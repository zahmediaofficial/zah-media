import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync} from 'node:fs';
import {createHandler} from '../src/worker.mjs';import {PACKAGES,validCrop,packageCode} from '../src/prints.mjs';import {jpegDimensions} from '../src/drive-writer.mjs';
async function fixture(pkg='G2'){
 const sqlite=new DatabaseSync(':memory:');for(const f of ['tests/fixtures/print-schema.sql','admin-schema.sql'])sqlite.exec(readFileSync(new URL('../'+f,import.meta.url),'utf8'));
 const wrap=(sql,args=[])=>({bind:(...a)=>wrap(sql,a),first:async()=>sqlite.prepare(sql).get(...args)||null,all:async()=>({results:sqlite.prepare(sql).all(...args)}),run:async()=>sqlite.prepare(sql).run(...args)});
 const db={prepare:s=>wrap(s),batch:async ss=>{sqlite.exec('BEGIN');try{const r=[];for(const s of ss)r.push(await s.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 const env={DB:db,ADMIN_ACCESS_KEY:'owner'.repeat(12),ACCESS_CODE_PEPPER:'pepper',GOOGLE_SERVICE_ACCOUNT_JSON:'fixture',DRIVE_ROOT_FOLDER_ID:'root'};
 const storage={authorisedFolder:async f=>f==='client-folder',file:async(folder,id)=>folder==='client-folder'&&['photo1','photo2'].includes(id)?{id,name:id+'.jpg',mimeType:'image/jpeg',imageMediaMetadata:{width:4000,height:6000}}:null,content:async()=>new Response(new Uint8Array([1,2]),{headers:{'Content-Type':'image/jpeg'}})};
 const handler=createHandler({admin:{storage},storage});const call=(path,body,cookie,method=body?'POST':'GET',origin='https://gallery.test')=>handler(new Request('https://gallery.test/api/'+path,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}),env,{waitUntil:p=>p});
 const admin=(await call('admin/session',{key:env.ADMIN_ACCESS_KEY})).headers.get('Set-Cookie').split(';')[0];
 await db.prepare('INSERT INTO clients VALUES (?,?,?,?,?,?)').bind('ZAH-GRAD-001','Graduate','graduate@example.com',pkg,'client-folder',1).run();
 const created=await(await call('admin/galleries',{registration_id:'ZAH-GRAD-001',name:'Graduation',client_name:'Graduate',email:'graduate@example.com',folder:'client-folder',confirmed_private:true,allow_downloads:true},admin)).json();
 await db.prepare('UPDATE galleries SET registration_id=? WHERE gallery_id=?').bind('ZAH-GRAD-001',created.gallery_id).run();
 const session=await call('session',{email:'graduate@example.com',code:created.code});const cookie=session.headers.get('Set-Cookie').split(';')[0];
 return {call,admin,cookie,db,env,handler,id:created.gallery_id};
}
test('all six packages enforce exact print quantities and sizes',async()=>{
 for(const [pkg,slots]of Object.entries(PACKAGES)){const f=await fixture(pkg+' — package');const info=await(await f.call('prints',null,f.cookie)).json();assert.deepEqual(info.slots,slots);
  const r=await f.call('prints',{files:slots.map(()=> 'photo1')},f.cookie);assert.equal(r.status,slots.length?201:400,pkg);const rows=(await f.db.prepare('SELECT size FROM print_items ORDER BY slot').all()).results;assert.deepEqual(rows.map(r=>r.size),slots);}
});
test('package counts calculate 23 small prints, 29 large prints, 52 total',()=>{const counts={B1:11,S1:8,S2:20,G1:4,G2:7,G3:1},total={'4x6':0,'8x10':0};for(const [code,n]of Object.entries(counts))for(const size of PACKAGES[code])total[size]+=n;assert.deepEqual(total,{'4x6':23,'8x10':29});assert.equal(Object.values(counts).reduce((a,b)=>a+b),51);assert.equal(packageCode('G2 — Gold'),'G2');assert.equal(packageCode('G21'),null);});
test('too many, too few and foreign photos rejected before any order is stored',async()=>{for(const files of [[],['photo1'],['photo1','photo2','photo1'],['photo1','foreign']]){const f=await fixture();assert.equal((await f.call('prints',{files},f.cookie)).status,400);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM print_orders').first()).n,0);}});
test('duplicate submissions do not duplicate prints; repeated image counts as separate slots',async()=>{const f=await fixture();assert.equal((await f.call('prints',{files:['photo1','photo1']},f.cookie)).status,201);assert.equal((await f.call('prints',{files:['photo2','photo2']},f.cookie)).status,409);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM print_items').first()).n,2);});
test('anonymous, client crop access and cross-origin print submissions denied',async()=>{const f=await fixture();assert.equal((await f.call('prints')).status,401);assert.equal((await f.call('prints',{files:['photo1','photo2']},f.cookie,'POST','https://evil.test')).status,403);assert.equal((await f.call('admin/prints',null,f.cookie)).status,401);});
test('only admin saves matching crop; original image and order remain unchanged',async()=>{const f=await fixture();await f.call('prints',{files:['photo1','photo2']},f.cookie);const crop={x:0,y:0,width:3200,height:4000,orientation:'portrait'};assert.equal((await f.call('admin/prints/'+f.id+'/1/crop',crop,f.cookie)).status,401);assert.equal((await f.call('admin/prints/'+f.id+'/1/crop',crop,f.admin)).status,200);assert.equal((await f.call('admin/prints/'+f.id+'/1/crop',{...crop,x:2000},f.admin)).status,400);const row=await f.db.prepare('SELECT * FROM print_items WHERE slot=1').first();assert.equal(row.source_file_id,'photo2');assert.equal(row.output_file_id,null);assert.equal(row.output_saved,0);});
test('crop bounds and print ratios validated for both orientations',()=>{const c={x:0,y:0,width:2000,height:3000,orientation:'portrait'};assert(validCrop(c,4000,6000,'4x6'));assert(!validCrop(c,4000,6000,'8x10'));assert(validCrop({...c,width:3000,height:2000,orientation:'landscape'},4000,6000,'4x6'));assert(!validCrop({...c,width:Infinity},4000,6000,'4x6'));assert(!validCrop({...c,x:-1},4000,6000,'4x6'));});
test('unknown package blocked and missing write authorization cannot prepare batch',async()=>{const f=await fixture('UNKNOWN');assert.equal((await f.call('prints',null,f.cookie)).status,409);assert.equal((await f.call('admin/prints/batch',{},f.admin)).status,503);assert.equal((await f.db.prepare('SELECT count(*) AS n FROM print_batches').first()).n,0);});
test('JPEG dimensions parsed; non-JPEG and truncated markers rejected',()=>{assert.equal(jpegDimensions(new Uint8Array([1,2,3])),null);const b=new Uint8Array([255,216,255,192,0,17,8,11,184,7,208,3,1,17,0,2,17,0,3,17,0,255,217]);assert.deepEqual(jpegDimensions(b),{height:3000,width:2000});assert.equal(jpegDimensions(b.slice(0,10)),null);});

test('owner saves a separate cropped JPEG under the size folder and sees its Drive location',async()=>{
 const f=await fixture('S1');await f.call('prints',{files:['photo1']},f.cookie);
 await f.db.prepare("INSERT INTO print_folders VALUES ('root','print-root')").run();
 f.env.GOOGLE_DRIVE_USER_OAUTH_JSON=JSON.stringify({client_id:'test',client_secret:'test',refresh_token:'test'});
 const uploads=[];const originalFetch=globalThis.fetch;
 globalThis.fetch=async(url,options={})=>{
  const u=String(url);
  if(u.includes('oauth2.googleapis.com'))return Response.json({access_token:'test-token'});
  if(u.includes('generateIds'))return Response.json({ids:['output-copy']});
  if(u.includes('/upload/')){uploads.push({url:u,method:options.method,body:await options.body.text()});return Response.json({id:'output-copy'});}
  if(u.includes('/files/print-root'))return Response.json({id:'print-root',mimeType:'application/vnd.google-apps.folder',trashed:false});
  if(u.includes('/files/size-folder'))return Response.json({id:'size-folder',parents:['print-root'],mimeType:'application/vnd.google-apps.folder'});
  if(u.includes('/files/output-copy'))return new Response(null,{status:404});
  if(options.method==='POST'&&u.includes('/files?'))return Response.json({id:'size-folder'});
  throw Error('Unexpected Drive call '+u);
 };
 try{
  const crop={x:0,y:0,width:4000,height:6000,orientation:'portrait'};
  assert.equal((await f.call('admin/prints/'+f.id+'/0/crop',crop,f.admin)).status,200);
  const jpeg=new Uint8Array([255,216,255,192,0,17,8,7,8,4,176,3,1,17,0,2,17,0,3,17,0,255,217]);
  const response=await f.handler(new Request('https://gallery.test/api/admin/prints/'+f.id+'/0/output',{method:'POST',headers:{Origin:'https://gallery.test',Cookie:f.admin,'Content-Type':'image/jpeg'},body:jpeg}),f.env);
  assert.equal(response.status,200);assert.equal(uploads.length,1);assert(uploads[0].url.includes('/files?'));assert(uploads[0].body.includes('size-folder'));assert(!uploads[0].body.includes('client-folder'));
  const item=await f.db.prepare('SELECT output_saved,output_file_id,source_file_id FROM print_items').first();assert.equal(item.output_saved,1);assert.equal(item.output_file_id,'output-copy');assert.equal(item.source_file_id,'photo1');
  const dashboard=await(await f.call('admin/prints',null,f.admin)).json();assert.equal(dashboard.drive_write_configured,true);assert.equal(dashboard.print_folder_url,'https://drive.google.com/drive/folders/print-root');
 }finally{globalThis.fetch=originalFetch;}
});

test('Drive writer calls transport without binding it to the writer instance',async()=>{
 const {DriveWriter}=await import('../src/drive-writer.mjs');let calls=0;
 const writer=new DriveWriter({GOOGLE_DRIVE_USER_OAUTH_JSON:'{}'},function(){assert.equal(this,undefined);calls++;return Promise.resolve(Response.json(calls===1?{access_token:'test'}:{id:'folder'}));});
 await writer.metadata('folder');assert.equal(calls,2);
});
