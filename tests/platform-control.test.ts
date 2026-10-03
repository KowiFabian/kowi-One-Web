import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Global control reads require trusted verified authority and leave an audit event',async()=>{
 const db=new PGlite(),owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table organizations(id uuid primary key);create table agent_installations(id uuid primary key);
 insert into auth.users values ('${owner}','owner@example.test',now(),null),('${other}','other@example.test',now(),null);`);
 await db.exec(await readFile('supabase/migrations/202610030003_platform_authority.sql','utf8'));
 await db.exec(await readFile('supabase/migrations/202610030004_platform_control_snapshot.sql','utf8'));
 await db.exec(`insert into private.platform_roles(user_id,role) values ('${owner}','platform_owner');insert into organizations values(gen_random_uuid());set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`);
 await assert.rejects(db.query('select platform_control_snapshot()'),/Platform authority required/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
 const result=(await db.query<{platform_control_snapshot:{organizations:number;installations:number}}>('select platform_control_snapshot()')).rows[0].platform_control_snapshot;
 assert.equal(result.organizations,1);assert.equal(result.installations,0);
 await db.exec('reset role');
 const rows=(await db.query<{actor_user_id:string;event:string}>('select * from private.platform_authority_ledger')).rows;
 assert.equal(rows.length,1);assert.equal(rows[0].actor_user_id,owner);assert.equal(rows[0].event,'global_control_snapshot_viewed');
 await db.exec(`update auth.users set email_confirmed_at=null where id='${owner}';set role authenticated;`);
 await assert.rejects(db.query('select platform_control_snapshot()'),/Platform authority required/);
 await db.exec('reset role;set role anon');
 await assert.rejects(db.query('select platform_control_snapshot()'),/permission denied/);
 }finally{await db.close();}
});
