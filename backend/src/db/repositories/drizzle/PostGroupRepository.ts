/**
 * PostGroup Repository - Drizzle Implementation
 *
 * Provides post group-specific database operations
 */

import { eq } from 'drizzle-orm';
import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import { postGroups } from '../../schema/index.js';
import type { PostGroup as JsonPostGroup } from '../../../common/index.js';

export class DrizzlePostGroupRepository extends DrizzleBaseRepository<
  typeof postGroups,
  typeof postGroups.$inferSelect,
  typeof postGroups.$inferInsert
> {
  constructor() {
    super(postGroups);
  }

  /**
   * Save post group from JSON format
   */
  async saveFromJson(
    sessionId: string,
    userId: string,
    group: JsonPostGroup,
    tx?: DrizzleTransaction,
  ): Promise<typeof postGroups.$inferSelect> {
    const db = this.getDb(tx);

    const groupData = {
      id: group.id,
      label: group.label,
      column: group.column,
      rank: group.rank,
      sessionId,
      userId,
    };

    return await this.insert(groupData, tx);
  }
}

export const drizzlePostGroupRepository = new DrizzlePostGroupRepository();
