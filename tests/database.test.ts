import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('RLS, ownership, atomic writes, quotas and cascading deletion', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create schema auth;
      create role anon nologin;
      create role authenticated nologin;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated, anon;
      grant execute on function auth.uid() to authenticated, anon;
      insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
    `);
    await db.exec(await readFile('supabase/migrations/202609250001_core.sql','utf8'));
    const user = '11111111-1111-4111-8111-111111111111';
    const other = '22222222-2222-4222-8222-222222222222';
    const conversation = '33333333-3333-4333-8333-333333333333';
    const request = '44444444-4444-4444-8444-444444444444';
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
    await db.query('insert into conversations(id) values ($1)',[conversation]);
    await assert.rejects(db.query('insert into conversations(user_id) values ($1)',[other]),/row-level security/);
    await db.query('select save_chat_turn($1,$2,0,$3,$4,null)',[conversation,request,'Mi idea','¿Qué quieres lograr?']);
    const turn = await db.query('select * from turns');
    assert.equal(turn.rows.length,1);
    await assert.rejects(db.query('select save_chat_turn($1,gen_random_uuid(),0,$2,$3,null)',[conversation,'duplicate','answer']),/Conversation changed/);
    await assert.rejects(db.exec('update chat_quotas set day_count=0'),/permission denied/);
    for (let i=0;i<5;i++) assert.equal((await db.query<{consume_chat_quota:boolean}>('select consume_chat_quota()')).rows[0].consume_chat_quota,true);
    assert.equal((await db.query<{consume_chat_quota:boolean}>('select consume_chat_quota()')).rows[0].consume_chat_quota,false);
    await db.exec(`reset role; update chat_quotas set minute_start=now()-interval '2 minutes',day_count=100;
      set role authenticated;`);
    assert.equal((await db.query<{consume_chat_quota:boolean}>('select consume_chat_quota()')).rows[0].consume_chat_quota,false);
    await db.exec(`reset role; update chat_quotas set day_start=now()-interval '25 hours'; set role authenticated;`);
    assert.equal((await db.query<{consume_chat_quota:boolean}>('select consume_chat_quota()')).rows[0].consume_chat_quota,true);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);
    assert.equal((await db.query('select * from conversations')).rows.length,0);
    assert.equal((await db.query('select * from turns')).rows.length,0);
    await assert.rejects(db.query('select save_chat_turn($1,gen_random_uuid(),1,$2,$3,null)',[conversation,'attack','answer']),/insufficient_privilege/);
    await db.query('delete from conversations where id=$1',[conversation]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
    assert.equal((await db.query('select * from conversations')).rows.length,1);
    await db.query('delete from conversations where id=$1',[conversation]);
    assert.equal((await db.query('select * from turns')).rows.length,0);
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.exec('select * from conversations'),/permission denied/);
    await assert.rejects(db.exec('select consume_chat_quota()'),/permission denied/);
    await assert.rejects(db.query('select save_chat_turn($1,$2,0,$3,$4,null)',[conversation,request,'x','y']),/permission denied/);
  } finally { await db.close(); }
});

test('Business and projects isolate two companies and require approval transitions', async () => {
  const db=new PGlite();
  const a='11111111-1111-4111-8111-111111111111';
  const b='22222222-2222-4222-8222-222222222222';
  try {
    await db.exec(`create schema auth; create role anon nologin; create role authenticated nologin; create role service_role nologin;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated,anon;
      grant execute on function auth.uid() to authenticated,anon;
      insert into auth.users values ('${a}'),('${b}');`);
    for(const name of ['202609250001_core.sql','20260928004208_education_agent.sql','20260928083927_business_agent.sql','20260928123000_business_agent_channels_approvals.sql','20260928124000_business_agent_fk_indexes.sql','20260928181514_public_platform.sql','20260928181706_action_approval_guard.sql','20260928182818_action_ledger_triggers.sql'])
      await db.exec(await readFile(`supabase/migrations/${name}`,'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    await db.query('insert into business_profiles(config) values ($1)', [{name:'Empresa A'}]);
    const project=await db.query<{id:string}>('insert into projects(idea,objective,next_action) values ($1,$2,$3) returning id',['Crear un servicio','Validar con cinco clientes','Entrevistar mañana']);
    const lead=await db.query<{id:string}>('insert into business_leads(name,consent) values ($1,true) returning id',['Cliente A']);
    const action=await db.query<{id:string}>('insert into business_actions(lead_id,action_type,summary) values ($1,$2,$3) returning id',[lead.rows[0].id,'send_email','Preparar correo']);
    await assert.rejects(db.query("update business_actions set status='executed'"),/permission denied/);
    await assert.rejects(db.query("insert into business_actions(lead_id,action_type,summary,status) values ($1,'send_email','Falso','executed')",[lead.rows[0].id]),/row-level security/);
    await db.query("select transition_business_action($1,'approved')",[action.rows[0].id]);
    assert.equal((await db.query("select * from agent_ledger where agent='business'")).rows.length,2);
    await assert.rejects(db.query("select transition_business_action($1,'approved')",[action.rows[0].id]),/Action unavailable/);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[b]);
    assert.equal((await db.query('select * from business_profiles')).rows.length,0);
    assert.equal((await db.query('select * from business_leads')).rows.length,0);
    assert.equal((await db.query('select * from projects')).rows.length,0);
    assert.equal((await db.query('select * from business_actions')).rows.length,0);
    assert.equal((await db.query('select * from agent_ledger')).rows.length,0);
    await assert.rejects(db.query("select transition_business_action($1,'executed')",[action.rows[0].id]),/Action unavailable/);
    const changed=await db.query('update projects set objective=$1 where id=$2 returning id',['Robado',project.rows[0].id]);
    assert.equal(changed.rows.length,0);
  } finally {await db.close();}
});
