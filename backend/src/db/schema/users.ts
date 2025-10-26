import {
  pgTable,
  varchar,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessions } from './sessions.js';
import { sessionTemplates } from './session-templates.js';

// Tracking columns embedded in users table
export const users = pgTable(
  'users',
  {
    id: varchar('id').primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email'),
    currency: varchar('currency'),
    photo: varchar('photo'),
    stripeId: varchar('stripe_id'),
    trial: timestamp('trial', { withTimezone: true }),
    quota: integer('quota').notNull().default(50),
    language: varchar('language'),
    defaultTemplateId: varchar('default_template_id'),
    slackUserId: varchar('slack_user_id'),
    slackTeamId: varchar('slack_team_id'),
    // Tracking fields
    campaignId: varchar('campaign_id'),
    creativeId: varchar('creative_id'),
    device: varchar('device'),
    keyword: varchar('keyword'),
    gclid: varchar('gclid'),
    trackedAt: timestamp('tracked_at', { withTimezone: true }),
    // Timestamps
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    nameIdx: index('users_name_idx').on(table.name),
    emailIdx: index('users_email_idx').on(table.email),
    defaultTemplateIdx: index('users_default_template_idx').on(
      table.defaultTemplateId,
    ),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  defaultTemplate: one(sessionTemplates, {
    fields: [users.defaultTemplateId],
    references: [sessionTemplates.id],
  }),
  identities: many(usersIdentities),
  createdSessions: many(sessions, { relationName: 'createdBy' }),
  moderatedSessions: many(sessions, { relationName: 'moderator' }),
  visitedSessions: many(visitors),
}));

// User identities table (for authentication)
export const usersIdentities = pgTable(
  'users_identities',
  {
    id: varchar('id').primaryKey(),
    userId: varchar('user_id').notNull(),
    accountType: varchar('account_type').notNull().default('anonymous'),
    username: varchar('username'),
    password: varchar('password'),
    emailVerification: varchar('email_verification'),
    photo: varchar('photo'),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index('users_identities_user_idx').on(table.userId),
    uniqueUsernameAccountType: index(
      'users_identities_username_account_type_idx',
    ).on(table.username, table.accountType),
  }),
);

export const usersIdentitiesRelations = relations(
  usersIdentities,
  ({ one }) => ({
    user: one(users, {
      fields: [usersIdentities.userId],
      references: [users.id],
    }),
  }),
);

// Visitors junction table (many-to-many between users and sessions)
export const visitors = pgTable(
  'visitors',
  {
    usersId: varchar('users_id').notNull(),
    sessionsId: varchar('sessions_id').notNull(),
  },
  (table) => ({
    usersIdx: index('visitors_users_idx').on(table.usersId),
    sessionsIdx: index('visitors_sessions_idx').on(table.sessionsId),
  }),
);

export const visitorsRelations = relations(visitors, ({ one }) => ({
  user: one(users, {
    fields: [visitors.usersId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [visitors.sessionsId],
    references: [sessions.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserIdentity = typeof usersIdentities.$inferSelect;
export type NewUserIdentity = typeof usersIdentities.$inferInsert;
