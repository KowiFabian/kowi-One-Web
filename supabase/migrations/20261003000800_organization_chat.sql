begin;
alter table public.conversations add column organization_id uuid references public.organizations(id);
alter table public.conversations add column agent_installation_id uuid;
alter table public.conversations add constraint conversations_tenant_identity unique(id,organization_id);
alter table public.conversations add constraint conversations_tenant_agent foreign key(agent_installation_id,organization_id) references public.agent_installations(id,organization_id);
alter table public.conversations add constraint conversations_tenant_binding check((organization_id is null and agent_installation_id is null) or (organization_id is not null and agent_installation_id is not null and agent='business'));
alter table public.agent_ledger add column if not exists organization_id uuid references public.organizations(id);
alter policy own_conversations_create on public.conversations with check(user_id=(select auth.uid()) and organization_id is null);
alter policy own_conversations_read on public.conversations using((organization_id is null and user_id=(select auth.uid())) or (organization_id is not null and private.crm_role(organization_id) is not null));
alter policy own_conversations_delete on public.conversations using(user_id=(select auth.uid()) and organization_id is null);
alter policy ledger_append on public.agent_ledger with check(user_id=(select auth.uid()) and actor_id=(select auth.uid()) and organization_id is null);
alter policy ledger_read on public.agent_ledger using((organization_id is null and user_id=(select auth.uid())) or (organization_id is not null and private.crm_role(organization_id) is not null));
create table public.messages(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),
 conversation_id uuid not null,request_id uuid not null,sequence integer not null check(sequence between 1 and 100),
 role text not null check(role in ('user','assistant')),content text not null check(length(content) between 1 and 6000),
 created_at timestamptz not null default now(),foreign key(conversation_id,organization_id) references public.conversations(id,organization_id),
 unique(organization_id,request_id,role),unique(conversation_id,sequence,role)
);
create table public.agent_metrics(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),
 agent_id uuid not null,conversation_id uuid not null,request_id uuid not null,model text not null check(length(model) between 1 and 100),
 prompt_tokens integer check(prompt_tokens between 0 and 1000000),completion_tokens integer check(completion_tokens between 0 and 1000000),
 provider_request_id text not null check(length(provider_request_id) between 1 and 200),ai_spend numeric check(ai_spend>=0),created_at timestamptz not null default now(),
 foreign key(agent_id,organization_id) references public.agent_installations(id,organization_id),
 foreign key(conversation_id,organization_id) references public.conversations(id,organization_id),unique(organization_id,request_id)
);
do $$declare t text;begin foreach t in array array['messages','agent_metrics'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy tenant_read on public.%I for select to authenticated using(private.crm_role(organization_id) is not null)',t);
 execute format('create index on public.%I(organization_id,created_at)',t);
 end loop;end$$;
alter table public.agent_installations add column last_verified_at timestamptz;
revoke insert,update on public.agent_installations from authenticated;
grant insert(organization_id,name,status,config,allowed_origins) on public.agent_installations to authenticated;
grant update(name,status,config,allowed_origins) on public.agent_installations to authenticated;
create function private.guard_agent_registration() returns trigger language plpgsql set search_path='' as $$begin
 if new.status<>'draft' then raise exception 'New agents must start in draft';end if;return new;end$$;
revoke all on function private.guard_agent_registration() from public,anon,authenticated;
create trigger guard_agent_registration before insert on public.agent_installations for each row execute function private.guard_agent_registration();
create function private.guard_agent_activation() returns trigger language plpgsql set search_path='' as $$begin
 if old.status='draft' and new.status='active' and (old.last_verified_at is null or old.last_verified_at<now()-interval '7 days') then raise exception 'Verify a private AI conversation before activation';end if;
 if new.config<>old.config and old.status='draft' then new.last_verified_at=null;end if;
 return new;end$$;
revoke all on function private.guard_agent_activation() from public,anon,authenticated;
create trigger guard_agent_activation before update on public.agent_installations for each row execute function private.guard_agent_activation();
create function private.organization_actor_role(org uuid,actor uuid) returns text language sql stable security definer set search_path='' as $$
 select case when o.owner_id=actor then 'owner' else (select m.role from public.organization_members m where m.organization_id=org and m.user_id=actor) end
 from public.organizations o join auth.users u on u.id=actor where o.id=org and u.email_confirmed_at is not null and u.deleted_at is null
$$;
revoke all on function private.organization_actor_role(uuid,uuid) from public,anon,authenticated;
create table private.organization_ai_quotas(organization_id uuid primary key references public.organizations(id),minute_start timestamptz not null,minute_count integer not null,day_start timestamptz not null,day_count integer not null);
alter table private.organization_ai_quotas enable row level security;
revoke all on private.organization_ai_quotas from public,anon,authenticated,service_role;
create function public.consume_organization_ai_quota(p_org uuid,p_actor uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare q private.organization_ai_quotas;
begin
 if coalesce(private.organization_actor_role(p_org,p_actor),'') not in ('owner','admin','configurator','operator') then raise insufficient_privilege;end if;
 insert into private.organization_ai_quotas values(p_org,now(),0,now(),0) on conflict do nothing;
 select * into q from private.organization_ai_quotas where organization_id=p_org for update;
 if q.minute_start<=now()-interval '1 minute' then q.minute_start=now();q.minute_count=0;end if;
 if q.day_start<=now()-interval '24 hours' then q.day_start=now();q.day_count=0;end if;
 if q.minute_count>=12 or q.day_count>=300 then return false;end if;
 update private.organization_ai_quotas set minute_start=q.minute_start,minute_count=q.minute_count+1,day_start=q.day_start,day_count=q.day_count+1 where organization_id=p_org;return true;
end$$;
revoke all on function public.consume_organization_ai_quota(uuid,uuid) from public,anon,authenticated;
grant execute on function public.consume_organization_ai_quota(uuid,uuid) to service_role;
create function public.save_organization_chat(p_org uuid,p_agent uuid,p_actor uuid,p_conversation uuid,p_request uuid,p_revision integer,p_message text,p_response text,p_model text,p_prompt_tokens integer,p_completion_tokens integer,p_provider_id text,p_agent_updated_at timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare installation public.agent_installations;conv public.conversations;revision integer;actor_role text;
begin
 actor_role:=private.organization_actor_role(p_org,p_actor);
 if coalesce(actor_role,'') not in ('owner','admin','configurator','operator') then raise insufficient_privilege;end if;
 if p_revision is null or p_revision<0 or p_revision>=100 or length(p_message) not between 1 and 2000 or length(p_response) not between 1 and 6000 then raise invalid_parameter_value;end if;
 select * into installation from public.agent_installations where id=p_agent and organization_id=p_org for update;
 if not found or installation.status not in ('draft','active') or (installation.status='draft' and actor_role='operator') then raise exception 'Agent unavailable';end if;
 if installation.updated_at is distinct from p_agent_updated_at then raise exception 'Agent configuration changed' using errcode='40001';end if;
 insert into public.conversations(id,user_id,agent,organization_id,agent_installation_id,title) values(p_conversation,p_actor,'business',p_org,p_agent,left(p_message,72)) on conflict(id) do nothing;
 select * into conv from public.conversations where id=p_conversation for update;
 if conv.organization_id is distinct from p_org or conv.agent_installation_id is distinct from p_agent then raise insufficient_privilege;end if;
 select coalesce(max(sequence),0) into revision from public.messages where conversation_id=p_conversation;
 if revision<>p_revision then raise exception 'Conversation changed' using errcode='40001';end if;
 insert into public.messages(organization_id,conversation_id,request_id,sequence,role,content) values(p_org,p_conversation,p_request,revision+1,'user',p_message),(p_org,p_conversation,p_request,revision+1,'assistant',p_response);
 insert into public.agent_metrics(organization_id,agent_id,conversation_id,request_id,model,prompt_tokens,completion_tokens,provider_request_id) values(p_org,p_agent,p_conversation,p_request,p_model,p_prompt_tokens,p_completion_tokens,p_provider_id);
 insert into public.agent_ledger(user_id,actor_id,organization_id,agent,action,permission,result,evidence) values(p_actor,p_actor,p_org,'business','organization_web_chat_response','private_owner_preview','completed',jsonb_build_object('conversation_id',p_conversation,'request_id',p_request,'agent_id',p_agent,'provider_id',p_provider_id));
 update public.agent_installations set last_verified_at=now() where id=p_agent;
 return jsonb_build_object('conversationId',p_conversation,'response',p_response);
end$$;
revoke all on function public.save_organization_chat(uuid,uuid,uuid,uuid,uuid,integer,text,text,text,integer,integer,text,timestamptz) from public,anon,authenticated;
grant execute on function public.save_organization_chat(uuid,uuid,uuid,uuid,uuid,integer,text,text,text,integer,integer,text,timestamptz) to service_role;
create or replace function public.save_chat_turn(
  p_conversation uuid, p_request uuid, p_revision integer,
  p_message text, p_response text, p_goal jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  current_revision integer;
begin
  if u is null then raise insufficient_privilege; end if;
  perform 1 from public.conversations where id = p_conversation and user_id = u and organization_id is null for update;
  if not found then raise insufficient_privilege; end if;
  select coalesce(max(sequence),0) into current_revision from public.turns where conversation_id = p_conversation;
  if current_revision <> p_revision then
    raise exception 'Conversation changed' using errcode = '40001';
  end if;
  insert into public.turns(conversation_id,user_id,request_id,sequence,user_message,response,goal)
  values (p_conversation,u,p_request,current_revision+1,p_message,p_response,p_goal);
  if current_revision = 0 then
    update public.conversations set title = left(p_message,120) where id = p_conversation;
  end if;
end $$;
commit;
