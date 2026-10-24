import test from 'node:test';
import assert from 'node:assert/strict';
import {requestOpenAIJson,OpenAITransportError,openAIErrorResponse,retryAfterSeconds} from '../src/lib/server/openai-transport';

const key='test-credential-only';
function fakeFetch(responses:Array<Response|Error>,requests:{count:number}){
 return (async (_url:RequestInfo|URL,_init?:RequestInit)=>{
  requests.count++;
  const next=responses.shift();
  if(next instanceof Error)throw next;
  if(!next)throw new Error('Unexpected request');
  return next;
 }) as typeof fetch;
}
test('transient 503 may retry once, then return response',async()=>{
 const tally={count:0},waits:number[]=[];
 const result=await requestOpenAIJson('responses',{model:'fixture'},key,{
  fetcher:fakeFetch([new Response('temporary',{status:503}),Response.json({status:'completed'})],tally),
  pause:async ms=>{waits.push(ms);}
 });
 assert.deepEqual(result,{status:'completed'});
 assert.equal(tally.count,2);assert.deepEqual(waits,[700]);
});
test('permanent 400 and 401 never retry',async()=>{
 for(const status of [400,401,403,422]){
  const tally={count:0};
  await assert.rejects(
   requestOpenAIJson('chat/completions',{},key,{fetcher:fakeFetch([new Response('',{status})],tally),pause:async()=>{}}),
   (error:unknown)=>error instanceof OpenAITransportError&&error.status===status
  );
  assert.equal(tally.count,1);
 }
});
test('rate limit respects Retry-After without long HTTP sleeps',async()=>{
 const tally={count:0};
 await assert.rejects(requestOpenAIJson('responses',{},key,{
  fetcher:fakeFetch([new Response('',{status:429,headers:{'Retry-After':'30'}})],tally),pause:async()=>{}
 }), (e:unknown)=>e instanceof OpenAITransportError&&e.kind==='rate_limit'&&e.retryAfterSeconds===30);
 assert.equal(tally.count,1);
 const response=openAIErrorResponse(new OpenAITransportError('rate_limit',429,30));
 assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'30');
});
test('ambiguous network failure is never retried',async()=>{
 const tally={count:0};
 await assert.rejects(requestOpenAIJson('responses',{},key,{fetcher:fakeFetch([new Error('disconnect')],tally)}),
  (e:unknown)=>e instanceof OpenAITransportError&&e.kind==='timeout');
 assert.equal(tally.count,1);
});
test('malformed upstream JSON is rejected without replay',async()=>{
 const tally={count:0};
 await assert.rejects(requestOpenAIJson('responses',{},key,{fetcher:fakeFetch([new Response('not-json',{status:200})],tally)}),
  (e:unknown)=>e instanceof OpenAITransportError&&e.kind==='invalid_response');
 assert.equal(tally.count,1);
});
test('Retry-After supports seconds and HTTP date',()=>{
 assert.equal(retryAfterSeconds('2'),2);
 assert.equal(retryAfterSeconds('Fri, 24 Oct 2026 00:00:15 GMT',Date.parse('2026-10-24T00:00:00Z')),15);
 assert.equal(retryAfterSeconds('not-a-date'),null);
});
