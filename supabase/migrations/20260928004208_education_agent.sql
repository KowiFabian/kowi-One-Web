-- A conversation is permanently assigned to one specialist agent.
-- Existing conversations keep the general agent. No UPDATE grant is added.
alter table public.conversations
  add column agent text not null default 'general'
  constraint conversations_agent_allowed check (agent in ('general', 'education'));
