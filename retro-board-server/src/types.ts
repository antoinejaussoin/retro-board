import {
  Session,
  Post,
  SessionOptions,
  ColumnDefinition,
  Vote,
} from 'retro-board-common';

export interface Store {
  get: (key: string) => Promise<Session>;
  create: (
    id: string,
    options: SessionOptions,
    columns: ColumnDefinition[]
  ) => Promise<void>;
  saveSession: (session: Session) => Promise<void>;
  savePost: (sessionId: string, post: Post) => Promise<void>;
  saveVote: (sessionId: string, postId: string, vote: Vote) => Promise<void>;
  deletePost: (sessionId: string, postId: string) => Promise<void>;
}

export interface Configuration {
  DB_TYPE: 'postgres' | 'nedb';
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  REDIS_ENABLED: boolean;
  REDIS_HOST: string;
  REDIS_PORT: number;
  BACKEND_PORT: number;
  SQL_LOG: boolean;
}
