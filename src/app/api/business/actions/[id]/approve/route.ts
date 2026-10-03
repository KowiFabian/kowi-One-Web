import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
import { executeBusinessAction, BusinessExecutionUncertainError } from '@/lib/server/business-execution';

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
    const { error: approvalError } = await db.rpc('transition_business_action', { p_id: id, p_decision: 'approved' });
    if (approvalError) throw new ApiError(409, 'La acción ya no está pendiente.');
    try {
      const result = await executeBusinessAction(db, action);
      const { data: done, error: doneError } = await db.rpc('transition_business_action', { p_id: id, p_decision: 'executed' });
      if (doneError) throw new BusinessExecutionUncertainError('La ejecución necesita revisión manual; no repitas la operación.');
      if (action.lead_id) await db.from('business_lead_events').insert({
        user_id: user.id, lead_id: action.lead_id, event_type: 'action',
        detail: { action_id: id, status: 'executed', result },
      });
      return Response.json(done, { headers: { 'Cache-Control': 'no-store' } });
    } catch (executionError) {
      if (!(executionError instanceof BusinessExecutionUncertainError))
        await db.rpc('transition_business_action', { p_id: id, p_decision: 'failed' });
      throw executionError;
    }
  } catch (error) { return apiFailure(error); }
}
