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

export async function cancelVotes(
  userId: string,
  sessionId: string,
  postId: string,
): Promise<void> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const voteRepository = manager.withRepository(VoteRepository);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (session?.options.allowCancelVote) {
      await voteRepository.delete({
        user: { id: userId },
        post: { id: postId },
      });
    }
  });
}

export async function registerVote(
  userId: string,
  sessionId: string,
  postId: string,
  type: VoteType,
): Promise<VoteExtract | null> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const userRepository = manager.withRepository(UserRepository);
    const voteRepository = manager.withRepository(VoteRepository);
    const postRepository = manager.withRepository(PostRepository);
    const user = await userRepository.findOne({ where: { id: userId } });
    const post = await postRepository.findOne({
      where: { id: postId, session: { id: sessionId } },
    });
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (post && session && user) {
      const existingVote: Vote | undefined = find(
        post.votes,
        (v) => v.user.id === user.id && v.type === type,
      );

      if (session.options.allowMultipleVotes || !existingVote) {
        const vote: Vote = {
          id: v4(),
          user: user.toJson(),
          type,
        };
        await voteRepository.saveFromJson(postId, userId, vote);
        return {
          id: vote.id,
          userName: vote.user.name,
          userId: vote.user.id,
          type: vote.type,
        };
      }
    }
    return null;
  });
}
