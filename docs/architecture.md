# Architecture

## Layers

### 1. App Router (`app/`)
- Routing via Next.js App Router
- Route groups: `(marketing)`, `auth/`, `(admin)`
- Server Components by default
- Client Components only when required

### 2. Middleware (`middleware.ts`)
- Session synchronization via Supabase
- Auth-based routing (redirect unauthenticated users)
- API routes are excluded from middleware redirects and enforce auth/signature checks at route level
- NO database access, NO tenant resolution

### 3. Components (`components/`)
- Presentational only
- Data via props
- NO data fetching, NO business logic

### 4. Client State (`store/`, `context/`)
- UI state only (modals, filters, theme, toasts)
- Zustand stores:
  - `appStore` — user, tenants, activeTenant, toasts
  - `useDialogStore` — global dialog state
- React Query for server state (with tenantId in queryKey)
- NO duplicating server data in Zustand

### 5. API Routes (`app/api/`)
- Thin orchestration layer
- Pattern:
  ```
  requireUser() → withAuthDb(jwt) → query(db) → response
  ```
- NO authorization logic (RLS handles it)

### 6. Database Layer (`lib/db/`)
- `client.ts` — Postgres pool
- `withAuthDb.ts` — JWT → Postgres session
- `queries/*` — Drizzle queries
- `schema/*` — Table definitions

### 7. Supabase (`lib/supabase/`)
- Auth only (NO database access)
- `client.ts` — browser
- `server.ts` — RSC/API routes
- `middleware.ts` — edge middleware

## Request Flow

```
Browser
  → Middleware (getUser() for auth check, routing)
  → API Route
      → requireUser()
          → getUser() [authenticates with Supabase Auth server]
          → getSession() [only for access_token]
      → withAuthDb(session.access_token)
          → Drizzle Query
              → PostgreSQL + RLS
  → Response
```

## Key Rules

1. RLS is the sole authorization layer
2. `withAuthDb` is the only database entry point
3. `tenant_id` and `user_id` never come from client
4. Middleware handles routing, not authorization
5. Supabase is auth-only, never for DB queries
6. Queries MUST filter by tenantId (RLS is security, filter is UX)
7. React Query keys MUST include tenantId for cache isolation
8. Always use `getUser()` to verify auth — `getSession()` data may not be authentic

## Tenant Resolution

Active tenant is stored in a cookie (`active_tenant_id`).

### Read-Only Resolution (Server Components)

`resolveActiveTenantId(db)` is **read-only** — safe to call from Server Components:
```
1. Read cookie hint
2. Fetch user's tenants via RLS
3. If cookie matches a valid tenant → use it
4. Else pick owner tenant or first available
5. Return resolved tenantId (does NOT write cookie)
```

### Cookie Sync (Lazy Sync Pattern)

Next.js 15 does not allow cookie modification in Server Components.
Cookie is synced via API on client mount:

```
Layout (Server Component)
  → resolveActiveTenantId(db) [read-only]
  → pass activeTenantId to AppStoreHydrator

AppStoreHydrator (Client Component)
  → mount
  → POST /api/tenants/sync { tenantId }
  → Route Handler sets cookie if needed
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/tenants/activeTenant.ts` | Cookie read/write helpers |
| `lib/tenants/resolveActiveTenant.ts` | Read-only tenant resolution |
| `app/api/tenants/sync/route.ts` | Cookie sync endpoint |
| `app/api/tenants/switch/route.ts` | Manual tenant switch |
| `components/navigations/app-store-hydrator.tsx` | Client sync on mount |

Cookie is a hint, not trusted. RLS validates actual access.

## App Initialization

### Root Layout (`app/layout.tsx`)
```
QueryClientProviderWrapper
  └── ThemeProvider
  └── ConfirmProvider
  └── ToastProvider
  └── DialogManager
  └── AppInitializer (loads user → appStore)
      └── Children
```

### Admin Layout (`app/(admin)/layout.tsx`)
Server Component that:
1. Calls `requireUser()` to verify auth
2. Calls `withAuthDb()` to fetch tenants + resolve active tenant
3. Renders `AppStoreHydrator` to push server data to Zustand
4. Renders sidebar and page content

## Core Migrations (DO NOT DELETE)

| File | Purpose |
|------|---------|
| `supabase/migrations/0000_quiet_angel.sql` | Core schema + RLS policies + auth trigger |

See `supabase/migrations/README.md` for migration workflow details (Drizzle-first, optional MCP checks).
