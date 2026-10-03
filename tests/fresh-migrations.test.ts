import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {organizationSlug} from '../src/lib/organization-schema';
test('Fresh application migrations reconstruct the observed production schema without inferring a founder',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,deleted_at timestamptz,created_at timestamptz default now());
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated,anon,service_role;grant execute on function auth.uid() to authenticated,anon,service_role;`);
 const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
 for(const file of files){
  // pg_cron is a Supabase runtime extension; its actual schedule is verified separately.
  if(file==='20261003000700_security_report_schedule.sql')continue;
  await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 }
 assert.equal((await db.query('select * from organizations')).rows.length,0);
 assert.equal((await db.query('select * from private.platform_roles')).rows.length,0);
 assert.equal((await db.query('select * from agent_installations')).rows.length,0);
 const owner='11111111-1111-4111-8111-111111111111';
 await db.exec(`insert into auth.users(id,email,email_confirmed_at) values ('${owner}','fixture@example.test',now());set role authenticated;select set_config('request.jwt.claim.sub','${owner}',false);`);
 const name='Empresa internacional con nombre empresarial muy extenso';
 const slug=organizationSlug(name,'22222222-2222-4222-8222-222222222222');
 assert.ok(slug.length<=63);assert.match(slug,/^[a-z0-9][a-z0-9-]{1,62}$/);
 const result=await db.query<{id:string}>('insert into organizations(owner_id,name,slug) values ($1,$2,$3) returning id',[owner,name,slug]);
 assert.equal(result.rows.length,1);
 assert.equal((await db.query('select * from crm_stages')).rows.length,6);
 assert.equal((await db.query('select * from organizations')).rows.length,1);
 }finally{await db.close();}
});
test('Organization slugs fit database constraints for long, accented and non-Latin names',()=>{
 for(const name of ['A'.repeat(120),'Empresa con acentos áéíóú','日本企業']){
 const slug=organizationSlug(name,'22222222-2222-4222-8222-222222222222');
 assert.ok(slug.length<=63);assert.match(slug,/^[a-z0-9][a-z0-9-]{1,62}$/);
 }
});
