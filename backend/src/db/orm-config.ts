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

const migrationsDirectory = 'src/db/migrations';

export type ConnectionOptionsCustomisation = {
  entities: string[];
  migrations: string[];
  migrationDir: string;
};

export default (function defaultOrmConfig() {
  return customOrmConfig();
})();

export function customOrmConfig(
  customisation?: Partial<ConnectionOptionsCustomisation>
): ConnectionOptions {
  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    namingStrategy: new SnakeNamingStrategy(),
    entities:
      customisation && customisation.entities
        ? customisation.entities
        : [
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
    migrations:
      customisation && customisation.migrations
        ? customisation.migrations
        : [`${migrationsDirectory}/*.ts`],
    cli: {
      migrationsDir:
        customisation && customisation.migrationDir
          ? customisation.migrationDir
          : migrationsDirectory,
    },
  };
}
