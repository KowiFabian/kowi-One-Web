-- Append an audit entry in the same transaction as each proposed/reviewed business action.
create function public.audit_business_action()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    null;
  elsif new.status is not distinct from old.status then
    return new;
  end if;
    insert into public.agent_ledger(user_id,actor_id,agent,action,permission,result,evidence)
    values(new.user_id,new.user_id,'business',new.action_type,
      case when new.status='pending_approval' then 'owner_propose' else 'owner_review' end,
      case new.status when 'pending_approval' then 'proposed' when 'executed' then 'completed'
        when 'approved' then 'approved' when 'rejected' then 'rejected' else 'failed' end,
      jsonb_build_object('action_id',new.id,'lead_id',new.lead_id,'status',new.status));
  return new;
end $$;
revoke all on function public.audit_business_action() from public,anon,authenticated;
create trigger business_action_audit after insert or update of status on public.business_actions
for each row execute function public.audit_business_action();
