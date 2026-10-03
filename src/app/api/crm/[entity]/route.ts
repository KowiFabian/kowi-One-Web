import {authenticate,ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
import {crmEntity,crmSchemas,crmWriteRoles} from '@/lib/crm-schema';
import {z} from 'zod';
export const dynamic='force-dynamic';
async function context(request:Request,entity:string,write=false){
 const parsed=crmEntity.safeParse(entity),org=z.string().uuid().safeParse(new URL(request.url).searchParams.get('organization_id'));
 if(!parsed.success||!org.success)throw new ApiError(400,'Selecciona una empresa y un recurso válidos.');
 const {db,user}=await authenticate(request);
 const [m,o]=await Promise.all([db.from('organization_members').select('role').eq('organization_id',org.data).eq('user_id',user.id).maybeSingle(),db.from('organizations').select('owner_id').eq('id',org.data).maybeSingle()]);
 if(m.error||o.error)throw new ApiError(503,'No se pudo verificar el acceso.');
 const role=o.data?.owner_id===user.id?'owner':m.data?.role;
 if(!role||(write&&!crmWriteRoles.includes(role)))throw new ApiError(403,'Sin permiso para esta operación.');
 return {db,org:org.data,entity:parsed.data,role};
}
type Context={params:Promise<{entity:string}>};
export async function GET(request:Request,{params}:Context){try{
 const c=await context(request,(await params).entity);
 const {data,error}=await c.db.from(c.entity).select('*').eq('organization_id',c.org).order('created_at',{ascending:false}).limit(200);
 if(error)throw new ApiError(503,'CRM no disponible.');
 return Response.json({items:data,role:c.role},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
export async function POST(request:Request,{params}:Context){try{
 const c=await context(request,(await params).entity,true);
 const parsed=crmSchemas[c.entity].safeParse(await limitedJson(request,6000));
 if(!parsed.success)throw new ApiError(400,'Revisa los campos del formulario.');
 const {data,error}=await c.db.from(c.entity).insert({...parsed.data,organization_id:c.org}).select().single();
 if(error)throw new ApiError(['23503','23514'].includes(error.code)?400:503,error.code==='23503'?'La relación no pertenece a esta empresa.':'No se pudo guardar.');
 return Response.json({item:data},{status:201,headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
export async function PATCH(request:Request,{params}:Context){try{
 const c=await context(request,(await params).entity,true);
 const input=z.object({id:z.string().uuid(),changes:crmSchemas[c.entity].partial()}).strict().safeParse(await limitedJson(request,6000));
 if(!input.success||!Object.keys(input.data.changes).length)throw new ApiError(400,'Revisa los cambios.');
 const {data,error}=await c.db.from(c.entity).update(input.data.changes).eq('organization_id',c.org).eq('id',input.data.id).select().maybeSingle();
 if(error)throw new ApiError(['23503','23514'].includes(error.code)?400:503,'No se pudo actualizar el registro o su relación.');
 if(!data)throw new ApiError(404,'Registro no disponible.');
 return Response.json({item:data},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
