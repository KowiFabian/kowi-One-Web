begin;
alter table private.controlled_email_test_quotas add column action_id uuid references public.business_actions(id);
create function public.can_execute_controlled_email_test(p_action uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.business_actions a join private.controlled_email_test_quotas q on q.action_id=a.id and q.user_id=a.user_id
 where a.id=p_action and a.user_id=auth.uid() and a.status='pending_approval' and a.action_type='send_email' and a.payload->>'controlled_test'='true'
 and public.can_prepare_controlled_email_test((a.payload->>'organization_id')::uuid,(a.payload->>'conversation_id')::uuid))
$$;
revoke all on function public.can_execute_controlled_email_test(uuid) from public,anon,service_role;
grant execute on function public.can_execute_controlled_email_test(uuid) to authenticated;
create or replace function public.prepare_controlled_email_test(p_org uuid,p_conversation uuid,p_consent boolean) returns public.business_actions
language plpgsql security definer set search_path='' as $$
declare recipient text;lead uuid;a public.business_actions;q private.controlled_email_test_quotas;
begin
 if p_consent is distinct from true or not public.can_prepare_controlled_email_test(p_org,p_conversation) then raise insufficient_privilege;end if;
 select email into recipient from auth.users where id=auth.uid();
 if recipient is null or length(recipient)>254 or position('@' in recipient)<2 then raise invalid_parameter_value;end if;
 insert into private.controlled_email_test_quotas(user_id) values(auth.uid()) on conflict do nothing;
 select * into q from private.controlled_email_test_quotas where user_id=auth.uid() for update;
 if q.window_started_at<=now()-interval '24 hours' then q.count:=0;update private.controlled_email_test_quotas set window_started_at=now(),count=0 where user_id=auth.uid();end if;
 if q.count>=1 then raise exception 'Test quota exceeded' using errcode='P0001';end if;
 update private.controlled_email_test_quotas set count=count+1 where user_id=auth.uid();
 insert into public.business_leads(user_id,name,contact,consent,notes,source) values(auth.uid(),'Prueba interna KOWI · cuenta verificada',recipient,true,'Prueba técnica solicitada por el titular. No representa un cliente ni una venta.','manual') returning id into lead;
 insert into public.business_actions(user_id,lead_id,action_type,risk_level,status,summary,payload)
 values(auth.uid(),lead,'send_email','high','pending_approval','Prueba controlada de correo KOWI',
 jsonb_build_object('to',recipient,'subject','Prueba controlada KOWI','body','Este es un mensaje de prueba autorizado de KOWI para verificar aprobación humana, envío y evidencia. No requiere ninguna acción.','controlled_test',true,'test_version',1,'organization_id',p_org,'conversation_id',p_conversation)) returning * into a;
 update private.controlled_email_test_quotas set action_id=a.id where user_id=auth.uid();
 return a;
end$;
revoke all on function public.prepare_controlled_email_test(uuid,uuid,boolean) from public,anon,service_role;
grant execute on function public.prepare_controlled_email_test(uuid,uuid,boolean) to authenticated;

create or replace function public.transition_business_action(p_id uuid,p_decision text) returns public.business_actions
language plpgsql security definer set search_path='' as $$
declare a public.business_actions;
begin
 if p_decision in ('approved','rejected') then
  if auth.uid() is null or not exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null) then raise insufficient_privilege;end if;
  update public.business_actions set status=p_decision,approved_at=case when p_decision='approved' then now() else approved_at end,updated_at=now()
   where id=p_id and user_id=auth.uid() and status='pending_approval' and (p_decision='rejected' or (action_type<>'update_lead' and (coalesce(payload->>'controlled_test','')<>'true' or public.can_execute_controlled_email_test(id)))) returning * into a;
 elsif p_decision in ('executed','failed') then
  if auth.role() is distinct from 'service_role' then raise insufficient_privilege;end if;
  update public.business_actions x set status=p_decision,executed_at=case when p_decision='executed' then now() else executed_at end,updated_at=now()
   where x.id=p_id and x.status='approved' and x.action_type<>'update_lead' and exists(select 1 from auth.users u where u.id=x.user_id and u.email_confirmed_at is not null and u.deleted_at is null) returning * into a;
 else raise invalid_parameter_value;
 end if;
 if a.id is null then raise exception 'Action unavailable' using errcode='P0002';end if;return a;
end$$;
commit;