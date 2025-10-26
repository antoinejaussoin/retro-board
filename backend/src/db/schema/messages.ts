import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sessions } from './sessions.js';
import { users } from './users.js';

export const messages = pgTable(
  'messages',
  {
    id: varchar('id').primaryKey(),
    sessionId: varchar('session_id').notNull(),
    content: varchar('content').notNull(),
    userId: varchar('user_id').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sessionIdx: index('messages_session_idx').on(table.sessionId),
    userIdx: index('messages_user_idx').on(table.userId),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
