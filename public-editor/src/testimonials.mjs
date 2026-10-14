const ROOT='https://zahmediastudio.com';
const recordPrefix='testimonial:record:', publicPrefix='testimonial:public:';
const trim=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
export function publicReview(r){return {id:r.id,name:r.name,project:r.project,projectId:r.projectId,text:r.text,handle:r.handle,photo:r.photo,created:r.created};}
export function validateReview(input,collections){
 const project=collections.find(g=>g.slug===input.projectId);
 const services={'service-wedding':'Wedding photography','service-event':'Event photography','service-portrait':'Portrait photography','service-graduation':'Graduation portraits','service-corporate':'Corporate photography'};
 const name=trim(input.name,100),text=trim(input.text,1500),email=trim(input.email,254);
 if(!name||text.length<15||!/^\S+@\S+\.\S+$/.test(email)||input.consent!==true)throw Error('Enter your name, email and testimonial, and give permission to publish.');
 if(!project&&!services[input.projectId])throw Error('Choose a project or photography service.');
 let photo=null;
 if(input.photoId){const p=project?.photos.find(p=>p.id===input.photoId);if(!p||!/^assets\/[A-Za-z0-9_./-]+\.webp$/.test(p.src)||p.src.includes('..'))throw Error('Choose a photograph from the selected public project.');photo={id:p.id,src:ROOT+'/portfolio/'+p.src,alt:p.alt||project.title};}
 const handle=trim(input.handle,80);
 if(handle&&!/^@?[\p{L}\p{N}_. -]{1,80}$/u.test(handle))throw Error('Enter a social name or handle, without a website link.');
 return {name,email,text,handle,photo,projectId:input.projectId,project:project?.title||services[input.projectId],consent:true};
}
async function smallBody(request){
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw Error('JSON required.');
 const reader=request.body?.getReader();if(!reader)throw Error('Request required.');let bytes=0,parts=[];
 for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>8192){await reader.cancel();throw Error('Request too large.');}parts.push(value);}
 const data=new Uint8Array(bytes);let pos=0;for(const p of parts){data.set(p,pos);pos+=p.length;}return JSON.parse(new TextDecoder().decode(data));
}
export async function reviewHandler(request,env,{authenticated=false,fetcher=fetch,hash}){
 const url=new URL(request.url),path=url.pathname,origin=request.headers.get('Origin');
 const cors=origin===ROOT||/^http:\/\/127\.0\.0\.1:\d+$/.test(origin||'')?origin:null;
 const response=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(cors?{'Access-Control-Allow-Origin':cors,'Vary':'Origin'}:{})}});
 try{
 if(path==='/api/testimonials'&&request.method==='OPTIONS')return new Response(null,{status:204,headers:{...(cors?{'Access-Control-Allow-Origin':cors}:{}),'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}});
 if(path==='/api/testimonials'&&request.method==='GET'){
  const listed=await env.DRAFTS.list({prefix:publicPrefix,limit:1000});const reviews=(await Promise.all(listed.keys.map(k=>env.DRAFTS.get(k.name,'json')))).filter(Boolean).map(publicReview);return response({reviews});
 }
 if(path==='/api/testimonials'&&request.method==='POST'){
  if(!cors)return response({error:'Request refused.'},403);
  const input=await smallBody(request);if(input.website)return response({ok:true},202);
  const bucket='testimonial:rate:'+await hash(request.headers.get('CF-Connecting-IP')||'local');const count=Number(await env.DRAFTS.get(bucket)||0);
  if(count>=5)return response({error:'Please try again in an hour.'},429);await env.DRAFTS.put(bucket,String(count+1),{expirationTtl:3600});
  const upstream=await fetcher(ROOT+'/portfolio/collections.json',{redirect:'error'});if(!upstream.ok)return response({error:'Projects are temporarily unavailable.'},503);
  const r={...validateReview(input,await upstream.json()),id:crypto.randomUUID(),created:new Date().toISOString(),status:'pending'};
  await env.DRAFTS.put(recordPrefix+r.id,JSON.stringify(r));return response({ok:true},201);
 }
 if(!authenticated)return response({error:'Please sign in to your visual studio.'},401);
 if(path==='/api/reviews'&&request.method==='GET'){
  const cursor=url.searchParams.get('cursor');const list=await env.DRAFTS.list({prefix:recordPrefix,limit:100,...(cursor?{cursor}:{})});
  const upstream=await fetcher(ROOT+'/portfolio/collections.json',{redirect:'error'});const projects=upstream.ok?(await upstream.json()).map(g=>({slug:g.slug,title:g.title})):[];
  return response({projects,reviews:(await Promise.all(list.keys.map(k=>env.DRAFTS.get(k.name,'json')))).filter(Boolean),cursor:list.list_complete?null:list.cursor});
 }
 if(path==='/api/reviews'&&request.method==='POST'){
  const b=await smallBody(request);if(!/^[a-f0-9-]{36}$/.test(b.id)||!['approve','reject','unpublish'].includes(b.action))return response({error:'Invalid review action.'},400);
  const r=await env.DRAFTS.get(recordPrefix+b.id,'json');if(!r)return response({error:'Review unavailable.'},404);
  if(b.action==='approve'){
   if(!r.consent||b.confirmed!==true)return response({error:'Confirm the testimonial and photograph belong to this client.'},400);
   await env.DRAFTS.put(publicPrefix+r.id,JSON.stringify(publicReview(r)));r.status='approved';
  }else{await env.DRAFTS.delete(publicPrefix+r.id);r.status=b.action==='reject'?'rejected':'pending';}
  await env.DRAFTS.put(recordPrefix+r.id,JSON.stringify(r));return response({ok:true});
 }
 return response({error:'Not found.'},404);
 }catch(error){return response({error:error.message==='Request too large.'?error.message:'Please check your review details and try again.'},error.message==='Request too large.'?413:400);}
}
