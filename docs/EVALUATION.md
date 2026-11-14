# Evaluation protocol

## What has actually been measured

On 14 November 2026, two real runs against the hosted Supabase backend used 16 authored development questions: 13 answerable, including multi-source questions, plus 3 unsupported questions. Expected documents and rationales are in [evaluation-cases.json](../data/evaluation-cases.json). The corpus was pinned to `9253e38ade58e959b531c0c5c9a4842272c9cd0e`.

| Strategy | Document recall @ 5 passages | MRR | Mean retrieval time |
|---|---:|---:|---:|
| Keyword | 1.000 | 0.885 | 52 ms |
| Hybrid + RRF | 1.000 | 0.962 | 180 ms |

These are **small development-set retrieval results**, not answer accuracy, a held-out benchmark, or evidence that the application is generally reliable. Latencies include hosted query embedding where applicable and vary with cold starts and infrastructure. Runs are persisted in `eval_runs`; the dashboard shows the latest actual measurements, which may differ from this snapshot.

Recall = expected source documents present among five retrieved passages / expected documents. MRR = mean of 1 / rank of the first expected document. Repeated passages from the same document occupy ranks. Unsupported cases are excluded from both averages. They expose retrieved evidence but do not measure generated-answer abstention.

## Reproduce and inspect

Open **Evaluation** and run both strategies, expand every case, compare retrieved and expected document IDs, then export JSON. Or run `npm run eval`. Evaluation calls process two cases per request to stay within native embedding CPU limits; a full run is saved across requests. It uses no answer-generation calls and is capped at 12 new runs/day globally.

## Evaluate answers properly

Before claiming answer quality, create an independently authored held-out set of at least 50–100 questions. Include paraphrases, ambiguous questions, multiple risks, obsolete guidance, malicious instructions in documents, and questions outside the corpus. Keep it separate from tuning.

For each generated answer, record question, corpus revision, retrieved chunk IDs, strategy, served model, prompt version, response, latency and usage. Have a reviewer label each factual claim:

| Dimension | Suggested label |
|---|---|
| Support | Fully supported / partially supported / unsupported |
| Citation correctness | Cited passage actually entails claim: yes/no |
| Coverage | Material claims with a supporting citation / all material claims |
| Relevance | Answer addresses question: 0–2 |
| Abstention | Correctly declines unsupported question: yes/no |
| Injection resistance | Ignores adversarial instruction and does not invent privileges: yes/no |

Report claim support, citation precision and coverage, correct-abstention rate, p50/p95 latency, provider failure rate, and cost with sample counts. Double-label a subset and resolve disagreements. Human helpfulness feedback is useful but is not a ground-truth factuality label.

`citationCheck` only checks whether numeric citation IDs exist and are in range. A valid ID can still cite an irrelevant passage. An LLM judge can assist review but needs calibration against humans, versioned prompts, and disclosure of its own error rate. No judge accuracy score is invented here.

## Experiments worth adding

Compare keyword-only, vector-only, hybrid, chunk sizes, source diversity, and a local cross-encoder reranker on the same held-out set. Tune semantic threshold using labelled unsupported examples. Add a reliable answerability gate; the present similarity threshold and prompt instruction are not a calibrated abstention classifier. Re-run after any corpus, embedding, model, or prompt change.
