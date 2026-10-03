begin;
select cron.schedule('kowi-agent-job-timeout-reaper','*/5 * * * *','select private.expire_organization_agent_jobs();');
commit;
