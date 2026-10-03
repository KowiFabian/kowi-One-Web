import {requirePlatformRole} from '@/lib/server/platform-authority';
import {ApiError,apiFailure} from '@/lib/server/auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db}=await requirePlatformRole(request,['platform_owner','kowi_admin']);
 const {data,error}=await db.rpc('platform_control_snapshot');
 if(error||!data)throw new ApiError(503,'No se pudo obtener la vista global auditada.');
 return Response.json({observed:data,interpretation:'Recuento de registros; no acredita actividad ni disponibilidad de agentes.',recommendation:'Revisar la configuración y la evidencia antes de activar agentes.'},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
