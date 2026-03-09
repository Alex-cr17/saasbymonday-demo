# Invariants

## Authentication

- MUST use Supabase Auth exclusively
- MUST use `requireUser()` in all protected routes
- MUST forward JWT to PostgreSQL via `withAuthDb()`
- MUST use `getUser()` to verify authentication (contacts Supabase Auth server)
- MUST NOT trust `getSession()` alone — data comes from cookies and may not be authentic
- `getSession()` is only for obtaining `access_token` AFTER `getUser()` succeeds

## Authorization

- MUST enforce via PostgreSQL RLS only
- MUST NOT implement auth logic in application code
- MUST NOT bypass RLS
- MUST add/maintain RLS policies whenever schema changes add or modify tables
- MUST ensure migrations that create or recreate core tables (`users`, `tenants`, `tenant_users`) also enable RLS for them (or run a follow-up migration that does)
- MUST NOT add earlier-numbered migrations that create these tables without enabling RLS, as this will leave them UNRESTRICTED in Supabase

## Cookies in Next.js 15 (CRITICAL)

- MUST NOT modify cookies in Server Components (layouts, pages)
- MUST only modify cookies in Route Handlers or Server Actions
- Reading cookies in Server Components is allowed
- Use "lazy sync" pattern: read in Server Component → sync via API on client mount

## Tenant Filtering

- MUST filter queries by `tenantId` from active tenant cookie
- MUST get tenantId via `getActiveTenantId()` (server-side)
- MUST NOT accept `tenantId` from client request body
- RLS is security layer, tenant filter is UX layer (show correct data)

## Database Access

- MUST use `withAuthDb(jwt, callback)` as only entry point
- MUST pass `db` instance to all query functions
- MUST NOT use Supabase SDK for data queries
- MUST NOT use raw pg client directly in routes

## Schema Changes

- MUST run `npm run db:generate` after schema edits
- MUST add/verify RLS policies in the generated migration
- MUST run `npm run db:migrate` after updating policies

## API Routes

- MUST follow pattern: `requireUser → withAuthDb → query → response`
- MUST use response helpers from `lib/api/responses.ts`
- MUST validate input with Zod
- MUST NOT accept `tenant_id` or `user_id` from client
- MUST NOT rely on middleware login redirects for `/api/*`; API routes must enforce auth/signature checks directly

## Supabase

- MUST use only for authentication
- MUST NOT use as database layer
- MUST NOT expose service role key

## Components

- MUST be presentational only
- MUST receive data via props
- MUST NOT fetch data directly
- MUST NOT access Supabase or database

## Client State

- MUST use Zustand for global UI state
- MUST NOT store server data as source of truth
- MUST use React Query for server state
- MUST include `tenantId` in React Query keys for tenant-scoped data
- MUST invalidate queries on tenant switch

## Dialogs

- MUST use `DialogManager` + `useDialogStore` for modals
- MUST define dialog types in `utils/constants.ts`
- MUST NOT use local dialog state in list components
