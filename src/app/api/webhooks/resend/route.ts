import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Configure this endpoint in Resend only after setting RESEND_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !apiKey || !url || !serviceKey) return new Response(null, { status: 503 });
  if (Number(request.headers.get('content-length')) > 64000) return new Response(null, { status: 413 });
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signature = request.headers.get('svix-signature');
  if (!id || !timestamp || !signature) return new Response(null, { status: 401 });
  let event: ReturnType<Resend['webhooks']['verify']>;
  try {
    const payload = await request.text();
    if (payload.length > 64000) return new Response(null, { status: 413 });
    event = new Resend(apiKey).webhooks.verify({ payload, headers: { id, timestamp, signature }, webhookSecret: secret });
  } catch { return new Response(null, { status: 401 }); }

  const eventTypes: Record<string, string> = {
    'email.delivered': 'delivered', 'email.bounced': 'bounced',
    'email.complained': 'complained', 'email.suppressed': 'suppressed',
  };
  const eventType = eventTypes[event.type ?? ''];
  const emailId = event.data && 'email_id' in event.data ? event.data.email_id : undefined;
  if (!eventType || !emailId) return Response.json({ received: true });
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: existing, error: findError } = await db.from('email_events')
    .select('user_id,business_action_id,recipient').eq('external_id', emailId)
    .eq('event_type', 'accepted').limit(1).maybeSingle();
  if (findError) return new Response(null, { status: 503 });
  if (!existing) return Response.json({ received: true });
  const { error } = await db.from('email_events').upsert({
    user_id: existing.user_id, business_action_id: existing.business_action_id,
    external_id: emailId, recipient: existing.recipient, event_type: eventType,
    event_id: id,
  }, { onConflict: 'external_id,event_type,event_id', ignoreDuplicates: true });
  if (error) return new Response(null, { status: 503 });
  return Response.json({ received: true });
}
