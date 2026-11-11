begin;
-- Staged only. Apply to an approved test database after RLS/tenant review.
-- Public tables are server-only via REVOKE + RLS; private schema is not exposed by PostgREST.
create table public.whatsapp_pilot_bindings(
 phone_number_id text primary key check(phone_number_id ~ '^[0-9]{6,30}$'),
 organization_id uuid not null references public.organizations(id),
 enabled boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.whatsapp_pilot_inbox(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 phone_number_id text not null,
 meta_message_id text not null check(length(meta_message_id) between 1 and 200),
 sender_e164 text not null check(sender_e164 ~ '^[0-9]{6,16}$'),
 message_text text not null check(length(message_text) between 1 and 2000),
 received_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '7 days'),
 unique(phone_number_id,meta_message_id),
 unique(id,organization_id),
 foreign key(phone_number_id) references public.whatsapp_pilot_bindings(phone_number_id)
);
create index whatsapp_pilot_inbox_org_recent on public.whatsapp_pilot_inbox(organization_id,received_at desc);
create table public.whatsapp_pilot_outbox(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id),
 inbox_id uuid not null unique,
 reply_text text not null check(length(reply_text) between 1 and 1000),
 status text not null default 'sending' check(status in ('sending','sent','uncertain')),
 provider_message_id text,
 approved_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(inbox_id,organization_id) references public.whatsapp_pilot_inbox(id,organization_id) on delete cascade
);
create index whatsapp_pilot_outbox_org on public.whatsapp_pilot_outbox(organization_id,created_at desc);
-- No PostgREST access for anon or authenticated users. Server-only service role.
alter table public.whatsapp_pilot_bindings enable row level security;
alter table public.whatsapp_pilot_inbox enable row level security;
alter table public.whatsapp_pilot_outbox enable row level security;
revoke all on public.whatsapp_pilot_bindings,public.whatsapp_pilot_inbox,public.whatsapp_pilot_outbox from public,anon,authenticated;

grant select,insert,update,delete on public.whatsapp_pilot_bindings,public.whatsapp_pilot_inbox,public.whatsapp_pilot_outbox to service_role;
commit;
