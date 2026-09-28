begin;

alter table public.conversations drop constraint conversations_agent_allowed;
alter table public.conversations add constraint conversations_agent_allowed
  check (agent in ('general', 'education', 'business'));

-- One tenant per owner in the pilot. The business agent only reads this owner-scoped profile.
create table public.business_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  config jsonb not null check (jsonb_typeof(config) = 'object' and octet_length(config::text) <= 30000),
  updated_at timestamptz not null default now()
);
create table public.business_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  contact text not null default '' check (char_length(contact) <= 120),
  status text not null default 'nuevo' check (status in ('nuevo','contactado','propuesta','ganado','perdido')),
  next_action text not null default '' check (char_length(next_action) <= 500),
  notes text not null default '' check (char_length(notes) <= 1000),
  updated_at timestamptz not null default now()
);
create index business_leads_owner on public.business_leads(user_id, updated_at desc);

alter table public.business_profiles enable row level security;
alter table public.business_leads enable row level security;
revoke all on public.business_profiles, public.business_leads from anon, authenticated;
grant select, insert, update on public.business_profiles, public.business_leads to authenticated;
create policy business_profiles_select on public.business_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy business_profiles_insert on public.business_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy business_profiles_update on public.business_profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy business_leads_select on public.business_leads for select to authenticated
  using ((select auth.uid()) = user_id);
create policy business_leads_insert on public.business_leads for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy business_leads_update on public.business_leads for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

commit;
