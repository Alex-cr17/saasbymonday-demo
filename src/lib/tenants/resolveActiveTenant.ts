import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getTenants } from '@/lib/db/queries/tenants';
import { getActiveTenantId } from './activeTenant';

/**
 * Resolves a valid active tenant for the current user (read-only).
 *
 * Cookie is treated as a hint, not a source of truth.
 * Does NOT modify cookies - safe to call from Server Components.
 * Cookie sync happens via API on client mount.
 */
export async function resolveActiveTenantId(
  db: NodePgDatabase<Record<string, unknown>>,
  userId: string
): Promise<string | null> {
  const cookieTenantId = await getActiveTenantId();
  const tenants = await getTenants(db, userId);

  if (tenants.length === 0) {
    return null;
  }

  if (cookieTenantId && tenants.some(t => t.id === cookieTenantId)) {
    return cookieTenantId;
  }

  const ownerTenant = tenants.find(t => t.role === 'owner');
  return ownerTenant?.id ?? tenants[0].id;
}