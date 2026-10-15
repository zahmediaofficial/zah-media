import {DriveWriter} from './drive-writer.mjs';
export async function prepareBatch(request,env,json){
 if(!env.GOOGLE_DRIVE_USER_OAUTH_JSON||!env.PRINT_ROOT_FOLDER_ID)return json({error:'Google Drive write authorization and a private print root are required.'},503);
 const db=env.DB,writer=new DriveWriter(env),root=await writer.metadata(env.PRINT_ROOT_FOLDER_ID);if(root.trashed||root.mimeType!=='application/vnd.google-apps.folder')return json({error:'Print root unavailable.'},503);
 let batch=await db.prepare("SELECT * FROM print_batches WHERE status='preparing' ORDER BY created_at LIMIT 1").first();
 if(!batch){const orders=(await db.prepare("SELECT gallery_id FROM print_orders WHERE status='submitted'").all()).results;if(!orders.length)return json({error:'No newly submitted print orders.'},400);
  const pending=await db.prepare("SELECT count(*) AS n FROM print_items p JOIN print_orders o USING(gallery_id) WHERE o.status='submitted' AND p.output_saved=0").first();if(pending.n)return json({error:pending.n+' print copies still need cropping and saving. Batch not created.'},409);
  const id=crypto.randomUUID().replaceAll('-','');
  await db.batch([db.prepare('INSERT INTO print_batches(batch_id,status,created_at) VALUES (?,?,?)').bind(id,'preparing',Math.floor(Date.now()/1000)),db.prepare("INSERT INTO print_batch_items(batch_id,gallery_id,slot,size,source_id,filename) SELECT ?,p.gallery_id,p.slot,p.size,p.output_file_id,coalesce(g.registration_id,g.gallery_id)||'_'||p.size||'_PRINT-'||(p.slot+1)||'.jpg' FROM print_items p JOIN print_orders o USING(gallery_id) JOIN galleries g USING(gallery_id) WHERE o.status='submitted'").bind(id),db.prepare("UPDATE print_orders SET status='ready' WHERE status='submitted'")]);batch=await db.prepare('SELECT * FROM print_batches WHERE batch_id=?').bind(id).first();
 }
 const now=Math.floor(Date.now()/1000);const lock=await db.prepare('UPDATE print_batches SET lease_until=? WHERE batch_id=? AND lease_until<=? RETURNING batch_id').bind(now+300,batch.batch_id,now).first();if(!lock)return json({error:'This batch is being prepared. Wait and retry.'},409);
 try{
 // Each request advances at most five files, keeping Worker subrequest limits and retries bounded.
 if(!batch.folder_id){const id=await writer.folder('Graduation print batch '+batch.batch_id.slice(0,8),env.PRINT_ROOT_FOLDER_ID);await db.prepare('UPDATE print_batches SET folder_id=? WHERE batch_id=?').bind(id,batch.batch_id).run();batch.folder_id=id;}
 let folders=(await db.prepare('SELECT * FROM print_batch_folders WHERE batch_id=?').bind(batch.batch_id).all()).results;
 for(const size of ['4x6','8x10'])if(!folders.some(f=>f.size===size)){const id=await writer.folder(size,batch.folder_id);await db.prepare('INSERT OR IGNORE INTO print_batch_folders VALUES (?,?,?)').bind(batch.batch_id,size,id).run();}
 folders=(await db.prepare('SELECT * FROM print_batch_folders WHERE batch_id=?').bind(batch.batch_id).all()).results;
 const pending=(await db.prepare('SELECT * FROM print_batch_items WHERE batch_id=? AND copied_id IS NULL LIMIT 5').bind(batch.batch_id).all()).results;
 for(const item of pending){const key=batch.batch_id+'_'+item.gallery_id+'_'+item.slot;const copy=await writer.copy(item.source_id,key,item.filename,folders.find(f=>f.size===item.size).folder_id);await db.prepare('UPDATE print_batch_items SET copied_id=? WHERE batch_id=? AND gallery_id=? AND slot=?').bind(copy,batch.batch_id,item.gallery_id,item.slot).run();}
 const left=(await db.prepare('SELECT count(*) AS n FROM print_batch_items WHERE batch_id=? AND copied_id IS NULL').bind(batch.batch_id).first()).n;
 if(!left){const items=(await db.prepare('SELECT * FROM print_batch_items WHERE batch_id=? ORDER BY size,filename').bind(batch.batch_id).all()).results;const csv='Filename,Size,Quantity\r\n'+items.map(i=>i.filename+','+i.size+',1').join('\r\n')+'\r\n';if(!batch.manifest_id){batch.manifest_id=await writer.reserve();await db.prepare('UPDATE print_batches SET manifest_id=? WHERE batch_id=?').bind(batch.manifest_id,batch.batch_id).run();}await writer.save(batch.manifest_id,'Print order sheet.csv',batch.folder_id,new TextEncoder().encode(csv),'text/csv');await db.prepare("UPDATE print_batches SET status='complete' WHERE batch_id=?").bind(batch.batch_id).run();}
 return json({batch_id:batch.batch_id,pending:left,status:left?'preparing':'complete',folder_url:'https://drive.google.com/drive/folders/'+batch.folder_id});
 }finally{await db.prepare('UPDATE print_batches SET lease_until=0 WHERE batch_id=?').bind(batch.batch_id).run();}
}
