import { browserSupabase } from './supabase-browser';

async function authenticatedFetch(path:string, init:RequestInit = {}) {
  const client = browserSupabase();
  const session = client ? (await client.auth.getSession()).data.session : null;
  if (!session) throw new Error('Inicia sesión para continuar.');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  if (!headers.has('Content-Type') && typeof init.body === 'string') headers.set('Content-Type','application/json');
  const response = await fetch(path, {
    ...init, cache: 'no-store', signal: init.signal ?? AbortSignal.timeout(55000), headers,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'No se pudo completar la operación.');
  }
  return response;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authenticatedFetch(path, init);
  return response.status === 204 ? undefined as T : response.json();
}

export async function apiBlob(path:string, init:RequestInit = {}):Promise<Blob> {
  const response = await authenticatedFetch(path, init);
  return response.blob();
}
