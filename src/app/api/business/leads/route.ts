import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().max(120).default(''),
  notes: z.string().trim().max(1000).default(''),
  next_action: z.string().trim().max(500).default(''),
  source: z.enum(['manual','web','telefono']).default('manual'),
  consent: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const parsed = leadSchema.safeParse(await limitedJson(request));
    if (!parsed.success) throw new ApiError(400, 'Revisa los datos del lead.');
    const { data, error } = await db.from('business_leads')
      .insert({ user_id: user.id, name: parsed.data.name, contact: parsed.data.contact, notes: parsed.data.notes,
        next_action: parsed.data.next_action, source: parsed.data.source, consent: parsed.data.consent })
      .select('*').single();
    if (error || !data) throw new ApiError(503, 'No se pudo crear el lead.');
    await db.from('business_lead_events').insert({
      user_id: user.id, lead_id: data.id, event_type: 'created', detail: { source: parsed.data.source, consent: parsed.data.consent },
    });
    return Response.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
