import {prepareBatch} from './print-batches.mjs';
import {DriveWriter,jpegDimensions} from './drive-writer.mjs';
import {GoogleDriveStorage} from './google-drive.mjs';
export const PACKAGES=Object.freeze({B1:[],S1:['4x6'],S2:['8x10'],G1:['4x6','4x6'],G2:['4x6','8x10'],G3:['8x10','8x10']});
export function packageCode(value){const m=String(value||'').match(/^(B1|S1|S2|G1|G2|G3)(?:\s|$)/);return m?.[1]||null;}
export async function bodyJSON(request){let size=0;const chunks=[];for await(const part of request.body||[]){size+=part.length;if(size>8192)throw new Error('Request too large');chunks.push(part);}const buffer=new Uint8Array(size);let offset=0;for(const p of chunks){buffer.set(p,offset);offset+=p.length;}return JSON.parse(new TextDecoder().decode(buffer));}
async function entitlement(db,g){const id=g.registration_id;if(!id)return null;const c=await db.prepare(id.startsWith('ZAH-GRAD-')?'SELECT package_code FROM clients WHERE client_id=?':'SELECT package_code FROM registrations WHERE submission_id=?').bind(id).first();return packageCode(c?.package_code);}
export async function clientPrints(request,env,g,storage,json){
 const code=await entitlement(env.DB,g);if(!code)return json({error:'Your print package needs studio review.'},409);
 const slots=PACKAGES[code],order=await env.DB.prepare('SELECT * FROM print_orders WHERE gallery_id=?').bind(g.gallery_id).first();
 if(request.method==='GET')return json({package_code:code,slots,order:order?{status:order.status,items:(await env.DB.prepare('SELECT slot,size,source_file_id,source_name FROM print_items WHERE gallery_id=? ORDER BY slot').bind(g.gallery_id).all()).results}:null});
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!slots.length)return json({error:'This digital-only package has no prints.'},400);
 if(order)return json({error:'Selections already submitted. Contact ZAH Media to request a change.'},409);
 const b=await bodyJSON(request);if(!Array.isArray(b.files)||b.files.length!==slots.length||b.files.some(id=>typeof id!=='string'||!/^[A-Za-z0-9_-]{1,200}$/.test(id)))return json({error:'Choose exactly one photograph for each included print.'},400);
 const files=[];for(const id of b.files){const f=await storage.file(g.drive_folder_id,id);if(!f)return json({error:'Choose a photograph from your own gallery.'},400);files.push(f);}
 // A single atomic batch reserves this order and every print slot. Repeated images are valid separate prints.
 try{await env.DB.batch([env.DB.prepare('INSERT INTO print_orders VALUES (?,?,?,?)').bind(g.gallery_id,code,'submitted',Math.floor(Date.now()/1000)),...files.map((f,i)=>env.DB.prepare('INSERT INTO print_items(gallery_id,slot,size,source_file_id,source_name) VALUES (?,?,?,?,?)').bind(g.gallery_id,i,slots[i],f.id,f.name))]);}catch{return json({error:'Selections already submitted or temporarily unavailable. Refresh to check.'},409);}
 return json({ok:true},201);
}
export function validCrop(c,w,h,size){if(!c||!['portrait','landscape'].includes(c.orientation))return false;for(const k of ['x','y','width','height'])if(!Number.isFinite(c[k])||c[k]<0)return false;if(c.width<1||c.height<1||c.x+c.width>w+.01||c.y+c.height>h+.01)return false;let ratio=size==='8x10'?4/5:2/3;if(c.orientation==='landscape')ratio=1/ratio;return Math.abs(c.width/c.height-ratio)<.005;}
async function handleAdminPrints(request,env,json,storage=new GoogleDriveStorage(env)){
 const path=new URL(request.url).pathname;
 if(!env.PRINT_ROOT_FOLDER_ID){const root=await env.DB.prepare("SELECT folder_id FROM print_folders WHERE size='root'").first();if(root)env={...env,PRINT_ROOT_FOLDER_ID:root.folder_id};}
 if(path==='/api/admin/prints/setup'&&request.method==='POST'){
  if(!env.GOOGLE_DRIVE_USER_OAUTH_JSON)return json({error:'Google Drive authorization is required.'},503);
  const writer=new DriveWriter(env);
  let id=env.PRINT_ROOT_FOLDER_ID;
  if(!id){const found=await writer.request('files?fields=files(id)&q='+encodeURIComponent("trashed=false and mimeType='application/vnd.google-apps.folder' and appProperties has { key='zah_print_root' and value='v1' }"));id=found.files?.[0]?.id;
   if(!id)id=(await writer.request('files?fields=id',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'ZAH Media Print Orders',mimeType:'application/vnd.google-apps.folder',appProperties:{zah_print_root:'v1'}})})).id;
   await env.DB.prepare("INSERT INTO print_folders(size,folder_id) VALUES ('root',?) ON CONFLICT(size) DO NOTHING").bind(id).run();
  }
  const folder=await writer.metadata(id);if(folder.trashed||folder.mimeType!=='application/vnd.google-apps.folder')return json({error:'Print folder unavailable.'},409);
  return json({ok:true,folder_url:'https://drive.google.com/drive/folders/'+id});
 }
 const mark=path.match(/^\/api\/admin\/prints\/batches\/([a-f0-9]{32})\/printed$/);if(mark&&request.method==='POST'){const batch=await env.DB.prepare('SELECT status FROM print_batches WHERE batch_id=?').bind(mark[1]).first();if(!batch||batch.status!=='complete')return json({error:'Only a completed printer batch can be marked printed.'},409);await env.DB.batch([env.DB.prepare("UPDATE print_orders SET status='printed' WHERE gallery_id IN (SELECT gallery_id FROM print_batch_items WHERE batch_id=?)").bind(mark[1]),env.DB.prepare("UPDATE print_batches SET status='printed' WHERE batch_id=?").bind(mark[1])]);return json({ok:true});}
 if(path==='/api/admin/prints/batch'&&request.method==='POST')return prepareBatch(request,env,json);
 if(path==='/api/admin/prints'&&request.method==='GET'){
  const items=(await env.DB.prepare('SELECT p.*,o.status,o.package_code,g.registration_id,g.client_name FROM print_items p JOIN print_orders o USING(gallery_id) JOIN galleries g USING(gallery_id) ORDER BY o.submitted_at,gallery_id,slot').all()).results;
  return json({items,batches:(await env.DB.prepare('SELECT batch_id,folder_id,status FROM print_batches ORDER BY created_at DESC').all()).results,drive_write_configured:!!env.GOOGLE_DRIVE_USER_OAUTH_JSON&&!!env.PRINT_ROOT_FOLDER_ID,print_folder_url:env.PRINT_ROOT_FOLDER_ID?'https://drive.google.com/drive/folders/'+env.PRINT_ROOT_FOLDER_ID:null});
 }
 const m=path.match(/^\/api\/admin\/prints\/([a-f0-9]{16})\/([01])\/(image|crop|output)$/);
 if(m){const [,id,slot,action]=m;const item=await env.DB.prepare('SELECT p.*,g.drive_folder_id,o.status FROM print_items p JOIN galleries g USING(gallery_id) JOIN print_orders o USING(gallery_id) WHERE p.gallery_id=? AND p.slot=?').bind(id,Number(slot)).first();if(!item)return json({error:'Print not found.'},404);
  if(!await storage.authorisedFolder(item.drive_folder_id))return json({error:'Folder unavailable.'},403);const f=await storage.file(item.drive_folder_id,item.source_file_id);if(!f)return json({error:'Source photo unavailable.'},404);
  if(action==='image'&&request.method==='GET'){const r=await storage.content(f,'full');if(!r)return json({error:'Source photo unavailable.'},404);return new Response(r.body,{headers:{'Content-Type':f.mimeType,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}

  if(action==='output'&&request.method==='POST'){
   if(item.status!=='submitted'||!item.crop_json)return json({error:'Save a crop on an unlocked order first.'},409);
   if(!env.GOOGLE_DRIVE_USER_OAUTH_JSON||!env.PRINT_ROOT_FOLDER_ID)return json({error:'Connect owner Google Drive write authorization before saving print copies.'},503);
   if(request.headers.get('Content-Type')!=='image/jpeg')return json({error:'JPEG required.'},415);
   const chunks=[];let n=0;for await(const part of request.body||[]){n+=part.length;if(n>16*1024*1024)return json({error:'Print image exceeds 16 MB.'},413);chunks.push(part);}const bytes=new Uint8Array(n);let off=0;for(const part of chunks){bytes.set(part,off);off+=part.length;}
   const dims=jpegDimensions(bytes),recipe=JSON.parse(item.crop_json),target=item.size==='8x10'?4/5:2/3,ratio=recipe.orientation==='portrait'?target:1/target;
   if(!dims||dims.width<1||dims.height<1||Math.abs(dims.width/dims.height-ratio)>.005||dims.width>Math.ceil(recipe.width)||dims.height>Math.ceil(recipe.height))return json({error:'Print output must match the saved crop without upscaling.'},400);
   const writer=new DriveWriter(env);const root=await writer.metadata(env.PRINT_ROOT_FOLDER_ID);if(root.trashed||root.mimeType!=='application/vnd.google-apps.folder')return json({error:'Print root unavailable.'},503);
   let row=await env.DB.prepare('SELECT folder_id FROM print_folders WHERE size=?').bind(item.size).first();if(!row){const folder=await writer.folder(item.size,env.PRINT_ROOT_FOLDER_ID);await env.DB.prepare('INSERT OR IGNORE INTO print_folders VALUES (?,?)').bind(item.size,folder).run();row=await env.DB.prepare('SELECT folder_id FROM print_folders WHERE size=?').bind(item.size).first();}
   const parent=await writer.metadata(row.folder_id);if(!parent.parents?.includes(env.PRINT_ROOT_FOLDER_ID))return json({error:'Print folder mismatch.'},403);
   if(!item.output_file_id){const generated=await writer.reserve();await env.DB.prepare('UPDATE print_items SET output_file_id=? WHERE gallery_id=? AND slot=? AND output_file_id IS NULL').bind(generated,id,Number(slot)).run();item.output_file_id=(await env.DB.prepare('SELECT output_file_id FROM print_items WHERE gallery_id=? AND slot=?').bind(id,Number(slot)).first()).output_file_id;}
   const client=await env.DB.prepare('SELECT registration_id FROM galleries WHERE gallery_id=?').bind(id).first();const name=(client.registration_id||id)+'_'+item.size+'_PRINT-'+(Number(slot)+1)+'.jpg';
   await writer.save(item.output_file_id,name,row.folder_id,bytes);await env.DB.prepare('UPDATE print_items SET output_saved=1 WHERE gallery_id=? AND slot=?').bind(id,Number(slot)).run();return json({ok:true,drive_copy_saved:true});
  }
  if(action==='crop'&&request.method==='POST'){if(item.status!=='submitted')return json({error:'This order is locked for printing.'},409);const c=await bodyJSON(request);const meta=f.imageMediaMetadata;const dims=meta&&Math.abs(meta.rotation||0)%2?{width:meta.height,height:meta.width}:meta;
   if(!dims||!validCrop(c,dims.width,dims.height,item.size))return json({error:'Crop must match the print ratio and original image bounds.'},400);
   await env.DB.prepare('UPDATE print_items SET crop_json=?,output_saved=0 WHERE gallery_id=? AND slot=? AND EXISTS (SELECT 1 FROM print_orders WHERE gallery_id=? AND status=?)').bind(JSON.stringify(c),id,Number(slot),id,'submitted').run();return json({ok:true,crop_saved:true,drive_copy_saved:false});
  }
 }
 return json({error:'Not found.'},404);
}

export async function adminPrints(request,env,json,storage){
 try{return await handleAdminPrints(request,env,json,storage);}
 catch(error){if(error.code==='PRINT_AUTH')return json({error:'The Google Drive write connection has expired or was revoked. Reconnect the studio Google account before saving cropped copies.'},503);throw error;}
}
