import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';

export const licences = pgTable(
  'licences',
  {
    id: varchar('id').primaryKey(),
    email: varchar('email'),
    key: varchar('key').notNull(),
    stripeCustomerId: varchar('stripe_customer_id').notNull(),
    stripeSessionId: varchar('stripe_session_id').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index('licences_email_idx').on(table.email),
  }),
);

export type Licence = typeof licences.$inferSelect;
export type NewLicence = typeof licences.$inferInsert;
