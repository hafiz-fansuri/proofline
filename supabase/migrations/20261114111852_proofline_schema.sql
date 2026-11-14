create extension if not exists vector with schema extensions;
create table public.documents (
 id text primary key, title text not null, version text not null, publisher text not null,
 url text not null, license text not null, revision text not null, content text not null,
 sha256 text not null, category text not null, created_at timestamptz not null default now()
);
create table public.chunks (
 id text primary key, document_id text not null references public.documents(id), ordinal int not null,
 heading text not null, content text not null, embedding extensions.vector(384),
 search_vector tsvector generated always as (to_tsvector('english',heading || ' ' || content)) stored,
 unique(document_id,ordinal)
);
create index chunks_search_idx on public.chunks using gin(search_vector);
create index chunks_document_idx on public.chunks(document_id);
create table public.questions (
 id uuid primary key default gen_random_uuid(), session_hash text not null, question text not null,
 answer text not null, evidence jsonb not null, strategy text not null, model text,
 status text not null, latency_ms int not null, retrieval_ms int not null,
 citation_valid boolean not null, usage jsonb, created_at timestamptz not null default now()
);
create index questions_session_idx on public.questions(session_hash,created_at desc);
create index questions_created_idx on public.questions(created_at desc);
create table public.feedback (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions(id),
 session_hash text not null, helpful boolean not null, created_at timestamptz default now(), unique(question_id,session_hash)
);
create table public.eval_cases (
 id text primary key, question text not null, expected_docs text[] not null, category text not null,
 answerable boolean not null default true, rationale text not null
);
create table public.eval_runs (
 id uuid primary key default gen_random_uuid(), session_hash text not null, strategy text not null,
 metrics jsonb not null, results jsonb not null, corpus_revision text not null,
 created_at timestamptz not null default now()
);
create index eval_runs_created_idx on public.eval_runs(created_at desc);
create table public.budgets (scope text not null, day date not null default current_date, used int not null default 0, primary key(scope,day));
create table public.releases (id text primary key, commit_sha text, status text not null, url text, checks jsonb not null default '{}', created_at timestamptz default now());
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.questions enable row level security;
alter table public.feedback enable row level security;
alter table public.eval_cases enable row level security;
alter table public.eval_runs enable row level security;
alter table public.budgets enable row level security;
alter table public.releases enable row level security;
revoke all on public.documents,public.chunks,public.questions,public.feedback,public.eval_cases,public.eval_runs,public.budgets,public.releases from anon,authenticated;
grant all on public.documents,public.chunks,public.questions,public.feedback,public.eval_cases,public.eval_runs,public.budgets,public.releases to service_role;

create function public.claim_budget(p_scope text,p_limit int) returns boolean language plpgsql security invoker set search_path='' as $$
declare n int;
begin
 insert into public.budgets(scope,day,used) values(p_scope,current_date,1)
 on conflict(scope,day) do update set used=public.budgets.used+1 where public.budgets.used<p_limit returning used into n;
 return n is not null;
end; $$;
revoke all on function public.claim_budget(text,int) from public,anon,authenticated;
grant execute on function public.claim_budget(text,int) to service_role;

create function public.retrieve_chunks(q text,q_embedding extensions.vector(384) default null,release_version text default '2026')
returns table(id text,document_id text,heading text,content text,title text,url text,version text,lexical_score real,similarity double precision)
language sql stable security invoker set search_path='' as $$
 with query as (select websearch_to_tsquery('english', q) as ts),
 lexical as (select c.id from public.chunks c join public.documents d on d.id=c.document_id,query where d.version=release_version and c.search_vector@@query.ts order by ts_rank_cd(c.search_vector,query.ts) desc limit 24),
 semantic as (select c.id from public.chunks c join public.documents d on d.id=c.document_id where d.version=release_version and q_embedding is not null and c.embedding is not null order by c.embedding OPERATOR(extensions.<=>) q_embedding limit 24)
 select c.id,c.document_id,c.heading,c.content,d.title,d.url,d.version,
 ts_rank_cd(c.search_vector,query.ts),
 case when q_embedding is null or c.embedding is null then null else 1-(c.embedding OPERATOR(extensions.<=>) q_embedding) end
 from public.chunks c join public.documents d on d.id=c.document_id,query
 where c.id in(select id from lexical union select id from semantic);
$$;
revoke all on function public.retrieve_chunks(text,extensions.vector,text) from public,anon,authenticated;
grant execute on function public.retrieve_chunks(text,extensions.vector,text) to service_role;

insert into storage.buckets(id,name,public) values('source-documents','source-documents',true) on conflict do nothing;
create policy source_documents_read on storage.objects for select to anon,authenticated using(bucket_id='source-documents');
