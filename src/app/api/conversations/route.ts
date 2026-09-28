import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db.from('conversations').select('id,title,created_at,agent')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw new ApiError(503, 'No se pudieron cargar las conversaciones.');
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const parsed = z.object({ agent: z.enum(['general','education','business']).optional() }).strict().safeParse(await limitedJson(request, 1000));
    if (!parsed.success) throw new ApiError(400, 'Agente no válido.');
    const { data, error } = await db.from('conversations').insert({ user_id: user.id, agent: parsed.data.agent ?? 'general' }).select('id,title,created_at,agent').single();
    if (error) throw new ApiError(503, 'No se pudo crear la conversación.');
    return Response.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
