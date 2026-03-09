# Authentication

## Overview

- Supabase Auth is the sole authentication provider
- Supabase is used ONLY for auth, NOT for database access
- Authorization is enforced by PostgreSQL RLS

## Supabase Clients

### `lib/supabase/client.ts` (Browser)
- Login/logout
- Session management
- Auth state changes

### `lib/supabase/server.ts` (Server)
- Resolve user/session from cookies
- Extract JWT for database access

### `lib/supabase/middleware.ts` (Edge)
- Session validation
- Routing decisions
- Applies to page routes; `/api/*` is handled at route level (no login redirects from middleware)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=                    # optional, for custom email integration
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Auth Flow

1. User logs in via Supabase client
2. Session stored in cookies
3. Server calls `requireUser()`:
   - `getUser()` — authenticates with Supabase Auth server (trusted)
   - `getSession()` — obtains `access_token` (only after getUser succeeds)
4. JWT passed to PostgreSQL via `withAuthDb()`
5. RLS enforces authorization

## Google OAuth Setup (Supabase + Google Cloud)

To use "Continue with Google", configure both Supabase and Google Cloud.

### 1) Configure Supabase Provider

1. Open **Supabase Dashboard → Authentication → Providers → Google**.
2. Enable **"Enable Sign in with Google"**.
3. Fill:
   - `Client IDs` (Google OAuth Client ID)
   - `Client Secret (for OAuth)` (Google OAuth Client Secret)
4. Save settings.

If this is not configured, login/signup fails with:
`{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

### 2) Configure Google Cloud OAuth

1. Open **Google Cloud Console → APIs & Services → Credentials**.
2. Create OAuth 2.0 Client ID (**Web application**).
3. In **Authorized redirect URIs**, add the exact callback shown in Supabase Provider UI:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy Client ID + Client Secret to Supabase Google provider fields.

### 3) Configure Supabase URL Settings

Open **Supabase Dashboard → Authentication → URL Configuration**:
- `Site URL`: your app origin, e.g. `http://localhost:3000`
- `Additional Redirect URLs`: include callback pages used in development, e.g.
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback` (if 3001 is used)

## Google OAuth Flow in This Project

### Client start
- Login/Signup buttons call `supabase.auth.signInWithOAuth({ provider: "google" })`.
- `redirectTo` points to `/auth/callback` with optional safe `next` path.

### Callback completion
- Route handler: `src/app/auth/callback/route.ts`
- Reads `code` and exchanges session via `supabase.auth.exchangeCodeForSession(code)`.
- On success: redirects to safe internal `next` path (or dashboard).
- On failure: redirects to `/auth/login?oauthError=...` for user-friendly UI message.

### Security rules
- Only internal relative redirect paths are allowed.
- Never trust external redirect targets from query params.
- Keep OAuth code exchange on server in Route Handler.

## getUser() vs getSession() (CRITICAL)

- **`getUser()`** — contacts Supabase Auth server, returns authenticated user
- **`getSession()`** — reads from cookies, data may not be authentic

**Rule**: Always verify auth with `getUser()` first. Use `getSession()` only to get `access_token` after successful `getUser()`.

```typescript
// ✅ Correct (requireUser does this)
const { data: { user } } = await supabase.auth.getUser();
if (!user) return unauthorized();
const { data: { session } } = await supabase.auth.getSession();

// ❌ Wrong — trusting session without verification
const { data: { session } } = await supabase.auth.getSession();
if (session?.user) { /* INSECURE */ }
```

## User Registration Trigger

When a user registers, a PostgreSQL trigger automatically:
1. Creates record in `public.users`
2. Creates personal tenant (workspace)
3. Adds user as tenant owner

Migration: `supabase/migrations/0000_quiet_angel.sql`

## Optional Email Integration (Resend)

- This template does not send signup welcome emails by default
- Helper stub: `src/lib/email/resend.ts`
- Use `sendTransactionalEmail(...)` from your own API routes/background jobs
- If `RESEND_API_KEY` is missing, sending is skipped by design

### Resend setup (for users of this template)

1. Create account at **Resend** and open **API Keys**.
2. Generate API key and copy it.
3. Add variables to `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

4. For production, verify your domain in Resend and use sender from that domain, e.g. `hello@yourdomain.com`.
5. Restart dev server after env changes:

```bash
npm run dev
```

Notes:
- If `RESEND_API_KEY` is empty, app features continue to work; email sending is skipped.
- On free/dev mode you can start with `onboarding@resend.dev`, then switch to your verified domain later.

## Rules

1. Never use `next-auth`
2. Never use Supabase for DB queries
3. Never expose service role key
4. Auth logic stays server-side
5. Always use `getUser()` to verify auth — never trust `getSession()` alone
6. Use `requireUser()` in all protected routes (it handles getUser + getSession correctly)
