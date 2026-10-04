begin;
create table private.controlled_email_test_quotas(user_id uuid primary key references auth.users(id),window_started_at timestamptz not null default now(),count integer not null default 0);
alter table private.controlled_email_test_quotas enable row level security;
revoke all on private.controlled_email_test_quotas from public,anon,authenticated,service_role;
create function public.can_prepare_controlled_email_test(p_org uuid,p_conversation uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null
 and exists(select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null)
 and coalesce(private.crm_role(p_org) in ('owner','admin'),false)
 and exists(select 1 from public.conversations c where c.id=p_conversation and c.organization_id=p_org)
 and exists(select 1 from public.messages m where m.conversation_id=p_conversation and m.organization_id=p_org and m.role='assistant')
 and exists(select 1 from public.agent_metrics m where m.conversation_id=p_conversation and m.organization_id=p_org and length(m.provider_request_id)>0)
$$;
revoke all on function public.can_prepare_controlled_email_test(uuid,uuid) from public,anon,service_role;
grant execute on function public.can_prepare_controlled_email_test(uuid,uuid) to authenticated;
create function public.prepare_controlled_email_test(p_org uuid,p_conversation uuid,p_consent boolean) returns public.business_actions
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
 return a;
end$$;
revoke all on function public.prepare_controlled_email_test(uuid,uuid,boolean) from public,anon,service_role;
grant execute on function public.prepare_controlled_email_test(uuid,uuid,boolean) to authenticated;
commit;