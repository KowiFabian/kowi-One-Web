begin;
alter table public.agent_installations drop constraint agent_installations_status_check;
alter table public.agent_installations add constraint agent_installations_status_check check(status in ('draft','active','paused','revoked','terminated'));
alter table public.agent_installations add constraint agent_installations_tenant_identity unique(id,organization_id);
create table public.agent_lifecycle_events(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),
 agent_id uuid not null,actor_user_id uuid,event text not null,previous_status text,status text not null,created_at timestamptz not null default now(),
 foreign key(agent_id,organization_id) references public.agent_installations(id,organization_id)
);
alter table public.agent_lifecycle_events enable row level security;
revoke all on public.agent_lifecycle_events from public,anon,authenticated;
grant select on public.agent_lifecycle_events to authenticated;
create policy lifecycle_read on public.agent_lifecycle_events for select to authenticated using(private.crm_role(organization_id) is not null);
create index on public.agent_lifecycle_events(organization_id,created_at);
create function private.guard_agent_lifecycle() returns trigger language plpgsql set search_path='' as $$begin
 if new.organization_id<>old.organization_id or new.id<>old.id then raise exception 'Agent identity is immutable';end if;
 if new.status<>old.status and not (
 (old.status='draft' and new.status in ('active','revoked','terminated')) or
 (old.status='active' and new.status in ('paused','revoked','terminated')) or
 (old.status='paused' and new.status in ('active','revoked','terminated')) or
 (old.status='revoked' and new.status='terminated')
 ) then raise exception 'Agent lifecycle transition denied';end if;
 if old.status in ('revoked','terminated') and (new.config<>old.config or new.name<>old.name or new.allowed_origins<>old.allowed_origins) then raise exception 'Agent privileges revoked';end if;
 if old.status='active' and (new.config<>old.config or new.allowed_origins<>old.allowed_origins) then raise exception 'Pause the agent before changing critical configuration';end if;
 new.updated_at=now();return new;
end$$;
revoke all on function private.guard_agent_lifecycle() from public,anon,authenticated;
create trigger guard_agent_lifecycle before update on public.agent_installations for each row execute function private.guard_agent_lifecycle();
create function private.record_agent_lifecycle() returns trigger language plpgsql security definer set search_path='' as $$begin
 if TG_OP='INSERT' then
 insert into public.agent_lifecycle_events(organization_id,agent_id,actor_user_id,event,status) values(new.organization_id,new.id,auth.uid(),'registered',new.status);
 elsif new.status<>old.status or new.config<>old.config or new.allowed_origins<>old.allowed_origins then
 insert into public.agent_lifecycle_events(organization_id,agent_id,actor_user_id,event,previous_status,status) values(new.organization_id,new.id,auth.uid(),case when new.status<>old.status then 'status_changed' else 'configuration_changed' end,old.status,new.status);
 end if;return new;
end$$;
revoke all on function private.record_agent_lifecycle() from public,anon,authenticated;
create trigger record_agent_lifecycle after insert or update on public.agent_installations for each row execute function private.record_agent_lifecycle();
commit;
