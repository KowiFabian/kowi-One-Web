import {z} from 'zod';
import {requireOrganization} from '@/lib/server/organization-access';
import {ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const market=z.enum(['national','europe','asia','africa','north_america','south_america','indonesia','oceania']);
const proposal=z.object({operation:z.literal('propose'),request_id:z.string().uuid(),agent_id:z.string().uuid(),kind:z.enum(['operations','commercial','foundation']),objective:z.string().trim().min(5).max(1000),markets:z.array(market).max(8),timezone:z.string().min(1).max(100)}).strict();
const decision=z.object({operation:z.enum(['approve','reject','execute']),order_id:z.string().uuid()}).strict();
const consent=z.object({operation:z.literal('group_consent'),group_id:z.string().uuid(),join:z.boolean()}).strict();
export async function GET(request:Request){try{
 const {db,organizationId,role,user}=await requireOrganization(request);
 const names=['director_orders','director_events','director_daily_reports','foundation_groups','foundation_group_members','director_report_preferences'] as const;
 const results=await Promise.all(names.map(name=>db.from(name).select('*').eq('organization_id',organizationId).order(name==='director_events'?'recorded_at':name==='director_daily_reports'?'report_date':name==='foundation_group_members'?'consented_at':'created_at',{ascending:false}).limit(100)));
 if(results.some(r=>r.error))throw new ApiError(503,'Dirección no disponible.');
 return Response.json({orders:results[0].data,events:results[1].data,reports:results[2].data,groups:results[3].data,memberships:results[4].data,schedule:results[5].data?.[0]||null,role,verified:Boolean(user.email_confirmed_at)},{headers});
}catch(e){return apiFailure(e);}}
export async function POST(request:Request){try{
 const {db,organizationId,role,user}=await requireOrganization(request);
 if(!user.email_confirmed_at)throw new ApiError(403,'Verifica tu correo para continuar.');
 const parsed=z.union([proposal,decision,consent]).safeParse(await limitedJson(request,6000));
 if(!parsed.success)throw new ApiError(400,'Revisa la orden y sus campos.');
 const input=parsed.data;
 if(input.operation!=='group_consent'&&role!=='owner')throw new ApiError(403,'Esta decisión requiere al propietario de la empresa.');
 let result;
 if(input.operation==='propose')result=await db.rpc('propose_director_order',{p_org:organizationId,p_agent:input.agent_id,p_request:input.request_id,p_kind:input.kind,p_objective:input.objective,p_markets:input.markets,p_timezone:input.timezone});
 else if(input.operation==='group_consent')result=await db.rpc('foundation_group_consent',{p_org:organizationId,p_group:input.group_id,p_join:input.join});
 else if(input.operation==='execute')result=await db.rpc('execute_director_order',{p_org:organizationId,p_order:input.order_id});
 else result=await db.rpc('decide_director_order',{p_org:organizationId,p_order:input.order_id,p_decision:input.operation});
 if(result.error)throw new ApiError(result.error.code==='54000'?429:409,'No se pudo completar: revisa propietario verificado, agente activo validado, autorización vigente y límites.');
 return Response.json({result:result.data},{headers});
}catch(e){return apiFailure(e);}}
