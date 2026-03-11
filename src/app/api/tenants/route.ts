import { ok, fail } from '@/lib/api/responses';
import { requireUser } from '@/lib/auth/requireUser';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { getTenants } from '@/lib/db/queries/tenants';

export async function GET() {
  const { user, session } = await requireUser();

  if (!user || !session) {
    return fail('UNAUTHENTICATED', 'You must be signed in.', 401, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const data = await withAuthDb(session.access_token, (db) =>
      getTenants(db, user.id)
    );

    return ok(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    console.error('[GET /api/tenants]', e);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to fetch tenants.', 500, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}