begin;
create or replace function public.transition_business_action(p_id uuid,p_decision text) returns public.business_actions
language plpgsql security definer set search_path='' as $$
declare a public.business_actions;
begin
 if p_decision in ('approved','rejected') then
  if auth.uid() is null or not exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null) then raise insufficient_privilege;end if;
  update public.business_actions set status=p_decision,approved_at=case when p_decision='approved' then now() else approved_at end,updated_at=now()
   where id=p_id and user_id=auth.uid() and status='pending_approval' and (p_decision='rejected' or action_type<>'update_lead') returning * into a;
 elsif p_decision in ('executed','failed') then
  if auth.role() is distinct from 'service_role' then raise insufficient_privilege;end if;
  update public.business_actions x set status=p_decision,executed_at=case when p_decision='executed' then now() else executed_at end,updated_at=now()
   where x.id=p_id and x.status='approved' and x.action_type<>'update_lead' and exists(select 1 from auth.users u where u.id=x.user_id and u.email_confirmed_at is not null and u.deleted_at is null) returning * into a;
 else raise invalid_parameter_value;
 end if;
 if a.id is null then raise exception 'Action unavailable' using errcode='P0002';end if;return a;
end$$;
revoke all on function public.transition_business_action(uuid,text) from public,anon;
grant execute on function public.transition_business_action(uuid,text) to authenticated,service_role;
revoke insert,update,delete on public.business_messages,public.business_appointments from authenticated;
create or replace function public.audit_business_action() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and new.status is not distinct from old.status then return new;end if;
 insert into public.agent_ledger(user_id,actor_id,agent,action,permission,result,evidence)
 values(new.user_id,auth.uid(),'business',new.action_type,
 case when new.status='pending_approval' then 'owner_propose' when new.status in ('approved','rejected') then 'owner_review' when new.action_type='update_lead' then 'verified_local_execution' else 'backend_execution' end,
 case new.status when 'pending_approval' then 'proposed' when 'executed' then 'completed' when 'approved' then 'approved' when 'rejected' then 'rejected' else 'failed' end,
 jsonb_build_object('action_id',new.id,'lead_id',new.lead_id,'status',new.status,'execution_scope',case when new.action_type='update_lead' then 'deterministic_sql' else 'backend_provider' end));
 return new;
end$$;
commit;