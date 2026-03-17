/**
 * Drizzle Transaction Wrapper
 *
 * Provides transaction support for Drizzle ORM queries
 */

import { db } from './drizzle.js';
import type { DrizzleDB } from './drizzle.js';

// Type for the transaction context
export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDB['transaction']>[0]
>[0];

// Type for the transaction callback
type TransactionCallback<T> = (tx: DrizzleTransaction) => Promise<T>;

/**
 * Execute a callback within a database transaction
 *
 * Usage:
 * ```typescript
 * const result = await drizzleTransaction(async (tx) => {
 *   const user = await tx.insert(users).values({...}).returning();
 *   const session = await tx.insert(sessions).values({...}).returning();
 *   return { user, session };
 * });
 * ```
 */
export async function drizzleTransaction<T>(
  cb: TransactionCallback<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    return cb(tx);
  });
}

/**
 * Execute a callback with the database (non-transactional)
 *
 * This is useful for queries that don't need transactions
 */
export async function withDb<T>(cb: (db: DrizzleDB) => Promise<T>): Promise<T> {
  return cb(db);
}

// Export the db instance for direct use
export { db as drizzleDb };
