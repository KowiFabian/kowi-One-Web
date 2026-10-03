import {authenticate,ApiError,apiFailure} from '@/lib/server/auth';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db}=await authenticate(request);
 const org=z.string().uuid().safeParse(new URL(request.url).searchParams.get('organization_id'));
 if(!org.success)throw new ApiError(400,'Selecciona una empresa.');
 const {data,error}=await db.from('crm_stages').select('id,name,position,outcome').eq('organization_id',org.data).order('position');
 if(error)throw new ApiError(503,'Pipeline no disponible.');
 return Response.json({items:data},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
