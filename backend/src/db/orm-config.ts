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
  UserView,
} from './entities';

const migrationsDirectory = 'src/db/migrations';

export default function (): ConnectionOptions {
  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [
      PostEntity,
      PostGroupEntity,
      SessionEntity,
      UserEntity,
      UserView,
      ColumnDefinitionEntity,
      VoteEntity,
      SessionTemplateEntity,
      TemplateColumnDefinitionEntity,
      SubscriptionEntity,
    ],
    synchronize: false,
    logging: config.SQL_LOG ? 'all' : undefined,
    migrations: [`${migrationsDirectory}/*.ts`],
    cli: {
      migrationsDir: migrationsDirectory,
    },
  };
}
