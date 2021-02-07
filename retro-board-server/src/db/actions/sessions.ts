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
  AccessErrorType,
  FullUser,
} from '@retrospected/common';
import shortId from 'shortid';
import { v4 } from 'uuid';
import {
  UserRepository,
  SessionRepository,
  SessionTemplateRepository,
  PostRepository,
  PostGroupRepository,
  ColumnRepository,
} from '../repositories';
import { orderBy } from 'lodash';
import { transaction } from './transaction';
import { EntityManager } from 'typeorm';
import { isUserPro } from './users';

export async function createSession(
  author: UserEntity,
  encryptionCheck?: string
): Promise<Session> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const sessionRepository = manager.getCustomRepository(SessionRepository);
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
          columns: template.columns
            ? template.columns.map(
                (c) =>
                  ({
                    ...c,
                    id: v4(),
                    author: { id: author.id },
                  } as ColumnDefinition)
              )
            : [],
        },
        author.id
      );
      await storeVisitorInner(manager, newSession.id, author);
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
      await storeVisitorInner(manager, newSession.id, author);
      return newSession;
    }
  });
}

export async function createCustom(
  options: SessionOptions,
  columns: ColumnDefinition[],
  setDefault: boolean,
  author: UserEntity
): Promise<Session> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const templateRepository = manager.getCustomRepository(
      SessionTemplateRepository
    );
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

    throw Error('The session already exists');
  });
}

export async function getSession(sessionId: string): Promise<Session | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.getCustomRepository(PostRepository);
    const postGroupRepository = manager.getCustomRepository(
      PostGroupRepository
    );
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const columnRepository = manager.getCustomRepository(ColumnRepository);

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
  });
}

export async function saveSession(
  userId: string,
  session: Session
): Promise<void> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    await sessionRepository.saveFromJson(session, userId);
  });
}

export async function deleteSessions(
  userId: string,
  sessionId: string
): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
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
    await sessionRepository.query(
      `delete from columns where "sessionId" = $1;`,
      [sessionId]
    );
    await sessionRepository.query(
      `delete from groups where "sessionId" = $1;`,
      [sessionId]
    );
    await sessionRepository.query(`delete from sessions where id = $1;`, [
      sessionId,
    ]);

    return true;
  });
}

function numberOfVotes(type: VoteType, session: SessionEntity) {
  if (!session.posts) {
    return 0;
  }
  return session.posts.reduce<number>((prev, cur) => {
    return cur.votes
      ? prev + cur.votes.filter((v) => v.type === type).length
      : prev;
  }, 0);
}

function numberOfActions(posts: PostEntity[] | undefined) {
  if (!posts) {
    return 0;
  }
  return posts.filter((p) => p.action !== null).length;
}

function getParticipants(visitors: UserEntity[] | undefined): User[] {
  if (!visitors) {
    return [];
  }
  return visitors.map((u) => u.toJson());
}

export async function previousSessions(
  userId: string
): Promise<SessionMetadata[]> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
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
            numberOfActions: numberOfActions(session.posts),
            locked: session.locked,
            lockedForUser:
              session.locked && session.visitors
                ? !session.visitors.map((v) => v.id).includes(userId)
                : false,
            participants: getParticipants(session.visitors),
            canBeDeleted:
              userId === session.createdBy.id &&
              session.createdBy.accountType !== 'anonymous',
          } as SessionMetadata)
      );
    }

    return [];
  });
}

export async function getDefaultTemplate(
  id: string
): Promise<SessionTemplateEntity | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const userWithDefaultTemplate = await userRepository.findOne(
      { id },
      { relations: ['defaultTemplate', 'defaultTemplate.columns'] }
    );
    return userWithDefaultTemplate?.defaultTemplate || null;
  });
}

export async function updateOptions(
  session: Session,
  options: SessionOptions
): Promise<SessionOptions> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    return await sessionRepository.updateOptions(session, options);
  });
}

export async function updateColumns(
  session: Session,
  columns: ColumnDefinition[]
): Promise<ColumnDefinition[]> {
  return await transaction(async (manager) => {
    const columnRepository = manager.getCustomRepository(ColumnRepository);
    return await columnRepository.updateColumns(session, columns);
  });
}

export async function saveTemplate(
  userId: string,
  _: Session,
  columns: ColumnDefinition[],
  options: SessionOptions
) {
  return await transaction(async (manager) => {
    const userRepository = manager.getCustomRepository(UserRepository);
    const templateRepository = manager.getCustomRepository(
      SessionTemplateRepository
    );

    const defaultTemplate = await templateRepository.saveFromJson(
      'Default Template',
      columns,
      options,
      userId
    );
    await userRepository.persistTemplate(userId, defaultTemplate.id);
  });
}

export async function updateName(
  sessionId: string,
  name: string
): Promise<void> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const session = await sessionRepository.findOne(sessionId);
    if (session) {
      session.name = name;
      await sessionRepository.save(session);
    }
  });
}

export async function getSessionWithVisitors(
  sessionId: string
): Promise<SessionEntity | null> {
  return await transaction(async (manager) => {
    return getSessionWithVisitorsInner(manager, sessionId);
  });
}

async function getSessionWithVisitorsInner(
  manager: EntityManager,
  sessionId: string
): Promise<SessionEntity | null> {
  const sessionRepository = manager.getCustomRepository(SessionRepository);
  const session = await sessionRepository.findOne(sessionId, {
    relations: ['visitors'],
  });
  return session || null;
}

export async function storeVisitor(sessionId: string, user: UserEntity) {
  return await transaction(async (manager) => {
    return storeVisitorInner(manager, sessionId, user);
  });
}

async function storeVisitorInner(
  manager: EntityManager,
  sessionId: string,
  user: UserEntity
) {
  const sessionRepository = manager.getCustomRepository(SessionRepository);
  const session = await getSessionWithVisitorsInner(manager, sessionId);
  if (
    session &&
    session.visitors &&
    !session.visitors.map((v) => v.id).includes(user.id)
  ) {
    session.visitors.push(user);
    await sessionRepository.save(session);
  }
}

export async function toggleSessionLock(sessionId: string, lock: boolean) {
  return await transaction(async (manager) => {
    const sessionRepository = manager.getCustomRepository(SessionRepository);
    const session = await sessionRepository.findOne(sessionId);
    if (session) {
      session.locked = lock;
      await sessionRepository.save(session);
    }
  });
}

interface AllowedResponse {
  allowed: boolean;
  reason?: AccessErrorType;
}

export function isAllowed(
  session: SessionEntity,
  user: FullUser | null
): AllowedResponse {
  if ((session.locked || session.encrypted) && user && !isUserPro(user)) {
    return { allowed: false, reason: 'non_pro' };
  }
  if (session.locked && session.visitors && user && isUserPro(user)) {
    if (session.visitors.map((v) => v.id).includes(user.id)) {
      return { allowed: true };
    } else {
      return { allowed: false, reason: 'locked' };
    }
  }
  if (session.locked && !user) {
    return { allowed: false, reason: 'locked' };
  }

  return { allowed: true };
}
