# Product Requirements

## Vision

Multi-tenant foundation for building SaaS applications with isolated workspaces.

## Core Concepts

### Tenant
Isolated workspace that owns all data. Primary boundary for access control.

### User
Authenticated person. Can belong to multiple tenants. Access mediated through membership.

### Habit (Example Entity)
Core business entity inside a tenant. Represents a trackable daily habit.

## MVP Scope

### Included
- User authentication (Supabase)
- Tenant membership
- Habit CRUD (example feature)
- Data isolation via RLS

### Excluded
- Billing
- Advanced roles
- Audit logs
- Real-time collaboration

## User Flows

### Authentication
1. User signs up → auto-creates personal tenant
2. User logs in → accesses their tenants

### Tenant
1. User sees list of their tenants
2. User switches active tenant
3. Data filtered by active tenant

### Habits
1. Create habit in active tenant
2. View habit list
3. Update/delete habit

## Success Criteria

- No data leakage between tenants
- Simple, predictable flows
- Extensible architecture
