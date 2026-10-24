import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.freebusy',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

const CALLBACK_PATH = '/api/integrations/google-calendar/callback';
const STATE_TTL_SECONDS = 10 * 60;

type OAuthState = { userId: string; organizationId: string; exp: number };

function secret() {
  const value = process.env.GOOGLE_OAUTH_STATE_SECRET;
  if (!value || value.length < 32) throw new Error('GOOGLE_OAUTH_STATE_SECRET no está configurado de forma segura.');
  return value;
}

function b64url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function googleCalendarRedirectUri() {
  const origin = (process.env.KOWI_PUBLIC_URL || 'https://kowi-one-web.vercel.app').replace(/\/$/, '');
  return origin + CALLBACK_PATH;
}

export function createGoogleOAuthState(userId: string, organizationId: string) {
  const payload = b64url(JSON.stringify({ userId, organizationId, exp: Math.floor(Date.now() / 1000) + STATE_TTL_SECONDS }));
  return payload + '.' + sign(payload);
}

export function verifyGoogleOAuthState(state: string): OAuthState | null {
  const [payload, signature, extra] = state.split('.');
  if (!payload || !signature || extra) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as OAuthState;
    if (!parsed.userId || !parsed.organizationId || !Number.isFinite(parsed.exp) || parsed.exp < Date.now() / 1000) return null;
    return parsed;
  } catch { return null; }
}

export function googleAuthorizationUrl(state: string) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_OAUTH_CLIENT_ID no está configurado.');
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', googleCalendarRedirectUri());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('scope', GOOGLE_CALENDAR_SCOPES.join(' '));
  url.searchParams.set('state', state);
  return url.toString();
}
