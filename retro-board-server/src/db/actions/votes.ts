import { Vote, VoteType } from '@retrospected/common';
import { find } from 'lodash';
import { v4 } from 'uuid';
import {
  SessionRepository,
  UserRepository,
  VoteRepository,
} from '../repositories';
import { transaction } from './transaction';

export async function registerVote(
  userId: string,
  sessionId: string,
  postId: string,
  type: VoteType
): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const userRepository = manager.getCustomRepository(UserRepository);
    const voteRepository = manager.getCustomRepository(VoteRepository);

    if (!userId) {
      return false;
    }
    const session = await sessionRepository.findOne(sessionId);
    if (!session) {
      return false;
    }
    const user = await userRepository.findOne(userId);
    const post = find(session.posts, (p) => p.id === postId);
    if (post && user) {
      const existingVote: Vote | undefined = find(
        post.votes,
        (v) => v.user.id === user.id && v.type === type
      );

      if (session.options.allowMultipleVotes || !existingVote) {
        const vote: Vote = {
          id: v4(),
          user: user.toJson(),
          type,
        };
        await voteRepository.saveFromJson(postId, userId, vote);
        return true;
      }
    }
    return false;
  });
}
