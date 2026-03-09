import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, releaseMock, getPostgresClientMock, drizzleDb, drizzleMock } = vi.hoisted(
  () => {
    const query = vi.fn();
    const release = vi.fn();
    const getPostgresClient = vi.fn(async () => ({
      query,
      release,
    }));
    const db = { mocked: true };
    const drizzle = vi.fn(() => db);
    return {
      queryMock: query,
      releaseMock: release,
      getPostgresClientMock: getPostgresClient,
      drizzleDb: db,
      drizzleMock: drizzle,
    };
  }
);

vi.mock('./client', () => ({
  getPostgresClient: getPostgresClientMock,
}));

vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: drizzleMock,
}));

import { withAuthDb } from './withAuthDb';

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function createJwt(payload: Record<string, unknown>) {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('withAuthDb', () => {
  beforeEach(() => {
    queryMock.mockReset();
    releaseMock.mockReset();
    getPostgresClientMock.mockClear();
    drizzleMock.mockClear();
  });

  it('sets jwt claims in transaction and commits on success', async () => {
    queryMock.mockResolvedValue(undefined);
    const jwt = createJwt({ sub: 'user-1', role: 'authenticated' });

    const result = await withAuthDb(jwt, async (db) => {
      expect(db).toBe(drizzleDb);
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(queryMock).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(queryMock).toHaveBeenNthCalledWith(
      2,
      "select set_config('request.jwt.claims', $1, true)",
      [JSON.stringify({ sub: 'user-1', role: 'authenticated' })]
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      3,
      "select set_config('request.jwt.claim.sub', $1, true)",
      ['user-1']
    );
    expect(queryMock).toHaveBeenNthCalledWith(
      4,
      "select set_config('request.jwt.claim.role', $1, true)",
      ['authenticated']
    );
    expect(queryMock).toHaveBeenNthCalledWith(5, 'set local role authenticated');
    expect(queryMock).toHaveBeenNthCalledWith(6, 'COMMIT');
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  it('rolls back when callback throws', async () => {
    queryMock.mockResolvedValue(undefined);
    const jwt = createJwt({ sub: 'user-1' });

    await expect(
      withAuthDb(jwt, async () => {
        throw new Error('QUERY_FAILED');
      })
    ).rejects.toThrow('QUERY_FAILED');

    expect(queryMock).toHaveBeenCalledWith('ROLLBACK');
    expect(releaseMock).toHaveBeenCalledOnce();
  });

  it('rejects invalid jwt format without opening transaction', async () => {
    await expect(withAuthDb('invalid', async () => 'never')).rejects.toThrow(
      'INVALID_JWT_FORMAT'
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(releaseMock).toHaveBeenCalledOnce();
  });
});
