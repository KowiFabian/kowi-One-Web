begin;
create schema if not exists private;
create table private.platform_bootstrap_config(singleton boolean primary key default true check(singleton),founder_user_id uuid not null references auth.users(id),founder_email text not null check(length(founder_email)>3),completed_at timestamptz);
create table private.platform_roles(user_id uuid primary key references auth.users(id),role text not null check(role in ('platform_owner','kowi_admin','configurator','operator','viewer')),granted_at timestamptz not null default now());
create table private.platform_authority_ledger(id uuid primary key default gen_random_uuid(),actor_user_id uuid,subject_user_id uuid not null,event text not null,recorded_at timestamptz not null default now());
alter table private.platform_bootstrap_config enable row level security;
alter table private.platform_roles enable row level security;
alter table private.platform_authority_ledger enable row level security;
revoke all on private.platform_bootstrap_config,private.platform_roles,private.platform_authority_ledger from public,anon,authenticated,service_role;
create function private.platform_ledger_append_only() returns trigger language plpgsql set search_path='' as $$begin raise exception 'Platform authority ledger is append-only';end$$;
revoke all on function private.platform_ledger_append_only() from public,anon,authenticated,service_role;
create trigger platform_ledger_append_only before update or delete on private.platform_authority_ledger for each row execute function private.platform_ledger_append_only();
create function private.bootstrap_platform_owner() returns uuid language plpgsql security definer set search_path='' as $$
declare cfg private.platform_bootstrap_config%rowtype;
begin
 select * into cfg from private.platform_bootstrap_config where singleton for update;
 if not found then raise exception 'Founder identity not configured';end if;
 if cfg.completed_at is not null or exists(select 1 from private.platform_roles) then raise exception 'Bootstrap already completed';end if;
 if not exists(select 1 from auth.users u where u.id=cfg.founder_user_id and lower(u.email)=lower(cfg.founder_email) and u.email_confirmed_at is not null and u.deleted_at is null) then raise exception 'Founder identity not verified';end if;
 insert into private.platform_roles(user_id,role) values(cfg.founder_user_id,'platform_owner');
 insert into private.platform_authority_ledger(actor_user_id,subject_user_id,event) values(auth.uid(),cfg.founder_user_id,'owner_bootstrapped_by_backend');
 update private.platform_bootstrap_config set completed_at=now() where singleton;
 return cfg.founder_user_id;
end$$;
revoke all on function private.bootstrap_platform_owner() from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.bootstrap_platform_owner() to service_role;
create function public.current_platform_role() returns text language sql stable security definer set search_path='' as $$
select r.role from private.platform_roles r join auth.users u on u.id=r.user_id where r.user_id=auth.uid() and u.email_confirmed_at is not null and u.deleted_at is null
$$;
revoke all on function public.current_platform_role() from public,anon,service_role;
grant execute on function public.current_platform_role() to authenticated;
commit;
