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
