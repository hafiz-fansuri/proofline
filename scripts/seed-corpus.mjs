import {readFile} from 'node:fs/promises';
import cases from '../data/evaluation-cases.json' with {type:'json'};
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally. Never commit them.');
const {docs,chunks}=JSON.parse(await readFile('.cache/corpus.json','utf8'));
async function upsert(table,rows){const r=await fetch(url+'/rest/v1/'+table,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(rows)});if(!r.ok)throw new Error(`Seed ${table}: HTTP ${r.status}`);}
await upsert('documents',docs);
for(let i=0;i<chunks.length;i+=40)await upsert('chunks',chunks.slice(i,i+40));
await upsert('eval_cases',cases);
console.log(`Seeded ${docs.length} documents, ${chunks.length} chunks, ${cases.length} cases. Existing embeddings are retained on matching IDs.`);
