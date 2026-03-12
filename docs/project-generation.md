# Project Generation Guide

This guide helps AI agents generate complete applications from user ideas.

## When to Use

User says:
- "I want to create [app name]"
- "Build a [description] app"
- "Add [feature] functionality"

## Step 1: Ask Clarifying Questions

### App Type
```
Is this a Personal App (single user) or Workspace App (multi-user)?
- Personal: One user, one workspace (hide multi-tenant UI)
- Workspace: Multiple users, multiple workspaces
```

### Entities

For each entity user mentions, ask:

```
For [Entity Name]:

1. What fields does it need?
   Example: For "Transaction"
   - amount (number)
   - description (text)
   - date (date)
   - category (relation to categories)

2. What type for each field?
   - text (short text, < 255 chars)
   - longtext (long text, > 255 chars)
   - number (integer)
   - decimal (money, measurements)
   - boolean (true/false)
   - date (date only)
   - datetime (date + time)
   - enum (fixed list of values)
   - uuid (relation to another entity)

3. Which fields are required?

4. Any relations to other entities?
   Example: Transaction → Category (many-to-one)
```

### Features

```
Any additional features?
- Charts/Analytics
- Export (CSV, PDF)
- Notifications
- File uploads
- Search/Filtering
```

## Step 2: Design / UI Discovery

**After** functional questions and **before** creating the PRD, run a short design discovery so the generated UI matches the user's expectations.

- Use the questions and blocks from **`docs/design-discovery.md`** (mood, theme, style, density, colors, references, what to avoid, main screen).
- Ask for 1–3 reference screenshots or links to apps/sites the user likes.
- If the user is unsure, suggest options (e.g. "minimal + cards, system theme") instead of leaving design implicit.
- Capture a short summary (e.g. in PRD as `designNotes` or in a short paragraph) so code generation can follow it.

This step is optional but recommended; without it, the agent will default to template styling with no user direction.

## Step 3: Create PRD File

Create `project.prd.json` in root:

```json
{
  "version": "1.0",
  "app": {
    "name": "Personal Finance Tracker",
    "description": "Track income, expenses, and budgets",
    "type": "personal"
  },
  "entities": [
    {
      "name": "transaction",
      "label": "Transaction",
      "pluralLabel": "Transactions",
      "icon": "DollarSign",
      "fields": [
        {
          "name": "amount",
          "type": "decimal",
          "required": true,
          "validation": { "min": 0 }
        },
        {
          "name": "description",
          "type": "text",
          "required": true,
          "maxLength": 255
        },
        {
          "name": "date",
          "type": "date",
          "required": true
        },
        {
          "name": "type",
          "type": "enum",
          "values": ["income", "expense"],
          "required": true
        },
        {
          "name": "categoryId",
          "type": "uuid",
          "relation": {
            "entity": "category",
            "type": "many-to-one"
          },
          "required": true
        }
      ]
    },
    {
      "name": "category",
      "label": "Category",
      "pluralLabel": "Categories",
      "icon": "Tag",
      "fields": [
        {
          "name": "name",
          "type": "text",
          "required": true,
          "maxLength": 100
        },
        {
          "name": "color",
          "type": "text",
          "required": false
        }
      ]
    }
  ],
  "features": {
    "charts": true,
    "export": false
  }
}
```

## Step 4: Generate Code from PRD

Follow this order:

### 1. Database Schema

For each entity in PRD, create `lib/db/schema/{entity}.ts`:

```typescript
import { pgTable, uuid, text, decimal, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { categories } from './categories'; // if has relations

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  type: text('type').notNull(), // enum
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**Type mapping:**
- `text` → `text()`
- `longtext` → `text()`
- `number` → `integer()`
- `decimal` → `decimal(precision, scale)`
- `boolean` → `boolean()`
- `date` → `timestamp()`
- `datetime` → `timestamp({ withTimezone: true })`
- `enum` → `text()` (validate in Zod)
- `uuid` (relation) → `uuid().references()`

### 2. Generate Migration

```bash
npm run db:generate
```

Add RLS policies to generated migration:

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = transactions.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = transactions.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = transactions.tenant_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = transactions.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = transactions.tenant_id AND user_id = auth.uid())
);
```

Apply migration:
```bash
npm run db:migrate
```

### 3. Queries

Create `lib/db/queries/{entity}.ts`:

```typescript
import { transactions } from '../schema/transactions';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export async function getTransactions(db: NodePgDatabase, tenantId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.tenantId, tenantId))
    .orderBy(desc(transactions.createdAt));
}

export async function createTransaction(db: NodePgDatabase, input: any) {
  const [transaction] = await db.insert(transactions).values(input).returning();
  return transaction;
}

export async function updateTransaction(db: NodePgDatabase, id: string, input: any) {
  const [transaction] = await db.update(transactions).set(input).where(eq(transactions.id, id)).returning();
  return transaction;
}

export async function deleteTransaction(db: NodePgDatabase, id: string) {
  await db.delete(transactions).where(eq(transactions.id, id));
}
```

### 4. Validation Schemas

Create `lib/validation/{entity}Schemas.ts`:

```typescript
import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().min(0),
  description: z.string().min(1).max(255),
  date: z.string(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
```

### 5. API Routes

Create `app/api/{entity}/route.ts` and `app/api/{entity}/[id]/route.ts`

Follow pattern from `docs/api-conventions.md`.

### 6. Client API

Create `lib/api/client/{entity}.ts`:

```typescript
export type Transaction = {
  id: string;
  tenantId: string;
  amount: string;
  description: string;
  date: string;
  type: string;
  categoryId: string;
  createdAt: string;
};

export async function fetchTransactions() {
  const res = await fetch('/api/transactions', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data as Transaction[];
}

export async function createTransaction(input: CreateTransactionInput) {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed');
  return (await res.json()).data;
}
```

### 7. React Query Hooks

Create `hooks/use{Entity}.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import { fetchTransactions, createTransaction } from '@/lib/api/client/transactions';

export const transactionKeys = {
  all: (tenantId: string | null) => ['transactions', tenantId] as const,
};

export function useTransactions() {
  const activeTenant = useAppStore((s) => s.activeTenant);
  
  return useQuery({
    queryKey: transactionKeys.all(activeTenant?.id ?? null),
    queryFn: fetchTransactions,
    enabled: !!activeTenant,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const activeTenant = useAppStore((s) => s.activeTenant);
  
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => qc.invalidateQueries({ 
      queryKey: transactionKeys.all(activeTenant?.id ?? null) 
    }),
  });
}
```

### 8. UI Components

Create `components/{entity}/`:
- `{Entity}List.tsx` - List with CRUD
- `{Entity}Form.tsx` - Create/edit form
- `{Entity}Card.tsx` - Display single item

Use existing component patterns in `components/` as reference.

### 9. Dialogs

Add to `utils/constants.ts`:
```typescript
export const DIALOG_TYPES = {
  TRANSACTION: {
    CREATE: 'transaction:create',
    EDIT: 'transaction:edit',
  },
} as const;
```

Create `components/dialogs/{Entity}Dialog.tsx`

Add to `DialogManager.tsx`

Note: in base template `DialogManager` can be a no-op (`return null`) until the first dialog is introduced.

### 10. Pages

Create `app/(admin)/{entity}/page.tsx`:

```typescript
import { TransactionList } from '@/components/transactions/TransactionList';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <TransactionList />
    </div>
  );
}
```

### 11. Navigation

Add to `components/navigations/app-sidebar.tsx`:

```typescript
import { DollarSign } from 'lucide-react';

const navItems = [
  { title: 'Transactions', href: '/transactions', icon: DollarSign },
];
```

### 12. Update siteConfig

Update `src/app/siteConfig.ts`:

```typescript
export const siteConfig = {
  name: 'Personal Finance Tracker',
  description: 'Track income, expenses, and budgets',
  baseLinks: {
    dashboard: ROUTES.APP.DASHBOARD,
    transactions: '/transactions',
    categories: '/categories',
  },
}
```

## Step 5: Environment Setup

Ask user for:
```
I need your Supabase credentials:

1. NEXT_PUBLIC_SUPABASE_URL=
2. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
3. DATABASE_URL=

Create .env.local with these values?
```

## Step 6: Test

```bash
npm run dev
# Test in browser
```

## Step 7: Deploy (Optional)

```
Ready to deploy to Vercel?
I'll need your Vercel token or you can deploy manually.
```

## Important Rules

1. **Always filter by tenantId** in queries
2. **Always add RLS policies** to migrations
3. **Always include tenantId in React Query keys**
4. **Follow naming conventions** (camelCase for JS, snake_case for DB)
5. **Use existing API and RLS patterns** from docs
6. **Update documentation** if adding new patterns

## For Personal Apps

If `app.type === "personal"`:
- Hide `WorkspaceSwitcher` in sidebar
- User still has one tenant (created automatically)
- All entities still have `tenantId` (same code)
