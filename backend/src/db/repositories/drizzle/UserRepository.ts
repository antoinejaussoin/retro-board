/**
 * User Repository - Drizzle Implementation
 *
 * Provides user-specific database operations
 */

import { eq, sql } from 'drizzle-orm';
import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import { users, sessionTemplates } from '../../schema/index.js';
import type { User as JsonUser, FullUser } from '../../../common/index.js';
import { addDays } from 'date-fns';

export class DrizzleUserRepository extends DrizzleBaseRepository<
  typeof users,
  typeof users.$inferSelect,
  typeof users.$inferInsert
> {
  constructor() {
    super(users);
  }

  /**
   * Save user from JSON format
   */
  async saveFromJson(
    user: JsonUser,
    tx?: DrizzleTransaction,
  ): Promise<typeof users.$inferSelect> {
    const db = this.getDb(tx);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email || '',
      photo: user.photo || null,
    };

    // Check if user exists
    const existing = await this.findById(user.id, tx);
    if (existing) {
      return (await this.update(user.id, userData, tx))!;
    }

    return await this.insert(userData, tx);
  }

  /**
   * Persist default template for user
   */
  async persistTemplate(
    userId: string,
    templateId: string,
    tx?: DrizzleTransaction,
  ): Promise<void> {
    const db = this.getDb(tx);
    await db
      .update(users)
      .set({ defaultTemplateId: templateId })
      .where(eq(users.id, userId));
  }

  /**
   * Start trial period for user
   */
  async startTrial(
    user: FullUser,
    tx?: DrizzleTransaction,
  ): Promise<typeof users.$inferSelect | null> {
    const db = this.getDb(tx);

    const userEntity = await this.findById(user.id, tx);
    if (userEntity && !userEntity.trial && !user.pro) {
      const trialEnd = addDays(new Date(), 30);
      return (await this.update(user.id, { trial: trialEnd }, tx)) || null;
    }

    return null;
  }

  /**
   * Get IDs of all users who have been in the same sessions
   */
  async getRelatedUsersIds(
    userId: string,
    tx?: DrizzleTransaction,
  ): Promise<string[]> {
    const db = this.getDb(tx);

    const result: Array<{ id: string }> = await db
      .execute(sql`
      select distinct u2.id from users u
      left join visitors v on v.users_id = u.id
      left join sessions s on v.sessions_id = s.id
      left join visitors v2 on v2.sessions_id = s.id
      left join users u2 on v2.users_id = u2.id
      where 
        u.id = ${userId} and
        u2.email is not null
    `)
      .then((r) => r.rows as Array<{ id: string }>);

    return result.map((i) => i.id);
  }
}

// Export singleton instance
export const drizzleUserRepository = new DrizzleUserRepository();
