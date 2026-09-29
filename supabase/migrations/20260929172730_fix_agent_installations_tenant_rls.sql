begin;

-- Correlate membership with this installation's organization. The previous
-- m.organization_id = m.organization_id condition allowed cross-tenant access.
drop policy if exists install_read on public.agent_installations;
drop policy if exists install_write on public.agent_installations;

create policy install_read on public.agent_installations
  for select to authenticated
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = agent_installations.organization_id
        and m.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.organizations o
      where o.id = agent_installations.organization_id
        and o.owner_id = (select auth.uid())
    )
  );

create policy install_write on public.agent_installations
  for all to authenticated
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = agent_installations.organization_id
        and m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'configurator')
    )
    or exists (
      select 1 from public.organizations o
      where o.id = agent_installations.organization_id
        and o.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = agent_installations.organization_id
        and m.user_id = (select auth.uid())
        and m.role in ('owner', 'admin', 'configurator')
    )
    or exists (
      select 1 from public.organizations o
      where o.id = agent_installations.organization_id
        and o.owner_id = (select auth.uid())
    )
  );

commit;
