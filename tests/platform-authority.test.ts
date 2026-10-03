import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Platform owner requires explicit verified identity and cannot be self-assigned',async()=>{
 const db=new PGlite(),founder='11111111-1111-4111-8111-111111111111',attacker='22222222-2222-4222-8222-222222222222';
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;
 insert into auth.users values ('${founder}','founder@example.test',null,null,'{}'),('${attacker}','attacker@example.test',now(),null,'{"role":"platform_owner"}');`);
 await db.exec(await readFile('supabase/migrations/202610030003_platform_authority.sql','utf8'));
 await db.exec('set role service_role');
 await assert.rejects(db.query('select private.bootstrap_platform_owner()'),/not configured/);
 await db.exec(`reset role;insert into private.platform_bootstrap_config(founder_user_id,founder_email) values ('${founder}','wrong@example.test');set role service_role;`);
 await assert.rejects(db.query('select private.bootstrap_platform_owner()'),/not verified/);
 await db.exec("reset role;update private.platform_bootstrap_config set founder_email='founder@example.test';set role service_role;");
 await assert.rejects(db.query('select private.bootstrap_platform_owner()'),/not verified/);
 await db.exec(`reset role;update auth.users set email_confirmed_at=now() where id='${founder}';set role service_role;`);
 assert.equal((await db.query<{bootstrap_platform_owner:string}>('select private.bootstrap_platform_owner()')).rows[0].bootstrap_platform_owner,founder);
 await assert.rejects(db.query('select private.bootstrap_platform_owner()'),/already completed/);
 await assert.rejects(db.query("update private.platform_roles set role='viewer'"),/permission denied/);
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${attacker}',false);`);
 assert.equal((await db.query<{current_platform_role:string|null}>('select current_platform_role()')).rows[0].current_platform_role,null);
 await assert.rejects(db.query('select private.bootstrap_platform_owner()'),/permission denied/);
 await assert.rejects(db.query('select * from private.platform_roles'),/permission denied/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[founder]);
 assert.equal((await db.query<{current_platform_role:string}>('select current_platform_role()')).rows[0].current_platform_role,'platform_owner');
 await db.exec('reset role');
 assert.equal((await db.query('select * from private.platform_authority_ledger')).rows.length,1);
 await assert.rejects(db.query('delete from private.platform_authority_ledger'),/append-only/);
 await db.exec('set role anon');
 await assert.rejects(db.query('select current_platform_role()'),/permission denied/);
 }finally{await db.close();}
});
