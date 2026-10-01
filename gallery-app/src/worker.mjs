import {GalleryRepository} from './repository.mjs';
import {GoogleDriveStorage} from './google-drive.mjs';
import {createAdminHandler} from './admin.mjs';
import {active,codeHash,digest,equal,randomToken} from './security.mjs';
const cookie='__Host-zah_gallery';
const secureHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...secureHeaders,'Content-Type':'application/json',...extra}});
const cookieValue = (r) => (r.headers.get('Cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookie+'='))?.slice(cookie.length+1);
export function createHandler(deps={}){return async(request,env,ctx)=>{
 const url=new URL(request.url);const path=url.pathname;
 try {
  if(!path.startsWith('/api/')){
   const asset=await env.ASSETS.fetch(request);const headers=new Headers(asset.headers);for(const [k,v]of Object.entries(secureHeaders))headers.set(k,v);return new Response(asset.body,{status:asset.status,headers});
  }
  if(path.startsWith('/api/admin/'))return await createAdminHandler(deps.admin)(request,env,json);
  if(!env.DB||!env.ACCESS_CODE_PEPPER||!env.GOOGLE_SERVICE_ACCOUNT_JSON||!env.DRIVE_ROOT_FOLDER_ID)return json({error:'Gallery service is not configured yet.'},503);
  const repo=deps.repo||new GalleryRepository(env.DB);const storage=deps.storage||new GoogleDriveStorage(env);const now=Math.floor(Date.now()/1000);
  if(request.method==='POST' && request.headers.get('Origin')!==url.origin)return json({error:'Request refused.'},403);
  if(path==='/api/session' && request.method==='POST'){
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
   // Streaming size bound; never buffer an arbitrarily large submitted code.
   const reader=request.body?.getReader();let body='';let bytes=0;if(!reader)return json({error:'Code required.'},400);
   const decoder=new TextDecoder();while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>1024){await reader.cancel();return json({error:'Request too large.'},413);}body+=decoder.decode(chunk.value,{stream:true});}
   let input;try{input=JSON.parse(body);}catch{return json({error:'Invalid request.'},400);}
   const bucket=await codeHash(env.ACCESS_CODE_PEPPER,'ip:'+ (request.headers.get('CF-Connecting-IP')||'local'));
   if(!await repo.attempt(bucket,now))return json({error:'Too many attempts. Please wait ten minutes.'},429,{'Retry-After':'600'});
   const code=typeof input.code==='string'?input.code.trim():'';
   const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
   const id=code.split('.')[0];const valid=/^[a-f0-9]{16}\.[A-Za-z0-9_-]{32}$/.test(code);
   const gallery=valid?await repo.gallery(id):null;
   const hash=await codeHash(env.ACCESS_CODE_PEPPER,code);
   if(!active(gallery,now)||!equal(hash,gallery.access_code_hash)||!email||email!==gallery.client_email)return json({error:'Email or gallery code unavailable. Check both or contact ZAH Media.'},401);
   const token=randomToken();const ttl=Math.min(3600,Math.max(60,Number(env.SESSION_TTL_SECONDS)||3600));
   await repo.saveSession(await digest(token),id,Math.min(now+ttl,gallery.expires_at||Infinity));
   ctx?.waitUntil(repo.cleanup(now));
   return json({ok:true},200,{'Set-Cookie':`${cookie}=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ttl}`});
  }
  const token=cookieValue(request);const session=token&&await repo.session(await digest(token),now);
  const gallery=session&&await repo.gallery(session.gallery_id);
  if(!active(gallery,now))return json({error:'Please enter your gallery code.'},401);
  if(path==='/api/session'&&request.method==='DELETE'){
   if(request.headers.get('Origin')!==url.origin)return json({error:'Request refused.'},403);
   await repo.deleteSession(await digest(token));return json({ok:true},200,{'Set-Cookie':`${cookie}=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`});
  }
  if(request.method!=='GET')return json({error:'Method not allowed.'},405);
  if(!await storage.authorisedFolder(gallery.drive_folder_id))return json({error:'Gallery is unavailable. Please contact ZAH Media.'},403);
  if(path==='/api/gallery')return json({name:gallery.gallery_name,created_at:gallery.created_at,allow_downloads:!!gallery.allow_downloads});
  if(path==='/api/photos'){
   const cursor=url.searchParams.get('cursor');if(cursor?.length>2048)return json({error:'Invalid page.'},400);
   const page=await storage.list(gallery.drive_folder_id,cursor);
   return json({photos:page.files.map(f=>({id:f.id,name:f.name,thumbnail:'/api/photos/'+encodeURIComponent(f.id)+'/thumbnail',full:'/api/photos/'+encodeURIComponent(f.id)+'/full',download:gallery.allow_downloads?'/api/photos/'+encodeURIComponent(f.id)+'/download':null})),cursor:page.nextPageToken||null});
  }
  const match=path.match(/^\/api\/photos\/([A-Za-z0-9_-]{1,200})\/(thumbnail|full|download)$/);
  if(!match)return json({error:'Not found.'},404);
  const [,id,kind]=match;if(kind==='download'&&!gallery.allow_downloads)return json({error:'Downloads are disabled.'},403);
  const file=await storage.file(gallery.drive_folder_id,id);if(!file)return json({error:'Not found.'},404);
  const upstream=await storage.content(file,kind);if(!upstream)return json({error:'Photograph unavailable.'},404);
  const headers={...secureHeaders,'Content-Type':file.mimeType};
  if(kind==='thumbnail')headers['Content-Type']=upstream.headers.get('Content-Type')||file.mimeType;
  if(!['image/jpeg','image/png','image/webp'].includes(headers['Content-Type'].split(';')[0]))return json({error:'Photograph unavailable.'},502);
  if(kind==='download')headers['Content-Disposition']="attachment; filename*=UTF-8''"+encodeURIComponent(file.name);
  return new Response(upstream.body,{headers});
 }catch(error){
  const message={GOOGLE_AUTH:'The gallery storage connection needs attention. Please contact ZAH Media.',DRIVE_ACCESS:'The gallery folder is currently unavailable. Please contact ZAH Media.'}[error?.code];
  return json({error:message||'Gallery service is temporarily unavailable. Please try again.'},502);
 }
};}
export default {fetch:createHandler()};
