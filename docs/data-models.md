# Data Models

Source of truth: `lib/db/schema/*`

## Tables

### tenants
Isolated workspace/account.
```
id          uuid PK
name        text
created_at  timestamptz
```

### users
Authenticated identity (synced with auth.users).
```
id          uuid PK (= auth.users.id)
email       text
created_at  timestamptz
```

### tenant_users
Membership between users and tenants.
```
tenant_id   uuid FK → tenants.id
user_id     uuid FK → users.id
role        enum('owner', 'member')
created_at  timestamptz
PK(tenant_id, user_id)
```

## Relationships

- Tenant has many users (via tenant_users)
- User belongs to many tenants

## Authorization

- All enforced by PostgreSQL RLS
- See: `supabase/migrations/0000_quiet_angel.sql`

## Key RLS Policies

- Users can only see their own record
- Tenants visible only to members
- tenant_users: only owners can modify
