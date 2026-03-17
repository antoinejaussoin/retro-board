import type { Vote, VoteExtract, VoteType } from '../../common/index.js';
import { find } from 'lodash-es';
import { v4 } from 'uuid';
import {
  PostRepository,
  SessionRepository,
  UserRepository,
  VoteRepository,
} from '../repositories/index.js';
import { transaction } from './transaction.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import {
  sessionsRepository,
  usersRepository,
  postsRepository,
  drizzleVoteRepository,
} from '../repositories/drizzle/index.js';
import * as schema from '../schema/index.js';
import { eq, and } from 'drizzle-orm';

export async function cancelVotes(
  userId: string,
  sessionId: string,
  postId: string,
): Promise<void> {
  return await drizzleTransaction(async (tx) => {
    const session = await sessionsRepository.findById(sessionId, tx);
    if (session?.allowCancelVote) {
      await drizzleVoteRepository.deleteWhere(
        and(eq(schema.votes.userId, userId), eq(schema.votes.postId, postId)),
        tx,
      );
    }
  });
}

export async function registerVote(
  userId: string,
  sessionId: string,
  postId: string,
  type: VoteType,
): Promise<VoteExtract | null> {
  return await drizzleTransaction(async (tx) => {
    const user = await usersRepository.findById(userId, tx);
    const post = await postsRepository.findById(postId, tx);
    const session = await sessionsRepository.findById(sessionId, tx);
    if (post && session && user && post.sessionId === sessionId) {
      // Check existing vote
      const existingVotes = await drizzleVoteRepository.findAll(
        and(
          eq(schema.votes.postId, postId),
          eq(schema.votes.userId, userId),
          eq(schema.votes.type, type),
        ),
        tx,
      );

      if (session.allowMultipleVotes || existingVotes.length === 0) {
        const vote: Vote = {
          id: v4(),
          user: { id: user.id, name: user.name } as any,
          type,
        };
        await drizzleVoteRepository.saveFromJson(postId, userId, vote, tx);
        return {
          id: vote.id,
          userName: user.name,
          userId: user.id,
          type: vote.type,
        };
      }
    }
    return null;
  });
}
