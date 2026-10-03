import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Persisted agent lifecycle denies reactivation, tenant moves and active policy edits',async()=>{
 const db=new PGlite(),a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',oa='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 try{
 await db.exec(`create schema auth;create schema private;create role anon nologin;create role authenticated nologin;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,private to authenticated;
 create table organizations(id uuid primary key,owner_id uuid);
 insert into organizations values ('${oa}','${a}'),('${ob}','${b}');
 create function private.crm_role(org uuid) returns text language sql stable security definer set search_path='' as $$select 'owner'::text from public.organizations where id=org and owner_id=auth.uid()$$;
 create table agent_installations(id uuid primary key default gen_random_uuid(),organization_id uuid not null references organizations,name text not null default 'KOWI',status text not null default 'draft' constraint agent_installations_status_check check(status in ('draft','active','paused')),config jsonb not null default '{}',allowed_origins text[] not null default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
 alter table agent_installations enable row level security;
 grant select,insert,update on agent_installations to authenticated;
 create policy agent_access on agent_installations for all to authenticated using(private.crm_role(organization_id)='owner') with check(private.crm_role(organization_id)='owner');`);
 await db.exec(await readFile('supabase/migrations/20261003000500_agent_lifecycle.sql','utf8'));
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 const id=(await db.query<{id:string}>('insert into agent_installations(organization_id) values ($1) returning id',[oa])).rows[0].id;
 await db.query("update agent_installations set status='active' where id=$1",[id]);
 await assert.rejects(db.query("update agent_installations set config='{\"policy\":\"changed\"}' where id=$1",[id]),/Pause/);
 await assert.rejects(db.query("update agent_installations set organization_id=$1 where id=$2",[ob,id]),/identity|row-level security/);
 await db.query("update agent_installations set status='paused' where id=$1",[id]);
 await db.query("update agent_installations set config='{\"policy\":\"reviewed\"}' where id=$1",[id]);
 await db.query("update agent_installations set status='active' where id=$1",[id]);
 await db.query("update agent_installations set status='revoked' where id=$1",[id]);
 await assert.rejects(db.query("update agent_installations set status='active' where id=$1",[id]),/transition denied/);
 await db.query("update agent_installations set status='terminated' where id=$1",[id]);
 await assert.rejects(db.query("update agent_installations set config='{}' where id=$1",[id]),/privileges revoked/);
 assert.equal((await db.query('select * from agent_installations')).rows.length,1);
 assert.equal((await db.query('select * from agent_lifecycle_events')).rows.length,7);
 await assert.rejects(db.query("delete from agent_lifecycle_events"),/permission denied/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);
 assert.equal((await db.query('select * from agent_installations')).rows.length,0);
 assert.equal((await db.query('select * from agent_lifecycle_events')).rows.length,0);
 assert.equal((await db.query("update agent_installations set status='active' returning id")).rows.length,0);
 }finally{await db.close();}
});
