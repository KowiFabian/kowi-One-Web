import 'server-only';
import {authenticate,ApiError} from '@/lib/server/auth';
export type PlatformRole='platform_owner'|'kowi_admin'|'configurator'|'operator'|'viewer';
export async function requirePlatformRole(request:Request,allowed:readonly PlatformRole[]){
 const context=await authenticate(request);
 const {data,error}=await context.db.rpc('current_platform_role');
 if(error||typeof data!=='string'||!allowed.includes(data as PlatformRole))throw new ApiError(403,'Se requiere autoridad de plataforma.');
 return {...context,platformRole:data as PlatformRole};
}
