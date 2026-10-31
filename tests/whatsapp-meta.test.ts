import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifyMetaSignature,parseMetaMessages,isAllowedMetaTestRecipient,metaPilotReplyEligibility,readLimitedMetaWebhookBody} from '../src/lib/whatsapp/meta';

const good={object:'whatsapp_business_account',entry:[{changes:[{value:{
 metadata:{phone_number_id:'123456789012345'},messages:[{id:'wamid.demo123',from:'34600111222',type:'text',text:{body:'Quiero reservar una cita'}}],
}}]}]};
test('Meta webhook signatures require valid raw HMAC and reject tampering',()=>{
 const secret='sample-secret',raw=JSON.stringify(good);
 const signature='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
 assert.equal(verifyMetaSignature(raw,signature,secret),true);
 assert.equal(verifyMetaSignature(raw+' ',signature,secret),false);
 assert.equal(verifyMetaSignature(raw,null,secret),false);
 assert.equal(verifyMetaSignature(raw,'sha256=bad',secret),false);
 assert.equal(verifyMetaSignature(raw,signature,''),false);
});
test('parse inbound text only with valid identifiers and no status echoes',()=>{
 assert.deepEqual(parseMetaMessages(good),[{id:'wamid.demo123',from:'34600111222',phoneNumberId:'123456789012345',text:'Quiero reservar una cita'}]);
 assert.deepEqual(parseMetaMessages({object:'whatsapp_business_account',entry:[{changes:[{value:{statuses:[{id:'wamid.demo123'}]}}]}]}),[]);
 assert.deepEqual(parseMetaMessages({object:'page',entry:good.entry}),[]);
 assert.deepEqual(parseMetaMessages(null),[]);
 assert.deepEqual(parseMetaMessages({object:'whatsapp_business_account',entry:[{changes:[{value:{metadata:{phone_number_id:'x'},messages:good.entry[0].changes[0].value.messages}}]}]}),[]);
});
test('no untrusted oversized text or arbitrary message type enters inbox',()=>{
 const v=good.entry[0].changes[0].value;
 assert.deepEqual(parseMetaMessages({object:'whatsapp_business_account',entry:[{changes:[{value:{metadata:v.metadata,messages:[{...v.messages[0],text:{body:'x'.repeat(2100)}},{...v.messages[0],type:'image'}]}}]}]}),[]);
});

test('Meta sandbox recipients must be explicitly allowlisted; no fallback to arbitrary numbers',()=>{
 assert.equal(isAllowedMetaTestRecipient('34600111222',undefined),false);
 assert.equal(isAllowedMetaTestRecipient('34600111222',''),false);
 assert.equal(isAllowedMetaTestRecipient('34600111222','34600111222, 34600999888'),true);
 assert.equal(isAllowedMetaTestRecipient('34600111222','34600999888'),false);
 assert.equal(isAllowedMetaTestRecipient('34600111222','+34600111222'),false);
 assert.equal(isAllowedMetaTestRecipient('34600111222','346001112220'),false);
 assert.equal(isAllowedMetaTestRecipient('abc','34600111222'),false);
});


test('Meta replies are preflighted before consuming a one-shot outbox reservation',()=>{
 const now=Date.parse('2026-10-31T07:00:00Z');
 const allowed='34600111222',received=new Date(now-3600000).toISOString();
 const expires=new Date(now+3600000).toISOString();
 const check=(sender:string,list:string|undefined,at:string,until:string)=>
  metaPilotReplyEligibility(sender,list,at,until,now);
 assert.equal(check(allowed,allowed,received,expires),'ok');
 assert.equal(check(allowed,undefined,received,expires),'recipient_not_allowed');
 assert.equal(check('34600999888',allowed,received,expires),'recipient_not_allowed');
 assert.equal(check(allowed,allowed,'not-a-date',expires),'window_expired');
 assert.equal(check(allowed,allowed,received,'not-a-date'),'window_expired');
 assert.equal(check(allowed,allowed,received,new Date(now).toISOString()),'window_expired');
 assert.equal(check(allowed,allowed,new Date(now-23*3600000-1).toISOString(),expires),'window_expired');
 assert.equal(check(allowed,allowed,new Date(now+120000).toISOString(),expires),'window_expired');
});

test('Meta webhook stream enforces a byte limit even without Content-Length',async()=>{
 const enc=new TextEncoder();
 const exact=new ReadableStream<Uint8Array>({start(controller){
  controller.enqueue(enc.encode('abc'));
  controller.enqueue(enc.encode('def'));
  controller.close();
 }});
 assert.deepEqual(await readLimitedMetaWebhookBody(exact,6),{raw:'abcdef',tooLarge:false});
 const oversized=new ReadableStream<Uint8Array>({start(controller){
  controller.enqueue(enc.encode('abc'));
  controller.enqueue(enc.encode('defg'));
  controller.close();
 }});
 assert.deepEqual(await readLimitedMetaWebhookBody(oversized,6),{raw:'',tooLarge:true});
 assert.deepEqual(await readLimitedMetaWebhookBody(null,6),{raw:'',tooLarge:false});
});
