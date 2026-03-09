# Tech Stack

## Core

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**

## Styling

- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **class-variance-authority**
- **tailwind-merge**

## State & Data

- **@tanstack/react-query** — server state
- **Zustand** — client state
- **react-hook-form** + **Zod** — forms

## Database

- **PostgreSQL** (Supabase)
- **Drizzle ORM**
- **pg** driver

## Authentication

- **Supabase Auth**
- **@supabase/ssr**

## UI Libraries

- **lucide-react** — icons
- **framer-motion** — animations
- **@dnd-kit** — drag & drop
- **cmdk** — command menu
- **react-day-picker** — date picker

## Rules

### Server Components
- Default for all pages
- Data fetching in RSC
- Client Components only when needed

### Database Access
```
requireUser() → withAuthDb(jwt) → Drizzle → PostgreSQL + RLS
```

### State Management
- Server data → React Query
- UI state → Zustand
- Forms → react-hook-form + Zod

### Multi-tenancy
- Shared-schema model
- `tenant_id` on all business tables
- RLS enforces isolation
