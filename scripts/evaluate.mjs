import { api } from './api.mjs';
import {randomUUID} from 'node:crypto';
const session=randomUUID();
for(const strategy of ['lexical','hybrid']){let data=await api({action:'evaluate',session,strategy});while(data.metrics.running)data=await api({action:'evaluate',session,run_id:data.id});console.log(JSON.stringify({id:data.id,strategy,metrics:data.metrics,failures:data.results.filter(r=>r.recall!==null&&r.recall<1).map(r=>({id:r.id,recall:r.recall}))},null,2));}
