import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, 'Conversación no válida.');
    const { data: conversation, error: ownerError } = await db.from('conversations').select('id,title')
      .eq('id', id).eq('user_id', user.id).maybeSingle();
    if (ownerError) throw new ApiError(503, 'No se pudo cargar la conversación.');
    if (!conversation) throw new ApiError(404, 'Conversación no encontrada.');
    const { data, error } = await db.from('turns').select('id,sequence,user_message,response,goal,created_at')
      .eq('conversation_id', id).eq('user_id', user.id).order('sequence').limit(100);
    if (error) throw new ApiError(503, 'No se pudo cargar el historial.');
    return Response.json({ conversation, turns: data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, 'Conversación no válida.');
    const { data, error } = await db.from('conversations').delete().eq('id', id).eq('user_id', user.id).select('id');
    if (error) throw new ApiError(503, 'No se pudo eliminar la conversación.');
    if (!data?.length) throw new ApiError(404, 'Conversación no encontrada.');
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
