import {requireOrganization} from '@/lib/server/organization-access';
import {ApiError,apiFailure} from '@/lib/server/auth';
import {agentWorkspaceState} from '@/lib/business-workspace';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db,organizationId,organization,role,user}=await requireOrganization(request);
 const tables=['contacts','leads','opportunities','tasks','appointments','conversations'] as const;
 const now=new Date();
 const [counts,agents,tasks,appointments]=await Promise.all([
 Promise.all(tables.map(table=>db.from(table).select('id',{head:true,count:'exact'}).eq('organization_id',organizationId))),
 db.from('agent_installations').select('id,name,status,config,last_verified_at').eq('organization_id',organizationId).order('created_at').limit(100),
 db.from('tasks').select('id,title,due_at,status').eq('organization_id',organizationId).eq('status','open').order('due_at',{ascending:true,nullsFirst:false}).limit(5),
 db.from('appointments').select('id,title,starts_at,ends_at,status').eq('organization_id',organizationId).neq('status','cancelled').gte('starts_at',now.toISOString()).order('starts_at').limit(5)
 ]);
 if(counts.some(c=>c.error||c.count===null)||agents.error||tasks.error||appointments.error)throw new ApiError(503,'No se pudo consultar el negocio. Actualiza para reintentar; no se muestran cifras estimadas.');
 const summary=Object.fromEntries(tables.map((table,i)=>[table,counts[i].count]));
 const agentStates=(agents.data||[]).map(agent=>({id:agent.id,name:agent.name,status:agent.status,...agentWorkspaceState(agent,now)}));
 return Response.json({organization:{id:organization.id,name:organization.name},role,verifiedAccount:Boolean(user.email_confirmed_at),counts:summary,agents:agentStates,tasks:tasks.data,appointments:appointments.data,observedAt:now.toISOString()},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
