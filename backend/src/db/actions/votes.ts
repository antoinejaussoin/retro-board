import { Vote, VoteExtract, VoteType } from '../../common';
import { find } from 'lodash';
import { v4 } from 'uuid';
import {
  PostRepository,
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
): Promise<VoteExtract | null> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const userRepository = manager.getCustomRepository(UserRepository);
    const voteRepository = manager.getCustomRepository(VoteRepository);
    const postRepository = manager.getCustomRepository(PostRepository);
    const user = await userRepository.findOne(userId);
    const post = await postRepository.findOne(postId, {
      where: { session: { id: sessionId } },
    });
    const session = await sessionRepository.findOne(sessionId);
    if (post && session && user) {
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
