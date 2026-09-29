begin;

-- A signed-in owner may approve or reject a proposed action, but cannot claim
-- that an external system sent a message or created an appointment.
create or replace function public.transition_business_action(p_id uuid, p_decision text)
returns public.business_actions
language plpgsql security definer set search_path = '' as $$
declare r public.business_actions;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if p_decision not in ('approved', 'rejected') then raise insufficient_privilege; end if;
  update public.business_actions a set
    status = p_decision,
    approved_at = case when p_decision = 'approved' then now() else a.approved_at end,
    updated_at = now()
  where a.id = p_id and a.user_id = auth.uid() and a.status = 'pending_approval'
  returning * into r;
  if not found then raise exception 'Action unavailable' using errcode = 'P0002'; end if;
  return r;
end $$;

-- Only the server-held service role can record the result after execution.
create function public.complete_business_action(p_id uuid, p_actor uuid, p_result text)
returns public.business_actions
language plpgsql security definer set search_path = '' as $$
declare r public.business_actions;
begin
  if p_actor is null or p_result not in ('executed', 'failed') then raise insufficient_privilege; end if;
  update public.business_actions a set
    status = p_result,
    executed_at = case when p_result = 'executed' then now() else a.executed_at end,
    updated_at = now()
  where a.id = p_id and a.user_id = p_actor and a.status = 'approved'
  returning * into r;
  if not found then raise exception 'Action unavailable' using errcode = 'P0002'; end if;
  return r;
end $$;
revoke all on function public.complete_business_action(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.complete_business_action(uuid,uuid,text) to service_role;

-- Delivery and calendar records must reflect server-side integrations only.
revoke insert, update, delete on public.business_messages, public.business_appointments from authenticated;
drop policy if exists business_messages_owner on public.business_messages;
drop policy if exists business_appointments_owner on public.business_appointments;
create policy business_messages_read on public.business_messages for select to authenticated
  using ((select auth.uid()) = user_id);
create policy business_appointments_read on public.business_appointments for select to authenticated
  using ((select auth.uid()) = user_id);

commit;
