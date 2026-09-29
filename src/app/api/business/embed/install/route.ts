import { z } from 'zod';
import { ApiError, apiFailure, authenticate, limitedJson } from '@/lib/server/auth';
import { businessConfigSchema } from '@/lib/business-schema';

export const dynamic = 'force-dynamic';
const installSchema = z.object({
  enabled: z.boolean(),
  allowedOrigins: z.array(z.string().max(200)).min(1).max(5),
}).strict();

function validateOrigins(values: string[]) {
  const origins = values.map(value => {
    let url: URL;
    try { url = new URL(value); } catch { throw new ApiError(400, 'Escribe un origen válido, por ejemplo https://miempresa.com.'); }
    if (url.origin !== value || (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost' && url.protocol === 'http:'))) {
      throw new ApiError(400, 'Cada dominio debe ser un origen HTTPS sin rutas ni barra final.');
    }
    return url.origin;
  });
  if (new Set(origins).size !== origins.length) throw new ApiError(400, 'Hay dominios repetidos.');
  return origins;
}

export async function GET(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { data, error } = await db.from('business_embeds').select('id,enabled,allowed_origins').eq('user_id', user.id).maybeSingle();
    if (error) throw new ApiError(503, 'La instalación todavía no está disponible.');
    return Response.json({ businessId: data?.id ?? null, enabled: data?.enabled ?? false, allowedOrigins: data?.allowed_origins ?? [], available: process.env.KOWI_BUSINESS_PUBLIC_ENABLED === 'true' && Boolean(process.env.OPENAI_API_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}

export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const parsed = installSchema.safeParse(await limitedJson(request, 2000));
    if (!parsed.success) throw new ApiError(400, 'Revisa los dominios y el estado de activación.');
    const origins = validateOrigins(parsed.data.allowedOrigins);
    if (parsed.data.enabled) {
      if (process.env.KOWI_BUSINESS_PUBLIC_ENABLED !== 'true') throw new ApiError(503, 'El piloto público necesita activación por Kowi antes de recibir clientes.');
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.OPENAI_API_KEY) throw new ApiError(503, 'El canal público todavía no está configurado por Kowi.');
      const { data: profile, error: profileError } = await db.from('business_profiles').select('config').eq('user_id', user.id).maybeSingle();
      if (profileError || !businessConfigSchema.safeParse(profile?.config).success) throw new ApiError(409, 'Guarda primero una ficha válida de tu negocio.');
    }
    const { data: existing, error: lookupError } = await db.from('business_embeds').select('id').eq('user_id', user.id).maybeSingle();
    if (lookupError) throw new ApiError(503, 'No se pudo cargar la instalación.');
    if (!existing) {
      const { error } = await db.from('business_embeds').insert({ user_id: user.id, allowed_origins: origins, enabled: false });
      if (error && error.code !== '23505') throw new ApiError(503, 'No se pudo crear la instalación.');
    }
    const { data, error } = await db.from('business_embeds').update({ allowed_origins: origins, enabled: parsed.data.enabled, updated_at: new Date().toISOString() }).eq('user_id', user.id).select('id,enabled,allowed_origins').single();
    if (error) throw new ApiError(503, 'No se pudo guardar la instalación.');
    return Response.json({ businessId: data.id, enabled: data.enabled, allowedOrigins: data.allowed_origins, available: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
