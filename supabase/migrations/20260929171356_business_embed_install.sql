begin;

create table public.business_embeds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  allowed_origins text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_embed_origins_count check (cardinality(allowed_origins) between 0 and 5),
  constraint business_embed_enabled_origins check (not enabled or cardinality(allowed_origins) >= 1),
  unique (id,user_id)
);
alter table public.business_embeds enable row level security;
revoke all on public.business_embeds from anon, authenticated;
grant select, insert on public.business_embeds to authenticated;
grant update (enabled,allowed_origins,updated_at) on public.business_embeds to authenticated;
grant all on public.business_embeds to service_role;
create policy business_embeds_select on public.business_embeds for select to authenticated using ((select auth.uid()) = user_id);
create policy business_embeds_insert on public.business_embeds for insert to authenticated with check ((select auth.uid()) = user_id and enabled = false);
create policy business_embeds_update on public.business_embeds for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.validate_business_embed() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.enabled and not exists(select 1 from public.business_profiles where user_id = new.user_id and jsonb_typeof(config) = 'object') then
    raise exception 'Save the business profile before activation';
  end if;
  if tg_op = 'UPDATE' and (new.user_id <> old.user_id or new.id <> old.id) then raise exception 'Cannot transfer installation'; end if;
  return new;
end $$;
create trigger validate_business_embed before insert or update on public.business_embeds for each row execute function public.validate_business_embed();

create table public.business_embed_usage (
  business_id uuid not null references public.business_embeds(id) on delete cascade,
  bucket timestamptz not null,
  kind text not null check (kind in ('chat_minute','chat_day','lead_day')),
  used int not null default 0 check (used >= 0),
  primary key (business_id, bucket, kind)
);
alter table public.business_embed_usage enable row level security;
revoke all on public.business_embed_usage from anon, authenticated;
grant all on public.business_embed_usage to service_role;

create table public.business_embed_global_usage (
  bucket timestamptz not null,
  kind text not null check (kind in ('chat_minute','chat_day')),
  used int not null default 0 check (used >= 0),
  primary key (bucket,kind)
);
alter table public.business_embed_global_usage enable row level security;
revoke all on public.business_embed_global_usage from anon, authenticated;
grant all on public.business_embed_global_usage to service_role;

create function public.consume_business_embed_global_quota(p_kind text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_bucket timestamptz;
declare v_used integer;
begin
  if p_kind not in ('chat_minute','chat_day') or p_limit < 1 or p_limit > 10000 then return false; end if;
  v_bucket := case when p_kind = 'chat_minute' then date_trunc('minute', now()) else date_trunc('day', now()) end;
  insert into public.business_embed_global_usage(bucket,kind,used) values(v_bucket,p_kind,1)
    on conflict (bucket,kind) do update set used = business_embed_global_usage.used + 1
      where business_embed_global_usage.used < p_limit
    returning used into v_used;
  return v_used is not null;
end $$;
revoke all on function public.consume_business_embed_global_quota(text,integer) from public, anon, authenticated;
grant execute on function public.consume_business_embed_global_quota(text,integer) to service_role;

-- Atomic per-tenant spending. Only a trusted server with the service role may call this.
create function public.consume_business_embed_quota(p_business uuid, p_kind text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_bucket timestamptz;
declare v_used integer;
begin
  if p_kind not in ('chat_minute','chat_day','lead_day') or p_limit < 1 or p_limit > 1000 then return false; end if;
  if not exists(select 1 from public.business_embeds where id = p_business and enabled) then return false; end if;
  v_bucket := case when p_kind = 'chat_minute' then date_trunc('minute', now()) else date_trunc('day', now()) end;
  insert into public.business_embed_usage(business_id,bucket,kind,used) values(p_business,v_bucket,p_kind,1)
    on conflict (business_id,bucket,kind) do update set used = business_embed_usage.used + 1
      where business_embed_usage.used < p_limit
    returning used into v_used;
  return v_used is not null;
end $$;
revoke all on function public.consume_business_embed_quota(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.consume_business_embed_quota(uuid,text,integer) to service_role;

create table public.business_embed_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_embeds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  constraint business_embed_leads_tenant foreign key (business_id,user_id) references public.business_embeds(id,user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  contact text not null check (char_length(contact) between 3 and 120),
  request text not null check (char_length(request) between 1 and 1000),
  preferred_time text not null default '' check (char_length(preferred_time) <= 120),
  consented_at timestamptz not null default now(),
  status text not null default 'pending_review' check (status in ('pending_review','contacted','closed')),
  created_at timestamptz not null default now()
);
create index business_embed_leads_owner on public.business_embed_leads(user_id,created_at desc);
alter table public.business_embed_leads enable row level security;
revoke all on public.business_embed_leads from anon, authenticated;
grant select on public.business_embed_leads to authenticated;
grant update (status) on public.business_embed_leads to authenticated;
grant all on public.business_embed_leads to service_role;
create policy business_embed_leads_select on public.business_embed_leads for select to authenticated using ((select auth.uid()) = user_id);
create policy business_embed_leads_update on public.business_embed_leads for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.record_business_embed_lead(p_business uuid,p_name text,p_contact text,p_request text,p_preferred_time text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
declare v_lead uuid;
begin
  select user_id into v_owner from public.business_embeds where id = p_business and enabled;
  if v_owner is null then raise exception 'Installation inactive'; end if;
  if char_length(p_name) not between 1 and 100 or char_length(p_contact) not between 3 and 120 or char_length(p_request) not between 1 and 900 or char_length(p_preferred_time) > 90 then
    raise exception 'Invalid request';
  end if;
  insert into public.business_leads(user_id,name,contact,status,next_action,notes,source,consent)
    values(v_owner,p_name,p_contact,'nuevo','Revisar solicitud web y confirmar disponibilidad',left(p_request || case when p_preferred_time <> '' then ' · Horario preferido: ' || p_preferred_time else '' end,1000),'web',true)
    returning id into v_lead;
  insert into public.business_embed_leads(business_id,user_id,name,contact,request,preferred_time)
    values(p_business,v_owner,p_name,p_contact,p_request,p_preferred_time);
  insert into public.business_lead_events(user_id,lead_id,event_type,detail)
    values(v_owner,v_lead,'created',jsonb_build_object('source','web','consent',true,'business_id',p_business));
  return v_lead;
end $$;
revoke all on function public.record_business_embed_lead(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_business_embed_lead(uuid,text,text,text,text) to service_role;

commit;
