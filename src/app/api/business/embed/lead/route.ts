import { z } from 'zod';
import { ApiError, apiFailure, limitedJson } from '@/lib/server/auth';
import { requestOrigin, resolveEmbed, serviceDb, spend } from '@/lib/server/business-embed';

export const runtime = 'nodejs';
const schema = z.object({ businessId: z.string().uuid(), name: z.string().trim().min(1).max(100), contact: z.string().trim().min(3).max(120), request: z.string().trim().min(1).max(1000), preferredTime: z.string().trim().max(120).default(''), consent: z.literal(true) }).strict();

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await limitedJson(request, 3000));
    if (!parsed.success) throw new ApiError(400, 'Completa nombre, contacto, solicitud y consentimiento.');
    const db = serviceDb();
    const { embed } = await resolveEmbed(db, parsed.data.businessId, requestOrigin(request));
    await spend(db, embed.id, 'lead_day', 50);
    const { error } = await db.rpc('record_business_embed_lead', { p_business: embed.id, p_name: parsed.data.name, p_contact: parsed.data.contact, p_request: parsed.data.request, p_preferred_time: parsed.data.preferredTime });
    if (error) throw new ApiError(503, 'No se pudo registrar la solicitud.');
    return Response.json({ ok: true, status: 'pending_review', message: 'Solicitud recibida. El negocio deberá confirmar disponibilidad y responderte.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
