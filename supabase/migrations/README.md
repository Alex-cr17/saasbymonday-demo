# Migrations Runbook

This project uses Drizzle as the source of truth for schema evolution.

## Workflow

1. Edit schema in `src/lib/db/schema/*`
2. Run `npm run db:generate`
3. Review the generated SQL in `supabase/migrations/*`
4. Add or verify RLS policies for tenant-scoped tables
5. Run `npm run db:migrate`

## Required Security Checks

- Ensure new tenant-scoped tables have `tenant_id`
- Ensure `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is present
- Ensure select/insert/update/delete RLS policies are present and tenant-scoped

## MCP Usage

Supabase MCP is optional and operational:

- Use MCP for post-migrate verification (tables, policies, checks)
- Do not use MCP as the schema migration source of truth
- Keep schema authoring and migration generation in Drizzle
