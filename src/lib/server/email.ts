import 'server-only';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { ApiError } from './auth';

export class EmailAcceptanceUncertainError extends ApiError{constructor(){super(503,'No se pudo confirmar la aceptación del correo. Revisa el proveedor y la evidencia antes de repetir.');}}
type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  idempotencyKey?: string;
};

// Only call after authenticating and authorizing the owner and, for business
// communications, recording explicit approval of the proposed action.
export async function sendEmail(input: SendEmailInput) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.KOWI_EMAIL_FROM;
  if (!key || !from) throw new ApiError(503, 'El envío de correo no está configurado.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to) || input.to.length > 254 ||
      !input.subject.trim() || input.subject.length > 200 ||
      (!input.text && !input.html)) throw new ApiError(400, 'Destinatario o contenido no válido.');

  const resend = new Resend(key);
  const payload = {
    from, to: [input.to], subject: input.subject,
    ...(input.html ? { html: input.html } : { text: input.text! }),
  };
  let timer:ReturnType<typeof setTimeout>|undefined;
  let response:Awaited<ReturnType<typeof resend.emails.send>>;
  try{
    response=await Promise.race([
      resend.emails.send(payload,input.idempotencyKey?{idempotencyKey:input.idempotencyKey}:undefined),
      new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new EmailAcceptanceUncertainError()),20000);})
    ]);
  }catch{throw new EmailAcceptanceUncertainError();}
  finally{if(timer)clearTimeout(timer);}
  const {data,error}=response;
  if(error){
    if(!['validation_error','missing_api_key','invalid_api_key','restricted_api_key','rate_limit_exceeded','not_found','method_not_allowed'].includes(error.name))throw new EmailAcceptanceUncertainError();
    throw new ApiError(502,'El proveedor de correo rechazó el envío.');
  }
  if(typeof data?.id!=='string'||!data.id.trim())throw new EmailAcceptanceUncertainError();
  // A Resend acceptance is not evidence of delivery; a signed webhook is needed.
  return { id: data.id, status: 'accepted' as const };
}

export function testEmailTemplate() {
  return {
    subject: 'Prueba KOWI + Resend',
    html: '<h2>KOWI + Resend funcionando ✅</h2><p>Este correo fue enviado desde la web de KOWI en Vercel.</p>',
  };
}

export async function recordEmailAccepted(input: {
  userId: string; recipient: string; externalId: string; businessActionId?: string;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.from('email_events').insert({
    user_id: input.userId, recipient: input.recipient, external_id: input.externalId,
    event_type: 'accepted', ...(input.businessActionId ? { business_action_id: input.businessActionId } : {}),
  });
  return !error || error.code === '23505';
}
