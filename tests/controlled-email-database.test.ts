import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Controlled email requires saved AI evidence, owner/admin scope and consent; proposals are quota limited',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',viewer='33333333-3333-4333-8333-333333333333';
 const org='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',agent='cccccccc-cccc-4ccc-8ccc-cccccccccccc',conversation='dddddddd-dddd-4ddd-8ddd-dddddddddddd',request='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,created_at timestamptz default now());
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select current_setting('role',true)$$;
 grant usage on schema auth to authenticated,anon,service_role;grant execute on function auth.uid(),auth.role() to authenticated,anon,service_role;`);
 for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()){if(['20261003000700_security_report_schedule.sql','20261003001100_job_timeout_schedule.sql'].includes(file))continue;await db.exec(await readFile('supabase/migrations/'+file,'utf8'));}
 await db.exec(`insert into auth.users(id,email,email_confirmed_at) values ('${a}','self@example.test',now()),('${b}','other@example.test',now()),('${viewer}','viewer@example.test',now());
 insert into organizations(id,owner_id,name,slug) values ('${org}','${a}','Fixture A','fixture-a'),('${other}','${b}','Fixture B','fixture-b');
 insert into organization_members(organization_id,user_id,role) values ('${org}','${viewer}','viewer');
 insert into agent_installations(id,organization_id,name,status,config) values ('${agent}','${org}','Fixture agent','draft','{}');
 set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 assert.equal((await db.query<{allowed:boolean}>('select can_prepare_controlled_email_test($1,$2) allowed',[org,conversation])).rows[0].allowed,false);
 await assert.rejects(db.query('select prepare_controlled_email_test($1,$2,true)',[org,conversation]),/insufficient_privilege/);
 const revision=(await db.query<{updated_at:string}>('select updated_at from agent_installations where id=$1',[agent])).rows[0].updated_at;
 await db.exec("reset role;set role service_role;select set_config('request.jwt.claim.sub','',false);");
 await db.query("select save_organization_chat($1,$2,$3,$4,$5,0,'Synthetic test prompt','Synthetic test response','fixture-model',1,1,'synthetic-fixture-provider',$6)",[org,agent,a,conversation,request,revision]);
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 assert.equal((await db.query<{allowed:boolean}>('select can_prepare_controlled_email_test($1,$2) allowed',[org,conversation])).rows[0].allowed,true);
 await assert.rejects(db.query('select prepare_controlled_email_test($1,$2,false)',[org,conversation]),/insufficient_privilege/);
 const action=(await db.query<{id:string;status:string;risk_level:string;payload:{to:string;controlled_test:boolean}}>('select * from prepare_controlled_email_test($1,$2,true)',[org,conversation])).rows[0];
 assert.equal(action.status,'pending_approval');assert.equal(action.risk_level,'high');assert.equal(action.payload.to,'self@example.test');assert.equal(action.payload.controlled_test,true);
 assert.equal((await db.query('select * from business_messages')).rows.length,0);
 assert.equal((await db.query<{allowed:boolean}>('select can_execute_controlled_email_test($1) allowed',[action.id])).rows[0].allowed,true);
 const forged=(await db.query<{id:string}>("insert into business_actions(user_id,action_type,summary,payload) values ($1,'send_email','Forged proposal',$2) returning id",[a,action.payload])).rows[0].id;
 assert.equal((await db.query<{allowed:boolean}>('select can_execute_controlled_email_test($1) allowed',[forged])).rows[0].allowed,false);
 await assert.rejects(db.query("select transition_business_action($1,'approved')",[forged]),/Action unavailable/);
 await db.query("select transition_business_action($1,'approved')",[action.id]);
 assert.equal((await db.query<{allowed:boolean}>('select can_execute_controlled_email_test($1) allowed',[action.id])).rows[0].allowed,false);
 await assert.rejects(db.query('select prepare_controlled_email_test($1,$2,true)',[org,conversation]),/Test quota exceeded/);
 await assert.rejects(db.query('update private.controlled_email_test_quotas set count=0'),/permission denied/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);
 assert.equal((await db.query<{allowed:boolean}>('select can_prepare_controlled_email_test($1,$2) allowed',[org,conversation])).rows[0].allowed,false);
 await assert.rejects(db.query('select prepare_controlled_email_test($1,$2,true)',[other,conversation]),/insufficient_privilege/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[viewer]);
 assert.equal((await db.query<{allowed:boolean}>('select can_prepare_controlled_email_test($1,$2) allowed',[org,conversation])).rows[0].allowed,false);
 await db.exec('reset role;set role anon');await assert.rejects(db.query('select prepare_controlled_email_test($1,$2,true)',[org,conversation]),/permission denied/);
 }finally{await db.close();}
});
