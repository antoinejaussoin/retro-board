import {
  pgTable,
  varchar,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessions } from './sessions.js';
import { posts } from './posts.js';
import { users } from './users.js';

export const postGroups = pgTable(
  'groups',
  {
    id: varchar('id').primaryKey(),
    sessionId: varchar('session_id').notNull(),
    column: integer('column').notNull().default(0),
    rank: varchar('rank').notNull(),
    label: varchar('label').notNull(),
    userId: varchar('user_id').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sessionIdx: index('groups_session_idx').on(table.sessionId),
    userIdx: index('groups_user_idx').on(table.userId),
    rankIdx: index('groups_rank_idx').on(table.rank),
  }),
);

export const postGroupsRelations = relations(postGroups, ({ one, many }) => ({
  session: one(sessions, {
    fields: [postGroups.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [postGroups.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export type PostGroup = typeof postGroups.$inferSelect;
export type NewPostGroup = typeof postGroups.$inferInsert;
