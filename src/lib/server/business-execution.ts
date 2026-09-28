import 'server-only';
import { ApiError } from './auth';

type Action = {
  id: string;
  user_id: string;
  lead_id: string | null;
  action_type: 'send_whatsapp' | 'send_email' | 'create_appointment' | 'update_lead';
  payload: Record<string, unknown>;
};

async function sendWhatsApp(action: Action) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_GRAPH_VERSION || 'v23.0';
  if (!token || !phoneId) throw new ApiError(409, 'WhatsApp todavía no está configurado.');
  const to = String(action.payload.to || '');
  const body = String(action.payload.body || '');
  if (!to || !body) throw new ApiError(400, 'Faltan destinatario o mensaje.');
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(502, 'WhatsApp no pudo enviar el mensaje.');
  return { external_id: data?.messages?.[0]?.id ?? '', detail: data };
}

async function sendEmail(action: Action) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.KOWI_EMAIL_FROM || 'Kowi <info@kowi.one>';
  if (!key) throw new ApiError(409, 'Email todavía no está configurado.');
  const to = String(action.payload.to || '');
  const subject = String(action.payload.subject || '');
  const body = String(action.payload.body || '');
  if (!to || !subject || !body) throw new ApiError(400, 'Faltan destinatario, asunto o mensaje.');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text: body }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(502, 'Email no pudo enviar el mensaje.');
  return { external_id: data?.id ?? '', detail: data };
}

async function createCalendarEvent(action: Action) {
  const token = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || 'primary');
  if (!token) throw new ApiError(409, 'Google Calendar todavía no está configurado.');
  const title = String(action.payload.title || '');
  const starts_at = String(action.payload.starts_at || '');
  const ends_at = String(action.payload.ends_at || '');
  if (!title || !starts_at || !ends_at) throw new ApiError(400, 'Faltan datos de la cita.');
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
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
  return { external_id: data?.id ?? '', detail: data };
}

export async function executeBusinessAction(db: any, action: Action) {
  if (action.action_type === 'send_whatsapp') {
    const result = await sendWhatsApp(action);
    await db.from('business_messages').insert({
      user_id: action.user_id, lead_id: action.lead_id, channel: 'whatsapp', direction: 'outbound',
      status: 'sent', recipient: String(action.payload.to || ''), subject: '',
      body: String(action.payload.body || ''), external_id: result.external_id, metadata: result.detail,
    });
    return result;
  }
  if (action.action_type === 'send_email') {
    const result = await sendEmail(action);
    await db.from('business_messages').insert({
      user_id: action.user_id, lead_id: action.lead_id, channel: 'email', direction: 'outbound',
      status: 'sent', recipient: String(action.payload.to || ''), subject: String(action.payload.subject || ''),
      body: String(action.payload.body || ''), external_id: result.external_id, metadata: result.detail,
    });
    return result;
  }
  if (action.action_type === 'create_appointment') {
    const result = await createCalendarEvent(action);
    await db.from('business_appointments').insert({
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
