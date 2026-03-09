import { cookies } from 'next/headers';

const COOKIE_NAME = 'active_tenant_id';

export async function getActiveTenantId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setActiveTenantId(id: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function clearActiveTenant(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}