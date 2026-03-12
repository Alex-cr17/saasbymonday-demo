# SaaS Boilerplate

Production-ready multi-tenant SaaS template with Next.js 15, Supabase Auth, PostgreSQL + RLS.

## Quick Start

### Before first run (required)

1. Create a Supabase project.
2. Open `Project Settings -> API` in Supabase dashboard.
3. Copy required values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `DATABASE_URL`
   - Optional (custom email integration): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
   - Optional (Stripe example): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
   - Optional (advanced DB TLS override): `DATABASE_SSL_REJECT_UNAUTHORIZED=false` (not recommended)

If these variables are empty, auth client initialization will fail and the app will not start correctly.

Note:
- API routes are not login-redirected by middleware; each route handles auth/signature checks explicitly.
- Stripe webhook route is a verified starter stub and does not persist billing state by default.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill .env.local with Supabase URL and publishable key

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### First-time setup checklist

- [ ] `npm install`
- [ ] `cp .env.example .env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`
- [ ] Set `DATABASE_URL` in `.env.local`
- [ ] (Optional) Set Resend keys for custom email integration
- [ ] (Optional) Set Stripe keys for billing example
- [ ] `npm run db:migrate`
- [ ] `npm run dev`
- [ ] `npm test`

### Bootstrap Verification (Fresh Supabase)

For template validation, verify migrations on a brand-new Supabase project:

1. Create a new Supabase project and update `DATABASE_URL` in `.env.local`.
2. Run `npm run db:migrate` once.
3. Confirm core objects exist: `users`, `tenants`, `tenant_users`, enum `tenant_role`.
4. Confirm RLS is enabled and policies are present on core tables.
5. Confirm trigger `on_auth_user_created` exists on `auth.users`.
6. Sign up a user and verify rows are created in `users`, `tenants`, and `tenant_users`.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (UI) + React Query (server)
- **Forms:** react-hook-form + Zod

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Protected routes
│   ├── (marketing)/       # Public routes
│   ├── auth/              # Auth pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # React Query hooks
├── lib/
│   ├── api/              # Response helpers + client functions
│   ├── auth/             # requireUser
│   ├── db/               # Drizzle schema + queries
│   ├── supabase/         # Supabase clients
│   ├── tenants/          # Tenant utilities
│   └── validation/       # Zod schemas
└── store/                # Zustand stores
```

## Key Patterns

### API Routes
```typescript
export async function GET() {
  const { user, session } = await requireUser();
  if (!user || !session) return fail('UNAUTHENTICATED', 'Auth required', 401);

  const data = await withAuthDb(session.access_token, (db) => query(db));
  return ok(data);
}
```

### React Query Hooks
```typescript
const activeTenant = useAppStore((s) => s.activeTenant);

return useQuery({
  queryKey: ['entities', activeTenant?.id],  // tenantId for cache isolation
  queryFn: fetchEntities,
  enabled: !!activeTenant,
});
```

### Forms
```typescript
const { register, handleSubmit } = useForm<Input>({
  resolver: zodResolver(schema),
});
```

## Creating New Features

See `docs/creating-features.md` for step-by-step guide.

## Documentation

- `docs/architecture.md` - System architecture and layers
- `docs/app-structure.md` - Directory layout and initialization flow
- `docs/api-conventions.md` - API patterns
- `docs/auth-and-supabase.md` - Auth architecture + Google OAuth setup
- `docs/stripe.md` - Base Stripe checkout + webhook integration
- `docs/data-models.md` - Database schema
- `docs/invariants.md` - Rules that must be followed
- `docs/creating-features.md` - How to add new features
- `docs/project-generation.md` - Generate complete app from user idea

## Multi-tenancy

All business data is scoped to tenants via `tenant_id`. Authorization is enforced by PostgreSQL RLS - no application code checks.

For single-user apps (Personal App), the user has one tenant created automatically. Multi-tenant features work transparently.

## License

MIT
