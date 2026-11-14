import { readdir,readFile } from 'node:fs/promises';
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else {const t=await readFile(p,'utf8');if(/sk-or-v1-[A-Za-z0-9]{20,}|sb_secret_[A-Za-z0-9]{10,}/.test(t))throw new Error('Possible private credential in '+p);}}}
await walk('dist');console.log('No recognized private provider or Supabase secret-key patterns found in the browser build.');
