import { businessConfigSchema } from '@/lib/business-schema';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db.from('business_profiles').select('config,updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo cargar el negocio.');
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}

export async function PUT(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const parsed = businessConfigSchema.safeParse(await limitedJson(request, 30000));
    if (!parsed.success) throw new ApiError(400, 'Revisa los datos del negocio y sus límites de longitud.');
    const { data, error } = await db.from('business_profiles').upsert({ user_id: user.id, config: parsed.data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select('config,updated_at').single();
    if (error) throw new ApiError(503, 'No se pudo guardar el negocio.');
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
