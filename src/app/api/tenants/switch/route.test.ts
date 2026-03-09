import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireUserMock, withAuthDbMock, setActiveTenantIdMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  withAuthDbMock: vi.fn(),
  setActiveTenantIdMock: vi.fn(),
}));

vi.mock('@/lib/auth/requireUser', () => ({
  requireUser: requireUserMock,
}));

vi.mock('@/lib/db/withAuthDb', () => ({
  withAuthDb: withAuthDbMock,
}));

vi.mock('@/lib/tenants/activeTenant', () => ({
  setActiveTenantId: setActiveTenantIdMock,
}));

import { POST } from './route';

describe('POST /api/tenants/switch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    requireUserMock.mockResolvedValue({ user: null, session: null });

    const response = await POST(
      new Request('http://localhost/api/tenants/switch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId: 'tenant-a' }),
      })
    );

    expect(response.status).toBe(401);
    expect(withAuthDbMock).not.toHaveBeenCalled();
  });

  it('denies cross-tenant switch attempts with 403', async () => {
    requireUserMock.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      session: { access_token: 'token-1' },
    });
    withAuthDbMock.mockResolvedValue(false);

    const response = await POST(
      new Request('http://localhost/api/tenants/switch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantId: 'tenant-b' }),
      })
    );

    expect(response.status).toBe(403);
    expect(setActiveTenantIdMock).not.toHaveBeenCalled();
  });

  it('allows same-tenant switch for valid membership', async () => {
    requireUserMock.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      session: { access_token: 'token-1' },
    });
    withAuthDbMock.mockResolvedValue(true);
    setActiveTenantIdMock.mockResolvedValue(undefined);

    const response = await POST(
      new Request('http://localhost/api/tenants/switch', {
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
