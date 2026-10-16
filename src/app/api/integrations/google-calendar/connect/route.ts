import { z } from 'zod';
import { authenticate, ApiError, apiFailure } from '@/lib/server/auth';
import { createGoogleOAuthState, googleAuthorizationUrl } from '@/lib/server/google-calendar-oauth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const organizationId = z.string().uuid().safeParse(new URL(request.url).searchParams.get('organization_id'));
    if (!organizationId.success) throw new ApiError(400, 'Selecciona una empresa válida.');
    const { db, user } = await authenticate(request);
    const [{ data: member, error: memberError }, { data: organization, error: orgError }] = await Promise.all([
      db.from('organization_members').select('role').eq('organization_id', organizationId.data).eq('user_id', user.id).maybeSingle(),
      db.from('organizations').select('owner_id').eq('id', organizationId.data).maybeSingle(),
    ]);
    if (memberError || orgError) throw new ApiError(503, 'No se pudo verificar el acceso a la empresa.');
    const role = organization?.owner_id === user.id ? 'owner' : member?.role;
    if (!['owner', 'admin'].includes(String(role || ''))) throw new ApiError(403, 'Solo un propietario o administrador puede conectar Google Calendar.');
    const state = createGoogleOAuthState(user.id, organizationId.data);
    return Response.json({ authorization_url: googleAuthorizationUrl(state) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiFailure(error); }
}
