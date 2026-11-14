# Operations, models, and data

## Model configuration

In Supabase → Edge Functions → Secrets, save the OpenRouter credential as `OPENROUTER_API_KEY` or the already-supported `RAGS`. Never paste it into the browser, GitHub, a Vite environment variable, or chat. The function also recognizes lowercase `rags`. Configuration status exposes only a boolean.

The default route is `openrouter/free`, with one bounded `liquid/lfm-3-1.7b:free` fallback. `OPENROUTER_MODEL` can pin an explicit `:free` model or `openrouter/free`; any other route is rejected. The actual served model is stored on each answer. Reasoning is requested disabled to reserve the response budget for visible answer text. There is a 3,000-token output cap and a 55-second timeout per provider attempt.

Free capacity is variable. A successful live test used `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`. Earlier tested free models returned empty completions or HTTP 429. This is why the UI retains evidence when generation fails. No paid model is selected automatically. Free inference does not mean unlimited hosting, storage, or requests. Review [OpenRouter limits](https://openrouter.ai/docs/api-reference/limits) and [free routing](https://openrouter.ai/docs/guides/routing/routers/free-router).

Application limits: 20 generation tasks/day globally, 10/session/day, up to two free provider attempts/task, and 12 evaluation runs/day. Counters reset with the database date. A failed provider request still consumes an application task. The random browser session is a capability token, not verified identity; clearing storage can reset session identity, but not the global budget. These limits reduce cost exposure and do not prevent all abuse.

### Ollama alternative

Ollama is a useful local-development option when a machine has adequate memory and compute. It is not currently wired into the deployed app: a hosted Supabase function cannot reach `localhost` on your laptop. Do not expose an unauthenticated Ollama port to the internet. To add it, introduce an authenticated OpenAI-compatible provider adapter on infrastructure you control, choose and benchmark a model compatible with your hardware, and explicitly change the backend's free-route policy. Keep embeddings identical or re-embed the entire corpus. Local inference has hardware/electricity costs and is not a hosted uptime guarantee.

## Provision your own Supabase project

1. Create a project, review the quoted plan, and apply `supabase/migrations/20261114111852_proofline_schema.sql`. The schema enables pgvector, all eight tables' RLS, service-only grants, RPCs, and the public licensed-source bucket.
2. Change `src/config.json` to your Supabase URL, publishable key, and legacy **anon** gateway JWT. These are public client identifiers. Never substitute `service_role`. The function uses JWT gateway verification, so the legacy anon bearer is supplied for compatibility alongside the publishable key.
3. Authenticate `gh`, run `npm run corpus` to collect the pinned source, and review `.cache/corpus.json`. The collector preserves original Markdown and SHA-256 and uses heading-aware chunks capped at 180 words (no overlap).
4. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your local shell only, then run `node scripts/seed-corpus.mjs`. It upserts documents, chunks, and authored evaluation cases. Treat corpus revision changes as an explicit migration; this script does not delete obsolete IDs.
5. Indexing is disabled in the public release. In a private setup project only, temporarily set `allowIndexing=true`, deploy the function, and run `node scripts/index-corpus.mjs`. It embeds two chunks per request with normalized `gte-small` 384-dimensional vectors, then archives source Markdown in Storage. Deploy again with indexing disabled before exposing the app. Never open this maintenance action on a public project.
6. Save the model secret, deploy `proofline`, check status, run smoke tests and evaluation, then build and publish the frontend.

Supabase currently logs that built-in ONNX inference is being considered for deprecation. Pinning the embedding contract is important: migrate to a separately hosted gte-small-compatible service or re-embed and benchmark a new embedding model before that capability is removed. Keyword fallback remains available during transient semantic failures.

## Where the data lives

| Data | Supabase location |
|---|---|
| Original licensed Markdown, attribution, revision, hashes | `documents` and `source-documents` Storage |
| Chunks, full-text index, 384D vectors | `chunks` |
| Questions, answers, exact evidence, model, usage, latencies | `questions` |
| Helpfulness votes | `feedback` |
| Labelled cases and persisted benchmark results | `eval_cases`, `eval_runs` |
| Daily quota counters | `budgets` |
| Real GitHub workflow release metadata | `releases` |

Code and public evaluation-case definitions also live in GitHub for reproducibility. Browser localStorage contains only the random session identifier. GitHub holds CI logs and static build artifacts. Public research questions and retrieved passages are sent to OpenRouter/provider for generation. **Do not enter confidential material.** Consult provider privacy terms before extending this demo to private data.

## Access and limitations

The public demo has no account login. The Edge Function uses its service credential to enforce session ownership on history and feedback. All application tables deny direct anon/authenticated access; RLS has intentionally no public policies. Licensed corpus files are publicly readable. Evaluation results and aggregate question counts are public; other sessions' raw question histories are not.

Protect the browser session token: it grants access to that browser's history. This is demonstration-level session isolation, not enterprise authentication or multi-tenant authorization. Add Supabase Auth, per-user policies, retention/deletion workflows, abuse protection and operational monitoring before processing private customer information. Data currently remains until the project owner removes it; no automatic retention job is configured.

The model has no tools and cannot execute retrieved instructions. Output renders as escaped text, not HTML. Prompt instructions and citations are mitigation layers, not proof against prompt injection or hallucinations. Corpus ingestion is pinned and owner-operated; no arbitrary URL fetch or upload is exposed. Keep dependencies updated, review provider logs without copying secrets, and test the deployed API after backend changes.
