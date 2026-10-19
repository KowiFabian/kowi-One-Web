import {z} from 'zod';
import {requireOrganization} from '@/lib/server/organization-access';
import {serviceDb} from '@/lib/server/business-embed';
import {ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
import {sendMetaText} from '@/lib/whatsapp/meta';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
const schema=z.object({messageId:z.string().uuid(),reply:z.string().trim().min(1).max(1000),approved:z.literal(true)}).strict();
const headers={'Cache-Control':'no-store'};

async function context(request:Request){
 const {organizationId,user}=await requireOrganization(request,['owner','admin']);
 if(process.env.META_WHATSAPP_PILOT_ENABLED!=='true')
  throw new ApiError(503,'El piloto de WhatsApp todavía no está activado.');
 const phone=process.env.META_WHATSAPP_TEST_PHONE_NUMBER_ID;
 if(!phone||process.env.KOWI_WHATSAPP_TEST_ORGANIZATION_ID!==organizationId)
  throw new ApiError(403,'Esta empresa no corresponde al número de prueba.');
 const db=serviceDb().schema('private');
 const {data:binding,error}=await db.from('whatsapp_pilot_bindings').select('organization_id')
  .eq('phone_number_id',phone).eq('organization_id',organizationId).eq('enabled',true).maybeSingle();
 if(error||!binding)throw new ApiError(503,'La conexión Meta de prueba no está verificada.');
 return {db,organizationId,user,phone};
}

export async function GET(request:Request){
 try{
  const {db,organizationId}=await context(request);
  const {data:messages,error}=await db.from('whatsapp_pilot_inbox')
   .select('id,phone_number_id,sender_e164,message_text,received_at,expires_at')
   .eq('organization_id',organizationId).gt('expires_at',new Date().toISOString())
   .order('received_at',{ascending:false}).limit(30);
  if(error)throw new ApiError(503,'No fue posible leer los mensajes.');
  const {data:outbox,error:outboxError}=await db.from('whatsapp_pilot_outbox')
   .select('inbox_id,status,provider_message_id').eq('organization_id',organizationId)
   .order('created_at',{ascending:false}).limit(30);
  if(outboxError)throw new ApiError(503,'No fue posible leer la respuesta.');
  return Response.json({messages:messages||[],outbox:outbox||[],mode:'test-manual-only'},{headers});
 }catch(e){return apiFailure(e);}
}

export async function POST(request:Request){
 try{
  const {db,organizationId,user,phone}=await context(request);
  const data=schema.safeParse(await limitedJson(request,5000));
  if(!data.success)throw new ApiError(400,'Confirma el texto y la aprobación explícita.');
  const {messageId,reply}=data.data;
  const {data:inbox,error}=await db.from('whatsapp_pilot_inbox')
   .select('id,sender_e164,phone_number_id,received_at,expires_at').eq('id',messageId)
   .eq('organization_id',organizationId).eq('phone_number_id',phone).maybeSingle();
  if(error)throw new ApiError(503,'No se pudo comprobar el mensaje.');
  if(!inbox)throw new ApiError(404,'Mensaje de prueba no encontrado.');
  if(Date.parse(inbox.expires_at)<Date.now()||Date.now()-Date.parse(inbox.received_at)>23*3600000)
   throw new ApiError(409,'La ventana de respuesta ha caducado. No se enviará ningún mensaje.');
  // The UNIQUE inbox_id constraint reserves exactly one outbound attempt;
  // an uncertain provider result must be reconciled manually, never retried here.
  const {data:reserved,error:reserveError}=await db.from('whatsapp_pilot_outbox')
   .insert({organization_id:organizationId,inbox_id:inbox.id,reply_text:reply,status:'sending',approved_by:user.id})
   .select('id').single();
  if(reserveError){
   if(reserveError.code==='23505')throw new ApiError(409,'Ya existe un intento de envío para este mensaje. Revisa Meta antes de repetir.');
   throw new ApiError(503,'No se pudo registrar la autorización. No se ha enviado nada.');
  }
  try{
   const providerId=await sendMetaText(inbox.sender_e164,reply,phone);
   const {error:finalizeError}=await db.from('whatsapp_pilot_outbox')
    .update({status:'sent',provider_message_id:providerId,updated_at:new Date().toISOString()})
    .eq('id',reserved.id).eq('organization_id',organizationId).eq('status','sending');
   if(finalizeError)throw new ApiError(503,'Meta aceptó el envío pero el registro requiere revisión manual.');
   return Response.json({sent:true,providerId,mode:'test-manual-only'},{headers});
  }catch(e){
   await db.from('whatsapp_pilot_outbox')
    .update({status:'uncertain',updated_at:new Date().toISOString()})
    .eq('id',reserved.id).eq('organization_id',organizationId).eq('status','sending');
   if(e instanceof ApiError)throw e;
   throw new ApiError(502,'El resultado de Meta no se ha podido verificar. No vuelvas a enviar sin revisar el historial.');
  }
 }catch(e){return apiFailure(e);}
}
