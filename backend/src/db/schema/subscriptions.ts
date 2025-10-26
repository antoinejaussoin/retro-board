import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  text,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: varchar('id').primaryKey(),
    active: boolean('active').notNull().default(false),
    plan: varchar('plan').notNull(),
    ownerId: varchar('owner_id').notNull(),
    domain: varchar('domain'),
    members: text('members').array().notNull().default([]),
    admins: text('admins').array().notNull().default([]),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerIdx: index('subscriptions_owner_idx').on(table.ownerId),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  owner: one(users, {
    fields: [subscriptions.ownerId],
    references: [users.id],
  }),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
