import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {crmSchemas} from '../src/lib/crm-schema';
test('CRM rejects tenant overrides and invalid relationships',()=>{
 assert.equal(crmSchemas.contacts.safeParse({name:'Cliente',organization_id:'11111111-1111-4111-8111-111111111111'}).success,false);
 assert.equal(crmSchemas.opportunities.safeParse({title:'Venta',stage_id:'bad'}).success,false);
});
test('CRM isolates owners, constrains references and denies viewer writes',async()=>{
 const db=new PGlite();
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',v='33333333-3333-4333-8333-333333333333';
 const oa='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 try{
 await db.exec(`create schema auth;create schema private;create role anon nologin;create role authenticated nologin;create role service_role nologin;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 create table organizations(id uuid primary key,owner_id uuid references auth.users);
 create table organization_members(organization_id uuid references organizations,user_id uuid references auth.users,role text,primary key(organization_id,user_id));
 insert into auth.users values ('${a}'),('${b}'),('${v}');`);
 await db.exec(await readFile('supabase/migrations/20261003000200_universal_tenant_crm.sql','utf8'));
 await db.exec('create table conversations(id uuid primary key,organization_id uuid references organizations,unique(id,organization_id))');
 await db.exec(await readFile('supabase/migrations/20261003001200_universal_crm_follow_up.sql','utf8'));
 await db.exec(`insert into organizations values ('${oa}','${a}'),('${ob}','${b}');insert into organization_members values ('${oa}','${v}','viewer');set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 assert.equal((await db.query('select * from crm_stages')).rows.length,6);
 const ca=(await db.query<{id:string}>('insert into contacts(organization_id,name) values ($1,$2) returning id',[oa,'Cliente A'])).rows[0].id;
 const la=(await db.query<{id:string}>('insert into leads(organization_id,title,contact_id) values ($1,$2,$3) returning id',[oa,'Lead A',ca])).rows[0].id;
 const stage=(await db.query<{id:string}>('select id from crm_stages where organization_id=$1 and position=0',[oa])).rows[0].id;
 const sale=(await db.query<{id:string}>('insert into opportunities(organization_id,title,contact_id,lead_id,stage_id) values ($1,$2,$3,$4,$5) returning id',[oa,'Venta A',ca,la,stage])).rows[0].id;
 await db.query('insert into tasks(organization_id,title,opportunity_id) values ($1,$2,$3)',[oa,'Seguimiento',sale]);
 const company=(await db.query<{id:string}>('insert into companies(organization_id,name) values ($1,$2) returning id',[oa,'Empresa A'])).rows[0].id;
 await db.query('update contacts set company_id=$1 where id=$2',[company,ca]);
 const activity=(await db.query<{occurred_at:null}>('insert into activities(organization_id,title,contact_id,opportunity_id) values ($1,$2,$3,$4) returning occurred_at',[oa,'Seguimiento previsto',ca,sale])).rows[0];
 assert.equal(activity.occurred_at,null);
 const appointment=(await db.query<{status:string}>("insert into appointments(organization_id,title,starts_at,ends_at,contact_id) values ($1,$2,'2026-10-05T09:00:00Z','2026-10-05T10:00:00Z',$3) returning status",[oa,'Propuesta',ca])).rows[0];
 assert.equal(appointment.status,'proposed');
 await assert.rejects(db.query("insert into appointments(organization_id,title,starts_at,ends_at) values ($1,$2,'2026-10-05T10:00:00Z','2026-10-05T09:00:00Z')",[oa,'Inválida']),/check constraint/);
 await assert.rejects(db.query('insert into contacts(organization_id,name) values ($1,$2)',[ob,'Intruso']),/row-level security/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);
 for(const t of ['contacts','leads','opportunities','tasks','companies','activities','appointments'])assert.equal((await db.query('select * from '+t)).rows.length,0);
 await assert.rejects(db.query('insert into leads(organization_id,title,contact_id) values ($1,$2,$3)',[ob,'Cross',ca]),/foreign key/);
 await assert.rejects(db.query('insert into opportunities(organization_id,title,stage_id) values ($1,$2,$3)',[ob,'Cross',stage]),/foreign key/);
 await assert.rejects(db.query('insert into contacts(organization_id,name,company_id) values ($1,$2,$3)',[ob,'Cruce',company]),/foreign key/);
 await assert.rejects(db.query('insert into activities(organization_id,title,opportunity_id) values ($1,$2,$3)',[ob,'Cruce',sale]),/foreign key/);
 await assert.rejects(db.query("insert into appointments(organization_id,title,starts_at,ends_at,contact_id) values ($1,$2,'2026-10-05T09:00:00Z','2026-10-05T10:00:00Z',$3)",[ob,'Cruce',ca]),/foreign key/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[v]);
 for(const table of ['companies','activities','appointments']) {
 assert.equal((await db.query('select * from '+table)).rows.length,1);
 assert.equal((await db.query("update "+table+" set "+(table==='companies'?'name':'title')+"='Modificado' returning id")).rows.length,0);
 await assert.rejects(db.query('delete from '+table),/permission denied/);
 }
 assert.equal((await db.query('select * from contacts')).rows.length,1);
 await assert.rejects(db.query('insert into tasks(organization_id,title) values ($1,$2)',[oa,'Viewer']),/row-level security/);
 assert.equal((await db.query("update tasks set status='done' returning id")).rows.length,0);
 await assert.rejects(db.query('delete from contacts'),/permission denied/);
 await db.exec('reset role;set role anon');
 await assert.rejects(db.query('select * from contacts'),/permission denied/);
 }finally{await db.close();}
});
