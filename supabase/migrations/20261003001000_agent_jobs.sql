begin;
create table public.agent_actions(
 job_id uuid primary key,organization_id uuid not null references public.organizations(id),
 agent_id uuid not null,actor_user_id uuid not null references auth.users(id),
 objective text not null,permissions text[] not null default array['conversation.reply'],
 tools text[] not null default array['openai.chat'],budget jsonb not null default '{"max_steps":2,"max_output_tokens":1200,"timeout_ms":60000,"max_concurrency":3}',
 risk_level text not null default 'LOW' check(risk_level='LOW'),
 status text not null check(status in ('running','completed','failed','cancelled','timed_out')),
 steps_used integer not null default 1 check(steps_used between 1 and 2),
 started_at timestamptz,attempt_started_at timestamptz,completed_at timestamptz,
 evidence jsonb not null default '{}',result jsonb not null default '{}',created_at timestamptz not null default now(),
 foreign key(agent_id,organization_id) references public.agent_installations(id,organization_id),
 unique(job_id,organization_id)
);
alter table public.agent_actions enable row level security;
revoke all on public.agent_actions from public,anon,authenticated;
grant select on public.agent_actions to authenticated;
grant all on public.agent_actions to service_role;
create policy job_read on public.agent_actions for select to authenticated using(private.crm_role(organization_id) is not null);
create index on public.agent_actions(organization_id,status,attempt_started_at);
create table public.agent_job_events(id uuid primary key default gen_random_uuid(),organization_id uuid not null,job_id uuid not null,status text not null,previous_status text,recorded_at timestamptz not null default now(),foreign key(job_id,organization_id) references public.agent_actions(job_id,organization_id));
alter table public.agent_job_events enable row level security;
revoke all on public.agent_job_events from public,anon,authenticated,service_role;
grant select on public.agent_job_events to authenticated;
create policy job_event_read on public.agent_job_events for select to authenticated using(private.crm_role(organization_id) is not null);
create function private.audit_agent_job() returns trigger language plpgsql security definer set search_path='' as $$begin
 if TG_OP='INSERT' then insert into public.agent_job_events(organization_id,job_id,status) values(new.organization_id,new.job_id,new.status);
 elsif new.status<>old.status then insert into public.agent_job_events(organization_id,job_id,status,previous_status) values(new.organization_id,new.job_id,new.status,old.status);end if;return new;
end$$;
revoke all on function private.audit_agent_job() from public,anon,authenticated;
create trigger audit_agent_job after insert or update on public.agent_actions for each row execute function private.audit_agent_job();
create function public.begin_organization_chat_job(p_org uuid,p_agent uuid,p_actor uuid,p_request uuid,p_fingerprint text) returns uuid language plpgsql security definer set search_path='' as $$
declare actor_role text;installation public.agent_installations;job public.agent_actions;running integer;
begin
 actor_role:=private.organization_actor_role(p_org,p_actor);
 if coalesce(actor_role,'') not in ('owner','admin','configurator','operator') then raise insufficient_privilege;end if;
 if p_request is null or p_fingerprint is null or length(p_fingerprint)<>64 then raise invalid_parameter_value;end if;
 perform 1 from public.organizations where id=p_org for update;
 select * into installation from public.agent_installations where id=p_agent and organization_id=p_org;
 if not found or installation.status not in ('draft','active') or (installation.status='draft' and actor_role='operator') then raise exception 'Agent unavailable';end if;
 update public.agent_actions set status='timed_out',completed_at=now(),result=jsonb_build_object('reason','execution_timeout') where organization_id=p_org and status='running' and attempt_started_at<now()-interval '60 seconds';
 select count(*) into running from public.agent_actions where organization_id=p_org and status='running';
 if running>=3 then raise exception 'Organization concurrency limit reached' using errcode='54000';end if;
 select * into job from public.agent_actions where job_id=p_request for update;
 if found then
  if job.organization_id<>p_org or job.agent_id<>p_agent or job.actor_user_id<>p_actor or job.evidence->>'input_fingerprint'<>p_fingerprint then raise exception 'Job request reused' using errcode='40001';end if;
  if job.status='running' then raise exception 'Job already running' using errcode='40001';end if;
  if job.status not in ('failed','timed_out') or job.steps_used>=2 then raise exception 'Job cannot be restarted' using errcode='54000';end if;
  update public.agent_actions set status='running',steps_used=steps_used+1,attempt_started_at=now(),completed_at=null where job_id=p_request;
 else
  insert into public.agent_actions(job_id,organization_id,agent_id,actor_user_id,objective,status,started_at,attempt_started_at,evidence) values(p_request,p_org,p_agent,p_actor,'Responder una consulta empresarial privada autorizada','running',now(),now(),jsonb_build_object('input_fingerprint',p_fingerprint));
 end if;return p_request;
end$$;
revoke all on function public.begin_organization_chat_job(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.begin_organization_chat_job(uuid,uuid,uuid,uuid,text) to service_role;
create function public.fail_organization_chat_job(p_org uuid,p_actor uuid,p_request uuid) returns void language plpgsql security definer set search_path='' as $$begin
 if coalesce(private.organization_actor_role(p_org,p_actor),'') not in ('owner','admin','configurator','operator') then raise insufficient_privilege;end if;
 update public.agent_actions set status='failed',completed_at=now(),result=jsonb_build_object('reason','response_not_completed') where job_id=p_request and organization_id=p_org and actor_user_id=p_actor and status='running';
end$$;
revoke all on function public.fail_organization_chat_job(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.fail_organization_chat_job(uuid,uuid,uuid) to service_role;
create function private.complete_organization_chat_job() returns trigger language plpgsql security definer set search_path='' as $$
declare job public.agent_actions;actor uuid;
begin
 select * into job from public.agent_actions where job_id=new.request_id for update;
 if found then
 if job.organization_id<>new.organization_id or job.agent_id<>new.agent_id or job.status<>'running' or job.attempt_started_at<now()-interval '60 seconds' then raise exception 'Job unavailable' using errcode='40001';end if;
 update public.agent_actions set status='completed',completed_at=now(),result=jsonb_build_object('conversation_id',new.conversation_id),evidence=evidence||jsonb_build_object('provider_id',new.provider_request_id,'model',new.model,'prompt_tokens',new.prompt_tokens,'completion_tokens',new.completion_tokens) where job_id=new.request_id;
 else
 -- During coordinated rollout, preserve existing server calls while recording
 -- their actual result; their start time was not observed and stays NULL.
 select user_id into actor from public.conversations where id=new.conversation_id;
 insert into public.agent_actions(job_id,organization_id,agent_id,actor_user_id,objective,status,completed_at,evidence,result) values(new.request_id,new.organization_id,new.agent_id,actor,'Respuesta empresarial registrada por el backend anterior','completed',now(),jsonb_build_object('provider_id',new.provider_request_id,'model',new.model,'prompt_tokens',new.prompt_tokens,'completion_tokens',new.completion_tokens,'start_observation','UNOBSERVED'),jsonb_build_object('conversation_id',new.conversation_id));
 end if;return new;
end$$;
revoke all on function private.complete_organization_chat_job() from public,anon,authenticated;
create trigger complete_organization_chat_job after insert on public.agent_metrics for each row execute function private.complete_organization_chat_job();
create function private.cancel_organization_agent_jobs() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.status in ('paused','revoked','terminated') and new.status<>old.status then update public.agent_actions set status='cancelled',completed_at=now(),result=jsonb_build_object('reason','agent_'||new.status) where agent_id=new.id and organization_id=new.organization_id and status='running';end if;return new;
end$$;
revoke all on function private.cancel_organization_agent_jobs() from public,anon,authenticated;
create trigger cancel_organization_agent_jobs after update on public.agent_installations for each row execute function private.cancel_organization_agent_jobs();
create function private.expire_organization_agent_jobs() returns integer language plpgsql security definer set search_path='' as $$
declare expired integer;
begin
 update public.agent_actions set status='timed_out',completed_at=now(),result=jsonb_build_object('reason','execution_timeout') where status='running' and attempt_started_at<now()-interval '60 seconds';
 get diagnostics expired=row_count;return expired;
end$$;
revoke all on function private.expire_organization_agent_jobs() from public,anon,authenticated;
grant execute on function private.expire_organization_agent_jobs() to service_role;
commit;
