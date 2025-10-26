import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { posts } from './posts.js';
import { users } from './users.js';

export const votes = pgTable(
  'votes',
  {
    id: varchar('id').primaryKey(),
    userId: varchar('user_id').notNull(),
    postId: varchar('post_id').notNull(),
    type: varchar('type').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index('votes_user_idx').on(table.userId),
    postIdx: index('votes_post_idx').on(table.postId),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
}));

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
