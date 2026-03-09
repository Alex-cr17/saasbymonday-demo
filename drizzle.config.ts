import type { Config } from 'drizzle-kit';

const drizzleConfig: Config = {
  schema: 'src/lib/db/schema/*.ts',
  out: 'supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export default drizzleConfig;
