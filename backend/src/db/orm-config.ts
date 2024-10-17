import config from '../config.js';
import type { DataSourceOptions } from 'typeorm';
import {
  PostEntity,
  PostGroupEntity,
  SessionEntity,
  UserEntity,
  ColumnDefinitionEntity,
  VoteEntity,
  SessionTemplateEntity,
  TemplateColumnDefinitionEntity,
  SubscriptionEntity,
  MessageEntity,
  UserView,
  SessionView,
  UserIdentityEntity,
} from './entities/index.js';
import LicenceEntity from './entities/Licence.js';
import SessionOptionsEntity from './entities/SessionOptions.js';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import path from 'node:path';
import { getDirname, getFilename } from './../path-utils.js';
import AiChatEntity from './entities/AiChat.js';
import AiChatMessageEntity from './entities/AiChatMessage.js';

const fileName = getFilename(import.meta.url);

function getMigrationsDirectory(): string {
  return path.resolve(getDirname(import.meta.url), 'migrations');
}

function getMigrationsFiles(): string {
  return `${getMigrationsDirectory()}/*.${
    fileName.endsWith('js') ? 'js' : 'ts'
  }`;
}

export default {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    PostEntity,
    PostGroupEntity,
    SessionEntity,
    SessionView,
    UserEntity,
    UserIdentityEntity,
    UserView,
    ColumnDefinitionEntity,
    VoteEntity,
    SessionTemplateEntity,
    TemplateColumnDefinitionEntity,
    SubscriptionEntity,
    LicenceEntity,
    SessionOptionsEntity,
    MessageEntity,
    AiChatEntity,
    AiChatMessageEntity,
  ],
  synchronize: false,
  logging: config.SQL_LOG ? 'all' : undefined,
  migrations: [getMigrationsFiles()],
  cli: {
    migrationsDir: getMigrationsDirectory(),
  },
} as DataSourceOptions;
