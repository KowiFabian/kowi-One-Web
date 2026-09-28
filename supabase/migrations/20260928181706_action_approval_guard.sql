-- The owner can propose actions, but cannot directly rewrite approval or outcome columns.
drop policy if exists "business_actions_owner" on public.business_actions;
create policy business_actions_read on public.business_actions for select to authenticated using ((select auth.uid())=user_id);
create policy business_actions_propose on public.business_actions for insert to authenticated
  with check ((select auth.uid())=user_id and status='pending_approval' and risk_level='high'
    and approved_at is null and executed_at is null and error='');
revoke update, delete on public.business_actions from authenticated;

create function public.transition_business_action(p_id uuid, p_decision text)
returns public.business_actions
language plpgsql security definer set search_path = '' as $$
declare r public.business_actions;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_decision not in ('approved','rejected','executed','failed') then raise invalid_parameter_value; end if;
  update public.business_actions a set
    status=p_decision,
    approved_at=case when p_decision='approved' then now() else a.approved_at end,
    executed_at=case when p_decision='executed' then now() else a.executed_at end,
    updated_at=now()
  where a.id=p_id and a.user_id=auth.uid()
    and ((a.status='pending_approval' and p_decision in ('approved','rejected'))
      or (a.status='approved' and p_decision in ('executed','failed')))
  returning * into r;
  if not found then raise exception 'Action unavailable' using errcode='P0002'; end if;
  return r;
end $$;
revoke all on function public.transition_business_action(uuid,text) from public,anon;
grant execute on function public.transition_business_action(uuid,text) to authenticated;
