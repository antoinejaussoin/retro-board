import { addSeconds } from 'date-fns';
import { drizzleTransaction } from '../drizzle-transaction.js';
import { sql } from 'drizzle-orm';

export async function startTimer(sessionId: string): Promise<number> {
  return await drizzleTransaction(async (db) => {
    // Get session options to find timer duration
    const sessionResult = await db.execute(
      sql`SELECT options FROM sessions WHERE id = ${sessionId}`,
    );
    const session = sessionResult.rows[0];
    if (!session) {
      throw new Error('Session not found');
    }
    const options = session.options as any; // Assuming options is JSON
    const duration = options.timerDuration;
    const timerEnd = addSeconds(new Date(), duration);
    await db.execute(
      sql`UPDATE sessions SET timer = ${timerEnd.toISOString()}, updated = NOW() WHERE id = ${sessionId}`,
    );

    return duration;
  });
}

export async function stopTimer(sessionId: string): Promise<void> {
  return await drizzleTransaction(async (db) => {
    await db.execute(
      sql`UPDATE sessions SET timer = NULL, updated = NOW() WHERE id = ${sessionId}`,
    );
  });
}
