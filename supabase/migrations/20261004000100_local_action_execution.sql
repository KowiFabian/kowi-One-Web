begin;
create function public.execute_approved_local_lead_action(p_id uuid) returns public.business_actions
language plpgsql security definer set search_path='' as $$
declare a public.business_actions;l public.business_leads;k text;v jsonb;
begin
 if auth.uid() is null or not exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null) then raise insufficient_privilege;end if;
 select * into a from public.business_actions where id=p_id and user_id=auth.uid() for update;
 if not found or a.status<>'pending_approval' or a.action_type<>'update_lead' then raise exception 'Action unavailable' using errcode='P0002';end if;
 select * into l from public.business_leads where id=a.lead_id and user_id=auth.uid() for update;
 if not found then raise exception 'Lead unavailable' using errcode='P0002';end if;
 if jsonb_typeof(a.payload)<>'object' or a.payload='{}'::jsonb then raise invalid_parameter_value;end if;
 for k,v in select * from jsonb_each(a.payload) loop
  if k not in ('status','next_action','notes','contact') or jsonb_typeof(v)<>'string' then raise invalid_parameter_value;end if;
 end loop;
 if (a.payload ? 'status' and a.payload->>'status' not in ('nuevo','contactado','propuesta','ganado','perdido'))
 or length(coalesce(a.payload->>'next_action',''))>500 or length(coalesce(a.payload->>'notes',''))>1000 or length(coalesce(a.payload->>'contact',''))>120 then raise invalid_parameter_value;end if;
 update public.business_actions set status='approved',approved_at=now(),updated_at=now() where id=p_id;
 update public.business_leads set status=coalesce(a.payload->>'status',status),next_action=coalesce(a.payload->>'next_action',next_action),notes=coalesce(a.payload->>'notes',notes),contact=coalesce(a.payload->>'contact',contact),
 consent=case when a.payload ? 'contact' and a.payload->>'contact' is distinct from contact then false else consent end,updated_at=now() where id=l.id and user_id=auth.uid();
 update public.business_actions set status='executed',executed_at=now(),updated_at=now() where id=p_id returning * into a;
 insert into public.business_lead_events(user_id,lead_id,event_type,detail) values(auth.uid(),l.id,'action',jsonb_build_object('action_id',p_id,'status','executed','executor','deterministic_sql','changed_fields',a.payload));
 return a;
end$$;
revoke all on function public.execute_approved_local_lead_action(uuid) from public,anon,service_role;
grant execute on function public.execute_approved_local_lead_action(uuid) to authenticated;
commit;