import { Post, PostGroup, Vote } from '@retrospected/common';
import { Connection } from 'typeorm';
import {
  PostRepository,
  PostGroupRepository,
  VoteRepository,
} from '../repositories';

export async function savePost(
  connection: Connection,
  userId: string,
  sessionId: string,
  post: Post
): Promise<void> {
  const postRepository = connection.getCustomRepository(PostRepository);
  await postRepository.saveFromJson(sessionId, userId, post);
}

export async function savePostGroup(
  connection: Connection,
  userId: string,
  sessionId: string,
  group: PostGroup
): Promise<void> {
  const postGroupRepository = connection.getCustomRepository(
    PostGroupRepository
  );
  await postGroupRepository.saveFromJson(sessionId, userId, group);
}

export async function saveVote(
  connection: Connection,
  userId: string,
  sessionId: string,
  postId: string,
  vote: Vote
): Promise<void> {
  const voteRepository = connection.getCustomRepository(VoteRepository);
  await voteRepository.saveFromJson(postId, userId, vote);
}

export async function deletePost(
  connection: Connection,
  userId: string,
  _: string,
  postId: string
): Promise<void> {
  const postRepository = connection.getCustomRepository(PostRepository);
  await postRepository.delete({ id: postId, user: { id: userId } });
}

export async function deletePostGroup(
  connection: Connection,
  userId: string,
  _: string,
  groupId: string
): Promise<void> {
  const postGroupRepository = connection.getCustomRepository(
    PostGroupRepository
  );
  await postGroupRepository.delete({ id: groupId, user: { id: userId } });
}
