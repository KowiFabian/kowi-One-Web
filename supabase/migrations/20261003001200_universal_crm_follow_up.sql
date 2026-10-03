begin;
create table public.companies(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),name text not null check(length(name) between 1 and 160),website text not null default '' check(length(website)<=300),created_at timestamptz not null default now(),unique(id,organization_id));
alter table public.contacts add column company_id uuid;
alter table public.contacts add constraint contacts_company_tenant foreign key(company_id,organization_id) references public.companies(id,organization_id);
create table public.activities(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),title text not null check(length(title) between 1 and 160),kind text not null default 'note' check(kind in ('note','call','meeting','follow_up')),status text not null default 'planned' check(status in ('planned','recorded')),details text not null default '' check(length(details)<=2000),occurred_at timestamptz,contact_id uuid,opportunity_id uuid,conversation_id uuid,created_at timestamptz not null default now(),unique(id,organization_id),foreign key(contact_id,organization_id) references public.contacts(id,organization_id),foreign key(opportunity_id,organization_id) references public.opportunities(id,organization_id),foreign key(conversation_id,organization_id) references public.conversations(id,organization_id));
create table public.appointments(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),title text not null check(length(title) between 1 and 160),starts_at timestamptz not null,ends_at timestamptz not null,status text not null default 'proposed' check(status in ('proposed','confirmed','cancelled')),notes text not null default '' check(length(notes)<=2000),contact_id uuid,opportunity_id uuid,created_at timestamptz not null default now(),check(ends_at>starts_at),unique(id,organization_id),foreign key(contact_id,organization_id) references public.contacts(id,organization_id),foreign key(opportunity_id,organization_id) references public.opportunities(id,organization_id));
do $$declare t text;begin foreach t in array array['companies','activities','appointments'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select,insert,update on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy crm_read on public.%I for select to authenticated using(private.crm_role(organization_id) is not null)',t);
 execute format('create policy crm_insert on public.%I for insert to authenticated with check(private.crm_role(organization_id) in (''owner'',''admin'',''configurator'',''operator''))',t);
 execute format('create policy crm_update on public.%I for update to authenticated using(private.crm_role(organization_id) in (''owner'',''admin'',''configurator'',''operator'')) with check(private.crm_role(organization_id) in (''owner'',''admin'',''configurator'',''operator''))',t);
 execute format('create index on public.%I(organization_id,created_at)',t);
 end loop;end$$;
commit;
