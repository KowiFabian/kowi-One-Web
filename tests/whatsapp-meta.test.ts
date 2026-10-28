import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifyMetaSignature,parseMetaMessages,isAllowedMetaTestRecipient} from '../src/lib/whatsapp/meta';

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
