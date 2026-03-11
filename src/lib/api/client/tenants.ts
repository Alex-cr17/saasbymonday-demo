export async function fetchTenants() {
  const res = await fetch('/api/tenants', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_TENANTS');
  }

  const json = await res.json();
  return json.data ?? [];
}

export async function switchTenant(tenantId: string) {
  const res = await fetch('/api/tenants/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  });

  if (!res.ok) {
    throw new Error('FAILED_TO_SWITCH_TENANT');
  }

  return true;
}

export async function syncTenantCookie(tenantId: string) {
  const res = await fetch('/api/tenants/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId }),
  });

  if (!res.ok) {
    return false;
  }

  return true;
}