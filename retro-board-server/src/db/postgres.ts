import 'reflect-metadata';
import { flattenDeep, uniqBy } from 'lodash';
import { createConnection, Connection } from 'typeorm';
import {
  SessionRepository,
  PostRepository,
  PostGroupRepository,
  ColumnRepository,
  VoteRepository,
  UserRepository,
  SessionTemplateRepository,
} from './repositories';
import {
  Session as JsonSession,
  Post as JsonPost,
  PostGroup as JsonPostGroup,
  Vote as JsonVote,
  User as JsonUser,
  ColumnDefinition as JsonColumnDefintion,
  SessionMetadata as JsonSessionMetadata,
  SessionOptions,
  defaultSession,
  VoteType,
} from 'retro-board-common';
import { Store } from '../types';
import getOrmConfig from './orm-config';
import shortId from 'shortid';
import { v4 } from 'uuid';
import { SessionTemplate, Session } from './entities';

export async function getDb() {
  const connection = await createConnection(getOrmConfig());
  return connection;
}

const create = (
  sessionRepository: SessionRepository,
  userRepository: UserRepository
) => async (author: JsonUser): Promise<JsonSession> => {
  try {
    const id = shortId();
    const userWithDefaultTemplate = await userRepository.findOne(
      { id: author.id },
      { relations: ['defaultTemplate', 'defaultTemplate.columns'] }
    );
    if (userWithDefaultTemplate?.defaultTemplate) {
      const template = userWithDefaultTemplate.defaultTemplate;
      const newSession = await sessionRepository.saveFromJson(
        {
          ...defaultSession,
          id,
          options: { ...template.options },
          columns: template.columns!.map(
            (c) =>
              ({
                ...c,
                id: v4(),
                author: { id: author.id },
              } as JsonColumnDefintion)
          ),
        },
        author.id
      );
      return newSession;
    } else {
      const newSession = await sessionRepository.saveFromJson(
        {
          ...defaultSession,
          columns: defaultSession.columns.map((c) => ({
            ...c,
            id: v4(),
          })),
          id,
        },
        author.id
      );
      return newSession;
    }
  } catch (err) {
    throw err;
  }
};

const createCustom = (
  sessionRepository: SessionRepository,
  templateRepository: SessionTemplateRepository,
  userRepository: UserRepository
) => async (
  options: SessionOptions,
  columns: JsonColumnDefintion[],
  setDefault: boolean,
  author: JsonUser
): Promise<JsonSession> => {
  console.log('Columns: ', columns.length);
  try {
    const id = shortId();
    const session = await sessionRepository.findOne({ id });
    if (!session) {
      const newSession = await sessionRepository.saveFromJson(
        {
          ...defaultSession,
          id,
          options,
          columns,
        },
        author.id
      );

      if (setDefault) {
        const defaultTemplate = await templateRepository.saveFromJson(
          'Default Template',
          columns,
          options,
          author.id
        );
        await userRepository.persistTemplate(author.id, defaultTemplate.id);
      }

      return newSession;
    }
  } catch (err) {
    throw err;
  }
  throw Error('The session already exists');
};

const getSession = (
  sessionRepository: SessionRepository,
  postRepository: PostRepository,
  postGroupRepository: PostGroupRepository,
  columnRepository: ColumnRepository
) => async (
  _: string | null,
  sessionId: string
): Promise<JsonSession | null> => {
  try {
    const session = await sessionRepository.findOne({ id: sessionId });
    if (session) {
      const posts = (await postRepository.find({
        where: { session },
        order: { created: 'ASC' },
      })) as JsonPost[];
      const groups = (await postGroupRepository.find({
        where: { session },
        order: { created: 'ASC' },
      })) as JsonPostGroup[];
      const columns = (await columnRepository.find({
        where: { session },
        order: { index: 'ASC' },
      })) as JsonColumnDefintion[];
      return {
        ...session,
        columns,
        posts,
        groups,
      };
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
};

const getUser = (userRepository: UserRepository) => async (
  id: string
): Promise<JsonUser | null> => {
  const user = await userRepository.findOne(id);
  return user || null;
};

const getDefaultTemplate = (userRepository: UserRepository) => async (
  id: string
): Promise<SessionTemplate | null> => {
  const userWithDefaultTemplate = await userRepository.findOne(
    { id },
    { relations: ['defaultTemplate', 'defaultTemplate.columns'] }
  );
  return userWithDefaultTemplate?.defaultTemplate || null;
};

const updateUser = (userRepository: UserRepository) => async (
  id: string,
  updatedUser: Partial<JsonUser>
): Promise<JsonUser | null> => {
  const user = await userRepository.findOne(id);
  if (user) {
    await userRepository.update(id, updatedUser);
    const newUser = await userRepository.findOne(id);
    return newUser || null;
  }
  return null;
};

const saveSession = (sessionRepository: SessionRepository) => async (
  userId: string,
  session: JsonSession
): Promise<void> => {
  await sessionRepository.saveFromJson(session, userId);
};

const savePost = (postRepository: PostRepository) => async (
  userId: string,
  sessionId: string,
  post: JsonPost
): Promise<void> => {
  await postRepository.saveFromJson(sessionId, userId, post);
};

const savePostGroup = (postGroupRepository: PostGroupRepository) => async (
  userId: string,
  sessionId: string,
  group: JsonPostGroup
): Promise<void> => {
  await postGroupRepository.saveFromJson(sessionId, userId, group);
};

const saveVote = (voteRepository: VoteRepository) => async (
  userId: string,
  sessionId: string,
  postId: string,
  vote: JsonVote
): Promise<void> => {
  await voteRepository.saveFromJson(postId, userId, vote);
};

const deletePost = (postRepository: PostRepository) => async (
  userId: string,
  _: string,
  postId: string
): Promise<void> => {
  await postRepository.delete({ id: postId, user: { id: userId } });
};

const deletePostGroup = (postGroupRepository: PostGroupRepository) => async (
  userId: string,
  _: string,
  groupId: string
): Promise<void> => {
  await postGroupRepository.delete({ id: groupId, user: { id: userId } });
};

const getOrSaveUser = (userRepository: UserRepository) => async (
  user: JsonUser
): Promise<JsonUser> => {
  const existingUser = await userRepository.findOne({
    where: { username: user.username, accountType: user.accountType },
  });
  if (existingUser) {
    return existingUser as JsonUser;
  }
  return await userRepository.saveFromJson(user);
};

const previousSessions = (sessionRepository: SessionRepository) => async (
  userId: string
): Promise<JsonSessionMetadata[]> => {
  const ids: number[] = await sessionRepository.query(
    `
  (
		select distinct id from sessions where "createdById" = $1
	)
	union
	(
		select distinct sessions.id from sessions 
		left join posts on sessions.id = posts."sessionId"
		where posts."userId" = $1
	)
	union
	(
		select distinct sessions.id from sessions 
		left join posts on sessions.id = posts."sessionId"
		left join votes on posts.id = votes."userId"
		where votes."userId" = $1
	)
  `,
    [userId]
  );

  const sessions = await sessionRepository.findByIds(ids, {
    relations: ['posts', 'posts.votes'],
    order: { created: 'DESC' },
  });

  return sessions.map(
    (session) =>
      ({
        created: session.created,
        createdBy: session.createdBy,
        id: session.id,
        name: session.name,
        numberOfNegativeVotes: numberOfVotes('dislike', session),
        numberOfPositiveVotes: numberOfVotes('like', session),
        numberOfPosts: session.posts?.length,
        numberOfActions: numberOfActions(session),
        participants: getParticipans(session),
      } as JsonSessionMetadata)
  );
};

function getParticipans(session: Session) {
  return uniqBy(
    [
      session.createdBy,
      ...session.posts!.map((p) => p.user),
      ...flattenDeep(session.posts!.map((p) => p.votes!.map((v) => v.user))),
    ].filter(Boolean),
    (u) => u.id
  );
}

function numberOfVotes(type: VoteType, session: Session) {
  return session.posts!.reduce<number>((prev, cur) => {
    return prev + cur.votes!.filter((v) => v.type === type).length;
  }, 0);
}

function numberOfActions(session: Session) {
  return session.posts!.filter((p) => p.action !== null).length;
}

export default async function db(): Promise<Store> {
  const connection = await getDb();
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const postRepository = connection.getCustomRepository(PostRepository);
  const postGroupRepository = connection.getCustomRepository(
    PostGroupRepository
  );
  const columnRepository = connection.getCustomRepository(ColumnRepository);
  const voteRepository = connection.getCustomRepository(VoteRepository);
  const userRepository = connection.getCustomRepository(UserRepository);
  const templateRepository = connection.getCustomRepository(
    SessionTemplateRepository
  );
  return {
    getSession: getSession(
      sessionRepository,
      postRepository,
      postGroupRepository,
      columnRepository
    ),
    getUser: getUser(userRepository),
    saveSession: saveSession(sessionRepository),
    savePost: savePost(postRepository),
    savePostGroup: savePostGroup(postGroupRepository),
    saveVote: saveVote(voteRepository),
    deletePost: deletePost(postRepository),
    deletePostGroup: deletePostGroup(postGroupRepository),
    getOrSaveUser: getOrSaveUser(userRepository),
    updateUser: updateUser(userRepository),
    create: create(sessionRepository, userRepository),
    createCustom: createCustom(
      sessionRepository,
      templateRepository,
      userRepository
    ),
    previousSessions: previousSessions(sessionRepository),
    getDefaultTemplate: getDefaultTemplate(userRepository),
  };
}
