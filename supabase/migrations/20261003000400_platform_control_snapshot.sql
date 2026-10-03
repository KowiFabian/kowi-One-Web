begin;
create function public.platform_control_snapshot() returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();role_name text;result jsonb;
begin
 select r.role into role_name from private.platform_roles r join auth.users u on u.id=r.user_id where r.user_id=actor and u.email_confirmed_at is not null and u.deleted_at is null;
 if role_name is null or role_name not in ('platform_owner','kowi_admin') then raise insufficient_privilege using message='Platform authority required';end if;
 select jsonb_build_object('organizations',(select count(*) from public.organizations),'installations',(select count(*) from public.agent_installations),'observed_at',now()) into result;
 insert into private.platform_authority_ledger(actor_user_id,subject_user_id,event) values(actor,actor,'global_control_snapshot_viewed');
 return result;
end$$;
revoke all on function public.platform_control_snapshot() from public,anon,service_role;
grant execute on function public.platform_control_snapshot() to authenticated;
commit;
