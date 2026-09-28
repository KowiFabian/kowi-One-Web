import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db.from('conversations').select('id,title,created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
    if (error) throw new ApiError(503, 'No se pudieron cargar las conversaciones.');
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db.from('conversations').insert({ user_id: user.id }).select('id,title,created_at').single();
    if (error) throw new ApiError(503, 'No se pudo crear la conversación.');
    return Response.json(data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
