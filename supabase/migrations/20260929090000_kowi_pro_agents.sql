begin;
alter table public.conversations drop constraint if exists conversations_agent_allowed;
alter table public.conversations add constraint conversations_agent_allowed check (agent in ('general','education','business','crm','operations','finance','marketing','projects','security','identity','orchestrator'));
alter table public.agent_ledger drop constraint if exists agent_ledger_agent_check;
alter table public.agent_ledger add constraint agent_ledger_agent_check check (agent in ('business','projects','general','education','crm','operations','finance','marketing','security','identity','orchestrator'));
commit;
