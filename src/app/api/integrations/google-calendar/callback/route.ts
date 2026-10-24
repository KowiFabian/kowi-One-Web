import { createClient } from '@supabase/supabase-js';
import { verifyGoogleOAuthState, googleCalendarRedirectUri } from '@/lib/server/google-calendar-oauth';

export const dynamic = 'force-dynamic';

function back(request: Request, status: 'connected' | 'error', reason?: string) {
  const url = new URL('/business/app', new URL(request.url).origin);
  url.searchParams.set('calendar', status);
  if (reason) url.searchParams.set('reason', reason);
  return Response.redirect(url, 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('error')) return back(request, 'error', 'google_denied');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return back(request, 'error', 'missing_oauth_response');
  let verified;
  try { verified = verifyGoogleOAuthState(state); } catch { return back(request, 'error', 'oauth_not_configured'); }
  if (!verified) return back(request, 'error', 'invalid_state');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!supabaseUrl || !serviceKey || !clientId || !clientSecret) return back(request, 'error', 'server_not_configured');

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const [{ data: member }, { data: organization }] = await Promise.all([
    db.from('organization_members').select('role').eq('organization_id', verified.organizationId).eq('user_id', verified.userId).maybeSingle(),
    db.from('organizations').select('owner_id').eq('id', verified.organizationId).maybeSingle(),
  ]);
  const role = organization?.owner_id === verified.userId ? 'owner' : member?.role;
  if (!['owner', 'admin'].includes(String(role || ''))) return back(request, 'error', 'access_revoked');

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: googleCalendarRedirectUri(), grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(20000),
  }).catch(() => null);
  if (!tokenResponse?.ok) return back(request, 'error', 'token_exchange_failed');
  const tokens = await tokenResponse.json().catch(() => null);
  if (!tokens?.refresh_token) return back(request, 'error', 'refresh_token_missing');

  // Deliberately fail closed until encrypted per-tenant token storage is deployed.
  // Never place refresh/access tokens in query strings, logs, public env vars, or the browser.
  return back(request, 'error', 'secure_token_store_pending');
}
