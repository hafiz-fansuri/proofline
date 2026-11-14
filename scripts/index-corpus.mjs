import { api } from './api.mjs';
for(let i=0;i<100;i++){const data=await api({action:'index'});console.log(`Batch ${i+1}: ${data.indexed} passages embedded`);if(!data.indexed)break;}
console.log(await api({action:'status'}));
