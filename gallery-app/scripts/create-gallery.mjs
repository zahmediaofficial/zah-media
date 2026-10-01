// Run locally after secure setup. Generates one code and a private SQL import file.
import {writeFile} from 'node:fs/promises';import {randomBytes} from 'node:crypto';import {codeHash} from '../src/security.mjs';
const [folder,name,client]=process.argv.slice(2);
if(!folder||!name||!client||!process.env.ACCESS_CODE_PEPPER){console.error('Supply folder ID, gallery name, client name; set ACCESS_CODE_PEPPER securely in this process first.');process.exit(1);}
if(!/^[A-Za-z0-9_-]{1,200}$/.test(folder))throw new Error('Invalid folder ID');
const id=randomBytes(8).toString('hex');const code=id+'.'+randomBytes(24).toString('base64url');const hash=await codeHash(process.env.ACCESS_CODE_PEPPER,code);
const quote=s=>"'"+s.replaceAll("'","''")+"'";
await writeFile('gallery.private.sql',`INSERT INTO galleries VALUES (${[id,name,client,folder,hash].map(quote).join(',')},${Math.floor(Date.now()/1000)},NULL,'active',1);\n`,{mode:0o600});
console.log('Client code (shown once): '+code);console.log('Private import saved to gallery.private.sql. Do not commit it.');
