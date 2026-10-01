import {codeHash,digest,equal,randomToken} from './security.mjs';
import {GoogleDriveStorage} from './google-drive.mjs';
const COOKIE='__Host-zah_admin';
const FORM='262725740128053';
const email=s=>typeof s==='string'?s.trim().toLowerCase():'';
const clean=(s,max=200)=>typeof s==='string'?s.trim().slice(0,max):'';
const stamp=()=>Math.floor(Date.now()/1000);
export function parseRegistration(s){
 const answers=Object.values(s.answers||{});
 const name=answers.find(a=>a.type==='control_fullname');
 const mail=answers.find(a=>a.type==='control_email');
 const pkg=answers.find(a=>/package code/i.test(a.text||''));
 const client_name=clean(name?.prettyFormat||[name?.answer?.first,name?.answer?.last].filter(Boolean).join(' '));
 const client_email=email(mail?.answer);
 if(!client_name||!/^\S+@\S+\.\S+$/.test(client_email)||!/^[0-9]{1,100}$/.test(String(s.id)))return null;
 return {submission_id:String(s.id),client_name,client_email,package_code:clean(pkg?.answer,60),registered_at:clean(s.created_at,50)};
}
async function readBody(request){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new Error('JSON required.');
 const reader=request.body?.getReader();if(!reader)throw new Error('Request required.');
 let n=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>8192){await reader.cancel();throw new Error('Request too large.');}parts.push(value);}
 const bytes=new Uint8Array(n);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
export function createAdminHandler(deps={}){return async(request,env,json)=>{
 const path=new URL(request.url).pathname;
 if(!env.DB||!env.ACCESS_CODE_PEPPER||typeof env.ADMIN_ACCESS_KEY!=='string'||env.ADMIN_ACCESS_KEY.length<32)return json({error:'Management access is not configured yet.'},503);
 const now=stamp(),db=env.DB;
 if(request.method!=='GET'&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Request refused.'},403);
 const cookie=(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(path==='/api/admin/session'&&request.method==='POST'){
  const body=await readBody(request);
  const bucket=await codeHash(env.ACCESS_CODE_PEPPER,'admin-ip:'+(request.headers.get('CF-Connecting-IP')||'local'));
  const row=await db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(bucket,now+600,now,now).first();
  if(row.count>10)return json({error:'Too many attempts. Wait ten minutes.'},429,{'Retry-After':'600'});
  const key=typeof body.key==='string'?body.key:'';
  if(!equal(await digest(key),await digest(env.ADMIN_ACCESS_KEY)))return json({error:'Management key unavailable.'},401);
  const token=randomToken();await db.batch([db.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now),db.prepare('INSERT INTO admin_sessions VALUES (?,?,?)').bind(await digest(token),now+3600,await digest(env.ADMIN_ACCESS_KEY))]);
  return json({ok:true},200,{'Set-Cookie':`${COOKIE}=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`});
 }
 const session=cookie&&await db.prepare('SELECT * FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await digest(cookie),now).first();
 if(!session||!equal(session.key_hash,await digest(env.ADMIN_ACCESS_KEY)))return json({error:'Sign in to management.'},401);
 if(path==='/api/admin/session'&&request.method==='DELETE'){
  await db.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(cookie)).run();
  return json({ok:true},200,{'Set-Cookie':`${COOKIE}=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`});
 }
 if(path==='/api/admin/overview'&&request.method==='GET'){
  const galleries=await db.prepare('SELECT gallery_id,gallery_name,client_name,client_email,drive_folder_id,created_at,expires_at,status,allow_downloads FROM galleries ORDER BY created_at DESC').all();
  const registrations=await db.prepare('SELECT * FROM registrations ORDER BY registered_at DESC,submission_id DESC').all();
  return json({galleries:galleries.results,registrations:registrations.results,jotform_configured:!!env.JOTFORM_API_KEY});
 }
 if(path==='/api/admin/sync'&&request.method==='POST'){
  if(!env.JOTFORM_API_KEY)return json({error:'Add the read-only Jotform API key before syncing.'},503);
  const fetcher=deps.fetcher||((...args)=>globalThis.fetch(...args));
  let imported=0,skipped=0,offset=0,more=false;
  // One explicit sync fetches at most 500 submissions; next_offset permits continuation.
  const body=await readBody(request);if(body.offset!==undefined&&(!Number.isSafeInteger(body.offset)||body.offset<0||body.offset>100000))return json({error:'Invalid sync offset.'},400);offset=body.offset||0;
  const url=new URL(`https://api.jotform.com/form/${FORM}/submissions`);url.searchParams.set('limit','500');url.searchParams.set('offset',String(offset));url.searchParams.set('orderby','id');
  const r=await fetcher(url.toString(),{headers:{APIKEY:env.JOTFORM_API_KEY},redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(!r.ok)return json({error:'Jotform is unavailable. Check the read-only API key.'},502);
  const data=await r.json();if(data.responseCode!==200||!Array.isArray(data.content))return json({error:'Jotform did not return registrations.'},502);
  const commands=[];for(const submission of data.content){if(submission.status&&submission.status!=='ACTIVE'){skipped++;continue;}const item=parseRegistration(submission);if(!item){skipped++;continue;}
   commands.push(db.prepare('INSERT INTO registrations VALUES (?,?,?,?,?) ON CONFLICT(submission_id) DO UPDATE SET client_name=excluded.client_name,client_email=excluded.client_email,package_code=excluded.package_code,registered_at=excluded.registered_at').bind(item.submission_id,item.client_name,item.client_email,item.package_code,item.registered_at));imported++;
  }
  for(let i=0;i<commands.length;i+=50)await db.batch(commands.slice(i,i+50));more=data.content.length===500;
  return json({imported,skipped,next_offset:more?offset+data.content.length:null});
 }
 if(path==='/api/admin/galleries'&&request.method==='POST'){
  const b=await readBody(request),name=clean(b.name),client=clean(b.client_name),mail=email(b.email);
  const folder=clean(b.folder,500).match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1]||clean(b.folder);
  const expiry=b.expires_at===null||b.expires_at===undefined?null:b.expires_at;
  if(!name||!client||!/^\S+@\S+\.\S+$/.test(mail)||mail.length>254||!/^[A-Za-z0-9_-]{1,200}$/.test(folder)||b.confirmed_private!==true||typeof b.allow_downloads!=='boolean'||(expiry!==null&&(!Number.isSafeInteger(expiry)||expiry<=now)))return json({error:'Check the client details, folder, expiry and photo confirmation.'},400);
  if(await db.prepare('SELECT gallery_id FROM galleries WHERE drive_folder_id=?').bind(folder).first())return json({error:'That folder already belongs to a gallery. Use a dedicated folder for this client.'},409);
  const storage=deps.storage||new GoogleDriveStorage(env);if(!await storage.authorisedFolder(folder))return json({error:'Choose a client folder beneath ZAH MEDIA CLIENT GALLERIES.'},400);
  const id=Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');
  // Selector is opaque; the independently random 192-bit secret protects access.
  const code=id+'.'+randomToken();
  await db.prepare('INSERT INTO galleries (gallery_id,gallery_name,client_name,client_email,drive_folder_id,access_code_hash,created_at,expires_at,status,allow_downloads) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,name,client,mail,folder,await codeHash(env.ACCESS_CODE_PEPPER,code),now,expiry,'active',b.allow_downloads?1:0).run();
  return json({code,email:mail,gallery_id:id},201);
 }
 const match=path.match(/^\/api\/admin\/galleries\/([a-f0-9]{16})\/(settings|rotate)$/);
 if(match&&request.method==='POST'){
  const [,id,action]=match,g=await db.prepare('SELECT gallery_id FROM galleries WHERE gallery_id=?').bind(id).first();if(!g)return json({error:'Gallery not found.'},404);
  if(action==='rotate'){
   const code=id+'.'+randomToken();await db.batch([db.prepare('UPDATE galleries SET access_code_hash=? WHERE gallery_id=?').bind(await codeHash(env.ACCESS_CODE_PEPPER,code),id),db.prepare('DELETE FROM sessions WHERE gallery_id=?').bind(id)]);return json({code});
  }
  const b=await readBody(request);if(!['active','disabled'].includes(b.status)||typeof b.allow_downloads!=='boolean'||(b.expires_at!==null&&(!Number.isSafeInteger(b.expires_at)||b.expires_at<=0)))return json({error:'Check status, download permission and expiry.'},400);
  await db.batch([db.prepare('UPDATE galleries SET status=?,allow_downloads=?,expires_at=? WHERE gallery_id=?').bind(b.status,b.allow_downloads?1:0,b.expires_at,id),db.prepare('DELETE FROM sessions WHERE gallery_id=?').bind(id)]);return json({ok:true});
 }
 return json({error:'Not found.'},404);
};}
