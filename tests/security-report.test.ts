import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Database security reports preserve observations, incomplete coverage and audited owner-only history',async()=>{
 const db=new PGlite(),owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 insert into auth.users values ('${owner}','owner@example.test',now(),null),('${other}','other@example.test',now(),null);`);
 await db.exec(await readFile('supabase/migrations/20261003000300_platform_authority.sql','utf8'));
 await db.exec(await readFile('supabase/migrations/20261003000600_database_security_reports.sql','utf8'));
 await db.exec(`insert into private.platform_roles(user_id,role) values ('${owner}','platform_owner');set role service_role;`);
 await db.query('select private.capture_platform_security_report()');
 await db.exec('reset role;create table public.unguarded(id uuid);set role service_role');
 await db.query('select private.capture_platform_security_report()');
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`);
 await assert.rejects(db.query('select platform_security_report_history()'),/Platform authority required/);
 await assert.rejects(db.query('select private.capture_platform_security_report()'),/permission denied/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
 const rows=(await db.query<{platform_security_report_history:{status:string;report:{unobserved:{critical_incidents:null};automatic_remediation:boolean}}[]}>('select platform_security_report_history()')).rows[0].platform_security_report_history;
 assert.equal(rows.length,2);assert.ok(rows.some(r=>r.status==='ATTENTION'));assert.ok(rows.some(r=>r.status==='CRITICAL'));
 for(const row of rows){assert.equal(row.report.unobserved.critical_incidents,null);assert.equal(row.report.automatic_remediation,false);}
 await assert.rejects(db.query('update private.platform_security_reports set status=\'OK\''),/permission denied/);
 await db.exec('reset role');
 assert.equal((await db.query("select * from private.platform_authority_ledger where event='security_report_history_viewed'")).rows.length,1);
 await db.exec('set role anon');await assert.rejects(db.query('select platform_security_report_history()'),/permission denied/);
 }finally{await db.close();}
});
