import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';
import { projectFields } from '@/lib/projects-schema';

export const dynamic = 'force-dynamic';

const changes = projectFields.extend({ status: z.enum(['borrador', 'en_marcha', 'completado']) }).strict();
const idSchema = z.string().uuid();
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const parsedId = idSchema.safeParse((await context.params).id);
    const parsed = changes.safeParse(await limitedJson(request, 35000));
    if (!parsedId.success || !parsed.success) throw new ApiError(400, 'Revisa los datos del proyecto.');
    const { data, error } = await db.from('projects').update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', parsedId.data).eq('user_id', user.id)
      .select('id,idea,objective,phases,tasks,next_action,status,details,created_at').maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo actualizar el proyecto.');
    if (!data) throw new ApiError(404, 'Proyecto no encontrado.');
    await db.from('agent_ledger').insert({ user_id: user.id, actor_id: user.id, agent: 'projects',
      action: 'update_project', permission: 'owner_write', result: 'completed', evidence: { project_id: data.id } });
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const parsedId = idSchema.safeParse((await context.params).id);
    if (!parsedId.success) throw new ApiError(400, 'Proyecto no válido.');
    const { data, error } = await db.from('projects').delete().eq('id', parsedId.data).eq('user_id', user.id).select('id').maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo eliminar el proyecto.');
    if (!data) throw new ApiError(404, 'Proyecto no encontrado.');
    await db.from('agent_ledger').insert({ user_id: user.id, actor_id: user.id, agent: 'projects',
      action: 'delete_project', permission: 'owner_write', result: 'completed', evidence: { project_id: data.id } });
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
