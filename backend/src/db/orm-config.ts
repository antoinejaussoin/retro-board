import path from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import config from '../config.js';
import { getDirname, getFilename } from './../path-utils.js';
import AiChatEntity from './entities/AiChat.js';
import AiChatMessageEntity from './entities/AiChatMessage.js';
import LicenceEntity from './entities/Licence.js';
import SessionOptionsEntity from './entities/SessionOptions.js';
import {
  ColumnDefinitionEntity,
  MessageEntity,
  PostEntity,
  PostGroupEntity,
  SessionEntity,
  SessionTemplateEntity,
  SessionView,
  SubscriptionEntity,
  TemplateColumnDefinitionEntity,
  UserEntity,
  UserIdentityEntity,
  UserView,
  VoteEntity,
} from './entities/index.js';

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
