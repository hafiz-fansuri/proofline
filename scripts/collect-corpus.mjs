import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { splitMarkdown } from '../src/lib/core.mjs';
const repo = 'GenAI-Security-Project/GenAI-LLM-Top10';
const revision = '9253e38ade58e959b531c0c5c9a4842272c9cd0e';
const files = JSON.parse(execFileSync('gh', ['api', `repos/${repo}/contents/2026/final?ref=${revision}`], {encoding:'utf8'}));
const docs = [], chunks = [];
for (const file of files.filter(f => /^LLM\d\d_.*\.md$/.test(f.name))) {
  const content = execFileSync('gh', ['api', `repos/${repo}/contents/2026/final/${file.name}?ref=${revision}`, '-H', 'Accept: application/vnd.github.raw+json'], {encoding:'utf8',maxBuffer:2e6});
  const id = file.name.replace('.md','').toLowerCase();
  const title = content.match(/^#{1,3}\s+(.+)/m)?.[1] ?? file.name;
  docs.push({id,title,version:'2026',publisher:'OWASP GenAI Security Project',url:`https://github.com/${repo}/blob/${revision}/2026/final/${file.name}`,license:'CC BY-SA 4.0',revision,content,sha256:createHash('sha256').update(content).digest('hex'),category:id.startsWith('llm0')||id.startsWith('llm10')?'Risk guidance':'Framework'});
  splitMarkdown(content).forEach((chunk,i) => chunks.push({id:`${id}-${String(i+1).padStart(3,'0')}`,document_id:id,ordinal:i,...chunk}));
}
await mkdir('.cache',{recursive:true});
await writeFile('.cache/corpus.json',JSON.stringify({docs,chunks}));
console.log(JSON.stringify({documents:docs.length,chunks:chunks.length,revision}));
