import {
  pgTable,
  varchar,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessions } from './sessions.js';
import { postGroups } from './post-groups.js';
import { users } from './users.js';
import { votes } from './votes.js';

export const posts = pgTable(
  'posts',
  {
    id: varchar('id').primaryKey(),
    sessionId: varchar('session_id').notNull(),
    groupId: varchar('group_id'),
    column: integer('column').notNull().default(0),
    rank: varchar('rank').notNull(),
    content: varchar('content').notNull(),
    action: varchar('action'),
    giphy: varchar('giphy'),
    userId: varchar('user_id').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sessionIdx: index('posts_session_idx').on(table.sessionId),
    groupIdx: index('posts_group_idx').on(table.groupId),
    userIdx: index('posts_user_idx').on(table.userId),
    rankIdx: index('posts_rank_idx').on(table.rank),
  }),
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  session: one(sessions, {
    fields: [posts.sessionId],
    references: [sessions.id],
  }),
  group: one(postGroups, {
    fields: [posts.groupId],
    references: [postGroups.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  votes: many(votes),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
