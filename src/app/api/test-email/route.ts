import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';
import { recordEmailAccepted, sendEmail, testEmailTemplate } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const testRecipient = 'faviangaray@gmail.com';
const noStore = { 'Cache-Control': 'no-store' };

// TEMPORARY: remove this diagnostic route after confirming delivery in Resend.
// GET is read-only so opening a link or a crawler cannot trigger email.
export function GET() {
  return Response.json({ ok: false, next: 'Inicia sesión con tu correo personal y usa el botón en /test-email para enviar una prueba.' }, { headers: noStore });
}

export async function POST(request: Request) {
  try {
    const { user } = await authenticate(request);
    if (user.email?.toLowerCase() !== testRecipient || !user.email_confirmed_at) {
      throw new ApiError(403, 'Esta prueba está reservada a la cuenta personal confirmada de Fabián.');
    }
    const result = await sendEmail({
      to: testRecipient, ...testEmailTemplate(),
      idempotencyKey: `kowi-test-email/${user.id}/${new Date().toISOString().slice(0,10)}`,
    });
    const eventLogged = await recordEmailAccepted({ userId: user.id, externalId: result.id, recipient: testRecipient });
    return Response.json({ ok: true, id: result.id, status: result.status, event_logged: eventLogged }, { headers: noStore });
  } catch (error) { return apiFailure(error); }
}
