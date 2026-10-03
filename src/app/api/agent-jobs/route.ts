import {requireOrganization} from '@/lib/server/organization-access';
import {ApiError,apiFailure} from '@/lib/server/auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db,organizationId}=await requireOrganization(request);
 const {data,error}=await db.from('agent_actions').select('job_id,agent_id,objective,risk_level,status,steps_used,budget,started_at,completed_at,evidence,result').eq('organization_id',organizationId).order('created_at',{ascending:false}).limit(100);
 if(error)throw new ApiError(503,'Trabajos no disponibles.');
 return Response.json({items:data},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
