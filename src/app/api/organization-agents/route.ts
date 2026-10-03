import {z} from 'zod';
import {requireOrganization} from '@/lib/server/organization-access';
import {ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
import {businessConfigSchema} from '@/lib/business-schema';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
const writers=['owner','admin','configurator'];
export async function GET(request:Request){try{
 const {db,organizationId,role}=await requireOrganization(request);
 const {data,error}=await db.from('agent_installations').select('id,name,status,config,created_at,updated_at').eq('organization_id',organizationId).order('created_at').limit(100);
 if(error)throw new ApiError(503,'No se pudieron cargar los agentes.');
 return Response.json({items:data,role},{headers});
}catch(e){return apiFailure(e);}}
export async function POST(request:Request){try{
 const {db,organizationId}=await requireOrganization(request,writers);
 const input=z.object({name:z.string().trim().min(2).max(120),config:businessConfigSchema}).strict().safeParse(await limitedJson(request,20000));
 if(!input.success)throw new ApiError(400,'Revisa la configuración del agente.');
 const {count,error:countError}=await db.from('agent_installations').select('id',{head:true,count:'exact'}).eq('organization_id',organizationId);
 if(countError||count===null)throw new ApiError(503,'No se pudo comprobar el registro.');
 if(count>=20)throw new ApiError(429,'Límite de instalaciones alcanzado.');
 const {data,error}=await db.from('agent_installations').insert({organization_id:organizationId,name:input.data.name,config:input.data.config,status:'draft'}).select('id,name,status,config').single();
 if(error)throw new ApiError(503,'No se pudo registrar el agente.');
 return Response.json(data,{status:201,headers});
}catch(e){return apiFailure(e);}}
export async function PATCH(request:Request){try{
 const {db,organizationId}=await requireOrganization(request,writers);
 const input=z.object({id:z.string().uuid(),status:z.enum(['active','paused','revoked','terminated']).optional(),config:businessConfigSchema.optional()}).strict().safeParse(await limitedJson(request,20000));
 if(!input.success||(!input.data.status&&!input.data.config))throw new ApiError(400,'Revisa el cambio solicitado.');
 const {id,...patch}=input.data;
 const {data,error}=await db.from('agent_installations').update(patch).eq('id',id).eq('organization_id',organizationId).select('id,name,status,config').maybeSingle();
 if(error)throw new ApiError(409,'Transición no permitida. Pausa antes de cambiar configuración; un agente revocado no puede reactivarse.');
 if(!data)throw new ApiError(404,'Agente no disponible.');
 return Response.json(data,{headers});
}catch(e){return apiFailure(e);}}
