import { createHmac, timingSafeEqual } from 'node:crypto';
import { parseMetaMessages, sendMetaText } from '@/lib/whatsapp/meta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = process.env.META_WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const secret = process.env.META_APP_SECRET;
  const signature = request.headers.get('x-hub-signature-256');
  if (!secret || !signature?.startsWith('sha256=')) return new Response('Unauthorized', { status: 401 });
  const raw = await request.text();
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const provided = signature.slice(7);
  if (!/^[a-f0-9]{64}$/i.test(provided) || !timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'))) {
    return new Response('Unauthorized', { status: 401 });
  }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return new Response('Invalid JSON', { status: 400 }); }
  const messages = parseMetaMessages(payload);
  // Safe pilot: acknowledge valid events without processing until durable deduplication,
  // tenant mapping and CRM persistence are configured.
  if (messages.length) console.info('WhatsApp pilot event received', { count: messages.length });
  return Response.json({ received: true });
}

// Keep outbound transport available for the later authenticated worker; never send
// from this webhook before idempotency and business identity have been established.
void sendMetaText;
