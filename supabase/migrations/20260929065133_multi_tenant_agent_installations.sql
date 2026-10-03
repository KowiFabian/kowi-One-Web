create table public.organizations (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete restrict,
 name text not null check(char_length(name) between 2 and 120), slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
 plan text not null default 'pro' check(plan in ('pilot','pro','enterprise')), created_at timestamptz not null default now()
);
create table public.organization_members (
 organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','admin','configurator','operator','viewer')), created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create table public.agent_installations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 public_key uuid not null default gen_random_uuid() unique, name text not null default 'KOWI', status text not null default 'draft' check(status in ('draft','active','paused')),
 config jsonb not null default '{}'::jsonb check(jsonb_typeof(config)='object' and octet_length(config::text)<20000),
 allowed_origins text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index organization_members_user on public.organization_members(user_id);
create index agent_installations_org on public.agent_installations(organization_id);
alter table public.organizations enable row level security; alter table public.organization_members enable row level security; alter table public.agent_installations enable row level security;
revoke all on public.organizations,public.organization_members,public.agent_installations from anon,authenticated;
grant select,insert,update on public.organizations to authenticated; grant select,insert,update,delete on public.organization_members to authenticated; grant select,insert,update,delete on public.agent_installations to authenticated;
create policy org_read on public.organizations for select to authenticated using(owner_id=(select auth.uid()) or exists(select 1 from public.organization_members m where m.organization_id=id and m.user_id=(select auth.uid())));
create policy org_insert on public.organizations for insert to authenticated with check(owner_id=(select auth.uid()));
create policy org_update on public.organizations for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy member_read on public.organization_members for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid())));
create policy member_write on public.organization_members for all to authenticated using(exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid()))) with check(exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid())));
create policy install_read on public.agent_installations for select to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=organization_id and m.user_id=(select auth.uid())) or exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid())));
create policy install_write on public.agent_installations for all to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=organization_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin','configurator')) or exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid()))) with check(exists(select 1 from public.organization_members m where m.organization_id=organization_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin','configurator')) or exists(select 1 from public.organizations o where o.id=organization_id and o.owner_id=(select auth.uid())));
