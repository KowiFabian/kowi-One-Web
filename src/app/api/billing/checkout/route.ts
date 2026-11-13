import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export async function GET(){
 const configured=Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET&&process.env.KOWI_BILLING_ENABLED==='true');
 return NextResponse.json({provider:'stripe',mode:'not_live',checkout_enabled:false,automatic_provisioning_enabled:false,credentials_configured:configured,required_steps:['verify Stripe account and price IDs','implement authenticated tenant orders and terms acceptance','verify signed webhook and persist idempotent events','validate invoice and tax process','pass tenant isolation and agent permission tests']},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(){
 return NextResponse.json({error:'billing_not_ready',message:'La contratación electrónica no está habilitada hasta completar verificaciones de seguridad y facturación.'},{status:503,headers:{'Cache-Control':'no-store'}});
}
