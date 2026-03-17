import type { DeepPartial } from 'typeorm';
import type { Post, PostGroup, Vote } from '../../common/index.js';
import {
  PostRepository,
  PostGroupRepository,
  VoteRepository,
  SessionRepository,
} from '../repositories/index.js';
import { transaction } from './transaction.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import {
  drizzlePostRepository,
  postsRepository,
  postGroupsRepository,
  votesRepository,
  sessionsRepository,
  visitorsRepository,
  drizzlePostGroupRepository,
  drizzleVoteRepository,
} from '../repositories/drizzle/index.js';
import * as schema from '../schema/index.js';
import { eq, and } from 'drizzle-orm';

export async function getNumberOfPosts(userId: string): Promise<number> {
  return await drizzleTransaction(async (tx) => {
    return await postsRepository.count(eq(schema.posts.userId, userId), tx);
  });
}

export async function savePost(
  userId: string,
  sessionId: string,
  post: DeepPartial<Post>,
): Promise<Post | null> {
  return await drizzleTransaction(async (tx) => {
    const entity = await drizzlePostRepository.saveFromJson(
      sessionId,
      userId,
      post,
      tx,
    );
    if (entity) {
      return entity as unknown as Post;
    }
    return null;
  });
}

export async function updatePost(
  sessionId: string,
  postData: Omit<Omit<Omit<Post, 'votes'>, 'user'>, 'group'>,
  groupId: string | null,
): Promise<Post | null> {
  return await drizzleTransaction(async (tx) => {
    const existing = await postsRepository.findById(postData.id, tx);
    if (existing) {
      const updatedPost = {
        id: existing.id,
        content: postData.content,
        action: postData.action,
        giphy: postData.giphy,
        column: postData.column,
        rank: postData.rank,
        user: { id: existing.userId } as any,
        group: groupId ? { id: groupId } : null,
        votes: [],
        created: existing.created,
        updated: new Date(),
      } as unknown as Post;
      const result = await drizzlePostRepository.updateFromJson(
        sessionId,
        updatedPost as unknown as Post,
        tx,
      );
      return result as unknown as Post;
    }
    return null;
  });
}

export async function savePostGroup(
  userId: string,
  sessionId: string,
  group: PostGroup,
): Promise<PostGroup | null> {
  return await drizzleTransaction(async (tx) => {
    const entity = await drizzlePostGroupRepository.saveFromJson(
      sessionId,
      userId,
      group,
      tx,
    );
    if (entity) {
      return entity as unknown as PostGroup;
    }
    return null;
  });
}

export async function updatePostGroup(
  userId: string,
  sessionId: string,
  groupData: Omit<Omit<PostGroup, 'user'>, 'posts'>,
) {
  return await drizzleTransaction(async (tx) => {
    const existing = await postGroupsRepository.findById(groupData.id, tx);
    if (existing) {
      const updatedGroup = {
        id: existing.id,
        label: groupData.label,
        column: groupData.column,
        rank: groupData.rank,
        user: { id: existing.userId } as any,
        posts: [],
      } as unknown as PostGroup;
      const result = await drizzlePostGroupRepository.saveFromJson(
        sessionId,
        userId,
        updatedGroup,
        tx,
      );
      return result as unknown as PostGroup;
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
  return await drizzleTransaction(async (tx) => {
    await drizzleVoteRepository.saveFromJson(postId, userId, vote, tx);
  });
}

export async function deletePost(
  userId: string,
  _: string,
  postId: string,
): Promise<boolean> {
  return await drizzleTransaction(async (tx) => {
    try {
      const deleted = await postsRepository.deleteWhere(
        and(eq(schema.posts.id, postId), eq(schema.posts.userId, userId)),
        tx,
      );
      return deleted.length > 0;
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
  return await drizzleTransaction(async (tx) => {
    try {
      // Check if user is a visitor of the session
      const visitor = await visitorsRepository.findAll(
        and(
          eq(schema.visitors.sessionsId, sessionId),
          eq(schema.visitors.usersId, userId),
        ),
        tx,
      );
      if (visitor.length > 0) {
        const deleted = await postGroupsRepository.deleteWhere(
          eq(schema.postGroups.id, groupId),
          tx,
        );
        return deleted.length > 0;
      }
      console.error('The user is not a visitor, cannot delete group');
      return false;
    } catch {
      return false;
    }
  });
}
