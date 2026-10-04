begin;
create table public.director_orders(
 id uuid primary key,organization_id uuid not null references public.organizations(id),agent_id uuid not null,
 requester_id uuid not null references auth.users(id),kind text not null check(kind in ('operations','commercial','foundation')),
 objective text not null check(length(objective) between 5 and 1000),markets text[] not null default '{}',
 plan jsonb not null,status text not null default 'pending_approval' check(status in ('pending_approval','approved','completed','rejected','cancelled','expired')),
 approved_by uuid references auth.users(id),approved_at timestamptz,expires_at timestamptz not null,
 completed_at timestamptz,created_at timestamptz not null default now(),
 foreign key(agent_id,organization_id) references public.agent_installations(id,organization_id),
 unique(id,organization_id)
);
create table public.director_events(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null,order_id uuid not null,
 event text not null,actor_id uuid references auth.users(id),evidence jsonb not null default '{}',
 recorded_at timestamptz not null default now(),
 foreign key(order_id,organization_id) references public.director_orders(id,organization_id)
);
create table public.foundation_groups(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),
 name text not null check(length(name) between 1 and 160),purpose text not null,
 created_from uuid not null,created_at timestamptz not null default now(),unique(id,organization_id),
 foreign key(created_from,organization_id) references public.director_orders(id,organization_id)
);
create table public.foundation_group_members(
 organization_id uuid not null,group_id uuid not null,user_id uuid not null references auth.users(id),
 consent_version text not null check(consent_version='foundation-collaboration-v1'),
 consented_at timestamptz not null default now(),withdrawn_at timestamptz,
 primary key(group_id,user_id),
 foreign key(group_id,organization_id) references public.foundation_groups(id,organization_id)
);
create table public.director_report_preferences(
 organization_id uuid primary key references public.organizations(id),timezone text not null,created_at timestamptz not null default now()
);
create table public.director_daily_reports(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),
 report_date date not null,timezone text not null,observed_at timestamptz not null default now(),
 observed jsonb not null,interpretation text not null,recommendation text not null,
 unique(organization_id,report_date)
);
do $$declare t text;begin
 foreach t in array array['director_orders','director_events','foundation_groups','director_report_preferences','director_daily_reports'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated,service_role',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy tenant_read on public.%I for select to authenticated using(private.crm_role(organization_id) is not null)',t);
 end loop;
end$$;
alter table public.foundation_group_members enable row level security;
revoke all on public.foundation_group_members from public,anon,authenticated,service_role;
grant select on public.foundation_group_members to authenticated;
create policy own_consent on public.foundation_group_members for select to authenticated using(user_id=auth.uid() and private.crm_role(organization_id) is not null);
create index on public.director_orders(organization_id,created_at);
create index on public.director_events(organization_id,recorded_at);

create function private.require_director_owner(p_org uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();begin
 if actor is null or coalesce(private.crm_role(p_org),'')<>'owner' or not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null and deleted_at is null) then raise insufficient_privilege;end if;
 return actor;
end$$;
revoke all on function private.require_director_owner(uuid) from public,anon,authenticated,service_role;

create function public.propose_director_order(p_org uuid,p_agent uuid,p_request uuid,p_kind text,p_objective text,p_markets text[],p_timezone text) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid;steps jsonb;existing public.director_orders;begin
 actor:=private.require_director_owner(p_org);
 if p_request is null or p_kind is null or p_kind not in ('operations','commercial','foundation') or p_objective is null or length(btrim(p_objective)) not between 5 and 1000 or p_markets is null or cardinality(p_markets)>8 or exists(select 1 from unnest(p_markets) m where m is null or m not in ('national','europe','asia','africa','north_america','south_america','indonesia','oceania')) or p_timezone is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise invalid_parameter_value;end if;
 perform 1 from public.organizations where id=p_org for update;
 if not exists(select 1 from public.agent_installations where id=p_agent and organization_id=p_org and status='active' and last_verified_at>=now()-interval '7 days' and coalesce(config->>'synthetic','false')<>'true' and exists(select 1 from public.agent_metrics metric where metric.agent_id=public.agent_installations.id and metric.organization_id=p_org and metric.created_at>=now()-interval '7 days')) then raise exception 'Verified active agent required' using errcode='42501';end if;
 select * into existing from public.director_orders where id=p_request;
 if found then
 if existing.organization_id<>p_org or existing.agent_id<>p_agent or existing.requester_id<>actor or existing.kind<>p_kind or existing.objective<>btrim(p_objective) or existing.markets<>p_markets then raise invalid_parameter_value;end if;
 return p_request;end if;
 if (select count(*) from public.director_orders where organization_id=p_org and created_at>now()-interval '24 hours')>=10 then raise exception 'Daily order quota reached' using errcode='54000';end if;
 steps:=case p_kind
 when 'commercial' then '[{"type":"task","title":"Validar mercados, idiomas, moneda y propuesta comercial"},{"type":"task","title":"Revisar contactos autorizados y consentimiento por finalidad"},{"type":"task","title":"Preparar propuesta y contenido localizado para revisión humana"},{"type":"task","title":"Solicitar aprobación de destinatarios y comunicación exacta"},{"type":"task","title":"Medir respuesta, oportunidad y siguiente paso en CRM"}]'::jsonb
 when 'foundation' then '[{"type":"group","title":"IA Human-First · investigación y verificación"},{"type":"group","title":"Educación y acceso al conocimiento"},{"type":"group","title":"Proyectos de bienestar e impacto comunitario"},{"type":"task","title":"Definir responsables humanos, propósito y criterios de evidencia"},{"type":"task","title":"Preparar invitación voluntaria y aviso de privacidad para aprobación"}]'::jsonb
 else '[{"type":"task","title":"Delimitar alcance, responsable y resultado verificable"},{"type":"task","title":"Revisar agenda, contactos y datos estrictamente necesarios"},{"type":"task","title":"Preparar acciones y aprobaciones específicas"},{"type":"task","title":"Verificar resultado y registrar evidencia"}]'::jsonb end;
 insert into public.director_orders(id,organization_id,agent_id,requester_id,kind,objective,markets,plan,expires_at)
 values(p_request,p_org,p_agent,actor,p_kind,btrim(p_objective),p_markets,jsonb_build_object('version',1,'execution_scope','internal_tasks_and_groups_only','max_steps',6,'steps',steps),now()+interval '7 days');
 insert into public.director_report_preferences(organization_id,timezone) values(p_org,p_timezone) on conflict(organization_id) do nothing;
 insert into public.director_events(organization_id,order_id,event,actor_id,evidence) values(p_org,p_request,'proposed',actor,jsonb_build_object('plan_version',1,'external_execution',false));
 return p_request;
end$$;
revoke all on function public.propose_director_order(uuid,uuid,uuid,text,text,text[],text) from public,anon,service_role;
grant execute on function public.propose_director_order(uuid,uuid,uuid,text,text,text[],text) to authenticated;

create function public.decide_director_order(p_org uuid,p_order uuid,p_decision text) returns text language plpgsql security definer set search_path='' as $$
declare actor uuid;job public.director_orders;begin
 actor:=private.require_director_owner(p_org);
 select * into job from public.director_orders where id=p_order and organization_id=p_org;
 if not found then raise insufficient_privilege;end if;
 perform 1 from public.agent_installations where id=job.agent_id and organization_id=p_org for update;
 select * into job from public.director_orders where id=p_order and organization_id=p_org for update;
 if not found then raise insufficient_privilege;end if;
 if p_decision is null or p_decision not in ('approve','reject') then raise invalid_parameter_value;end if;
 if job.status not in ('pending_approval','approved') or (p_decision='approve' and job.status<>'pending_approval') then raise exception 'Decision unavailable' using errcode='40001';end if;
 if p_decision='approve' then
 if job.expires_at<=now() or not exists(select 1 from public.agent_installations where id=job.agent_id and organization_id=p_org and status='active' and last_verified_at>=now()-interval '7 days' and coalesce(config->>'synthetic','false')<>'true' and exists(select 1 from public.agent_metrics metric where metric.agent_id=public.agent_installations.id and metric.organization_id=p_org and metric.created_at>=now()-interval '7 days')) then raise insufficient_privilege;end if;
 update public.director_orders set status='approved',approved_by=actor,approved_at=now(),expires_at=now()+interval '24 hours' where id=p_order;
 else update public.director_orders set status='rejected' where id=p_order;end if;
 insert into public.director_events(organization_id,order_id,event,actor_id,evidence) values(p_org,p_order,p_decision,actor,jsonb_build_object('plan_version',1,'external_execution',false));
 return case when p_decision='approve' then 'approved' else 'rejected' end;
end$$;
revoke all on function public.decide_director_order(uuid,uuid,text) from public,anon,service_role;
grant execute on function public.decide_director_order(uuid,uuid,text) to authenticated;

create function public.execute_director_order(p_org uuid,p_order uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;job public.director_orders;step jsonb;created uuid;results jsonb:='[]';begin
 actor:=private.require_director_owner(p_org);
 select * into job from public.director_orders where id=p_order and organization_id=p_org;
 if not found then raise insufficient_privilege;end if;
 perform 1 from public.agent_installations where id=job.agent_id and organization_id=p_org for update;
 select * into job from public.director_orders where id=p_order and organization_id=p_org for update;
 if not found then raise insufficient_privilege;end if;
 if job.status='completed' then return (select evidence from public.director_events where order_id=p_order and event='completed' limit 1);end if;
 if job.status<>'approved' or job.approved_by<>actor or job.expires_at<=now() then raise insufficient_privilege;end if;
 perform 1 from public.agent_installations where id=job.agent_id and organization_id=p_org and status='active' and last_verified_at>=now()-interval '7 days' and coalesce(config->>'synthetic','false')<>'true' and exists(select 1 from public.agent_metrics metric where metric.agent_id=public.agent_installations.id and metric.organization_id=p_org and metric.created_at>=now()-interval '7 days') for update;
 if not found then raise insufficient_privilege;end if;
 for step in select value from jsonb_array_elements(job.plan->'steps') loop
 if step->>'type'='task' then
 insert into public.tasks(organization_id,title,status) values(p_org,left(job.objective,50)||' · '||left(step->>'title',100),'open') returning id into created;
 elsif step->>'type'='group' and job.kind='foundation' then
 insert into public.foundation_groups(organization_id,name,purpose,created_from) values(p_org,step->>'title',job.objective,p_order) returning id into created;
 else raise insufficient_privilege;end if;
 results:=results||jsonb_build_array(jsonb_build_object('type',step->>'type','id',created));
 end loop;
 update public.director_orders set status='completed',completed_at=now() where id=p_order;
 insert into public.director_events(organization_id,order_id,event,actor_id,evidence) values(p_org,p_order,'completed',actor,jsonb_build_object('results',results,'external_execution',false,'objective_achieved',false));
 return jsonb_build_object('results',results,'external_execution',false,'objective_achieved',false);
end$$;
revoke all on function public.execute_director_order(uuid,uuid) from public,anon,service_role;
grant execute on function public.execute_director_order(uuid,uuid) to authenticated;

create function public.foundation_group_consent(p_org uuid,p_group uuid,p_join boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or private.crm_role(p_org) is null or p_join is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null and deleted_at is null) or not exists(select 1 from public.foundation_groups where id=p_group and organization_id=p_org) then raise insufficient_privilege;end if;
 if p_join then
 insert into public.foundation_group_members(organization_id,group_id,user_id,consent_version) values(p_org,p_group,auth.uid(),'foundation-collaboration-v1') on conflict(group_id,user_id) do update set consented_at=now(),withdrawn_at=null;
 else update public.foundation_group_members set withdrawn_at=now() where group_id=p_group and organization_id=p_org and user_id=auth.uid() and withdrawn_at is null;end if;
end$$;
revoke all on function public.foundation_group_consent(uuid,uuid,boolean) from public,anon,service_role;
grant execute on function public.foundation_group_consent(uuid,uuid,boolean) to authenticated;

create function private.cancel_director_orders() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status in ('paused','revoked','terminated') and new.status<>old.status then
 with stopped as(update public.director_orders set status='cancelled' where agent_id=new.id and organization_id=new.organization_id and status in ('pending_approval','approved') returning id)
 insert into public.director_events(organization_id,order_id,event,evidence) select new.organization_id,id,'cancelled',jsonb_build_object('reason','agent_'||new.status) from stopped;
 end if;return new;
end$$;
revoke all on function private.cancel_director_orders() from public,anon,authenticated,service_role;
create trigger cancel_director_orders after update on public.agent_installations for each row execute function private.cancel_director_orders();

create function private.capture_director_midday_reports() returns integer language plpgsql security definer set search_path='' as $$
declare schedule record;captured integer:=0;counts jsonb;begin
 for schedule in select organization_id,timezone,(now() at time zone timezone)::date as local_date from public.director_report_preferences where extract(hour from now() at time zone timezone)>=12 loop
 select jsonb_build_object('pending_approval',count(*) filter(where status='pending_approval'),'approved',count(*) filter(where status='approved' and expires_at>now()),'internal_work_created',count(*) filter(where status='completed'),'expired_authorizations',count(*) filter(where status in ('pending_approval','approved') and expires_at<=now())) into counts from public.director_orders where organization_id=schedule.organization_id;
 counts:=counts||jsonb_build_object('open_tasks',(select count(*) from public.tasks where organization_id=schedule.organization_id and status='open'),'contacts',(select count(*) from public.contacts where organization_id=schedule.organization_id),'opportunities',(select count(*) from public.opportunities where organization_id=schedule.organization_id),'foundation_groups',(select count(*) from public.foundation_groups where organization_id=schedule.organization_id));
 insert into public.director_daily_reports(organization_id,report_date,timezone,observed,interpretation,recommendation) values(schedule.organization_id,schedule.local_date,schedule.timezone,counts,'Los conteos describen registros internos. No acreditan ventas, comunicaciones ni objetivos alcanzados.','Revisar órdenes pendientes, consentimientos, agenda y evidencias antes de autorizar acciones externas.') on conflict(organization_id,report_date) do nothing;
 if found then captured:=captured+1;end if;
 end loop;return captured;
end$$;
revoke all on function private.capture_director_midday_reports() from public,anon,authenticated;
grant execute on function private.capture_director_midday_reports() to service_role;
commit;
