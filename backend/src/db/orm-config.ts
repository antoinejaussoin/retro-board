import config from '../config';
import { ConnectionOptions } from 'typeorm';
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
} from './entities';
import LicenceEntity from './entities/Licence';
import SessionOptionsEntity from './entities/SessionOptions';
import UserIdentityEntity from './entities/UserIdentity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import path from 'path';

function getMigrationsDirectory(): string {
  return path.resolve(__dirname, 'migrations');
}

function getMigrationsFiles(): string {
  return `${getMigrationsDirectory()}/*.${
    __filename.endsWith('js') ? 'js' : 'ts'
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
  ],
  synchronize: false,
  logging: config.SQL_LOG ? 'all' : undefined,
  migrations: [getMigrationsFiles()],
  cli: {
    migrationsDir: getMigrationsDirectory(),
  },
} as ConnectionOptions;
