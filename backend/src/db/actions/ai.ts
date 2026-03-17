import type UserView from '../entities/UserView.js';
import AiChatEntity from '../entities/AiChat.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { sql } from 'drizzle-orm';
import { getUser } from './users.js';
import type { CoachMessage, CoachRole } from 'common/types.js';
import { v4 } from 'uuid';
import { addDays } from 'date-fns';
import config from '../../config.js';

export async function getAiChatSession(
  id: string,
  userView: UserView,
  systemMessage: CoachMessage,
): Promise<AiChatEntity> {
  return await drizzleTransaction(async (db) => {
    // Check if chat exists
    const chatResult = await db.execute(
      sql`SELECT id, created_by_id, created, updated FROM ai_chat WHERE id = ${id}`,
    );
    const existingChat = chatResult.rows[0];
    if (existingChat) {
      // Reconstruct the entity (simplified)
      const user = await getUser(existingChat.created_by_id as string);
      if (user) {
        const chat = new AiChatEntity(existingChat.id as string, user);
        chat.created = new Date(existingChat.created as string);
        chat.updated = new Date(existingChat.updated as string);
        return chat;
      }
    }

    const user = await getUser(userView.id);
    if (user && systemMessage.content) {
      // Create new chat
      await db.execute(
        sql`INSERT INTO ai_chat (id, created_by_id, created, updated) VALUES (${id}, ${user.id}, NOW(), NOW())`,
      );

      // Add system message
      const messageId = v4();
      await db.execute(
        sql`INSERT INTO ai_chat_messages (id, chat_id, content, role, created, updated) VALUES (${messageId}, ${id}, ${systemMessage.content}, ${systemMessage.role}, NOW(), NOW())`,
      );

      // Return the new chat (simplified, in practice you'd fetch it back)
      const newChat = new AiChatEntity(id, user);
      newChat.created = new Date();
      newChat.updated = new Date();
      return newChat;
    }

    throw Error('Could not persist a chat session');
  });
}

export async function recordAiChatMessage(
  role: CoachRole,
  content: string | undefined,
  chat: AiChatEntity,
): Promise<void> {
  if (!content) {
    return;
  }
  return await drizzleTransaction(async (db) => {
    const messageId = v4();
    await db.execute(
      sql`INSERT INTO ai_chat_messages (id, chat_id, content, role, created, updated) VALUES (${messageId}, ${chat.id}, ${content}, ${role}, NOW(), NOW())`,
    );
  });
}

export async function getAllowance(user: UserView) {
  return await drizzleTransaction(async (db) => {
    const thirtyDaysAgo = addDays(new Date(), -30);
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM ai_chat_messages WHERE role = 'user' AND chat_id IN (SELECT id FROM ai_chat WHERE created >= ${thirtyDaysAgo.toISOString()} AND created_by_id = ${user.id})`,
    );
    const count = Number.parseInt(result.rows[0].count as string, 10);
    const allowance = user.pro
      ? config.OPEN_AI_PAID_LIMIT
      : config.OPEN_AI_FREE_LIMIT;

    return count / allowance;
  });
}
