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
import LicenceEntity from './entities/Licence';
import SessionOptionsEntity from './entities/SessionOptions';

const migrationsDirectory = 'src/db/migrations';

export type ConnectionOptionsCustomisation = {
  entities: string[];
  migrations: string[];
  migrationDir: string;
};

export default function (
  customisation?: Partial<ConnectionOptionsCustomisation>
): ConnectionOptions {
  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities:
      customisation && customisation.entities
        ? customisation.entities
        : [
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
            LicenceEntity,
            SessionOptionsEntity,
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
