import {authenticate,ApiError,apiFailure} from '@/lib/server/auth';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const {db}=await authenticate(request);
 const parsed=z.string().uuid().safeParse(new URL(request.url).searchParams.get('organization_id'));
 if(!parsed.success)throw new ApiError(400,'Selecciona una empresa.');
 const org=parsed.data;
 const {data:organization,error:orgError}=await db.from('organizations').select('id,name').eq('id',org).maybeSingle();
 if(orgError)throw new ApiError(503,'No se pudo comprobar la empresa.');
 if(!organization)throw new ApiError(404,'Empresa no disponible.');
 const [counts,stages]=await Promise.all([
 Promise.all(['contacts','leads','opportunities','tasks'].map(async table=>{
 const {count,error}=await db.from(table).select('id',{head:true,count:'exact'}).eq('organization_id',org);
 if(error||count===null)throw new ApiError(503,'No se pudieron observar los registros.');
 return [table,count] as const;
 })),
 db.from('crm_stages').select('id,name,outcome').eq('organization_id',org).order('position')
 ]);
 if(stages.error||!stages.data)throw new ApiError(503,'No se pudo observar el pipeline.');
 const pipeline=await Promise.all(stages.data.map(async stage=>{
 const {count,error}=await db.from('opportunities').select('id',{head:true,count:'exact'}).eq('organization_id',org).eq('stage_id',stage.id);
 if(error||count===null)throw new ApiError(503,'No se pudo medir el pipeline.');
 return {...stage,count};
 }));
 const observed=Object.fromEntries(counts);
 const interpretation=observed.leads===0?'No hay leads registrados para analizar su evolución.':'Los recuentos describen los registros actuales; no demuestran atribución ni conversión comercial.';
 const recommendations=observed.contacts===0?['Registrar contactos con finalidad y consentimiento adecuados.']:observed.opportunities===0?['Vincular una oportunidad real a un contacto o lead y definir su siguiente tarea.']:['Revisar las oportunidades abiertas y registrar el resultado y la siguiente tarea.'];
 return Response.json({organization,observed:{counts:observed,pipeline,observedAt:new Date().toISOString()},interpretation,recommendations,unobserved:['conversaciones vinculadas','ventas atribuidas','tiempos de respuesta','satisfacción','costes IA','ingresos','margen'],limitations:['Recuentos consultados por separado; no son una instantánea transaccional.','No se calcula conversión a partir de recuentos sin relaciones y resultados suficientes.'],automaticChanges:false},{headers:{'Cache-Control':'no-store'}});
}catch(e){return apiFailure(e);}}
