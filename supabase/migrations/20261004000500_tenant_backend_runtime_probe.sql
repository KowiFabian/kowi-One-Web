begin;
create function public.verify_tenant_backend_runtime() returns boolean language sql stable security definer set search_path='' as $$select auth.role()='service_role'$$;
revoke all on function public.verify_tenant_backend_runtime() from public,anon,authenticated;
grant execute on function public.verify_tenant_backend_runtime() to service_role;
commit;