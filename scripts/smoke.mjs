import assert from 'node:assert/strict';
import {api} from './api.mjs';
import config from '../src/config.json' with {type:'json'};
const session=crypto.randomUUID(),other=crypto.randomUUID();
const status=await api({action:'status'});assert.equal(status.documents,11);assert.equal(status.embedded,status.chunks);
const sources=await api({action:'sources'});assert.equal(sources.sources.length,11);
const source=await api({action:'source',id:sources.sources[0].id});assert.ok(source.source.content.length>100);
await assert.rejects(api({action:'ask',session,question:'short'}),/between/);
const denied=await fetch(config.url+'/rest/v1/questions?select=id',{headers:{apikey:config.publishableKey,Authorization:'Bearer '+config.gatewayToken}});assert.ok([401,403].includes(denied.status));
const run=await api({action:'dashboard',session:other});assert.equal(run.history.length,0);
await assert.rejects(api({action:'feedback',session:other,id:crypto.randomUUID(),helpful:true}),/not found/);
if(process.argv.includes('--generation')){
 const answer=await api({action:'ask',session,question:'What controls reduce excessive agency in a tool-using assistant?',strategy:'hybrid'});
 assert.equal(answer.status,'answered',answer.error??answer.status);assert.equal(answer.citation_valid,true);assert.ok(answer.evidence.length>0);
 assert.ok((await api({action:'dashboard',session})).history.some(q=>q.id===answer.id));
 assert.ok(!(await api({action:'dashboard',session:other})).history.some(q=>q.id===answer.id));
 await assert.rejects(api({action:'feedback',session:other,id:answer.id,helpful:true}),/not found/);
 assert.equal((await api({action:'feedback',session,id:answer.id,helpful:true})).saved,true);
 console.log(`Live generation passed: ${answer.model}; citation IDs valid. Claim support still requires human review.`);
}
console.log('Smoke checks passed: corpus, API validation, database denial, session separation, feedback ownership.');
