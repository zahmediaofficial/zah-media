import {GalleryStorage} from './storage.mjs';
import {encode} from './security.mjs';
const ID=/^[A-Za-z0-9_-]{1,200}$/;
const image = f => ['image/jpeg','image/png','image/webp'].includes(f.mimeType) && !f.trashed;
export class GoogleDriveStorage extends GalleryStorage {
 constructor(env,fetcher=fetch){super();this.env=env;this.fetcher=fetcher;this.token=null;}
 async accessToken(){
  let stage='credentials';
  try {
  if(this.token && this.token.until>Date.now()+60000)return this.token.value;
  const credentials=JSON.parse(this.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const now=Math.floor(Date.now()/1000);
  const header=encode(new TextEncoder().encode(JSON.stringify({alg:'RS256',typ:'JWT'})));
  const payload=encode(new TextEncoder().encode(JSON.stringify({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/drive.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
  const raw=credentials.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
  stage='private-key';
  const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(raw),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const assertion=header+'.'+payload+'.'+encode(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(header+'.'+payload)));
  stage='token-request';
  const response=await this.fetcher('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(12000)});
  if(!response.ok){stage='token-rejected';throw new Error('Google authentication unavailable');}
  const data=await response.json();if(!data.access_token)throw new Error('Google authentication unavailable');
  this.token={value:data.access_token,until:Date.now()+data.expires_in*1000};return this.token.value;
  } catch { console.error('Gallery Google authentication failed at '+stage);throw Object.assign(new Error('Google authentication unavailable'),{code:'GOOGLE_AUTH'}); }
 }
 async request(path,params={}){
  const url=new URL('https://www.googleapis.com/drive/v3/'+path);
  for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
  const r=await this.fetcher(url,{headers:{Authorization:'Bearer '+await this.accessToken()},signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!r.ok)throw Object.assign(new Error('Drive request unavailable'),{code:'DRIVE_ACCESS'});return r;
 }
 async metadata(id){if(!ID.test(id))throw new Error('Invalid file');return (await this.request('files/'+id,{fields:'id,name,mimeType,parents,trashed,thumbnailLink,size,capabilities(canDownload)',supportsAllDrives:'true'})).json();}
 async authorisedFolder(folder){
  // A registered folder must be beneath the dedicated root, never the root itself.
  if(folder===this.env.DRIVE_ROOT_FOLDER_ID)return false;
  for(let depth=0;depth<6;depth++){
   const f=await this.metadata(folder);
   if(f.trashed||f.mimeType!=='application/vnd.google-apps.folder')return false;
   if(f.parents?.includes(this.env.DRIVE_ROOT_FOLDER_ID))return true;
   folder=f.parents?.[0];if(!folder)return false;
  }return false;
 }
 async list(folder,cursor){
  if(!ID.test(folder))throw new Error('Invalid folder');
  const params={q:`'${folder}' in parents and trashed = false and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp')`,pageSize:'50',orderBy:'name',fields:'nextPageToken,files(id,name,mimeType,size)',supportsAllDrives:'true',includeItemsFromAllDrives:'true'};
  if(cursor)params.pageToken=cursor;
  return (await this.request('files',params)).json();
 }
 async file(folder,id){const f=await this.metadata(id);return image(f)&&f.parents?.includes(folder)?f:null;}
 async content(file,kind){
  if(kind==='thumbnail'){
   if(!file.thumbnailLink)return null;
   const url=new URL(file.thumbnailLink);
   if(url.protocol!=='https:'||!(url.hostname.endsWith('.googleusercontent.com')||url.hostname==='lh3.google.com'))throw new Error('Invalid thumbnail host');
   const r=await this.fetcher(url,{headers:{Authorization:'Bearer '+await this.accessToken()},redirect:'error',signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw new Error('Thumbnail unavailable');return r;
  }
  if(file.capabilities?.canDownload===false)return null;
  return this.request('files/'+file.id,{alt:'media',supportsAllDrives:'true'});
 }
}
