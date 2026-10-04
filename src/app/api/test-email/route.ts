import {z} from 'zod';
import {ApiError,apiFailure,authenticate,limitedJson} from '@/lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){try{
 const {db,user}=await authenticate(request);
 if(!user.email_confirmed_at||!user.email)throw new ApiError(403,'Verifica tu correo antes de realizar la prueba.');
 const {data:action,error}=await db.from('business_actions').select('id,status,payload,approved_at,executed_at').eq('user_id',user.id).contains('payload',{controlled_test:true}).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(error)throw new ApiError(503,'No se pudo consultar la aprobación.');
 let events:unknown[]|null=null;let receipt:unknown=null;
 if(action){const message=await db.from('business_messages').select('external_id,status').eq('user_id',user.id).contains('metadata',{business_action_id:action.id}).order('created_at',{ascending:false}).limit(1).maybeSingle();if(!message.error&&message.data?.external_id)receipt=message.data;const result=await db.from('email_events').select('event_type,external_id,created_at').eq('user_id',user.id).eq('business_action_id',action.id).order('created_at');if(!result.error)events=result.data;}
 return Response.json({recipient:user.email,sender:process.env.KOWI_EMAIL_FROM||null,emailConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.KOWI_EMAIL_FROM),tenantPersistenceConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),action:action||null,events,receipt,scope:'Configuration presence and saved records only. Provider acceptance does not prove delivery.'},{headers});
}catch(e){return apiFailure(e);}}
export async function POST(request:Request){try{
 const {db,user}=await authenticate(request);
 if(!user.email||!user.email_confirmed_at)throw new ApiError(403,'Verifica tu correo antes de realizar la prueba.');
 const parsed=z.object({organization_id:z.string().uuid(),conversation_id:z.string().uuid(),consent:z.literal(true)}).strict().safeParse(await limitedJson(request,1000));
 if(!parsed.success)throw new ApiError(400,'Selecciona una conversación guardada y confirma el propósito de prueba.');
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new ApiError(409,'Configura la persistencia del backend antes de preparar la prueba.');
 if(!process.env.RESEND_API_KEY||!process.env.KOWI_EMAIL_FROM)throw new ApiError(409,'Configura el proveedor y remitente de correo antes de preparar la prueba.');
 const {data,error}=await db.rpc('prepare_controlled_email_test',{p_org:parsed.data.organization_id,p_conversation:parsed.data.conversation_id,p_consent:true});
 if(error)throw new ApiError(error.code==='P0001'?429:409,error.code==='P0001'?'Límite de una prueba cada 24 horas.':'Se requiere Company Owner/Admin y una conversación de IA realmente guardada.');
 return Response.json({action:data},{status:201,headers});
}catch(e){return apiFailure(e);}}
