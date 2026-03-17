/**
 * SessionTemplate Repository - Drizzle Implementation
 *
 * Provides session template-specific database operations
 */

import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import { sessionTemplates } from '../../schema/index.js';
import type {
  ColumnDefinition,
  SessionOptions,
} from '../../../common/index.js';

export class DrizzleSessionTemplateRepository extends DrizzleBaseRepository<
  typeof sessionTemplates,
  typeof sessionTemplates.$inferSelect,
  typeof sessionTemplates.$inferInsert
> {
  constructor() {
    super(sessionTemplates);
  }

  /**
   * Save session template from JSON format
   */
  async saveFromJson(
    name: string,
    columns: ColumnDefinition[],
    options: SessionOptions,
    userId: string,
    tx?: DrizzleTransaction,
  ): Promise<typeof sessionTemplates.$inferSelect> {
    const db = this.getDb(tx);

    const templateData = {
      id: `template_${Date.now()}`,
      name,
      createdById: userId,
      maxUpVotes: options.maxUpVotes?.toString(),
      maxDownVotes: options.maxDownVotes?.toString(),
      maxPosts: options.maxPosts?.toString(),
      allowActions: options.allowActions,
      allowSelfVoting: options.allowSelfVoting,
      allowMultipleVotes: options.allowMultipleVotes,
      allowAuthorVisible: options.allowAuthorVisible,
      allowGiphy: options.allowGiphy,
      allowGrouping: options.allowGrouping,
      allowReordering: options.allowReordering,
      allowCancelVote: options.allowCancelVote,
      allowTimer: options.allowTimer,
      restrictTitleEditToModerator: options.restrictTitleEditToModerator,
      restrictReorderingToModerator: options.restrictReorderingToModerator,
      restrictGroupingToModerator: options.restrictGroupingToModerator,
      timerDuration: options.timerDuration?.toString(),
      readonlyOnTimerEnd: options.readonlyOnTimerEnd,
      blurCards: options.blurCards,
      newPostsFirst: options.newPostsFirst,
    };

    const template = await this.insert(templateData, tx);

    // Note: columns are not inserted here, as the original may handle them separately

    return template;
  }
}

export const drizzleSessionTemplateRepository =
  new DrizzleSessionTemplateRepository();
