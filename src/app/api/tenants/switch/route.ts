import { ok, fail } from '@/lib/api/responses';
import { requireUser } from '@/lib/auth/requireUser';
import { setActiveTenantId } from '@/lib/tenants/activeTenant';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { tenantUsers } from '@/lib/db/schema/tenantUsers';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const switchTenantSchema = z.object({
  tenantId: z.string().min(1),
});

export async function POST(req: Request) {
  const { user, session } = await requireUser();

  if (!user || !session) {
    return fail('UNAUTHENTICATED', 'You must be signed in.', 401, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  let input: z.infer<typeof switchTenantSchema>;
  try {
    const json = await req.json();
    const parsed = switchTenantSchema.safeParse(json);
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
    const isMember = await withAuthDb(session.access_token, async (db) => {
      const membership = await db
        .select({ tenantId: tenantUsers.tenantId })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.userId, user.id),
            eq(tenantUsers.tenantId, input.tenantId)
          )
        )
        .limit(1);

      return membership.length > 0;
    });

    // Security: do not reveal whether tenant exists; treat as forbidden.
    if (!isMember) {
      return fail('FORBIDDEN', 'You do not have access to this tenant.', 403, {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    await setActiveTenantId(input.tenantId);

    return ok(
      { tenantId: input.tenantId },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('[POST /api/tenants/switch]', e);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to switch tenant.', 500, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}