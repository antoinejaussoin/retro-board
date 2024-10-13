import type { DeepPartial } from 'typeorm';
import type { Post, PostGroup, Vote } from '../../common/index.js';
import {
  PostRepository,
  PostGroupRepository,
  VoteRepository,
  SessionRepository,
} from '../repositories/index.js';
import { transaction } from './transaction.js';

export async function getNumberOfPosts(userId: string): Promise<number> {
  return await transaction(async (manager) => {
    const postRepository = manager.withRepository(PostRepository);
    return await postRepository.count({ where: { user: { id: userId } } });
  });
}

export async function savePost(
  userId: string,
  sessionId: string,
  post: DeepPartial<Post>,
): Promise<Post | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.withRepository(PostRepository);
    const entity = await postRepository.saveFromJson(sessionId, userId, post);
    if (entity) {
      return entity.toJson();
    }

    return null;
  });
}

export async function updatePost(
  sessionId: string,
  postData: Omit<Omit<Omit<Post, 'votes'>, 'user'>, 'group'>,
  groupId: string | null,
): Promise<Post | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.withRepository(PostRepository);
    const entity = await postRepository.findOne({
      where: {
        id: postData.id,
        session: { id: sessionId },
      },
    });
    if (entity) {
      const post = entity.toJson();
      post.content = postData.content;
      post.action = postData.action;
      post.giphy = postData.giphy;
      post.column = postData.column;
      post.group = (groupId ? { id: groupId } : null) as PostGroup;
      post.rank = postData.rank;
      const persisted = await postRepository.updateFromJson(sessionId, post);
      return persisted ? persisted.toJson() : null;
    }

    return null;
  });
}

export async function savePostGroup(
  userId: string,
  sessionId: string,
  group: PostGroup,
): Promise<PostGroup | null> {
  return await transaction(async (manager) => {
    const postGroupRepository = manager.withRepository(PostGroupRepository);
    const entity = await postGroupRepository.saveFromJson(
      sessionId,
      userId,
      group,
    );
    if (entity) {
      return entity.toJson();
    }
    return null;
  });
}

export async function updatePostGroup(
  userId: string,
  sessionId: string,
  groupData: Omit<Omit<PostGroup, 'user'>, 'posts'>,
) {
  return await transaction(async (manager) => {
    const postGroupRepository = manager.withRepository(PostGroupRepository);
    const entity = await postGroupRepository.findOne({
      where: { id: groupData.id, session: { id: sessionId } },
    });
    if (entity) {
      const group = entity.toJson();
      group.column = groupData.column;
      group.label = groupData.label;
      group.rank = groupData.rank;
      const persisted = await postGroupRepository.saveFromJson(
        sessionId,
        userId,
        group,
      );
      return persisted ? persisted.toJson() : null;
    }

    return null;
  });
}

export async function saveVote(
  userId: string,
  _: string,
  postId: string,
  vote: Vote,
): Promise<void> {
  return await transaction(async (manager) => {
    const voteRepository = manager.withRepository(VoteRepository);
    await voteRepository.saveFromJson(postId, userId, vote);
  });
}

export async function deletePost(
  userId: string,
  _: string,
  postId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    try {
      const postRepository = manager.withRepository(PostRepository);
      const result = await postRepository.delete({
        id: postId,
        user: { id: userId },
      });
      return !!result.affected;
    } catch {
      return false;
    }
  });
}

export async function deletePostGroup(
  userId: string,
  sessionId: string,
  groupId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    try {
      const postGroupRepository = manager.withRepository(PostGroupRepository);
      const sessionRepository = manager.withRepository(SessionRepository);
      const session = await sessionRepository.findOne({
        where: { id: sessionId },
        relations: ['visitors'],
      });
      if (session?.visitors?.find((v) => v.id === userId)) {
        const result = await postGroupRepository.delete({ id: groupId });
        return !!result.affected;
      }
      console.error('The user is not a visitor, cannot delete group');
      return false;
    } catch {
      return false;
    }
  });
}
