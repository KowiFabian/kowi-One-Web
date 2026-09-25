import 'server-only';
import { createClient } from '@supabase/supabase-js';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function authenticate(request: Request) {
  const bearer = request.headers.get('authorization');
  if (!bearer?.startsWith('Bearer ') || bearer.length > 8192) {
    throw new ApiError(401, 'Inicia sesión para continuar.');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ApiError(503, 'El servicio todavía no está configurado.');
  const db = createClient(url, key, {
    global: { headers: { Authorization: bearer } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await db.auth.getUser(bearer.slice(7));
  if (error || !data.user) throw new ApiError(401, 'La sesión ha caducado. Vuelve a entrar.');
  return { db, user: data.user };
}
export function apiFailure(error: unknown) {
  return Response.json(
    { error: error instanceof ApiError ? error.message : 'No se pudo completar la operación. Inténtalo de nuevo.' },
    { status: error instanceof ApiError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
export async function limitedJson(request: Request, maxBytes = 12000): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new ApiError(415, 'Envía el mensaje en formato JSON.');
  }
  if (Number(request.headers.get('content-length')) > maxBytes) throw new ApiError(413, 'Mensaje demasiado grande.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Falta el mensaje.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, 'Mensaje demasiado grande.'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'El mensaje no es válido.');
  } finally { reader.releaseLock(); }
}
