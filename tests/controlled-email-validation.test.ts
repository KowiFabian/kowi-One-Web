import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CONTROLLED_EMAIL_BODY,CONTROLLED_EMAIL_SUBJECT,validControlledEmailTest} from '../src/lib/controlled-email-test';
test('Controlled email binds exact content, verified recipient and conversation identifiers',()=>{
 const payload={to:'self@example.test',subject:CONTROLLED_EMAIL_SUBJECT,body:CONTROLLED_EMAIL_BODY,controlled_test:true,test_version:1,organization_id:'11111111-1111-4111-8111-111111111111',conversation_id:'22222222-2222-4222-8222-222222222222'};
 assert.equal(validControlledEmailTest(payload,'self@example.test'),true);
 for(const patch of [{to:'other@example.test'},{subject:'Changed'},{body:'Changed'},{controlled_test:false},{test_version:2},{organization_id:'invalid'},{extra:'injected'}])assert.equal(validControlledEmailTest({...payload,...patch},'self@example.test'),false);
});
