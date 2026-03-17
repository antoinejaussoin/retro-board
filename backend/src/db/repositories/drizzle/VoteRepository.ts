/**
 * Vote Repository - Drizzle Implementation
 *
 * Provides vote-specific database operations
 */

import { eq } from 'drizzle-orm';
import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import { votes } from '../../schema/index.js';
import type { Vote as JsonVote } from '../../../common/index.js';

export class DrizzleVoteRepository extends DrizzleBaseRepository<
  typeof votes,
  typeof votes.$inferSelect,
  typeof votes.$inferInsert
> {
  constructor() {
    super(votes);
  }

  /**
   * Save vote from JSON format
   */
  async saveFromJson(
    postId: string,
    userId: string,
    vote: JsonVote,
    tx?: DrizzleTransaction,
  ): Promise<typeof votes.$inferSelect> {
    const db = this.getDb(tx);

    const voteData = {
      id: vote.id,
      type: vote.type,
      postId,
      userId,
    };

    return await this.insert(voteData, tx);
  }
}

export const drizzleVoteRepository = new DrizzleVoteRepository();
