-- Private planning metadata; names here do not grant collaborators access.
alter table public.projects add column if not exists details jsonb not null default '{}'::jsonb
  check (jsonb_typeof(details) = 'object' and octet_length(details::text) < 30000);
