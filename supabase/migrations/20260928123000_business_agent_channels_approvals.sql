create table if not exists public.business_channels (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  channel text not null check (channel in ('whatsapp','email','calendar')),
  provider text not null default '',
  enabled boolean not null default false,
  status text not null default 'not_configured' check (status in ('not_configured','ready','error')),
  public_config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, channel)
);
create table if not exists public.business_lead_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid not null references public.business_leads(id) on delete cascade,
  event_type text not null check (event_type in ('created','status_changed','note','message','appointment','action')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.business_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid references public.business_leads(id) on delete set null,
  channel text not null check (channel in ('whatsapp','email')),
  direction text not null check (direction in ('inbound','outbound')),
  status text not null default 'draft' check (status in ('draft','pending_approval','sent','delivered','read','failed','received')),
  recipient text not null default '',
  subject text not null default '',
  body text not null,
  external_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.business_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid references public.business_leads(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'tentative' check (status in ('tentative','confirmed','cancelled')),
  location text not null default '',
  notes text not null default '',
  external_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create table if not exists public.business_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lead_id uuid references public.business_leads(id) on delete set null,
  action_type text not null check (action_type in ('send_whatsapp','send_email','create_appointment','update_lead')),
  risk_level text not null default 'high' check (risk_level in ('low','medium','high')),
  status text not null default 'pending_approval' check (status in ('pending_approval','approved','executed','rejected','failed')),
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  executed_at timestamptz,
  error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.business_channels enable row level security;
alter table public.business_lead_events enable row level security;
alter table public.business_messages enable row level security;
alter table public.business_appointments enable row level security;
alter table public.business_actions enable row level security;
grant select, insert, update, delete on public.business_channels, public.business_lead_events, public.business_messages, public.business_appointments, public.business_actions to authenticated, service_role;
create policy "business_channels_owner" on public.business_channels for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "business_lead_events_owner" on public.business_lead_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "business_messages_owner" on public.business_messages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "business_appointments_owner" on public.business_appointments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "business_actions_owner" on public.business_actions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
