alter table public.business_leads add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.business_actions add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.business_appointments add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.agent_ledger add column organization_id uuid references public.organizations(id) on delete cascade;
create table public.agent_incidents(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 installation_id uuid references public.agent_installations(id) on delete set null, severity text not null check(severity in ('info','warning','error','critical')),
 category text not null check(category in ('runtime','security','integration','data','policy')), code text not null, summary text not null,
 status text not null default 'open' check(status in ('open','investigating','resolved')), evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), resolved_at timestamptz
);
create table public.agent_metrics_daily(
 organization_id uuid not null references public.organizations(id) on delete cascade, installation_id uuid not null references public.agent_installations(id) on delete cascade,
 day date not null, conversations integer not null default 0 check(conversations>=0), leads integer not null default 0 check(leads>=0),
 qualified_leads integer not null default 0 check(qualified_leads>=0), actions_prepared integer not null default 0 check(actions_prepared>=0),
 actions_executed integer not null default 0 check(actions_executed>=0), errors integer not null default 0 check(errors>=0),
 primary key(installation_id,day)
);
alter table public.agent_incidents enable row level security; alter table public.agent_metrics_daily enable row level security;
revoke all on public.agent_incidents,public.agent_metrics_daily from anon,authenticated;
grant select,insert,update on public.agent_incidents to authenticated; grant select on public.agent_metrics_daily to authenticated;
create policy incident_read on public.agent_incidents for select to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=agent_incidents.organization_id and m.user_id=(select auth.uid())) or exists(select 1 from public.organizations o where o.id=agent_incidents.organization_id and o.owner_id=(select auth.uid())));
create policy incident_write on public.agent_incidents for insert to authenticated with check(exists(select 1 from public.organization_members m where m.organization_id=agent_incidents.organization_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin','configurator','operator')) or exists(select 1 from public.organizations o where o.id=agent_incidents.organization_id and o.owner_id=(select auth.uid())));
create policy incident_update on public.agent_incidents for update to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=agent_incidents.organization_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin','configurator')) or exists(select 1 from public.organizations o where o.id=agent_incidents.organization_id and o.owner_id=(select auth.uid()))) with check(exists(select 1 from public.organization_members m where m.organization_id=agent_incidents.organization_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin','configurator')) or exists(select 1 from public.organizations o where o.id=agent_incidents.organization_id and o.owner_id=(select auth.uid())));
create policy metrics_read on public.agent_metrics_daily for select to authenticated using(exists(select 1 from public.organization_members m where m.organization_id=agent_metrics_daily.organization_id and m.user_id=(select auth.uid())) or exists(select 1 from public.organizations o where o.id=agent_metrics_daily.organization_id and o.owner_id=(select auth.uid())));
create index business_leads_org on public.business_leads(organization_id,updated_at desc); create index business_actions_org on public.business_actions(organization_id,created_at desc); create index agent_incidents_org on public.agent_incidents(organization_id,created_at desc);
revoke all on public.chat_quotas from anon,authenticated;
