import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
import { executeBusinessAction } from '@/lib/server/business-execution';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { db, user } = await authenticate(request);
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) throw new ApiError(400, 'Acción no válida.');
    const { data: action, error } = await db.from('business_actions').select('*')
      .eq('id', id).eq('user_id', user.id).maybeSingle();
    if (error) throw new ApiError(503, 'No se pudo recuperar la acción.');
    if (!action) throw new ApiError(404, 'Acción no encontrada.');
    if (action.status === 'executed') return Response.json(action);
    if (action.status === 'rejected') throw new ApiError(409, 'La acción fue rechazada.');
    await db.from('business_actions').update({
      status: 'approved', approved_at: action.approved_at || new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', id).eq('user_id', user.id);
    try {
      const result = await executeBusinessAction(db, action);
      const { data: done } = await db.from('business_actions').update({
        status: 'executed', executed_at: new Date().toISOString(), error: '', updated_at: new Date().toISOString(),
      }).eq('id', id).eq('user_id', user.id).select('*').single();
      if (action.lead_id) await db.from('business_lead_events').insert({
        user_id: user.id, lead_id: action.lead_id, event_type: 'action',
        detail: { action_id: id, status: 'executed', result },
      });
      return Response.json(done, { headers: { 'Cache-Control': 'no-store' } });
    } catch (executionError) {
      const message = executionError instanceof Error ? executionError.message : 'No se pudo ejecutar.';
      await db.from('business_actions').update({ status: 'approved', error: message, updated_at: new Date().toISOString() })
        .eq('id', id).eq('user_id', user.id);
      throw executionError;
    }
  } catch (error) { return apiFailure(error); }
}
