import test from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestion, fuseRanks, diversify, citationCheck, retrievalMetrics, splitMarkdown } from '../src/lib/core.mjs';
test('rejects empty, oversized, and non-string questions',()=>{ for(const q of ['',null,'a'.repeat(1201)]) assert.throws(()=>validateQuestion(q)); assert.equal(validateQuestion('  How do agents leak secrets?  '),'How do agents leak secrets?'); });
test('rank fusion rewards evidence found by both retrieval channels',()=>{const ranked=fuseRanks([{id:'a'},{id:'b'}],[{id:'b'},{id:'c'}]);assert.equal(ranked[0].id,'b');assert.deepEqual(ranked[0].channels,['lexical','semantic']);});
test('diversification prevents one source crowding out others',()=>{const rows=[1,2,3].map(i=>({id:String(i),document_id:'a'}));rows.push({id:'4',document_id:'b'});assert.deepEqual(diversify(rows).map(x=>x.id),['1','2','4']);});
test('citation references must exist and at least one is required',()=>{assert.equal(citationCheck('Claim [1].',2).valid,true);for(const t of ['No source','Invalid [0]','Invalid [3]'])assert.equal(citationCheck(t,2).valid,false);});
test('recall counts expected documents once and MRR reflects first correct rank',()=>{assert.deepEqual(retrievalMetrics(['x','a','a'],['a','b']),{recall:0.5,reciprocalRank:0.5});assert.deepEqual(retrievalMetrics([],[]),{recall:null,reciprocalRank:null});});
test('chunker preserves headings and bounds long paragraphs',()=>{const text='# Topic\n'+('word '.repeat(500));const chunks=splitMarkdown(text,100);assert.equal(chunks.length,5);assert(chunks.every(c=>c.heading==='Topic'&&c.content.split(' ').length<=100));});
