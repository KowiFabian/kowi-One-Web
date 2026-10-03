import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Organization policies repair recursion while preserving tenant and owner permissions',async()=>{
 const db=new PGlite();
 const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',v='33333333-3333-4333-8333-333333333333';
 const oa='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 try{
 await db.exec(`
 create schema auth;create role anon nologin;create role authenticated nologin;
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 create table organizations(id uuid primary key,owner_id uuid not null);
 create table organization_members(organization_id uuid references organizations,user_id uuid,role text,primary key(organization_id,user_id));
 alter table organizations enable row level security;alter table organization_members enable row level security;
 grant select,insert,update on organizations to authenticated;grant select,insert,update,delete on organization_members to authenticated;
 create policy org_read on organizations for select to authenticated using(owner_id=auth.uid() or exists(select 1 from organization_members m where m.organization_id=organizations.id and m.user_id=auth.uid()));
 create policy org_insert on organizations for insert to authenticated with check(owner_id=auth.uid());
 create policy org_update on organizations for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
 create policy member_read on organization_members for select to authenticated using(user_id=auth.uid() or exists(select 1 from organizations o where o.id=organization_members.organization_id and o.owner_id=auth.uid()));
 create policy member_write on organization_members for all to authenticated using(exists(select 1 from organizations o where o.id=organization_members.organization_id and o.owner_id=auth.uid())) with check(exists(select 1 from organizations o where o.id=organization_members.organization_id and o.owner_id=auth.uid()));
 insert into organizations values ('${oa}','${a}'),('${ob}','${b}');
 insert into organization_members values ('${oa}','${v}','viewer');
 set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);
 `);
 await assert.rejects(db.query('select * from organizations'),/infinite recursion/);
 await db.exec('reset role');
 await db.exec(await readFile('supabase/migrations/202610030001_organization_rls_recursion.sql','utf8'));
 await db.exec('set role authenticated');
 assert.equal((await db.query('select * from organizations')).rows.length,1);
 assert.equal((await db.query('select * from organization_members')).rows.length,1);
 await assert.rejects(db.query('insert into organization_members values ($1,$2,$3)',[ob,a,'owner']),/row-level security/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[v]);
 assert.equal((await db.query('select * from organizations')).rows.length,1);
 await assert.rejects(db.query('insert into organization_members values ($1,$2,$3)',[oa,b,'admin']),/row-level security/);
 assert.equal((await db.query('update organizations set owner_id=$1 returning id',[v])).rows.length,0);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);
 assert.equal((await db.query('select * from organization_members')).rows.length,0);
 assert.equal((await db.query('select * from organizations')).rows.length,1);
 await assert.rejects(db.query('insert into organizations values (gen_random_uuid(),$1)',[a]),/row-level security/);
 await db.exec('reset role;set role anon');
 await assert.rejects(db.query('select private.kowi_org_owner($1)',[oa]),/permission denied/);
 await db.exec('reset role');
 assert.equal((await db.query<{n:number}>("select count(*)::int n from pg_class where relname in ('organizations','organization_members') and relrowsecurity")).rows[0].n,2);
 }finally{await db.close();}
});
