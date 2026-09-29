create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_action_id uuid references public.business_actions(id) on delete set null,
  provider text not null default 'resend' check (provider = 'resend'),
  external_id text not null check (char_length(external_id) between 1 and 255),
  recipient text not null check (char_length(recipient) between 3 and 254),
  event_type text not null check (event_type in ('accepted','delivered','bounced','complained','suppressed')),
  event_id text,
  created_at timestamptz not null default now(),
  unique (external_id, event_type, event_id)
);
create index if not exists email_events_owner_created on public.email_events(user_id,created_at desc);
create index if not exists email_events_external on public.email_events(external_id);
create unique index if not exists email_events_accepted_once on public.email_events(external_id) where event_type = 'accepted';
alter table public.email_events enable row level security;
revoke all on public.email_events from anon, authenticated;
grant select on public.email_events to authenticated;
grant select, insert on public.email_events to service_role;
create policy email_events_owner_read on public.email_events for select to authenticated
  using ((select auth.uid()) = user_id);
-- Delivery events are appended by a signed provider webhook using service_role.
