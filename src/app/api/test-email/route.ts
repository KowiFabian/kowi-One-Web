import { Resend } from 'resend';
import { ApiError, apiFailure, authenticate } from '@/lib/server/auth';

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
    if (!process.env.RESEND_API_KEY) throw new ApiError(503, 'Falta RESEND_API_KEY en Vercel.');
    const from = process.env.KOWI_EMAIL_FROM || 'KOWI <info@kowi.one>';
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from, to: [testRecipient], subject: 'Prueba KOWI + Resend',
      html: '<h2>KOWI + Resend funcionando ✅</h2><p>Este correo fue enviado desde la web de KOWI en Vercel.</p>',
    }, { idempotencyKey: `kowi-test-email/${user.id}/${new Date().toISOString().slice(0,10)}` });
    if (error) throw new ApiError(502, `Resend rechazó la prueba: ${error.message}`);
    return Response.json({ ok: true, id: data?.id }, { headers: noStore });
  } catch (error) { return apiFailure(error); }
}
