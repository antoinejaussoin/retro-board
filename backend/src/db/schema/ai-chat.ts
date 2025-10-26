import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { aiChatMessages } from './ai-chat-messages.js';

export const aiChat = pgTable(
  'ai_chat',
  {
    id: varchar('id').primaryKey(),
    createdById: varchar('created_by_id').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdByIdx: index('ai_chat_created_by_idx').on(table.createdById),
  }),
);

export const aiChatRelations = relations(aiChat, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [aiChat.createdById],
    references: [users.id],
  }),
  messages: many(aiChatMessages),
}));

export type AiChat = typeof aiChat.$inferSelect;
export type NewAiChat = typeof aiChat.$inferInsert;
