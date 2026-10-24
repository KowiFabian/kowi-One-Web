import test from 'node:test';
import assert from 'node:assert/strict';
import {emailDeliveryState,emailDeliveryLabels} from '../src/lib/email-delivery';

test('provider acceptance does not imply delivery or failure',()=>{
 assert.equal(emailDeliveryState(null), 'unknown');
 assert.equal(emailDeliveryState([],true),'accepted');
 assert.equal(emailDeliveryState([{event_type:'accepted'}]),'accepted');
 assert.match(emailDeliveryLabels.accepted,/entrega no confirmada/i);
});
test('signed event chronology is reflected without inventing success',()=>{
 const accepted={event_type:'accepted',created_at:'2026-10-24T10:00:00Z'};
 for(const event of ['delivered','bounced','complained','suppressed']){
  assert.equal(emailDeliveryState([accepted,{event_type:event,created_at:'2026-10-24T10:01:00Z'}]),event);
 }
 assert.equal(emailDeliveryState([accepted,{event_type:'email.failed'}],true),'accepted');
 assert.equal(emailDeliveryState([accepted,{event_type:'bounced',created_at:'2026-10-24T10:01:00Z'},{event_type:'delivered',created_at:'2026-10-24T10:02:00Z'}]),'delivered');
});
