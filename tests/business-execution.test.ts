import {test} from 'node:test';
import assert from 'node:assert/strict';
import {executeBusinessAction,BusinessExecutionUncertainError} from '../src/lib/server/business-execution';
test('Business execution requires provider evidence and checked persistence',async()=>{
 const originalFetch=globalThis.fetch;
 const keys=['KOWI_VERIFIED_CHANNELS','WHATSAPP_ACCESS_TOKEN','WHATSAPP_PHONE_NUMBER_ID','GOOGLE_CALENDAR_ACCESS_TOKEN'] as const;
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 let payload:unknown={},throwFetch=false,inserts=0,fail=false;
 const db={from:()=>({insert:async()=>{inserts++;return {error:fail?{message:'test failure'}:null};}})};
 const base={id:'test-action',user_id:'test-user',lead_id:null};
 try{
 process.env.KOWI_VERIFIED_CHANNELS='whatsapp,calendar';process.env.WHATSAPP_ACCESS_TOKEN='test-only';process.env.WHATSAPP_PHONE_NUMBER_ID='test-only';process.env.GOOGLE_CALENDAR_ACCESS_TOKEN='test-only';
 globalThis.fetch=async()=>{if(throwFetch)throw new Error('test timeout');return Response.json(payload);};
 const whatsapp={...base,action_type:'send_whatsapp' as const,payload:{to:'34000000000',body:'Test'}};
 const calendar={...base,action_type:'create_appointment' as const,payload:{title:'Test',starts_at:'2030-01-01T10:00:00Z',ends_at:'2030-01-01T11:00:00Z'}};
 payload={messages:[]};await assert.rejects(executeBusinessAction(db,whatsapp),BusinessExecutionUncertainError);
 payload={};await assert.rejects(executeBusinessAction(db,calendar),BusinessExecutionUncertainError);assert.equal(inserts,0);
 throwFetch=true;await assert.rejects(executeBusinessAction(db,calendar),BusinessExecutionUncertainError);throwFetch=false;
 fail=true;payload={messages:[{id:'test-message'}]};await assert.rejects(executeBusinessAction(db,whatsapp),BusinessExecutionUncertainError);
 payload={id:'test-event'};await assert.rejects(executeBusinessAction(db,calendar),BusinessExecutionUncertainError);
 fail=false;assert.equal((await executeBusinessAction(db,calendar)).external_id,'test-event');assert.equal(inserts,3);
 }finally{globalThis.fetch=originalFetch;for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
});

test('Controlled self-email allows only exact approved payload; uncertain provider results require review',async()=>{
 const originalFetch=globalThis.fetch;
 const keys=['KOWI_VERIFIED_CHANNELS','RESEND_API_KEY','KOWI_EMAIL_FROM','NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'] as const;
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 const body='Este es un mensaje de prueba autorizado de KOWI para verificar aprobación humana, envío y evidencia. No requiere ninguna acción.';
 const action={id:'synthetic-action',user_id:'synthetic-user',lead_id:null,action_type:'send_email' as const,payload:{to:'self@example.test',subject:'Prueba controlada KOWI',body,controlled_test:true,test_version:1,organization_id:'11111111-1111-4111-8111-111111111111',conversation_id:'22222222-2222-4222-8222-222222222222'}};
 let calls=0,uncertain=false,record:Record<string,unknown>|null=null;
 const db={from:()=>({insert:async(value:Record<string,unknown>)=>{record=value;return {error:null};}})};
 try{
 process.env.KOWI_VERIFIED_CHANNELS='';process.env.RESEND_API_KEY='re_synthetic_only';process.env.KOWI_EMAIL_FROM='fixture@example.test';delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 globalThis.fetch=async()=>{calls++;if(uncertain)throw new Error('Synthetic transport failure');return Response.json({id:'synthetic-provider-email'});};
 await assert.rejects(executeBusinessAction(db,action),/Canal pendiente/);assert.equal(calls,0);
 await assert.rejects(executeBusinessAction(db,{...action,payload:{...action.payload,to:'other@example.test'}},{controlledEmailTestRecipient:'self@example.test'}),/no coincide/);assert.equal(calls,0);
 const result=await executeBusinessAction(db,action,{controlledEmailTestRecipient:'self@example.test'});
 assert.equal(result.external_id,'synthetic-provider-email');assert.ok(record);
 uncertain=true;await assert.rejects(executeBusinessAction(db,action,{controlledEmailTestRecipient:'self@example.test'}),BusinessExecutionUncertainError);
 }finally{globalThis.fetch=originalFetch;for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
});
