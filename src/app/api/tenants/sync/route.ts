import { ok, fail } from '@/lib/api/responses';
import { requireUser } from '@/lib/auth/requireUser';
import { setActiveTenantId, getActiveTenantId, clearActiveTenant } from '@/lib/tenants/activeTenant';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { getTenants } from '@/lib/db/queries/tenants';
import { z } from 'zod';

const syncTenantSchema = z.object({
  tenantId: z.string().min(1),
});

export async function POST(req: Request) {
  const { user, session } = await requireUser();

  if (!user || !session) {
    return fail('UNAUTHENTICATED', 'You must be signed in.', 401, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  let input: z.infer<typeof syncTenantSchema>;
  try {
    const json = await req.json();
    const parsed = syncTenantSchema.safeParse(json);
    if (!parsed.success) {
      return fail('BAD_REQUEST', 'Invalid request body.', 400, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    input = parsed.data;
  } catch {
    return fail('BAD_REQUEST', 'Invalid JSON body.', 400, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const currentCookie = await getActiveTenantId();
    
    if (currentCookie === input.tenantId) {
      return ok(
        { tenantId: input.tenantId, synced: false },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const tenants = await withAuthDb(session.access_token, (db) =>
      getTenants(db, user.id)
    );

    if (tenants.length === 0) {
      await clearActiveTenant();
      return ok(
        { tenantId: null, synced: true },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const hasAccess = tenants.some(t => t.id === input.tenantId);
    if (!hasAccess) {
      return fail('FORBIDDEN', 'You do not have access to this tenant.', 403, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    await setActiveTenantId(input.tenantId);

    return ok(
      { tenantId: input.tenantId, synced: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('[POST /api/tenants/sync]', e);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to sync tenant.', 500, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
