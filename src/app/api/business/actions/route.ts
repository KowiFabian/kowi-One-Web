import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';

const actionSchema = z.object({
  lead_id: z.string().uuid().nullable().optional(),
  action_type: z.enum(['send_whatsapp','send_email','create_appointment','update_lead']),
  summary: z.string().trim().min(1).max(500),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const parsed = actionSchema.safeParse(await limitedJson(request));
    if (!parsed.success) throw new ApiError(400, 'Acción no válida.');
    const { data, error } = await db.from('business_actions').insert({
      user_id: user.id,
      lead_id: parsed.data.lead_id ?? null,
      action_type: parsed.data.action_type,
      risk_level: 'high',
      status: 'pending_approval',
      summary: parsed.data.summary,
      payload: parsed.data.payload,
    }).select('*').single();
    if (error || !data) throw new ApiError(503, 'No se pudo preparar la acción.');
    if (parsed.data.lead_id) await db.from('business_lead_events').insert({
      user_id: user.id, lead_id: parsed.data.lead_id, event_type: 'action',
      detail: { action_id: data.id, action_type: data.action_type, status: data.status },
    });
    return Response.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
