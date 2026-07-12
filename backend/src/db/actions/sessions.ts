import {
  type UserEntity,
  type PostEntity,
  type PostGroupEntity,
  type ColumnDefinitionEntity,
  type SessionEntity,
  type SessionTemplateEntity,
  SessionView,
} from '../entities/index.js';
import {
  type Session,
  defaultSession,
  type ColumnDefinition,
  type SessionOptions,
  type SessionMetadata,
  type AccessErrorType,
  type FullUser,
} from '../../common/index.js';
import shortId from 'shortid';
import { v4 } from 'uuid';
import {
  UserRepository,
  SessionRepository,
  SessionTemplateRepository,
  PostRepository,
  PostGroupRepository,
  ColumnRepository,
} from '../repositories/index.js';
import { transaction } from './transaction.js';
import { type EntityManager, In } from 'typeorm';
import { getUserViewInner, isUserPro } from './users.js';
import { uniq } from 'lodash-es';
import MessageRepository from '../repositories/MessageRepository.js';
import type MessageEntity from '../entities/Message.js';

export async function createSessionFromSlack(
  slackUserId: string,
  name: string,
): Promise<Session | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.withRepository(UserRepository);
    const users = await userRepository.find({ where: { slackUserId } });
    if (!users.length) {
      return null;
    }
    const user = users[0];
    const session = await createSession(user);
    session.name = name;
    await saveSession(user.id, session);
    return session;
  });
}

export async function createSession(
  author: UserEntity,
  encryptionCheck?: string,
): Promise<Session> {
  return await transaction(async (manager) => {
    const userRepository = manager.withRepository(UserRepository);
    const sessionRepository = manager.withRepository(SessionRepository);
    const id = shortId();
    const userWithDefaultTemplate = await userRepository.findOne({
      where: { id: author.id },
      relations: ['defaultTemplate', 'defaultTemplate.columns'],
    });
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
                  }) as ColumnDefinition,
              )
            : [],
        },
        author.id,
      );
      await storeVisitorInner(manager, newSession.id, author);
      return newSession;
    }
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
      author.id,
    );
    await storeVisitorInner(manager, newSession.id, author);
    return newSession;
  });
}

export async function createCustom(
  options: SessionOptions,
  columns: ColumnDefinition[],
  setDefault: boolean,
  author: UserEntity,
): Promise<Session> {
  return await transaction(async (manager) => {
    const userRepository = manager.withRepository(UserRepository);
    const sessionRepository = manager.withRepository(SessionRepository);
    const templateRepository = manager.withRepository(
      SessionTemplateRepository,
    );
    const id = shortId();
    const session = await sessionRepository.findOne({ where: { id } });
    if (!session) {
      const newSession = await sessionRepository.saveFromJson(
        {
          ...defaultSession,
          id,
          options,
          columns,
        },
        author.id,
      );

      if (setDefault) {
        const defaultTemplate = await templateRepository.saveFromJson(
          'Default Template',
          columns,
          options,
          author.id,
        );
        await userRepository.persistTemplate(author.id, defaultTemplate.id);
      }

      return newSession;
    }

    throw Error('The session already exists');
  });
}

export async function doesSessionExists(sessionId: string): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    return (await sessionRepository.count({ where: { id: sessionId } })) === 1;
  });
}

export async function getSession(sessionId: string): Promise<Session | null> {
  return await transaction(async (manager) => {
    const postRepository = manager.withRepository(PostRepository);
    const postGroupRepository = manager.withRepository(PostGroupRepository);
    const sessionRepository = manager.withRepository(SessionRepository);
    const columnRepository = manager.withRepository(ColumnRepository);
    const messageRepository = manager.withRepository(MessageRepository);

    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (session) {
      const posts = (await postRepository.find({
        where: { session: { id: session.id } },
        order: { created: 'ASC' },
      })) as PostEntity[];
      const groups = (await postGroupRepository.find({
        where: { session: { id: session.id } },
        order: { created: 'ASC' },
      })) as PostGroupEntity[];
      const columns = (await columnRepository.find({
        where: { session: { id: session.id } },
        order: { index: 'ASC' },
      })) as ColumnDefinitionEntity[];
      const messages = (await messageRepository.find({
        where: { session: { id: session.id } },
        order: { created: 'DESC' },
      })) as MessageEntity[];
      return {
        ...session.toJson(),
        columns: columns.map((c) => c.toJson()),
        posts: posts.map((p) => p.toJson()),
        groups: groups.map((g) => g.toJson()),
        messages: messages.map((m) => m.toJson()),
      };
    }
    return null;
  });
}

export async function saveSession(
  userId: string,
  session: Session,
): Promise<void> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    await sessionRepository.saveFromJson(session, userId);
  });
}

export async function deleteSessions(
  identityId: string,
  sessionId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    const user = await getUserViewInner(manager, identityId);
    if (!user) {
      console.info('Identity not found', identityId);
      return false;
    }
    if (!session) {
      console.info('Session not found', sessionId);
      return false;
    }
    if (session.createdBy.id !== user.id || !user.canDeleteSession) {
      console.error(
        'The user is not the one who created the session, or is anonymous',
      );
      return false;
    }

    try {
      await sessionRepository.query(
        'delete from messages where session_id = $1;',
        [sessionId],
      );
      await sessionRepository.query(
        'delete from visitors where sessions_id = $1;',
        [sessionId],
      );
      await sessionRepository.query(
        'delete from posts where session_id = $1;',
        [sessionId],
      );
      await sessionRepository.query(
        'delete from columns where session_id = $1;',
        [sessionId],
      );
      await sessionRepository.query(
        'delete from groups where session_id = $1;',
        [sessionId],
      );
      await sessionRepository.query('delete from sessions where id = $1;', [
        sessionId,
      ]);
    } catch (err) {
      console.error('Could not delete session', sessionId, err);
      return false;
    }

    return true;
  });
}

export async function previousSessions(
  userId: string,
): Promise<SessionMetadata[]> {
  return await transaction(async (manager) => {
    const sessionsAsVisitors: { sessions_id: string }[] = await manager.query(
      `
      select distinct v.sessions_id from visitors v
      where v.users_id = $1
    `,
      [userId],
    );

    const sessionsAsOwner: { id: string }[] = await manager.query(
      `
      select s.id from sessions s
      where s.created_by_id = $1
    `,
      [userId],
    );

    const ids = uniq([
      ...sessionsAsVisitors.map((s) => s.sessions_id),
      ...sessionsAsOwner.map((s) => s.id),
    ]);

    const sessionViewRepository = manager.getRepository(SessionView);
    const sessions = await sessionViewRepository.find({
      where: { id: In(ids) },
    });
    return sessions.map((s) => s.toJson(userId));
  });
}

export async function getDefaultTemplate(
  id: string,
): Promise<SessionTemplateEntity | null> {
  return await transaction(async (manager) => {
    const userRepository = manager.withRepository(UserRepository);
    const userWithDefaultTemplate = await userRepository.findOne({
      where: { id },
      relations: ['defaultTemplate', 'defaultTemplate.columns'],
    });
    return userWithDefaultTemplate?.defaultTemplate || null;
  });
}

export async function updateOptions(
  sessionId: string,
  options: SessionOptions,
): Promise<SessionOptions | null> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    return await sessionRepository.updateOptions(sessionId, options);
  });
}

export async function updateColumns(
  sessionId: string,
  columns: ColumnDefinition[],
): Promise<ColumnDefinition[] | null> {
  return await transaction(async (manager) => {
    const columnRepository = manager.withRepository(ColumnRepository);
    return await columnRepository.updateColumns(sessionId, columns);
  });
}

export async function saveTemplate(
  userId: string,
  columns: ColumnDefinition[],
  options: SessionOptions,
) {
  return await transaction(async (manager) => {
    const userRepository = manager.withRepository(UserRepository);
    const templateRepository = manager.withRepository(
      SessionTemplateRepository,
    );

    const defaultTemplate = await templateRepository.saveFromJson(
      'Default Template',
      columns,
      options,
      userId,
    );
    await userRepository.persistTemplate(userId, defaultTemplate.id);
  });
}

export async function updateName(
  sessionId: string,
  name: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    try {
      const sessionRepository = manager.withRepository(SessionRepository);
      const session = await sessionRepository.findOne({
        where: { id: sessionId },
      });
      if (session) {
        session.name = name;
        await sessionRepository.save(session);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
}

export async function updateModerator(
  sessionId: string,
  moderatorId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    try {
      const sessionRepository = manager.withRepository(SessionRepository);
      const session = await sessionRepository.findOne({
        where: { id: sessionId },
      });
      if (session) {
        await sessionRepository.save({
          ...session,
          moderator: {
            id: moderatorId,
          },
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
}

export async function getSessionWithVisitors(
  sessionId: string,
): Promise<SessionEntity | null> {
  return await transaction(async (manager) => {
    return getSessionWithVisitorsInner(manager, sessionId);
  });
}

async function getSessionWithVisitorsInner(
  manager: EntityManager,
  sessionId: string,
): Promise<SessionEntity | null> {
  const sessionRepository = manager.withRepository(SessionRepository);
  const session = await sessionRepository.findOne({
    where: { id: sessionId },
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
  user: UserEntity,
) {
  const sessionRepository = manager.withRepository(SessionRepository);
  const session = await getSessionWithVisitorsInner(manager, sessionId);
  if (
    session?.visitors &&
    !session.visitors.map((v) => v.id).includes(user.id)
  ) {
    session.visitors.push(user);
    await sessionRepository.save(session);
  }
}

export async function toggleSessionLock(sessionId: string, lock: boolean) {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (session) {
      session.locked = lock;
      await sessionRepository.save(session);
    }
  });
}

export async function wasSessionCreatedBy(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    return !!session && session.createdBy.id === userId;
  });
}

interface AllowedResponse {
  allowed: boolean;
  reason?: AccessErrorType;
}

export function isAllowed(
  session: SessionEntity,
  user: FullUser | null,
): AllowedResponse {
  if ((session.locked || session.encrypted) && user && !isUserPro(user)) {
    return { allowed: false, reason: 'non_pro' };
  }
  if (session.locked && session.visitors && user && isUserPro(user)) {
    if (session.visitors.map((v) => v.id).includes(user.id)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'locked' };
  }
  if (session.locked && !user) {
    return { allowed: false, reason: 'locked' };
  }

  return { allowed: true };
}

export async function toggleReady(
  sessionId: string,
  userId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    const sessionRepository = manager.withRepository(SessionRepository);
    const session = await sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      return false;
    }
    session.ready = session.ready.includes(userId)
      ? session.ready.filter((id) => id !== userId)
      : [...session.ready, userId];
    await sessionRepository.save(session);
    return session.ready.includes(userId);
  });
}
