import { browserSupabase } from './supabase-browser';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const client = browserSupabase();
  const session = client ? (await client.auth.getSession()).data.session : null;
  if (!session) throw new Error('Inicia sesión para continuar.');
  const response = await fetch(path, {
    ...init, cache: 'no-store', signal: AbortSignal.timeout(55000),
    headers: { ...init.headers, 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'No se pudo completar la operación.');
  }
  return response.status === 204 ? undefined as T : response.json();
}
