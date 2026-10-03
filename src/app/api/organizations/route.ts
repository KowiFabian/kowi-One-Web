import {randomUUID} from 'node:crypto';
import {authenticate,ApiError,apiFailure,limitedJson} from '@/lib/server/auth';
import {organizationSchema,organizationSlug} from '@/lib/organization-schema';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){
 try{
  const {db}=await authenticate(request);
  const {data,error}=await db.from('organizations').select('id,name,slug').order('name').limit(100);
  if(error)throw new ApiError(503,'No se pudieron cargar las empresas.');
  return Response.json(data,{headers});
 }catch(e){return apiFailure(e);}
}
export async function POST(request:Request){
 try{
  const {db,user}=await authenticate(request);
  if(!user.email||!user.email_confirmed_at)throw new ApiError(403,'Verifica tu correo antes de crear una empresa.');
  const input=organizationSchema.safeParse(await limitedJson(request,2000));
  if(!input.success)throw new ApiError(400,'El nombre debe tener entre 2 y 120 caracteres válidos.');
  const {count,error}=await db.from('organizations').select('id',{head:true,count:'exact'}).eq('owner_id',user.id);
  if(error||count===null)throw new ApiError(503,'No se pudo comprobar el registro.');
  if(count>=20)throw new ApiError(429,'Has alcanzado el límite de empresas de esta cuenta.');
  for(let i=0;i<3;i++){
   const {data,error}=await db.from('organizations').insert({owner_id:user.id,name:input.data.name,slug:organizationSlug(input.data.name,randomUUID())}).select('id,name,slug').single();
   if(!error)return Response.json(data,{status:201,headers});
   if(error.code!=='23505')break;
  }
  throw new ApiError(503,'No se pudo crear la empresa. Inténtalo de nuevo.');
 }catch(e){return apiFailure(e);}
}
