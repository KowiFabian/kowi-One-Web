import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let cached:{at:number;valid:boolean}|null=null;
let checking:Promise<boolean>|null=null;
async function verifyBackend(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return false;
 if(cached&&Date.now()-cached.at<30000)return cached.valid;
 if(checking)return checking;
 checking=(async()=>{let valid=false;try{
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.rpc('verify_tenant_backend_runtime').abortSignal(AbortSignal.timeout(5000));
  valid=!error&&data===true;
 }catch{valid=false;}cached={at:Date.now(),valid};return valid;})();
 try{return await checking;}finally{checking=null;}
}
export async function GET(){
 const authenticationConfigured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 const tenantPersistenceConfigured=await verifyBackend();
 const aiConfigured=Boolean(process.env.OPENAI_API_KEY);
 const commit=process.env.VERCEL_GIT_COMMIT_SHA;
 return Response.json({
  status:authenticationConfigured&&tenantPersistenceConfigured&&aiConfigured?'CONFIGURED':'PARTIALLY_CONFIGURED',
  authenticationConfigured,tenantPersistenceConfigured,aiConfigured,
  commit:commit&&/^[a-f0-9]{40}$/.test(commit)?commit:null,
  observedAt:new Date().toISOString(),
  scope:'Backend credential checked through a restricted database probe. Authentication and AI flags observe configuration presence; OTP and provider connectivity are not verified.'
 },{headers:{'Cache-Control':'no-store'}});
}
