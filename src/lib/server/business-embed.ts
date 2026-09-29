import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ApiError } from '@/lib/server/auth';
import { businessConfigSchema } from '@/lib/business-schema';

export function serviceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ApiError(503, 'El canal web todavía no está configurado.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function resolveEmbed(db: ReturnType<typeof serviceDb>, id: string, origin: string) {
  if (process.env.KOWI_BUSINESS_PUBLIC_ENABLED !== 'true') throw new ApiError(503, 'El canal web está pendiente de activación.');
  const { data: embed, error } = await db.from('business_embeds').select('id,user_id,enabled,allowed_origins').eq('id', id).maybeSingle();
  if (error || !embed?.enabled) throw new ApiError(404, 'Este agente no está activo.');
  if (!embed.allowed_origins.includes(origin)) throw new ApiError(403, 'Este dominio no está autorizado.');
  const { data: profile, error: profileError } = await db.from('business_profiles').select('config').eq('user_id', embed.user_id).maybeSingle();
  const config = businessConfigSchema.safeParse(profile?.config);
  if (profileError || !config.success) throw new ApiError(503, 'La ficha del negocio no está disponible.');
  return { embed, config: config.data };
}

export function requestOrigin(request: Request) {
  const claimed = request.headers.get('x-kowi-site-origin') ?? '';
  let url: URL;
  try { url = new URL(claimed); } catch { throw new ApiError(403, 'No se identificó el dominio de instalación.'); }
  if (url.origin !== claimed || url.protocol !== 'https:') throw new ApiError(403, 'Dominio no autorizado.');
  const browserOrigin = request.headers.get('origin');
  if (browserOrigin && browserOrigin !== new URL(request.url).origin) throw new ApiError(403, 'Origen no autorizado.');
  return claimed;
}

export async function spend(db: ReturnType<typeof serviceDb>, businessId: string, kind: 'chat_minute'|'chat_day'|'lead_day', limit: number) {
  const { data, error } = await db.rpc('consume_business_embed_quota', { p_business: businessId, p_kind: kind, p_limit: limit });
  if (error) throw new ApiError(503, 'No se pudo comprobar el límite de uso.');
  if (data !== true) throw new ApiError(429, 'Límite de consultas alcanzado. Contacta directamente con el negocio.');
}

export async function spendGlobal(db: ReturnType<typeof serviceDb>, kind: 'chat_minute'|'chat_day', limit: number) {
  const { data, error } = await db.rpc('consume_business_embed_global_quota', { p_kind: kind, p_limit: limit });
  if (error) throw new ApiError(503, 'No se pudo comprobar el límite global.');
  if (data !== true) throw new ApiError(429, 'El servicio está ocupado. Inténtalo más tarde.');
}
