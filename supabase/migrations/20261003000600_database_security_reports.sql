begin;
create table private.platform_security_reports(
 id uuid primary key default gen_random_uuid(),recorded_at timestamptz not null default now(),
 status text not null check(status in ('OK','ATTENTION','CRITICAL')),report jsonb not null
);
alter table private.platform_security_reports enable row level security;
revoke all on private.platform_security_reports from public,anon,authenticated,service_role;
create function private.capture_platform_security_report() returns uuid
language plpgsql security definer set search_path='' as $$
declare rls jsonb;missing jsonb;unsafe integer;report_id uuid;state text;
begin
 select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'enabled',c.relrowsecurity) order by n.nspname,c.relname),'[]'::jsonb),count(*) filter(where not c.relrowsecurity)
 into rls,unsafe from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind in ('r','p');
 select coalesce(jsonb_agg(t),'[]'::jsonb) into missing from unnest(array['organizations','organization_members','agent_installations','contacts','companies','leads','opportunities','activities','tasks','appointments','conversations','messages','agent_actions','agent_incidents','agent_metrics','agent_ledger']) t where pg_catalog.to_regclass('public.'||t) is null;
 state:=case when unsafe>0 then 'CRITICAL' else 'ATTENTION' end;
 insert into private.platform_security_reports(status,report) values(state,jsonb_build_object(
 'title','KOWI DAILY SECURITY REPORT','observed_at',now(),'producer','database_security_observer',
 'observed',jsonb_build_object('rls',rls,'tables_without_rls',unsafe,'missing_target_tables',missing),
 'interpretation',case when unsafe>0 then 'Se observan tablas de aplicación sin RLS. Es una deficiencia de control; este informe no demuestra acceso indebido ni fuga.' else 'RLS está habilitado en las tablas observadas. La cobertura de seguridad sigue incompleta.' end,
 'recommendations',jsonb_build_array('Revisar las evidencias y los permisos antes de modificar controles.','Completar autenticación, APIs, agentes, dependencias e infraestructura con fuentes verificadas.'),
 'unobserved',jsonb_build_object('critical_incidents',null,'blocked_attempts',null,'anomalous_access',null,'permission_changes',null,'possible_secret_exposure',null,'vulnerable_dependencies',null,'relevant_errors',null,'api_health',null,'anomalous_agent_activity',null,'information_access_export',null,'automatic_actions',null,'pending_approvals',null,'sensitive_code_changes',null),
 'classification','Observación de controles; no se confirma un incidente de datos.','automatic_remediation',false
 )) returning id into report_id;
 return report_id;
end$$;
revoke all on function private.capture_platform_security_report() from public,anon,authenticated;
grant execute on function private.capture_platform_security_report() to service_role;
create function public.platform_security_report_history() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();role_name text;result jsonb;
begin
 select r.role into role_name from private.platform_roles r join auth.users u on u.id=r.user_id where r.user_id=actor and u.email_confirmed_at is not null and u.deleted_at is null;
 if role_name is null or role_name not in ('platform_owner','kowi_admin') then raise insufficient_privilege using message='Platform authority required';end if;
 select coalesce(jsonb_agg(to_jsonb(s) order by s.recorded_at desc),'[]'::jsonb) into result from (select id,recorded_at,status,report from private.platform_security_reports order by recorded_at desc limit 30) s;
 insert into private.platform_authority_ledger(actor_user_id,subject_user_id,event) values(actor,actor,'security_report_history_viewed');
 return result;
end$$;
revoke all on function public.platform_security_report_history() from public,anon,service_role;
grant execute on function public.platform_security_report_history() to authenticated;
commit;
