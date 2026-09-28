import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, 'Acción no válida.');
    const { data, error } = await db.from('business_actions').update({
      status: 'rejected', updated_at: new Date().toISOString(),
    }).eq('id', id).eq('user_id', user.id).eq('status', 'pending_approval').select('*').maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo rechazar la acción.');
    if (!data) throw new ApiError(409, 'La acción ya no está pendiente.');
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
