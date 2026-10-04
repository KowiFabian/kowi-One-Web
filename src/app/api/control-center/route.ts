import {authenticate,ApiError,apiFailure} from '@/lib/server/auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 try{
  const {db}=await authenticate(request);
  const {data:organizations,error}=await db.from('organizations').select('id,name,slug').order('name').limit(100);
  if(error)throw new ApiError(503,'No se pudieron cargar las empresas.');
  const id=new URL(request.url).searchParams.get('organization_id');
  const organization=id?organizations?.find(o=>o.id===id):organizations?.[0];
  if(id&&!organization)throw new ApiError(404,'Empresa no disponible.');
  const observations=organization?await Promise.all([
   {table:'organization_members',column:'organization_id',label:'Miembros registrados'},
   {table:'agent_installations',column:'id',label:'Instalaciones registradas'},
   {table:'agent_installations',column:'id',label:'Instalaciones marcadas como prueba',synthetic:true}
  ].map(async source=>{
   let query=db.from(source.table).select(source.column,{head:true,count:'exact'}).eq('organization_id',organization.id);
   if('synthetic' in source&&source.synthetic)query=query.contains('config',{synthetic:true});
   const {count,error}=await query;
   return {label:source.label,status:error||count===null?'UNOBSERVED':'OBSERVED',count:error?null:count};
  })):[];
  return Response.json({organizations,organization:organization??null,observations,observedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return apiFailure(e);}
}
