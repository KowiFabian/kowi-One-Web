-- Preview pilot only. Applied to isolated project zjjpkbnogbpgdmbayshg.
create table if not exists public.whatsapp_pilot_auto_replies (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null,
 inbox_id uuid not null references public.whatsapp_pilot_inbox(id) on delete cascade,
 recipient_e164 text not null,
 status text not null default 'reserved' check (status in ('reserved','sent','uncertain','failed')),
 reply_text text,
 provider_message_id text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(inbox_id)
);
alter table public.whatsapp_pilot_auto_replies enable row level security;
revoke all on public.whatsapp_pilot_auto_replies from anon, authenticated;
create index if not exists whatsapp_pilot_auto_replies_org_idx on public.whatsapp_pilot_auto_replies(organization_id,created_at desc);
