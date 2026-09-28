import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const [leads, actions, appointments] = await Promise.all([
      db.from('business_leads').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(100),
      db.from('business_actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      db.from('business_appointments').select('*').eq('user_id', user.id).order('starts_at', { ascending: true }).limit(50),
    ]);
    if (leads.error || actions.error || appointments.error) throw new ApiError(503, 'No se pudo cargar Kowi Business.');

    const channels = [
      {
        channel: 'whatsapp',
        provider: 'Meta WhatsApp Cloud API',
        enabled: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        status: process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID ? 'ready' : 'not_configured',
      },
      {
        channel: 'email',
        provider: 'Resend',
        enabled: Boolean(process.env.RESEND_API_KEY),
        status: process.env.RESEND_API_KEY ? 'ready' : 'not_configured',
      },
      {
        channel: 'calendar',
        provider: 'Google Calendar',
        enabled: Boolean(process.env.GOOGLE_CALENDAR_ACCESS_TOKEN),
        status: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN ? 'ready' : 'not_configured',
      },
    ];

    return Response.json({
      leads: leads.data ?? [],
      actions: actions.data ?? [],
      appointments: appointments.data ?? [],
      channels,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
