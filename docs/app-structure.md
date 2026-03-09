# App Structure

## Directory Layout

```
src/
  app/
    layout.tsx            # Root layout (providers, AppInitializer)
    (marketing)/          # Public pages
      page.tsx            # Landing page
    auth/                 # Auth pages (public)
      login/page.tsx
      signup/page.tsx
      forgot-password/page.tsx
    (admin)/              # Protected area
      layout.tsx          # Auth layout + sidebar + AppStoreHydrator
      dashboard/page.tsx
    api/                  # API routes
      tenants/
        route.ts
        switch/route.ts
  
  components/
    AppInitializer.tsx    # Client-side user state init
    ui/                   # Base UI components (shadcn)
    navigations/          # Nav components
      app-sidebar.tsx
      app-store-hydrator.tsx  # Server→Client state hydration
      WorkspaceSwitcher.tsx   # Tenant switcher (hide for Personal App)
      AccessControl.tsx       # Conditional rendering by permissions
    marketing/            # Marketing page components
    dialogs/              # Dialog components
      DialogManager.tsx   # Global dialog controller
  
  lib/
    api/
      responses.ts        # ok(), fail(), created(), notFound()
      client/             # Client-side API functions
    auth/
      requireUser.ts      # Auth gate for API routes
    db/
      client.ts           # Postgres pool
      withAuthDb.ts       # JWT → Postgres session binding
      queries/            # Query functions (always filter by tenantId)
      schema/             # Drizzle schema definitions
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server Supabase client
      middleware.ts       # Edge middleware (session sync + routing)
    tenants/
      activeTenant.ts     # Cookie read/write for active tenant
      resolveActiveTenant.ts  # Validate + resolve tenant from cookie
    helpers/
      routes.ts           # Centralized route definitions (ROUTES)
    validation/           # Zod schemas for API input validation
  
  store/
    appStore.ts           # Zustand: user, tenants, toasts
    useDialogStore.ts     # Zustand: dialog state
  
  context/
    QueryClientProviderWrapper.tsx  # All providers wrapper
    ToastContext.tsx      # Toast UI (renders from appStore)
    ConfirmProvider.tsx   # Promise-based confirm dialogs
  
  hooks/
    useConfirm.ts         # Access confirm() function
    use-mobile.tsx        # Responsive breakpoint detection
    use-local-storage.ts  # Persistent local storage
    useScroll.ts          # Scroll position tracking
  
  types/                  # TypeScript type definitions
  utils/
    constants.ts          # ToastType, DialogTypes, Roles
    formatters.ts         # Number/date/file formatters
```

## Route Groups

- `(marketing)` — Public, no auth
- `auth/` — Auth flows, public
- `(admin)` — Protected, requires auth

## Routing Rules

- `/` and `/auth/*` are public
- All other routes require authentication
- Unauthenticated users redirect to `/auth/login?redirectTo=...`
- Authenticated users on auth pages redirect to `/dashboard`

## App Initialization Flow

```
1. Root Layout (app/layout.tsx)
   └── QueryClientProviderWrapper (providers: React Query, Theme, Toast, Confirm)
       └── AppInitializer (client: loads user from Supabase → appStore)
           └── Children

2. Admin Layout (app/(admin)/layout.tsx) - Server Component
   └── requireUser() - verify auth
   └── withAuthDb() - load tenants + resolve active tenant
   └── AppStoreHydrator - hydrate tenants into Zustand
   └── SidebarProvider + AppSidebar
       └── Children (pages)
```

## Key Components

### AppInitializer
Client component that loads current user from Supabase Auth into Zustand store on mount.

### AppStoreHydrator
Receives server-fetched tenants and hydrates them into Zustand. Runs once on admin layout mount.

### AccessControl
Conditional rendering based on permissions:
```tsx
<AccessControl isAllowed={role === 'owner'}>
  <AdminButton />
</AccessControl>
```

### WorkspaceSwitcher
Tenant switcher in sidebar. For Personal App, hide this component.

### DialogManager
Global dialog controller stub. Add dialog mappings when introducing feature-specific dialogs.
