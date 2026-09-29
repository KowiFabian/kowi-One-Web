import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
import { executeBusinessAction } from '@/lib/server/business-execution';
import { serviceDb } from '@/lib/server/business-embed';

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
    if (action.status !== 'pending_approval') throw new ApiError(409, 'La acción ya fue revisada. Prepara una nueva si procede.');
    if (['send_whatsapp','send_email'].includes(action.action_type)) {
      const { data: lead, error: leadError } = await db.from('business_leads').select('id,contact,consent')
        .eq('id', action.lead_id).eq('user_id', user.id).maybeSingle();
      if (leadError || !lead || !lead.consent || lead.contact !== action.payload?.to)
        throw new ApiError(409, 'Revisa contacto, destinatario y consentimiento antes de aprobar.');
    }
    // The service credential is server-only. Never use the owner's JWT to claim delivery.
    const executionDb = serviceDb();
    const { error: approvalError } = await db.rpc('transition_business_action', { p_id: id, p_decision: 'approved' });
    if (approvalError) throw new ApiError(409, 'La acción ya no está pendiente.');
    try {
      const result = await executeBusinessAction(executionDb, action);
      const { data: done, error: doneError } = await executionDb.rpc('complete_business_action', { p_id: id, p_actor: user.id, p_result: 'executed' });
      if (doneError) throw new ApiError(503, 'La ejecución necesita revisión manual.');
      if (action.lead_id) await db.from('business_lead_events').insert({
        user_id: user.id, lead_id: action.lead_id, event_type: 'action',
        detail: { action_id: id, status: 'executed', result },
      });
      return Response.json(done, { headers: { 'Cache-Control': 'no-store' } });
    } catch (executionError) {
      await executionDb.rpc('complete_business_action', { p_id: id, p_actor: user.id, p_result: 'failed' });
      throw executionError;
    }
  } catch (error) { return apiFailure(error); }
}
