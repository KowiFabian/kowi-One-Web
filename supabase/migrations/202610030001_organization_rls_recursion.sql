begin;
create schema if not exists private;
create or replace function private.kowi_org_owner(org uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organizations o where o.id=org and o.owner_id=auth.uid())
$$;
create or replace function private.kowi_org_member(org uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_members m where m.organization_id=org and m.user_id=auth.uid())
$$;
revoke all on function private.kowi_org_owner(uuid),private.kowi_org_member(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.kowi_org_owner(uuid),private.kowi_org_member(uuid) to authenticated;
alter policy org_read on public.organizations using(owner_id=(select auth.uid()) or private.kowi_org_member(id));
alter policy member_read on public.organization_members using(user_id=(select auth.uid()) or private.kowi_org_owner(organization_id));
alter policy member_write on public.organization_members using(private.kowi_org_owner(organization_id)) with check(private.kowi_org_owner(organization_id));
commit;
