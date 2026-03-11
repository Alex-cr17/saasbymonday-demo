import { drizzle } from 'drizzle-orm/node-postgres';
import { decodeJwt } from 'jose';
import { getPostgresClient } from './client';

const jwtPartRegex = /^[A-Za-z0-9_-]+$/;

function assertJwtFormat(jwt: string) {
  const parts = jwt.split('.');
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error('INVALID_JWT_FORMAT');
  }
  if (!parts.every((part) => jwtPartRegex.test(part))) {
    throw new Error('INVALID_JWT_FORMAT');
  }
}

function parseJwtClaims(jwt: string): { claimsJson: string; sub: string; role: string } {
  assertJwtFormat(jwt);
  const claims = decodeJwt(jwt);
  const sub = claims.sub;
  if (!sub || typeof sub !== 'string') {
    throw new Error('INVALID_JWT_CLAIMS');
  }
  const role = typeof claims.role === 'string' ? claims.role : 'authenticated';
  return {
    claimsJson: JSON.stringify(claims),
    sub,
    role,
  };
}

export async function withAuthDb<T>(
  jwt: string,
  callback: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const client = await getPostgresClient();
  let beganTransaction = false;

  try {
    const { claimsJson, sub, role } = parseJwtClaims(jwt);
    await client.query('BEGIN');
    beganTransaction = true;
    await client.query(
      `select set_config('request.jwt.claims', $1, true)`,
      [claimsJson]
    );
    await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [sub]);
    await client.query(`select set_config('request.jwt.claim.role', $1, true)`, [role]);
    await client.query('set local role authenticated');

    const db = drizzle(client);
    const result = await callback(db);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (beganTransaction) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
  }
}