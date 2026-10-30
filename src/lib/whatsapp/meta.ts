import {createHmac,timingSafeEqual} from 'node:crypto';

export type MetaMessage = {id:string;from:string;phoneNumberId:string;text:string};
type R=Record<string,unknown>;
const rec=(v:unknown):R|null=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as R:null;
const arr=(v:unknown):unknown[]=>Array.isArray(v)?v:[];

export function verifyMetaSignature(raw:string,header:string|null,secret:string):boolean{
 if(!secret||!header||!/^sha256=[\da-f]{64}$/i.test(header))return false;
 const expected=createHmac('sha256',secret).update(raw,'utf8').digest();
 return timingSafeEqual(expected,Buffer.from(header.slice(7),'hex'));
}
export function parseMetaMessages(payload:unknown):MetaMessage[]{
 const root=rec(payload);if(root?.object!=='whatsapp_business_account')return [];
 const messages:MetaMessage[]=[];
 for(const entry of arr(root.entry)){
  for(const change of arr(rec(entry)?.changes)){
   const value=rec(rec(change)?.value),metadata=rec(value?.metadata);
   const phoneNumberId=metadata?.phone_number_id;
   if(typeof phoneNumberId!=='string'||!/^\d{6,30}$/.test(phoneNumberId))continue;
   for(const input of arr(value?.messages)){
    const row=rec(input),body=rec(row?.text)?.body;
    if(row?.type!=='text'||typeof row?.from!=='string'||!/^\d{6,16}$/.test(row.from)||
       typeof row?.id!=='string'||row.id.length>200||!/^wamid\.[\w.:-]+$/.test(row.id)||
       typeof body!=='string'||body.trim().length<1||body.length>2000)continue;
    messages.push({id:row.id,from:row.from,phoneNumberId,text:body.trim()});
    if(messages.length>=20)return messages;
   }
  }
 }
 return messages;
}
// Test recipients are explicitly registered in the Meta sandbox and
// separately allowlisted on our server. No arbitrary third-party replies.
export function isAllowedMetaTestRecipient(phone:string,allowlist:string|undefined):boolean{
 if(!/^\d{6,16}$/.test(phone)||!allowlist)return false;
 const allowed=allowlist.split(',').map(value=>value.trim()).filter(value=>/^\d{6,16}$/.test(value));
 return allowed.includes(phone);
}

// Bound the request stream BEFORE reading it into memory. The Content-Length
// header cannot be trusted and may be absent on chunked webhook requests.
export async function readLimitedMetaWebhookBody(
 stream:ReadableStream<Uint8Array>|null,maxBytes=262144,
):Promise<{raw:string;tooLarge:boolean}>{
 if(!stream)return {raw:'',tooLarge:false};
 const reader=stream.getReader();
 const chunks:Uint8Array[]=[];
 let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   if(value.byteLength>maxBytes-size){
    await reader.cancel().catch(()=>{});
    return {raw:'',tooLarge:true};
   }
   if(value.byteLength){chunks.push(value);size+=value.byteLength;}
  }
  return {raw:Buffer.concat(chunks.map(chunk=>Buffer.from(chunk)),size).toString('utf8'),tooLarge:false};
 }finally{reader.releaseLock();}
}

export async function sendMetaText(to:string,body:string,phoneNumberId:string):Promise<string>{
 if(!/^\d{6,16}$/.test(to)||!/^\d{6,30}$/.test(phoneNumberId)||!body.trim()||body.length>1000)throw new Error('Invalid WhatsApp reply');
 if(!isAllowedMetaTestRecipient(to,process.env.META_WHATSAPP_TEST_RECIPIENTS))
  throw new Error('Recipient not authorized for Meta test pilot');
 const token=process.env.META_WHATSAPP_ACCESS_TOKEN;
 const permitted=process.env.META_WHATSAPP_TEST_PHONE_NUMBER_ID;
 if(process.env.META_WHATSAPP_PILOT_ENABLED!=='true'||!token||!permitted||permitted!==phoneNumberId)throw new Error('WhatsApp test pilot not configured');
 const version=process.env.META_GRAPH_API_VERSION||'v26.0';
 if(!/^v\d{1,3}\.0$/.test(version))throw new Error('Unsupported Graph version');
 const response=await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`,{
  method:'POST',
  headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
  body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to,type:'text',text:{body}}),
  signal:AbortSignal.timeout(12000),
 });
 if(!response.ok)throw new Error(`WhatsApp provider returned ${response.status}`);
 const json:unknown=await response.json().catch(()=>null);
 const ids=rec(json)?.messages;
 const id=rec(arr(ids)[0])?.id;
 if(typeof id!=='string'||!id.startsWith('wamid.')||id.length>200)throw new Error('WhatsApp provider delivery ID missing');
 return id;
}
