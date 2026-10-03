export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 const authenticationConfigured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 const tenantPersistenceConfigured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);
 const aiConfigured=Boolean(process.env.OPENAI_API_KEY);
 const commit=process.env.VERCEL_GIT_COMMIT_SHA;
 return Response.json({
  status:authenticationConfigured&&tenantPersistenceConfigured&&aiConfigured?'CONFIGURED':'PARTIALLY_CONFIGURED',
  authenticationConfigured,tenantPersistenceConfigured,aiConfigured,
  commit:commit&&/^[a-f0-9]{40}$/.test(commit)?commit:null,
  observedAt:new Date().toISOString(),
  scope:'Configuration presence only. OTP delivery, credential validity and provider connectivity are not verified.'
 },{headers:{'Cache-Control':'no-store'}});
}
