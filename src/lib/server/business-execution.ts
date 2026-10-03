import 'server-only';
import { ApiError } from './auth';
import { recordEmailAccepted, sendEmail } from './email';

export class BusinessExecutionUncertainError extends ApiError {
 constructor(message:string){super(503,message);}
}
async function persistExecutionRecord(db:any,table:'business_messages'|'business_appointments',record:Record<string,unknown>){
 try{const {error}=await db.from(table).insert(record);if(error)throw error;}
 catch{throw new BusinessExecutionUncertainError('El proveedor aceptó la acción, pero no se pudo registrar su evidencia. Requiere revisión manual; no repitas la operación.');}
}
async function providerFetch(url:string,options:RequestInit){
 try{return await fetch(url,{...options,signal:AbortSignal.timeout(20000)});}
 catch{throw new BusinessExecutionUncertainError('No se pudo confirmar el resultado del proveedor. Requiere revisión manual antes de repetir la operación.');}
}
type Action = {
  id: string;
  user_id: string;
  lead_id: string | null;
  action_type: 'send_whatsapp' | 'send_email' | 'create_appointment' | 'update_lead';
  payload: Record<string, unknown>;
};
function requireVerified(channel: string) {
  const verified = (process.env.KOWI_VERIFIED_CHANNELS || '').split(',').map(value => value.trim());
  if (!verified.includes(channel)) throw new ApiError(409, 'Canal pendiente de verificación de extremo a extremo.');
}

async function sendWhatsApp(action: Action) {
  requireVerified('whatsapp');
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_GRAPH_VERSION || 'v23.0';
  if (!token || !phoneId) throw new ApiError(409, 'WhatsApp todavía no está configurado.');
  const to = String(action.payload.to || '');
  const body = String(action.payload.body || '');
  if (!to || !body) throw new ApiError(400, 'Faltan destinatario o mensaje.');
  const res = await providerFetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(502, 'WhatsApp no pudo enviar el mensaje.');
  const id=data?.messages?.[0]?.id;
  if(typeof id!=='string'||!id.trim())throw new BusinessExecutionUncertainError('WhatsApp respondió sin identificador verificable. Revisa el proveedor antes de repetir.');
  return { external_id:id, detail:data };
}

async function createCalendarEvent(action: Action) {
  requireVerified('calendar');
  const token = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || 'primary');
  if (!token) throw new ApiError(409, 'Google Calendar todavía no está configurado.');
  const title = String(action.payload.title || '');
  const starts_at = String(action.payload.starts_at || '');
  const ends_at = String(action.payload.ends_at || '');
  if (!title || !starts_at || !ends_at) throw new ApiError(400, 'Faltan datos de la cita.');
  const res = await providerFetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: title,
      description: String(action.payload.notes || ''),
      location: String(action.payload.location || ''),
      start: { dateTime: starts_at },
      end: { dateTime: ends_at },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(502, 'Calendar no pudo crear la cita.');
  const id=data?.id;
  if(typeof id!=='string'||!id.trim())throw new BusinessExecutionUncertainError('Calendar respondió sin identificador verificable. Revisa el proveedor antes de repetir.');
  return {external_id:id,detail:data};
}

export async function executeBusinessAction(db: any, action: Action) {
  if (action.action_type === 'send_whatsapp') {
    const result = await sendWhatsApp(action);
    await persistExecutionRecord(db,'business_messages',{
      user_id: action.user_id, lead_id: action.lead_id, channel: 'whatsapp', direction: 'outbound',
      status: 'sent', recipient: String(action.payload.to || ''), subject: '',
      body: String(action.payload.body || ''), external_id: result.external_id, metadata: result.detail,
    });
    return result;
  }
  if (action.action_type === 'send_email') {
    requireVerified('email');
    const to = String(action.payload.to || '');
    const result = await sendEmail({
      to, subject: String(action.payload.subject || ''), text: String(action.payload.body || ''),
      idempotencyKey: `business-action/${action.id}`,
    });
    await persistExecutionRecord(db,'business_messages',{
      user_id: action.user_id, lead_id: action.lead_id, channel: 'email', direction: 'outbound',
      status: 'sent', recipient: to, subject: String(action.payload.subject || ''),
      body: String(action.payload.body || ''), external_id: result.id, metadata: { provider_status: result.status },
    });
    const eventLogged = await recordEmailAccepted({
      userId: action.user_id, businessActionId: action.id, recipient: to, externalId: result.id,
    });
    return { external_id: result.id, detail: { provider_status: result.status, event_logged: eventLogged } };
  }
  if (action.action_type === 'create_appointment') {
    const result = await createCalendarEvent(action);
    await persistExecutionRecord(db,'business_appointments',{
      user_id: action.user_id, lead_id: action.lead_id, title: String(action.payload.title || ''),
      starts_at: String(action.payload.starts_at || ''), ends_at: String(action.payload.ends_at || ''),
      status: 'confirmed', location: String(action.payload.location || ''), notes: String(action.payload.notes || ''),
      external_id: result.external_id,
    });
    return result;
  }
  if (action.action_type === 'update_lead') {
    if (!action.lead_id) throw new ApiError(400, 'La acción necesita un lead.');
    const patch: Record<string, unknown> = {};
    for (const key of ['status','next_action','notes','contact']) if (key in action.payload) patch[key] = action.payload[key];
    const { error } = await db.from('business_leads').update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', action.lead_id).eq('user_id', action.user_id);
    if (error) throw new ApiError(503, 'No se pudo actualizar el lead.');
    return { detail: patch, external_id: '' };
  }
  throw new ApiError(400, 'Tipo de acción no soportado.');
}
