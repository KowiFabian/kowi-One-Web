import {requirePlatformRole} from '@/lib/server/platform-authority';
import {ApiError,apiFailure} from '@/lib/server/auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db}=await requirePlatformRole(request,['platform_owner','kowi_admin']);
 const {data,error}=await db.rpc('platform_security_report_history');
 if(error||!Array.isArray(data))throw new ApiError(503,'Histórico de seguridad no disponible.');
 return Response.json({items:data},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
