import { z } from 'zod';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
import { executeBusinessAction, BusinessExecutionUncertainError } from '@/lib/server/business-execution';

import {validControlledEmailTest} from '@/lib/controlled-email-test';
import { createClient } from '@supabase/supabase-js';
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
    if(!user.email_confirmed_at) throw new ApiError(403,'Verifica tu correo antes de aprobar.');
    if(action.action_type==='update_lead'){
      const {data:done,error:localError}=await db.rpc('execute_approved_local_lead_action',{p_id:id});
      if(localError) throw new ApiError(409,'No se pudo verificar o aplicar la actualización del lead.');
      return Response.json(done,{headers:{'Cache-Control':'no-store'}});
    }
    const serverUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serverKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!serverUrl||!serverKey) throw new ApiError(409,'La ejecución externa requiere configuración segura del backend.');
    const executionDb=createClient(serverUrl,serverKey,{auth:{persistSession:false,autoRefreshToken:false}});
    if(action.lead_id){
      const {data:boundLead,error:boundError}=await db.from('business_leads').select('id').eq('id',action.lead_id).eq('user_id',user.id).maybeSingle();
      if(boundError||!boundLead) throw new ApiError(409,'El lead no pertenece a tu cuenta.');
    }
    if (['send_whatsapp','send_email'].includes(action.action_type)) {
      const { data: lead, error: leadError } = await db.from('business_leads').select('id,contact,consent')
        .eq('id', action.lead_id).eq('user_id', user.id).maybeSingle();
      if (leadError || !lead || !lead.consent || lead.contact !== action.payload?.to)
        throw new ApiError(409, 'Revisa contacto, destinatario y consentimiento antes de aprobar.');
    }
    let controlledEmailTestRecipient:string|undefined;
    if(action.payload?.controlled_test===true){
      if(action.action_type!=='send_email'||!user.email||!validControlledEmailTest(action.payload,user.email))throw new ApiError(409,'Destinatario o contenido de prueba no autorizado.');
      const {data:allowed,error:contextError}=await db.rpc('can_execute_controlled_email_test',{p_action:id});
      if(contextError||allowed!==true)throw new ApiError(409,'La propuesta debe haber sido emitida por el servidor para una conversación persistente autorizada.');
      if(!process.env.RESEND_API_KEY||!process.env.KOWI_EMAIL_FROM)throw new ApiError(409,'El proveedor de prueba no está configurado.');
      controlledEmailTestRecipient=user.email;
    }
    const { error: approvalError } = await db.rpc('transition_business_action', { p_id: id, p_decision: 'approved' });
    if (approvalError) throw new ApiError(409, 'La acción ya no está pendiente.');
    try {
      const result = await executeBusinessAction(executionDb, action,{controlledEmailTestRecipient});
      const { data: done, error: doneError } = await executionDb.rpc('transition_business_action', { p_id: id, p_decision: 'executed' });
      if (doneError) throw new BusinessExecutionUncertainError('La ejecución necesita revisión manual; no repitas la operación.');
      if (action.lead_id) await executionDb.from('business_lead_events').insert({
        user_id: user.id, lead_id: action.lead_id, event_type: 'action',
        detail: { action_id: id, status: 'executed', result },
      });
      return Response.json(done, { headers: { 'Cache-Control': 'no-store' } });
    } catch (executionError) {
      if (!(executionError instanceof BusinessExecutionUncertainError))
        await executionDb.rpc('transition_business_action', { p_id: id, p_decision: 'failed' });
      throw executionError;
    }
  } catch (error) { return apiFailure(error); }
}
