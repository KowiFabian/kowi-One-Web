import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('Meta test inbox is private, tenant-bound, deduplicated and one-send-only',async()=>{
 const db=new PGlite();
 const orgA='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const orgB='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const user='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 try{
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;
   create schema auth;create table auth.users(id uuid primary key);
   create table public.organizations(id uuid primary key);
   insert into auth.users values ('${user}');
   insert into public.organizations values ('${orgA}'),('${orgB}');`);
  await db.exec(await readFile('supabase/migrations/20261020000000_whatsapp_meta_test_pilot.sql','utf8'));
  await db.exec(`set role authenticated;`);
  await assert.rejects(db.query('select * from public.whatsapp_pilot_inbox'),/permission denied/);
  await assert.rejects(db.query(`insert into public.whatsapp_pilot_bindings(phone_number_id,organization_id) values ('1234567890','${orgA}')`),/permission denied/);
  await db.exec('reset role;set role service_role');
  await db.query('insert into public.whatsapp_pilot_bindings(phone_number_id,organization_id,enabled) values ($1,$2,true)',['1234567890',orgA]);
  const row=(await db.query<{id:string}>(`insert into public.whatsapp_pilot_inbox(organization_id,phone_number_id,meta_message_id,sender_e164,message_text)
   values ($1,$2,$3,$4,$5) returning id`,[orgA,'1234567890','wamid.test','34600111222','Cita de prueba'])).rows[0];
  await assert.rejects(db.query(`insert into public.whatsapp_pilot_inbox(organization_id,phone_number_id,meta_message_id,sender_e164,message_text)
   values ($1,$2,$3,$4,$5)`,[orgA,'1234567890','wamid.test','34600111222','Repetido']),/duplicate key/);
  await assert.rejects(db.query(`insert into public.whatsapp_pilot_outbox(organization_id,inbox_id,reply_text,approved_by)
   values ($1,$2,$3,$4)`,[orgB,row.id,'Intento entre empresas',user]),/foreign key/);
  await db.query(`insert into public.whatsapp_pilot_outbox(organization_id,inbox_id,reply_text,approved_by)
   values ($1,$2,$3,$4)`,[orgA,row.id,'Confirmado, solo prueba',user]);
  await assert.rejects(db.query(`insert into public.whatsapp_pilot_outbox(organization_id,inbox_id,reply_text,approved_by)
   values ($1,$2,$3,$4)`,[orgA,row.id,'Segundo envío',user]),/duplicate key/);
  await db.exec('reset role;set role anon');
  await assert.rejects(db.query('select * from public.whatsapp_pilot_outbox'),/permission denied/);
 }finally{await db.close();}
});
