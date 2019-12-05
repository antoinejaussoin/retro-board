import 'reflect-metadata';
import { createConnection } from 'typeorm';
import {
  SessionRepository,
  PostRepository,
  ColumnRepository,
  VoteRepository,
  UserRepository,
} from './repositories';
import {
  Session as JsonSession,
  Post as JsonPost,
  Vote as JsonVote,
  ColumnDefinition as JsonColumnDefintion,
  SessionOptions,
  defaultSession,
} from 'retro-board-common';
import { Store } from '../types';
import getOrmConfig from './orm-config';
import { User } from './entities';

export async function getDb() {
  const connection = await createConnection(getOrmConfig());
  return connection;
}

const create = (sessionRepository: SessionRepository) => async (
  id: string,
  options: SessionOptions,
  columns: JsonColumnDefintion[]
) => {
  try {
    const session = await sessionRepository.findOne({ id });
    if (!session) {
      await sessionRepository.saveFromJson({
        ...defaultSession,
        id,
        ...options,
        columns,
      });
    }
  } catch (err) {
    throw err;
  }
};

const get = (
  sessionRepository: SessionRepository,
  postRepository: PostRepository,
  columnRepository: ColumnRepository
) => async (sessionId: string): Promise<JsonSession> => {
  try {
    const session = await sessionRepository.findOne({ id: sessionId });
    if (session) {
      const posts = (await postRepository.find({
        where: { session },
        order: { created: 'ASC' },
      })) as JsonPost[];
      const columns = (await columnRepository.find({
        where: { session },
        order: { index: 'ASC' },
      })) as JsonColumnDefintion[];
      return {
        ...session,
        columns,
        posts,
      };
    } else {
      return {
        ...defaultSession,
        id: sessionId,
      };
    }
  } catch (err) {
    throw err;
  }
};

const saveSession = (sessionRepository: SessionRepository) => async (
  session: JsonSession
): Promise<void> => {
  await sessionRepository.saveFromJson(session);
};

const savePost = (postRepository: PostRepository) => async (
  sessionId: string,
  post: JsonPost
): Promise<void> => {
  await postRepository.saveFromJson(sessionId, post);
};

const saveVote = (voteRepository: VoteRepository) => async (
  sessionId: string,
  postId: string,
  vote: JsonVote
): Promise<void> => {
  await voteRepository.saveFromJson(postId, vote);
};

const deletePost = (postRepository: PostRepository) => async (
  _: string,
  postId: string
): Promise<void> => {
  await postRepository.delete({ id: postId });
};

const saveUser = (userRepository: UserRepository) => async (
  user: User
): Promise<void> => {
  await userRepository.saveFromJson(user);
};

export default async function db(): Promise<Store> {
  const connection = await getDb();
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const postRepository = connection.getCustomRepository(PostRepository);
  const columnRepository = connection.getCustomRepository(ColumnRepository);
  const voteRepository = connection.getCustomRepository(VoteRepository);
  const userRepository = connection.getCustomRepository(UserRepository);
  return {
    get: get(sessionRepository, postRepository, columnRepository),
    saveSession: saveSession(sessionRepository),
    savePost: savePost(postRepository),
    saveVote: saveVote(voteRepository),
    deletePost: deletePost(postRepository),
    saveUser: saveUser(userRepository),
    create: create(sessionRepository),
  };
}
