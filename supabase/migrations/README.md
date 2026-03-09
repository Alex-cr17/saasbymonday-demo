# Database Migrations

## Core Migrations (DO NOT DELETE)

| File | Purpose |
|------|---------|
| `0000_quiet_angel.sql` | Core schema + RLS policies + auth signup trigger |

**Deleting this file will break authentication and data isolation on fresh setups.**

## Migration Workflow

### Step 1: Create/modify schema
```
src/lib/db/schema/{entity}.ts
```
All business entities must have `tenantId` field.

### Step 2: Generate migration
```bash
npm run db:generate
```
This creates a new SQL file in `supabase/migrations/`.

### Step 3: Add RLS policies
Open the generated file and add RLS policies after table creation:

```sql
ALTER TABLE {entity} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{entity}_select" ON {entity} FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = {entity}.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "{entity}_insert" ON {entity} FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = {entity}.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "{entity}_update" ON {entity} FOR UPDATE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = {entity}.tenant_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = {entity}.tenant_id AND user_id = auth.uid())
);

CREATE POLICY "{entity}_delete" ON {entity} FOR DELETE USING (
  EXISTS (SELECT 1 FROM tenant_users WHERE tenant_id = {entity}.tenant_id AND user_id = auth.uid())
);
```

### Step 4: Apply migration
```bash
npm run db:migrate
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:migrate` | Apply pending migrations to database |

## Fresh Supabase Bootstrap Check

Run this check when validating template readiness:

1. Use a new Supabase project with clean database.
2. Set `DATABASE_URL` and run `npm run db:migrate`.
3. Verify core schema objects exist: `users`, `tenants`, `tenant_users`, `tenant_role`.
4. Verify RLS is enabled on core tables and expected policies are present.
5. Verify `on_auth_user_created` trigger exists on `auth.users`.
