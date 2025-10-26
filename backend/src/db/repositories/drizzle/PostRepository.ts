/**
 * Post Repository - Drizzle Implementation
 *
 * Provides post-specific database operations
 */

import { eq } from 'drizzle-orm';
import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import { posts, sessions } from '../../schema/index.js';
import type { Post as JsonPost } from '../../../common/index.js';
import { cloneDeep } from 'lodash-es';
import type { DeepPartial } from 'typeorm';

export class DrizzlePostRepository extends DrizzleBaseRepository<
  typeof posts,
  typeof posts.$inferSelect,
  typeof posts.$inferInsert
> {
  constructor() {
    super(posts);
  }

  /**
   * Update post from JSON format
   */
  async updateFromJson(
    sessionId: string,
    post: JsonPost,
    tx?: DrizzleTransaction,
  ): Promise<typeof posts.$inferSelect | undefined> {
    const db = this.getDb(tx);

    const postData = {
      id: post.id,
      content: post.content,
      action: post.action || null,
      giphy: post.giphy || null,
      rank: post.rank,
      sessionId,
      userId: post.user.id,
      groupId: post.group ? post.group.id : null,
    };

    // Check if post exists
    const existing = await this.findById(post.id, tx);
    if (existing) {
      return await this.update(post.id, postData, tx);
    }

    return await this.insert(postData, tx);
  }

  /**
   * Save new post from JSON format
   */
  async saveFromJson(
    sessionId: string,
    userId: string,
    post: DeepPartial<JsonPost>,
    tx?: DrizzleTransaction,
  ): Promise<typeof posts.$inferSelect | undefined> {
    const db = this.getDb(tx);

    // Check if session exists
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session.length) {
      return undefined;
    }

    const postData = {
      id: post.id || undefined,
      content: post.content || '',
      action: post.action || null,
      giphy: post.giphy || null,
      rank: post.rank || 'a0',
      sessionId,
      userId,
      groupId: post.group?.id || null,
    };

    return await this.insert(postData as any, tx);
  }
}

// Export singleton instance
export const drizzlePostRepository = new DrizzlePostRepository();
