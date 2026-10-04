import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('Runtime backend probe is executable only by the backend role and exposes no tenant data',async()=>{
 const db=new PGlite();try{
 await db.exec(`create schema auth;create role anon nologin;create role authenticated nologin;create role service_role nologin;
 create function auth.role() returns text language sql stable as $$select current_setting('role',true)$$;`);
 await db.exec(await readFile('supabase/migrations/20261004000500_tenant_backend_runtime_probe.sql','utf8'));
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(db.query('select verify_tenant_backend_runtime()'),/permission denied/);await db.exec('reset role');}
 await db.exec('set role service_role');assert.equal((await db.query<{valid:boolean}>('select verify_tenant_backend_runtime() valid')).rows[0].valid,true);
 }finally{await db.close();}
});
