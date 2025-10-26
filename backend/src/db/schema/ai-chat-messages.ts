import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { aiChat } from './ai-chat.js';

export const aiChatMessages = pgTable(
  'ai_chat_messages',
  {
    id: varchar('id').primaryKey(),
    chatId: varchar('chat_id').notNull(),
    role: varchar('role').notNull(),
    content: varchar('content').notNull(),
    created: timestamp('created', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp('updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    chatIdx: index('ai_chat_messages_chat_idx').on(table.chatId),
  }),
);

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  chat: one(aiChat, {
    fields: [aiChatMessages.chatId],
    references: [aiChat.id],
  }),
}));

export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type NewAiChatMessage = typeof aiChatMessages.$inferInsert;
