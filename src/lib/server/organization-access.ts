import 'server-only';
import {z} from 'zod';
import {authenticate,ApiError} from '@/lib/server/auth';
export async function requireOrganization(request:Request,writeRoles?:readonly string[]){
 const {db,user}=await authenticate(request);
 const parsed=z.string().uuid().safeParse(new URL(request.url).searchParams.get('organization_id'));
 if(!parsed.success)throw new ApiError(400,'Selecciona una empresa.');
 const organizationId=parsed.data;
 const [o,m]=await Promise.all([db.from('organizations').select('id,owner_id,name').eq('id',organizationId).maybeSingle(),db.from('organization_members').select('role').eq('organization_id',organizationId).eq('user_id',user.id).maybeSingle()]);
 if(o.error||m.error)throw new ApiError(503,'No se pudo verificar el acceso.');
 if(!o.data)throw new ApiError(404,'Empresa no disponible.');
 const role=o.data.owner_id===user.id?'owner':m.data?.role;
 if(!role||(writeRoles&&!writeRoles.includes(role)))throw new ApiError(403,'Sin permiso para esta operación.');
 return {db,user,organizationId,role,organization:o.data};
}
