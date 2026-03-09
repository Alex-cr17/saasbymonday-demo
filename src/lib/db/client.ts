import { Pool, type PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * Gracefully release the Postgres pool on shutdown
 */
export const releasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[db] Postgres pool released');
  }
};

process.once('SIGTERM', releasePool);
process.once('SIGINT', releasePool);

/**
 * Singleton Postgres pool.
 * This pool is shared across the entire application.
 */
export async function getPostgresPool(): Promise<Pool> {
  if (pool) return pool;

  const useSsl = process.env.NODE_ENV === 'production';
  const rejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized } : false,
  });

  pool.on('error', (error) => {
    console.error('[db] Postgres pool error:', error);
    pool = null;
  });

  return pool;
}

/**
 * Low-level helper to acquire a raw Postgres client.
 * Should rarely be used directly.
 */
export async function getPostgresClient(): Promise<PoolClient> {
  const pool = await getPostgresPool();
  return pool.connect();
}