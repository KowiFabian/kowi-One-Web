-- Apply once through Supabase migrations. No service-role key is used by the app.
begin;
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'Nueva conversación' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create index conversations_owner on public.conversations(user_id, created_at desc);
create table public.turns (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  sequence integer not null check (sequence between 1 and 100),
  user_message text not null check (char_length(user_message) between 1 and 2000),
  response text not null check (char_length(response) between 1 and 6000),
  goal jsonb check (goal is null or jsonb_typeof(goal) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (conversation_id,user_id) references public.conversations(id,user_id) on delete cascade,
  unique (conversation_id, sequence),
  unique (conversation_id, request_id)
);
create index turns_owner on public.turns(user_id, conversation_id);
create table public.chat_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  minute_start timestamptz not null,
  minute_count integer not null,
  day_start timestamptz not null,
  day_count integer not null
);
alter table public.conversations enable row level security;
alter table public.turns enable row level security;
alter table public.chat_quotas enable row level security;
revoke all on public.conversations, public.turns, public.chat_quotas from anon, authenticated;
grant select, insert, delete on public.conversations to authenticated;
grant select on public.turns to authenticated;
create policy own_conversations_read on public.conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy own_conversations_create on public.conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_conversations_delete on public.conversations for delete to authenticated using ((select auth.uid()) = user_id);
create policy own_turns_read on public.turns for select to authenticated using ((select auth.uid()) = user_id);

-- Serializes updates for each user; fixed rolling windows, shared across server instances.
create function public.consume_chat_quota() returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  t timestamptz := clock_timestamp();
  q public.chat_quotas%rowtype;
begin
  if u is null then raise insufficient_privilege; end if;
  insert into public.chat_quotas values (u,t,0,t,0) on conflict do nothing;
  select * into q from public.chat_quotas where user_id = u for update;
  if q.minute_start <= t - interval '1 minute' then q.minute_start := t; q.minute_count := 0; end if;
  if q.day_start <= t - interval '24 hours' then q.day_start := t; q.day_count := 0; end if;
  if q.minute_count >= 5 or q.day_count >= 100 then return false; end if;
  update public.chat_quotas set minute_start = q.minute_start, minute_count = q.minute_count + 1,
    day_start = q.day_start, day_count = q.day_count + 1 where user_id = u;
  return true;
end $$;

-- Atomic user/assistant pair. Ownership checked again under a row lock.
-- Users can write their own content through this RPC; it confers no extra permissions.
create function public.save_chat_turn(
  p_conversation uuid, p_request uuid, p_revision integer,
  p_message text, p_response text, p_goal jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  current_revision integer;
begin
  if u is null then raise insufficient_privilege; end if;
  perform 1 from public.conversations where id = p_conversation and user_id = u for update;
  if not found then raise insufficient_privilege; end if;
  select coalesce(max(sequence),0) into current_revision from public.turns where conversation_id = p_conversation;
  if current_revision <> p_revision then
    raise exception 'Conversation changed' using errcode = '40001';
  end if;
  insert into public.turns(conversation_id,user_id,request_id,sequence,user_message,response,goal)
  values (p_conversation,u,p_request,current_revision+1,p_message,p_response,p_goal);
  if current_revision = 0 then
    update public.conversations set title = left(p_message,120) where id = p_conversation;
  end if;
end $$;
revoke all on function public.consume_chat_quota() from public, anon;
revoke all on function public.save_chat_turn(uuid,uuid,integer,text,text,jsonb) from public, anon;
grant execute on function public.consume_chat_quota() to authenticated;
grant execute on function public.save_chat_turn(uuid,uuid,integer,text,text,jsonb) to authenticated;
commit;
