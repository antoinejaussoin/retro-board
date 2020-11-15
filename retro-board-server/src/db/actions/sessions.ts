import {
  UserEntity,
  PostEntity,
  PostGroupEntity,
  ColumnDefinitionEntity,
  SessionEntity,
  SessionTemplateEntity,
} from '../entities';
import {
  Session,
  defaultSession,
  ColumnDefinition,
  SessionOptions,
  SessionMetadata,
  VoteType,
  User,
} from 'retro-board-common';
import shortId from 'shortid';
import { v4 } from 'uuid';
import { Connection } from 'typeorm';
import {
  UserRepository,
  SessionRepository,
  SessionTemplateRepository,
  PostRepository,
  PostGroupRepository,
  ColumnRepository,
} from '../repositories';
import { orderBy } from 'lodash';

export async function createSession(
  connection: Connection,
  author: UserEntity,
  encryptionCheck?: string
): Promise<Session> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const sessionRepository = connection.getCustomRepository(SessionRepository);
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
          encrypted: encryptionCheck || null,
          options: { ...template.options },
          columns: template.columns!.map(
            (c) =>
              ({
                ...c,
                id: v4(),
                author: { id: author.id },
              } as ColumnDefinition)
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
          encrypted: encryptionCheck || null,
        },
        author.id
      );
      return newSession;
    }
  } catch (err) {
    throw err;
  }
}

export async function createCustom(
  connection: Connection,
  options: SessionOptions,
  columns: ColumnDefinition[],
  setDefault: boolean,
  author: UserEntity
): Promise<Session> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const templateRepository = connection.getCustomRepository(
    SessionTemplateRepository
  );
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
}

export async function getSession(
  connection: Connection,
  sessionId: string
): Promise<Session | null> {
  const postRepository = connection.getCustomRepository(PostRepository);
  const postGroupRepository = connection.getCustomRepository(
    PostGroupRepository
  );
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const columnRepository = connection.getCustomRepository(ColumnRepository);

  try {
    const session = await sessionRepository.findOne({ id: sessionId });
    if (session) {
      const posts = (await postRepository.find({
        where: { session },
        order: { created: 'ASC' },
      })) as PostEntity[];
      const groups = (await postGroupRepository.find({
        where: { session },
        order: { created: 'ASC' },
      })) as PostGroupEntity[];
      const columns = (await columnRepository.find({
        where: { session },
        order: { index: 'ASC' },
      })) as ColumnDefinitionEntity[];
      return {
        ...session.toJson(),
        columns: columns.map((c) => c.toJson()),
        posts: posts.map((p) => p.toJson()),
        groups: groups.map((g) => g.toJson()),
      };
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
}

export async function saveSession(
  connection: Connection,
  userId: string,
  session: Session
): Promise<void> {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  await sessionRepository.saveFromJson(session, userId);
}

export async function deleteSessions(
  connection: Connection,
  userId: string,
  sessionId: string
): Promise<boolean> {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const session = await sessionRepository.findOne(sessionId);
  if (!session) {
    console.info('Session not found', sessionId);
    return false;
  }
  if (
    session.createdBy.id !== userId ||
    session.createdBy.accountType === 'anonymous'
  ) {
    console.error(
      'The user is not the one who created the session, or is anonymous'
    );
    return false;
  }
  await sessionRepository.query(
    `delete from visitors where "sessionsId" = $1;`,
    [sessionId]
  );
  await sessionRepository.query(`delete from posts where "sessionId" = $1;`, [
    sessionId,
  ]);
  await sessionRepository.query(`delete from columns where "sessionId" = $1;`, [
    sessionId,
  ]);
  await sessionRepository.query(`delete from groups where "sessionId" = $1;`, [
    sessionId,
  ]);
  await sessionRepository.query(`delete from sessions where id = $1;`, [
    sessionId,
  ]);

  return true;
}

function numberOfVotes(type: VoteType, session: SessionEntity) {
  return session.posts!.reduce<number>((prev, cur) => {
    return prev + cur.votes!.filter((v) => v.type === type).length;
  }, 0);
}

function numberOfActions(posts: PostEntity[]) {
  return posts.filter((p) => p.action !== null).length;
}

function getParticipants(visitors: UserEntity[]): User[] {
  return visitors.map((u) => u.toJson());
}

export async function previousSessions(
  connection: Connection,
  userId: string
): Promise<SessionMetadata[]> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const loadedUser = await userRepository.findOne(userId, {
    relations: ['sessions', 'sessions.posts', 'sessions.visitors'],
  });
  if (loadedUser && loadedUser.sessions) {
    return orderBy(loadedUser.sessions, (s) => s.updated, 'desc').map(
      (session) =>
        ({
          created: session.created,
          createdBy: session.createdBy.toJson(),
          encrypted: session.encrypted,
          id: session.id,
          name: session.name,
          numberOfNegativeVotes: numberOfVotes('dislike', session),
          numberOfPositiveVotes: numberOfVotes('like', session),
          numberOfPosts: session.posts?.length,
          numberOfActions: numberOfActions(session.posts!),
          participants: getParticipants(session.visitors!),
          canBeDeleted:
            userId === session.createdBy.id &&
            session.createdBy.accountType !== 'anonymous',
        } as SessionMetadata)
    );
  }

  return [];
}

export async function getDefaultTemplate(
  connection: Connection,
  id: string
): Promise<SessionTemplateEntity | null> {
  const userRepository = connection.getCustomRepository(UserRepository);
  const userWithDefaultTemplate = await userRepository.findOne(
    { id },
    { relations: ['defaultTemplate', 'defaultTemplate.columns'] }
  );
  return userWithDefaultTemplate?.defaultTemplate || null;
}

export async function updateOptions(
  connection: Connection,
  session: Session,
  options: SessionOptions
): Promise<SessionOptions> {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  return await sessionRepository.updateOptions(session, options);
}

export async function updateColumns(
  connection: Connection,
  session: Session,
  columns: ColumnDefinition[]
): Promise<ColumnDefinition[]> {
  const columnRepository = connection.getCustomRepository(ColumnRepository);
  return await columnRepository.updateColumns(session, columns);
}

export async function updateName(
  connection: Connection,
  sessionId: string,
  name: string
) {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const session = await sessionRepository.findOne(sessionId);
  if (session) {
    session.name = name;
    await sessionRepository.save(session);
  }
}

export async function getSessionWithVisitors(
  connection: Connection,
  sessionId: string
): Promise<SessionEntity | null> {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const session = await sessionRepository.findOne(sessionId, {
    relations: ['visitors'],
  });
  return session || null;
}

export async function storeVisitor(
  connection: Connection,
  sessionId: string,
  user: UserEntity
) {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const session = await getSessionWithVisitors(connection, sessionId);
  if (
    session &&
    session.visitors &&
    !session.visitors.map((v) => v.id).includes(user.id)
  ) {
    session.visitors.push(user);
    await sessionRepository.save(session);
  }
}

export async function toggleSessionLock(
  connection: Connection,
  sessionId: string,
  lock: boolean
) {
  const sessionRepository = connection.getCustomRepository(SessionRepository);
  const session = await sessionRepository.findOne(sessionId);
  if (session) {
    session.locked = lock;
    await sessionRepository.save(session);
  }
}

export function isAllowed(session: SessionEntity, user: UserEntity) {
  if (!session.locked) {
    return true;
  }
  if (session.visitors) {
    return session.visitors.map((v) => v.id).includes(user.id);
  }
  return false;
}
