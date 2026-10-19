import {parseMetaMessages,verifyMetaSignature} from '@/lib/whatsapp/meta';
import {serviceDb} from '@/lib/server/business-embed';
export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:Request){
 const url=new URL(request.url);
 const token=process.env.META_WHATSAPP_VERIFY_TOKEN;
 const challenge=url.searchParams.get('hub.challenge');
 if(token&&url.searchParams.get('hub.mode')==='subscribe'&&
    url.searchParams.get('hub.verify_token')===token&&challenge&&challenge.length<=512)
  return new Response(challenge,{status:200,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
 return new Response('Forbidden',{status:403});
}
export async function POST(request:Request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
  return new Response('Unsupported Media Type',{status:415});
 if(Number(request.headers.get('content-length')||0)>262144)return new Response('Payload too large',{status:413});
 const raw=await request.text();
 if(Buffer.byteLength(raw,'utf8')>262144)return new Response('Payload too large',{status:413});
 if(!verifyMetaSignature(raw,request.headers.get('x-hub-signature-256'),process.env.META_APP_SECRET||''))
  return new Response('Unauthorized',{status:401});
 let payload:unknown;
 try{payload=JSON.parse(raw);}catch{return new Response('Invalid JSON',{status:400});}
 if(process.env.META_WHATSAPP_PILOT_ENABLED!=='true')
  return Response.json({received:true,pilot:'disabled'},{headers:{'Cache-Control':'no-store'}});
 const phoneId=process.env.META_WHATSAPP_TEST_PHONE_NUMBER_ID;
 const organizationId=process.env.KOWI_WHATSAPP_TEST_ORGANIZATION_ID;
 if(!phoneId||!organizationId)return new Response('Pilot configuration incomplete',{status:503});
 const messages=parseMetaMessages(payload).filter(m=>m.phoneNumberId===phoneId);
 if(!messages.length)return Response.json({received:true,stored:0},{headers:{'Cache-Control':'no-store'}});
 try{
  const db=serviceDb();
  const {data:binding,error:bindingError}=await db.from('whatsapp_pilot_bindings').select('organization_id')
   .eq('phone_number_id',phoneId).eq('organization_id',organizationId).eq('enabled',true).maybeSingle();
  if(bindingError||!binding)return new Response('Test binding unavailable',{status:503});
  const {error}=await db.from('whatsapp_pilot_inbox').upsert(messages.map(m=>({
   organization_id:organizationId,phone_number_id:m.phoneNumberId,meta_message_id:m.id,
   sender_e164:m.from,message_text:m.text,
  })),{onConflict:'phone_number_id,meta_message_id',ignoreDuplicates:true});
  if(error)throw error;
  return Response.json({received:true,stored:messages.length},{headers:{'Cache-Control':'no-store'}});
 }catch{
  // Request retry instead of acknowledging a message that may not be durable.
  return new Response('Temporary storage error',{status:503});
 }
}
