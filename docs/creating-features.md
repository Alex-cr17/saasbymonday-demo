# Creating New Features

Step-by-step guide for adding new features. `habits` below is documentation-only example and is not included in runtime code by default.

## 1. Database Schema

Create `lib/db/schema/{feature}.ts`:

```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

## 2. Generate Migration

Run: `npm run db:generate`

This creates a new SQL file in `supabase/migrations/`.

## 3. Add RLS Policies

Open the generated migration file and ADD RLS policies at the end:

```sql
-- Add after table creation
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select" ON habits FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = habits.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "habits_insert" ON habits FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = habits.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "habits_update" ON habits FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = habits.tenant_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = habits.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "habits_delete" ON habits FOR DELETE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = habits.tenant_id AND user_id = auth.uid())
);
```

## 4. Apply Migration

Run: `npm run db:migrate`

## 5. Queries

Create `lib/db/queries/{feature}.ts`:

```typescript
import { habits } from '../schema/habits';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// IMPORTANT: Always filter by tenantId for tenant-scoped entities
export async function getHabits(db: NodePgDatabase, tenantId: string) {
  return db
    .select()
    .from(habits)
    .where(eq(habits.tenantId, tenantId))
    .orderBy(desc(habits.createdAt));
}

export async function createHabit(db: NodePgDatabase, input: {...}) {
  const [habit] = await db.insert(habits).values(input).returning();
  return habit;
}
```

## 6. Validation

Create `lib/validation/{feature}Schemas.ts`:

```typescript
import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
```

## 7. API Routes

Create `app/api/{feature}/route.ts`:

```typescript
import { requireUser } from '@/lib/auth/requireUser';
import { withAuthDb } from '@/lib/db/withAuthDb';
import { ok, fail, created } from '@/lib/api/responses';
import { getActiveTenantId } from '@/lib/tenants/activeTenant';

export async function GET() {
  const { user, session } = await requireUser();
  if (!user || !session) return fail('UNAUTHENTICATED', 'Auth required', 401);

  const tenantId = await getActiveTenantId();
  if (!tenantId) return fail('BAD_REQUEST', 'No tenant', 400);

  const data = await withAuthDb(session.access_token, (db) => 
    getHabits(db, tenantId)
  );
  return ok(data);
}

export async function POST(req: Request) {
  const { user, session } = await requireUser();
  if (!user || !session) return fail('UNAUTHENTICATED', 'Auth required', 401);

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('VALIDATION_ERROR', 'Invalid input', 400);

  const tenantId = await getActiveTenantId();
  if (!tenantId) return fail('BAD_REQUEST', 'No tenant', 400);

  const result = await withAuthDb(session.access_token, (db) =>
    createHabit(db, { ...parsed.data, tenantId })
  );

  return created(result);
}
```

## 8. Client API

Create `lib/api/client/{feature}.ts`:

```typescript
export async function fetchHabits() {
  const res = await fetch('/api/habits', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data;
}
```

## 9. React Query Hooks

Create `hooks/use{Feature}.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';

// IMPORTANT: Include tenantId in queryKey for proper cache isolation
export const habitKeys = {
  all: (tenantId: string | null) => ['habits', tenantId] as const,
};

export function useHabits() {
  const activeTenant = useAppStore((s) => s.activeTenant);
  
  return useQuery({
    queryKey: habitKeys.all(activeTenant?.id ?? null),
    queryFn: fetchHabits,
    enabled: !!activeTenant,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  const activeTenant = useAppStore((s) => s.activeTenant);
  
  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ 
      queryKey: habitKeys.all(activeTenant?.id ?? null) 
    }),
  });
}
```

## 10. UI Components

Create `components/{feature}/`:

- `{Feature}Card.tsx` - Display single item
- `{Feature}Form.tsx` - Create/edit form (react-hook-form + Zod)
- `{Feature}List.tsx` - List with CRUD operations

## 11. Page

Create `app/(admin)/{feature}/page.tsx`:

```typescript
import { FeatureList } from '@/components/feature/FeatureList';

export default function FeaturePage() {
  return <FeatureList />;
}
```

## 12. Navigation

Add to `components/navigations/app-sidebar.tsx`:

```typescript
const navItems = [
  { title: 'Feature', href: '/feature', icon: Icon },
];
```

## 13. Dialogs (Optional)

If feature needs create/edit dialogs:

1. Add dialog types to `utils/constants.ts`:
```typescript
export const DIALOG_TYPES = {
  FEATURE: {
    CREATE: 'feature:create',
    EDIT: 'feature:edit',
  },
} as const;
```

2. Create `components/dialogs/{Feature}Dialog.tsx`

3. Add case to `DialogManager.tsx`:
```typescript
case DIALOG_TYPES.FEATURE.CREATE:
case DIALOG_TYPES.FEATURE.EDIT:
  return <FeatureDialog />;
```

4. Open from list component:
```typescript
import { openDialog } from '@/store/useDialogStore';
openDialog(DIALOG_TYPES.FEATURE.CREATE);
openDialog(DIALOG_TYPES.FEATURE.EDIT, { entity: data });
```

## Checklist

- [ ] Schema with `tenantId`
- [ ] Run `npm run db:generate`
- [ ] Add RLS policies to migration
- [ ] Run `npm run db:migrate`
- [ ] Queries (filter by tenantId)
- [ ] Validation (Zod schemas)
- [ ] API routes (following pattern)
- [ ] Client API functions
- [ ] React Query hooks (tenantId in queryKey)
- [ ] UI components
- [ ] Dialogs (if needed)
- [ ] Page
- [ ] Navigation link
