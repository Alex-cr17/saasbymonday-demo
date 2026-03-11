import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants';
import { users } from './users';

export const tenantRoleEnum = pgEnum('tenant_role', [
  'owner',
  'member',
]);

export const tenantUsers = pgTable('tenant_users', {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: tenantRoleEnum('role')
      .notNull()
      .default('member'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.tenantId, table.userId],
    }),
  }),
);