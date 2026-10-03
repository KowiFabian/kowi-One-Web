import {z} from 'zod';
import {requireOrganization} from '@/lib/server/organization-access';
import {serviceDb} from '@/lib/server/business-embed';
import {ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
export const dynamic='force-dynamic';
const inputSchema=z.object({conversationId:z.string().uuid(),requestId:z.string().uuid(),name:z.string().trim().min(1).max(160),email:z.string().email().max(254).or(z.literal('')).default(''),phone:z.string().trim().max(40).default(''),consent:z.boolean(),title:z.string().trim().min(1).max(160)}).strict();
export async function POST(request:Request){try{
 const {user,organizationId}=await requireOrganization(request,['owner','admin','configurator','operator']);
 const input=inputSchema.safeParse(await limitedJson(request,3000));
 if(!input.success)throw new ApiError(400,'Revisa los datos del contacto y la oportunidad.');
 const data=input.data;
 const {data:result,error}=await serviceDb().rpc('capture_organization_conversation',{p_org:organizationId,p_actor:user.id,p_conversation:data.conversationId,p_request:data.requestId,p_name:data.name,p_email:data.email,p_phone:data.phone,p_consent:data.consent,p_title:data.title});
 if(error)throw new ApiError(error.code==='40001'||error.code==='23505'?409:503,'No se pudo registrar la oportunidad. Revisa conversación e historial antes de repetir.');
 return Response.json(result,{status:201,headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
