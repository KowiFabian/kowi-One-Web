begin;
create or replace function private.crm_role(org uuid) returns text language sql stable security definer set search_path='' as $$
select case when exists(select 1 from public.organizations o where o.id=org and o.owner_id=auth.uid()) then 'owner' else (select m.role from public.organization_members m where m.organization_id=org and m.user_id=auth.uid()) end
$$;
revoke all on function private.crm_role(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.crm_role(uuid) to authenticated;
create table public.crm_stages(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),name text not null check(char_length(name) between 1 and 80),position integer not null check(position between 0 and 100),outcome text not null default 'open' check(outcome in ('open','won','lost')),created_at timestamptz not null default now(),unique(id,organization_id),unique(organization_id,position));
create table public.contacts(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),name text not null check(char_length(name) between 1 and 160),email text not null default '' check(char_length(email)<=254),phone text not null default '' check(char_length(phone)<=40),consent boolean not null default false,created_at timestamptz not null default now(),unique(id,organization_id));
create table public.leads(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),title text not null check(char_length(title) between 1 and 160),contact_id uuid,source text not null default 'manual' check(source in ('manual','web','email','whatsapp','voice','other')),notes text not null default '' check(char_length(notes)<=2000),created_at timestamptz not null default now(),unique(id,organization_id),foreign key(contact_id,organization_id) references public.contacts(id,organization_id));
create table public.opportunities(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),title text not null check(char_length(title) between 1 and 160),lead_id uuid,contact_id uuid,stage_id uuid not null,value_minor bigint check(value_minor between 0 and 100000000000),currency text not null default 'EUR' check(currency ~ '^[A-Z]{3}$'),created_at timestamptz not null default now(),unique(id,organization_id),foreign key(contact_id,organization_id) references public.contacts(id,organization_id),foreign key(lead_id,organization_id) references public.leads(id,organization_id),foreign key(stage_id,organization_id) references public.crm_stages(id,organization_id));
create table public.tasks(id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),title text not null check(char_length(title) between 1 and 160),opportunity_id uuid,contact_id uuid,status text not null default 'open' check(status in ('open','done','cancelled')),due_at timestamptz,created_at timestamptz not null default now(),unique(id,organization_id),foreign key(opportunity_id,organization_id) references public.opportunities(id,organization_id),foreign key(contact_id,organization_id) references public.contacts(id,organization_id));
do $$ declare t text; roles text; begin
 foreach t in array array['crm_stages','contacts','leads','opportunities','tasks'] loop
 roles:=case when t='crm_stages' then '''owner'',''admin'',''configurator''' else '''owner'',''admin'',''configurator'',''operator''' end;
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select,insert,update on public.%I to authenticated',t);
 execute format('create policy crm_read on public.%I for select to authenticated using(private.crm_role(organization_id) is not null)',t);
 execute format('create policy crm_insert on public.%I for insert to authenticated with check(private.crm_role(organization_id) in (%s))',t,roles);
 execute format('create policy crm_update on public.%I for update to authenticated using(private.crm_role(organization_id) in (%s)) with check(private.crm_role(organization_id) in (%s))',t,roles,roles);
 execute format('create index on public.%I(organization_id,created_at)',t);
 end loop;end $$;
create function private.seed_crm_stages() returns trigger language plpgsql security definer set search_path='' as $$begin
insert into public.crm_stages(organization_id,name,position,outcome) values (new.id,'Nuevo',0,'open'),(new.id,'Cualificado',1,'open'),(new.id,'Contactado',2,'open'),(new.id,'Propuesta',3,'open'),(new.id,'Ganado',4,'won'),(new.id,'Perdido',5,'lost');return new;end $$;
revoke all on function private.seed_crm_stages() from public,anon,authenticated;
create trigger seed_crm_stages after insert on public.organizations for each row execute function private.seed_crm_stages();
insert into public.crm_stages(organization_id,name,position,outcome) select o.id,s.name,s.position,s.outcome from public.organizations o cross join(values ('Nuevo',0,'open'),('Cualificado',1,'open'),('Contactado',2,'open'),('Propuesta',3,'open'),('Ganado',4,'won'),('Perdido',5,'lost')) s(name,position,outcome);
commit;
