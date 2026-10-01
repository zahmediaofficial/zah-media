export const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export const randomToken = () => encode(crypto.getRandomValues(new Uint8Array(24)));
export async function digest(value) {return encode(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
export async function codeHash(secret, code) {
 const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return encode(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(code)));
}
export function equal(a,b) {if(typeof a !== 'string'||typeof b !== 'string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
export const active = (g,now) => g && g.status==='active' && (!g.expires_at || g.expires_at>now);
