import { Post, PostGroup, Vote } from '@retrospected/common';
import { fi } from 'date-fns/locale';
import { PostEntity } from '../entities';
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
  post: Post
): Promise<Post | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    const entity = await postRepository.saveFromJson(sessionId, userId, post);
    if (entity) {
      return entity.toJson();
    }

    return null;
  });
}

export async function updatePost(
  sessionId: string,
  postData: Omit<Omit<Post, 'votes'>, 'user'>
): Promise<Post | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    const entity = (
      await postRepository.findOne(postData.id, {
        where: { session: { id: sessionId } },
      })
    )?.toJson();
    if (entity) {
      entity.content = postData.content;
      entity.action = postData.action;
      entity.giphy = postData.giphy;
      entity.column = postData.column;
      entity.group = postData.group;
      entity.rank = postData.rank;
      const persisted = await postRepository.updateFromJson(sessionId, entity);
      return persisted ? persisted.toJson() : null;
    }

    return null;
  });
}

export async function savePostGroup(
  userId: string,
  sessionId: string,
  group: PostGroup
): Promise<PostGroup | null> {
  return await transaction(async (manager) => {
    const postGroupRepository = manager.getCustomRepository(
      PostGroupRepository
    );
    const entity = await postGroupRepository.saveFromJson(
      sessionId,
      userId,
      group
    );
    if (entity) {
      return entity.toJson();
    }
    return null;
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
