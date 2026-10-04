import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Director binds verified owner approval, idempotent internal execution, tenant isolation, lifecycle and voluntary consent',async()=>{
 const db=new PGlite();
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',viewer='33333333-3333-4333-8333-333333333333',oa='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',agent='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,created_at timestamptz default now());
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select current_setting('role',true)$$;
 grant usage on schema auth to authenticated,anon,service_role;`);
 for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()){
 if(['20261003000700_security_report_schedule.sql','20261003001100_job_timeout_schedule.sql','20261004000700_director_midday_schedule.sql'].includes(file))continue;
 await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 }
 await db.exec(`insert into auth.users(id,email,email_confirmed_at) values ('${a}','owner-a@example.test',now()),('${b}','owner-b@example.test',now()),('${viewer}','viewer@example.test',now());
 insert into organizations(id,owner_id,name,slug) values ('${oa}','${a}','Fixture A','fixture-a'),('${ob}','${b}','Fixture B','fixture-b');
 insert into organization_members(organization_id,user_id,role) values ('${oa}','${viewer}','viewer');
 insert into agent_installations(id,organization_id,name,config,status) values ('${agent}','${oa}','Local SQL fixture','{}','draft');
 update agent_installations set last_verified_at=now() where id='${agent}';update agent_installations set status='active' where id='${agent}';`);
 async function as(user:string){await db.exec('set role authenticated');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);}
 async function propose(kind='operations'){const id=crypto.randomUUID();await db.query("select propose_director_order($1,$2,$3,$4,'Objetivo local de prueba',array['europe'],'Europe/Madrid')",[oa,agent,id,kind]);return id;}
 await as(a);
 const id=await propose();
 await assert.rejects(db.query('select execute_director_order($1,$2)',[oa,id]),/permission denied/);
 await assert.rejects(db.query("update director_orders set status='approved' where id=$1",[id]),/permission denied/);
 await as(b);
 assert.equal((await db.query('select * from director_orders')).rows.length,0);
 await assert.rejects(db.query("select decide_director_order($1,$2,'approve')",[oa,id]),/permission denied/);
 await as(viewer);
 assert.equal((await db.query('select * from director_orders')).rows.length,1);
 await assert.rejects(db.query("select decide_director_order($1,$2,'approve')",[oa,id]),/permission denied/);
 await as(a);
 await db.query("select decide_director_order($1,$2,'approve')",[oa,id]);
 const result=(await db.query<{result:{results:unknown[];external_execution:boolean;objective_achieved:boolean}}>('select execute_director_order($1,$2) as result',[oa,id])).rows[0].result;
 assert.equal(result.results.length,4);assert.equal(result.external_execution,false);assert.equal(result.objective_achieved,false);
 await db.query('select execute_director_order($1,$2)',[oa,id]);
 assert.equal((await db.query('select * from tasks')).rows.length,4);
 assert.equal((await db.query("select * from director_events where event='completed'")).rows.length,1);
 const foundation=await propose('foundation');
 await db.query("select decide_director_order($1,$2,'approve')",[oa,foundation]);await db.query('select execute_director_order($1,$2)',[oa,foundation]);
 const groups=(await db.query<{id:string}>('select id from foundation_groups')).rows;assert.equal(groups.length,3);
 assert.equal((await db.query('select * from foundation_group_members')).rows.length,0);
 await db.query('select foundation_group_consent($1,$2,true)',[oa,groups[0].id]);
 assert.equal((await db.query('select * from foundation_group_members where withdrawn_at is null')).rows.length,1);
 await db.query('select foundation_group_consent($1,$2,false)',[oa,groups[0].id]);
 assert.equal((await db.query('select * from foundation_group_members where withdrawn_at is null')).rows.length,0);
 await as(b);await assert.rejects(db.query('select foundation_group_consent($1,$2,true)',[oa,groups[0].id]),/permission denied/);
 await as(a);
 const paused=await propose('commercial');await db.query("select decide_director_order($1,$2,'approve')",[oa,paused]);
 await db.query("update agent_installations set status='paused' where id=$1",[agent]);
 assert.equal((await db.query<{status:string}>('select status from director_orders where id=$1',[paused])).rows[0].status,'cancelled');
 await assert.rejects(db.query('select execute_director_order($1,$2)',[oa,paused]),/permission denied/);
 assert.equal((await db.query('select * from tasks')).rows.length,6);
 await db.query("update agent_installations set status='active' where id=$1",[agent]);
 const expired=await propose();await db.query("select decide_director_order($1,$2,'approve')",[oa,expired]);
 await db.exec('reset role');await db.query("update director_orders set expires_at=now()-interval '1 second' where id=$1",[expired]);
 await as(a);await assert.rejects(db.query('select execute_director_order($1,$2)',[oa,expired]),/permission denied/);
 await db.exec('reset role');
 await db.query("update auth.users set email_confirmed_at=null where id=$1",[a]);
 await as(a);await assert.rejects(propose(),/permission denied/);
 await db.exec('reset role');await db.query('update auth.users set email_confirmed_at=now() where id=$1',[a]);
 // Choose a real timezone whose current local hour is 12 to test collection,
 // without changing production clocks or asserting a provider execution.
 const zone=(await db.query<{name:string}>("select name from pg_timezone_names where extract(hour from now() at time zone name)=12 limit 1")).rows[0]?.name;
 assert.ok(zone);await db.query('update director_report_preferences set timezone=$1',[zone]);
 assert.equal((await db.query<{count:number}>('select private.capture_director_midday_reports() as count')).rows[0].count,1);
 assert.equal((await db.query<{count:number}>('select private.capture_director_midday_reports() as count')).rows[0].count,0);
 await as(b);assert.equal((await db.query('select * from director_daily_reports')).rows.length,0);
 await db.exec('set role anon');await assert.rejects(db.query('select * from director_orders'),/permission denied/);
 }finally{await db.close();}
});
