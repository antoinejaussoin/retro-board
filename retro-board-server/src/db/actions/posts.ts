import { Post, PostGroup, Vote } from '@retrospected/common';
import {
  PostRepository,
  PostGroupRepository,
  VoteRepository,
  SessionRepository,
} from '../repositories';
import { transaction } from './transaction';

export async function getNumberOfPosts(userId: string): Promise<number> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    return await postRepository.count({ where: { user: { id: userId } } });
  });
}

export async function savePost(
  userId: string,
  sessionId: string,
  post: Post,
  update: boolean
): Promise<Post | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    if (update) {
      const entity = await postRepository.updateFromJson(sessionId, post);
      if (entity) {
        return entity.toJson();
      }
    } else {
      const entity = await postRepository.saveFromJson(sessionId, userId, post);
      if (entity) {
        return entity.toJson();
      }
    }
    return null;
  });
}

export async function savePostGroup(
  userId: string,
  sessionId: string,
  group: PostGroup
): Promise<void> {
  return await transaction(async (manager) => {
    const postGroupRepository = manager.getCustomRepository(
      PostGroupRepository
    );
    await postGroupRepository.saveFromJson(sessionId, userId, group);
  });
}

export async function saveVote(
  userId: string,
  _: string,
  postId: string,
  vote: Vote
): Promise<void> {
  return await transaction(async (manager) => {
    const voteRepository = manager.getCustomRepository(VoteRepository);
    await voteRepository.saveFromJson(postId, userId, vote);
  });
}

export async function deletePost(
  userId: string,
  _: string,
  postId: string
): Promise<void> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    await postRepository.delete({ id: postId, user: { id: userId } });
  });
}

export async function deletePostGroup(
  userId: string,
  sessionId: string,
  groupId: string
): Promise<void> {
  return await transaction(async (manager) => {
    const postGroupRepository = manager.getCustomRepository(
      PostGroupRepository
    );
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const session = await sessionRepository.findOne(sessionId, {
      relations: ['visitors'],
    });
    if (
      session &&
      session.visitors &&
      session.visitors.find((v) => v.id === userId)
    ) {
      await postGroupRepository.delete({ id: groupId });
    } else {
      console.error('The user is not a visitor, cannot delete group');
    }
  });
}
