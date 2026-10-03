import {requireOrganization} from '@/lib/server/organization-access';
import {ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
import {z} from 'zod';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){try{
 const {db,organizationId}=await requireOrganization(request);
 const {data,error}=await db.from('crm_stages').select('id,name,position,outcome').eq('organization_id',organizationId).order('position');
 if(error)throw new ApiError(503,'Pipeline no disponible.');
 return Response.json({items:data},{headers});
}catch(e){return apiFailure(e);}}
export async function PATCH(request:Request){try{
 const {db,organizationId}=await requireOrganization(request,['owner','admin','configurator']);
 const input=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(80)}).strict().safeParse(await limitedJson(request,1000));
 if(!input.success)throw new ApiError(400,'Revisa el nombre de la etapa.');
 const {data,error}=await db.from('crm_stages').update({name:input.data.name}).eq('id',input.data.id).eq('organization_id',organizationId).select('id,name,position,outcome').maybeSingle();
 if(error)throw new ApiError(503,'No se pudo guardar la etapa.');
 if(!data)throw new ApiError(404,'Etapa no disponible.');
 return Response.json({item:data},{headers});
}catch(e){return apiFailure(e);}}
