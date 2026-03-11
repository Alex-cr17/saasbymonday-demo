# API Conventions

## Structure

```
app/api/
  tenants/
    route.ts          # GET /api/tenants
    switch/
      route.ts        # POST /api/tenants/switch
  {entity}/
    route.ts          # GET, POST /api/{entity}
    [id]/
      route.ts        # GET, PUT, DELETE /api/{entity}/:id
```

## Route Pattern

Every API route MUST follow this pattern:

```typescript
import { requireUser } from '@/lib/auth/requireUser';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { ok, fail, created, notFound } from '@/lib/api/responses';

export async function GET() {
  const { user, session } = await requireUser();
  
  if (!user || !session) {
    return fail('UNAUTHENTICATED', 'Authentication required', 401);
  }

  try {
    const data = await withAuthDb(session.access_token, (db) =>
      queryFunction(db)
    );
    return ok(data);
  } catch (error) {
    console.error('[GET /api/resource]', error);
    return fail('INTERNAL_SERVER_ERROR', 'Failed to fetch', 500);
  }
}
```

## Response Format

### Success
```json
{ "data": {} }
```

### Error
```json
{ "error": { "code": "ERROR_CODE", "message": "Human readable" } }
```

## Response Helpers

File: `lib/api/responses.ts`

- `ok(data)` — 200
- `created(data)` — 201
- `notFound(message)` — 404
- `fail(code, message, status)` — custom error

## HTTP Status Codes

- `200` — success
- `201` — created
- `400` — validation error
- `401` — unauthenticated
- `403` — forbidden
- `404` — not found
- `500` — server error

## Validation

- Use Zod for input validation
- Validate at API boundary
- Return `400` with `VALIDATION_ERROR` on failure

```typescript
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return fail('VALIDATION_ERROR', 'Invalid input', 400);
}
```

## Tenant-Scoped Routes

For routes that operate on tenant data:

```typescript
import { getActiveTenantId } from '@/lib/tenants/activeTenant';

export async function GET() {
  const { user, session } = await requireUser();
  if (!user || !session) return fail('UNAUTHENTICATED', 'Auth required', 401);

  const tenantId = await getActiveTenantId();
  if (!tenantId) return fail('BAD_REQUEST', 'No active tenant', 400);

  const data = await withAuthDb(session.access_token, (db) =>
    getEntities(db, tenantId)  // Pass tenantId to query
  );
  return ok(data);
}
```

## Rules

1. Always use `requireUser()` first
2. Always use `withAuthDb(jwt, ...)` for DB access
3. Always get `tenantId` from `getActiveTenantId()` (cookie)
4. Always pass `tenantId` to tenant-scoped queries
5. Never use Supabase for data queries
6. Never pass `tenant_id` or `user_id` from client
7. Never implement authorization in code (RLS handles it)
8. Always use response helpers from `responses.ts`
