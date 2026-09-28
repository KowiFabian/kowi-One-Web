import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const [leads, actions, appointments, channels] = await Promise.all([
      db.from('business_leads').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(100),
      db.from('business_actions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      db.from('business_appointments').select('*').eq('user_id', user.id).order('starts_at', { ascending: true }).limit(50),
      db.from('business_channels').select('*').eq('user_id', user.id).order('channel'),
    ]);
    if (leads.error || actions.error || appointments.error || channels.error) {
      throw new ApiError(503, 'No se pudo cargar Kowi Business.');
    }
    return Response.json({
      leads: leads.data ?? [],
      actions: actions.data ?? [],
      appointments: appointments.data ?? [],
      channels: channels.data ?? [],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
