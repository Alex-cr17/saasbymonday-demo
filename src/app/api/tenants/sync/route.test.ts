import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  requireUserMock,
  withAuthDbMock,
  getActiveTenantIdMock,
  setActiveTenantIdMock,
  clearActiveTenantMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  withAuthDbMock: vi.fn(),
  getActiveTenantIdMock: vi.fn(),
  setActiveTenantIdMock: vi.fn(),
  clearActiveTenantMock: vi.fn(),
}));

vi.mock('@/lib/auth/requireUser', () => ({
  requireUser: requireUserMock,
}));

vi.mock('@/lib/db/withAuthDb', () => ({
  withAuthDb: withAuthDbMock,
}));

vi.mock('@/lib/tenants/activeTenant', () => ({
  getActiveTenantId: getActiveTenantIdMock,
  setActiveTenantId: setActiveTenantIdMock,
  clearActiveTenant: clearActiveTenantMock,
}));

import { POST } from './route';

describe('POST /api/tenants/sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    requireUserMock.mockResolvedValue({ user: null, session: null });

    const response = await POST(
      new Request('http://localhost/api/tenants/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId: 'tenant-a' }),
      })
    );

    expect(response.status).toBe(401);
    expect(withAuthDbMock).not.toHaveBeenCalled();
  });

  it('returns 403 when user tries to sync inaccessible tenant', async () => {
    requireUserMock.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      session: { access_token: 'token-1' },
    });
    getActiveTenantIdMock.mockResolvedValue('tenant-current');
    withAuthDbMock.mockResolvedValue([{ id: 'tenant-a', name: 'A', role: 'owner' }]);

    const response = await POST(
      new Request('http://localhost/api/tenants/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId: 'tenant-b' }),
      })
    );

    expect(response.status).toBe(403);
    expect(setActiveTenantIdMock).not.toHaveBeenCalled();
    expect(clearActiveTenantMock).not.toHaveBeenCalled();
  });

  it('returns 200 and syncs cookie when tenant is accessible', async () => {
    requireUserMock.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      session: { access_token: 'token-1' },
    });
    getActiveTenantIdMock.mockResolvedValue('tenant-current');
    withAuthDbMock.mockResolvedValue([{ id: 'tenant-a', name: 'A', role: 'owner' }]);
    setActiveTenantIdMock.mockResolvedValue(undefined);

    const response = await POST(
      new Request('http://localhost/api/tenants/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId: 'tenant-a' }),
      })
    );

    expect(response.status).toBe(200);
    expect(withAuthDbMock).toHaveBeenCalledWith('token-1', expect.any(Function));
    expect(setActiveTenantIdMock).toHaveBeenCalledWith('tenant-a');
  });
});
