import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';

type Context = { params: Promise<{ id: string }> };
const updateSchema = z.object({
  status: z.enum(['nuevo','contactado','propuesta','ganado','perdido']).optional(),
  next_action: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
  contact: z.string().trim().max(120).optional(),
});

export async function PATCH(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, 'Lead no válido.');
    const parsed = updateSchema.safeParse(await limitedJson(request));
    if (!parsed.success) throw new ApiError(400, 'Cambio no válido.');
    const { data, error } = await db.from('business_leads').update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user.id).select('*').maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo actualizar el lead.');
    if (!data) throw new ApiError(404, 'Lead no encontrado.');
    await db.from('business_lead_events').insert({
      user_id: user.id, lead_id: id, event_type: parsed.data.status ? 'status_changed' : 'note', detail: parsed.data,
    });
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
