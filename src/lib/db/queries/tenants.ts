import { tenants } from '@/lib/db/schema/tenants';
import { tenantUsers } from '@/lib/db/schema/tenantUsers';
import { and, eq } from 'drizzle-orm';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';

export function getTenants(
  db: NodePgDatabase<Record<string, unknown>>,
  userId: string
) {
  return db
    .select({
      id: tenants.id,
      name: tenants.name,
      role: tenantUsers.role,
    })
    .from(tenants)
    .innerJoin(
      tenantUsers,
      and(eq(tenantUsers.tenantId, tenants.id), eq(tenantUsers.userId, userId))
    );
}

export function getTenantById(db: NodePgDatabase<Record<string, unknown>>, id: string) {
  return db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1);
}

export async function hasTenantAccess(
  db: NodePgDatabase<Record<string, unknown>>,
  userId: string,
  tenantId: string,
) {
  const membership = await db
    .select({ tenantId: tenantUsers.tenantId })
    .from(tenantUsers)
    .where(
      and(
        eq(tenantUsers.userId, userId),
        eq(tenantUsers.tenantId, tenantId),
      ),
    )
    .limit(1);

  return membership.length > 0;
}