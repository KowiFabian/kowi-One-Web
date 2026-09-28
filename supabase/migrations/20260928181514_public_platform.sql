-- One company per owner in the pilot; owner-scoped RLS on every operational table.
alter table public.business_leads add column if not exists source text not null default 'manual' check (source in ('manual','web','telefono'));
alter table public.business_leads add column if not exists consent boolean not null default false;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  idea text not null check (char_length(idea) between 5 and 2000),
  objective text not null check (char_length(objective) between 3 and 1000),
  phases jsonb not null default '[]'::jsonb check (jsonb_typeof(phases)='array' and octet_length(phases::text)<10000),
  tasks jsonb not null default '[]'::jsonb check (jsonb_typeof(tasks)='array' and octet_length(tasks::text)<10000),
  next_action text not null check (char_length(next_action) between 3 and 500),
  status text not null default 'borrador' check (status in ('borrador','en_marcha','completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_created on public.projects(user_id,created_at desc);
alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select,insert,update,delete on public.projects to authenticated;
create policy projects_read on public.projects for select to authenticated using ((select auth.uid())=user_id);
create policy projects_insert on public.projects for insert to authenticated with check ((select auth.uid())=user_id);
create policy projects_update on public.projects for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy projects_delete on public.projects for delete to authenticated using ((select auth.uid())=user_id);

create table public.agent_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  agent text not null check (agent in ('business','projects','general','education')),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (char_length(action) between 1 and 100),
  permission text not null check (char_length(permission) between 1 and 100),
  result text not null check (result in ('proposed','approved','rejected','completed','failed')),
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence)='object' and octet_length(evidence::text)<4000),
  created_at timestamptz not null default now()
);
create index agent_ledger_owner_created on public.agent_ledger(user_id,created_at desc);
alter table public.agent_ledger enable row level security;
revoke all on public.agent_ledger from anon, authenticated;
grant select,insert on public.agent_ledger to authenticated;
create policy ledger_read on public.agent_ledger for select to authenticated using ((select auth.uid())=user_id);
create policy ledger_append on public.agent_ledger for insert to authenticated with check ((select auth.uid())=user_id and (select auth.uid())=actor_id);
-- No updates or deletes to the append-only ledger through the Data API.
