export const VERSION = 'proofline-rag-1.0';
export function validateQuestion(value) {
  if (typeof value !== 'string' || value.trim().length < 8 || value.length > 1200) throw new Error('Ask a question between 8 and 1,200 characters.');
  return value.trim();
}
export function fuseRanks(lexical, semantic, k = 40) {
  const map = new Map();
  for (const [kind, rows] of [['lexical', lexical], ['semantic', semantic]]) rows.forEach((row, i) => {
    const item = map.get(row.id) ?? { ...row, score: 0, channels: [] };
    item.score += 1 / (k + i + 1); item.channels.push(kind); map.set(row.id, item);
  });
  return [...map.values()].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function diversify(rows, limit = 5) {
  const counts = new Map(); const selected = [];
  for (const row of rows) {
    const count = counts.get(row.document_id) ?? 0;
    if (count >= 2) continue;
    counts.set(row.document_id, count + 1); selected.push(row);
    if (selected.length === limit) break;
  }
  return selected;
}
export function citationCheck(text, count) {
  const ids = [...text.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1]));
  return { valid: ids.length > 0 && ids.every(i => i >= 1 && i <= count), ids: [...new Set(ids)] };
}
export function retrievalMetrics(rankedDocs, expectedDocs) {
  if (!expectedDocs.length) return { recall: null, reciprocalRank: null };
  const found = new Set(rankedDocs.slice(0, 5));
  const first = rankedDocs.findIndex(id => expectedDocs.includes(id));
  return { recall: expectedDocs.filter(id => found.has(id)).length / expectedDocs.length, reciprocalRank: first < 0 ? 0 : 1 / (first + 1) };
}
export function splitMarkdown(text, maxWords = 180) {
  const chunks = []; let heading = 'Overview'; let buffer = [];
  function flush() { if (buffer.length) { chunks.push({heading, content: buffer.join(' ').trim()}); buffer = []; } }
  for (const line of text.split('\n')) {
    if (/^#{1,6}\s/.test(line)) { flush(); heading = line.replace(/^#+\s*/, ''); continue; }
    const words = line.trim().split(/\s+/).filter(Boolean);
    for (const word of words) { buffer.push(word); if (buffer.length >= maxWords) flush(); }
  }
  flush(); return chunks.filter(c => c.content.length > 70);
}
