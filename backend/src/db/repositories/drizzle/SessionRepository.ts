/**
 * Session Repository - Drizzle Implementation
 *
 * Provides session-specific database operations
 */

import { eq } from 'drizzle-orm';
import {
  DrizzleBaseRepository,
  type DrizzleTransaction,
} from '../DrizzleBaseRepository.js';
import {
  sessions,
  posts,
  postGroups,
  columnDefinitions,
} from '../../schema/index.js';
import type {
  SessionOptions,
  Session as JsonSession,
  ColumnDefinition,
} from '../../../common/index.js';
import { getDrizzleConnection } from '../../connection.js';

export class DrizzleSessionRepository extends DrizzleBaseRepository<
  typeof sessions,
  typeof sessions.$inferSelect,
  typeof sessions.$inferInsert
> {
  constructor() {
    super(sessions);
  }

  /**
   * Update session options
   */
  async updateOptions(
    sessionId: string,
    options: SessionOptions,
    tx?: DrizzleTransaction,
  ): Promise<SessionOptions | null> {
    try {
      const db = this.getDb(tx);
      await db
        .update(sessions)
        .set({
          allowActions: options.allowActions,
          allowSelfVoting: options.allowSelfVoting,
          allowMultipleVotes: options.allowMultipleVotes,
          allowAuthorVisible: options.allowAuthorVisible,
          allowGiphy: options.allowGiphy,
          allowGrouping: options.allowGrouping,
          allowReordering: options.allowReordering,
          allowCancelVote: options.allowCancelVote,
          blurCards: options.blurCards,
          newPostsFirst: options.newPostsFirst,
          allowTimer: options.allowTimer,
          readonlyOnTimerEnd: options.readonlyOnTimerEnd,
          restrictTitleEditToModerator: options.restrictTitleEditToModerator,
          restrictReorderingToModerator: options.restrictReorderingToModerator,
          restrictGroupingToModerator: options.restrictGroupingToModerator,
          timerDuration: String(options.timerDuration),
          maxUpVotes:
            options.maxUpVotes !== null ? String(options.maxUpVotes) : null,
          maxDownVotes:
            options.maxDownVotes !== null ? String(options.maxDownVotes) : null,
          maxPosts: options.maxPosts !== null ? String(options.maxPosts) : null,
        })
        .where(eq(sessions.id, sessionId));
      return options;
    } catch {
      return null;
    }
  }

  /**
   * Update session name
   */
  async updateName(
    sessionId: string,
    name: string,
    tx?: DrizzleTransaction,
  ): Promise<boolean> {
    const db = this.getDb(tx);
    const session = await this.findById(sessionId, tx);
    if (session) {
      await db.update(sessions).set({ name }).where(eq(sessions.id, sessionId));
      return true;
    }
    return false;
  }

  /**
   * Save session from JSON format (used for templates and imports)
   */
  async saveFromJson(
    session: Omit<JsonSession, 'createdBy' | 'moderator'>,
    authorId: string,
    tx?: DrizzleTransaction,
  ): Promise<JsonSession> {
    const db = this.getDb(tx);

    // Prepare session data without posts and columns
    const sessionData = {
      id: session.id,
      name: session.name || 'Untitled Session',
      encrypted: session.encrypted || null,
      locked: session.locked || false,
      allowActions: session.options.allowActions,
      allowSelfVoting: session.options.allowSelfVoting,
      allowMultipleVotes: session.options.allowMultipleVotes,
      allowAuthorVisible: session.options.allowAuthorVisible,
      allowGiphy: session.options.allowGiphy,
      allowGrouping: session.options.allowGrouping,
      allowReordering: session.options.allowReordering,
      allowCancelVote: session.options.allowCancelVote,
      blurCards: session.options.blurCards,
      newPostsFirst: session.options.newPostsFirst,
      allowTimer: session.options.allowTimer,
      readonlyOnTimerEnd: session.options.readonlyOnTimerEnd,
      restrictTitleEditToModerator:
        session.options.restrictTitleEditToModerator,
      restrictReorderingToModerator:
        session.options.restrictReorderingToModerator,
      restrictGroupingToModerator: session.options.restrictGroupingToModerator,
      timerDuration: String(session.options.timerDuration),
      maxUpVotes:
        session.options.maxUpVotes !== null
          ? String(session.options.maxUpVotes)
          : null,
      maxDownVotes:
        session.options.maxDownVotes !== null
          ? String(session.options.maxDownVotes)
          : null,
      maxPosts:
        session.options.maxPosts !== null
          ? String(session.options.maxPosts)
          : null,
      createdById: authorId,
      moderatorId: authorId,
    };

    // Insert session
    const [createdSession] = await db
      .insert(sessions)
      .values(sessionData)
      .returning();

    // Insert columns
    if (session.columns && session.columns.length > 0) {
      const columnsData = session.columns.map((col, index) => ({
        id: col.id,
        sessionId: session.id,
        type: col.type,
        label: col.label || '',
        color: col.color || '#000000',
        icon: col.icon || null,
        index: col.index ?? index,
      }));

      await db.insert(columnDefinitions).values(columnsData);
    }

    // Convert back to JSON format
    return this.toJson(createdSession);
  }

  /**
   * Convert database session to JSON format
   */
  private toJson(session: typeof sessions.$inferSelect): JsonSession {
    return {
      id: session.id,
      name: session.name || 'Untitled Session',
      posts: [],
      columns: [],
      createdBy: { id: session.createdById, name: '', photo: null, email: '' },
      moderator: { id: session.moderatorId, name: '', photo: null, email: '' },
      encrypted: session.encrypted || null,
      locked: session.locked || false,
      ready: session.ready || false,
      timer: session.timer,
      options: {
        allowActions: session.allowActions ?? true,
        allowSelfVoting: session.allowSelfVoting ?? false,
        allowMultipleVotes: session.allowMultipleVotes ?? false,
        allowAuthorVisible: session.allowAuthorVisible ?? false,
        allowGiphy: session.allowGiphy ?? true,
        allowGrouping: session.allowGrouping ?? true,
        allowReordering: session.allowReordering ?? true,
        allowCancelVote: session.allowCancelVote ?? true,
        restrictTitleEditToModerator:
          session.restrictTitleEditToModerator ?? false,
        restrictReorderingToModerator:
          session.restrictReorderingToModerator ?? false,
        restrictGroupingToModerator:
          session.restrictGroupingToModerator ?? false,
        blurCards: session.blurCards ?? false,
        newPostsFirst: session.newPostsFirst ?? false,
        allowTimer: session.allowTimer ?? false,
        timerDuration: session.timerDuration
          ? Number(session.timerDuration)
          : 900,
        readonlyOnTimerEnd: session.readonlyOnTimerEnd ?? false,
        maxUpVotes:
          session.maxUpVotes !== null ? Number(session.maxUpVotes) : null,
        maxDownVotes:
          session.maxDownVotes !== null ? Number(session.maxDownVotes) : null,
        maxPosts: session.maxPosts !== null ? Number(session.maxPosts) : null,
      },
      groups: [],
      messages: [],
      demo: session.demo || false,
    };
  }
}

// Export singleton instance
export const drizzleSessionRepository = new DrizzleSessionRepository();
