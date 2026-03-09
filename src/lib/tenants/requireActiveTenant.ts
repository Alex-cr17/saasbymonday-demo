import { getActiveTenantId } from './activeTenant';

/**
 * UI-level helper.
 *
 * IMPORTANT:
 * - This is NOT a security check
 * - Does NOT validate tenant access
 * - Reads cookie only
 *
 * Use cases:
 * - UI guards
 * - Layouts
 * - Navigation flows
 *
 * NEVER use in API routes or DB access logic.
 */
export async function assertActiveTenantContext(): Promise<string> {
  const tenantId = await getActiveTenantId();

  if (!tenantId) {
    throw new Error('NO_ACTIVE_TENANT');
  }

  return tenantId;
}