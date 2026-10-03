begin;
create extension if not exists pg_cron;
select cron.schedule('kowi-daily-security-report','45 7 * * *','select private.capture_platform_security_report();');
commit;
