import type { Message } from '../../common/index.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { sql } from 'drizzle-orm';
import { getUser } from './users.js';

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  message: Message,
): Promise<Message | null> {
  return await drizzleTransaction(async (db) => {
    // Check if session exists
    const sessionResult = await db.execute(
      sql`SELECT id FROM sessions WHERE id = ${sessionId}`,
    );
    if (sessionResult.rows.length === 0) {
      throw new Error('No session found');
    }

    // Insert the message
    await db.execute(
      sql`INSERT INTO messages (id, session_id, content, user_id, created, updated) VALUES (${message.id}, ${sessionId}, ${message.content}, ${userId}, NOW(), NOW())`,
    );

    // Return the message with user data
    const user = await getUser(userId);
    if (user) {
      return {
        id: message.id,
        content: message.content,
        user: user.toJson(),
        created: new Date(),
      };
    }

    return null;
  });
}
