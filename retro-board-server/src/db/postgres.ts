import 'reflect-metadata';
import { createConnection, Connection, Repository } from 'typeorm';
import { Post, Session, User } from './entities';
import { SessionRepository } from './repositories';
import { Session as JsonSession } from 'retro-board-common/src/types';
import { Store } from '../types';
import config from './config';

export async function init() {
  await getDb(true);
}

export async function getDb(sync: boolean = false, log: boolean = false) {
  const connection = await createConnection({
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [Post, Session, User],
    synchronize: sync,
    logging: log ? 'all' : undefined,
  });
  return connection;
}

const get = (_: Connection, sessionRepository: SessionRepository) => async (
  sessionId: string
) => {
  try {
    const session = await sessionRepository.findOne({ id: sessionId });
    if (session) {
      return session;
    } else {
      return {
        id: sessionId,
        name: null,
        posts: [],
      };
    }
  } catch (err) {
    throw err;
  }
};

const set = (_: Connection, sessionRepository: SessionRepository) => async (
  session: JsonSession
) => {
  await sessionRepository.saveFromJson(session);
};

export default async function db(): Promise<Store> {
  const connection = await getDb();
  const sessionRepository = await connection.getCustomRepository(
    SessionRepository
  );
  return {
    set: set(connection, sessionRepository),
    get: get(connection, sessionRepository),
  };
}
