import config from './config';
import { ConnectionOptions } from 'typeorm';
import {
  Post,
  PostGroup,
  Session,
  User,
  ColumnDefinition,
  Vote,
  SessionTemplate,
  TemplateColumnDefinition,
} from './entities';

const migrationsDirectory = 'src/db/migrations';

export default function(): ConnectionOptions {
  return {
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [
      Post,
      PostGroup,
      Session,
      User,
      ColumnDefinition,
      Vote,
      SessionTemplate,
      TemplateColumnDefinition,
    ],
    synchronize: false,
    logging: config.SQL_LOG ? 'all' : undefined,
    migrations: [`${migrationsDirectory}/*.ts`],
    cli: {
      migrationsDir: migrationsDirectory,
    },
  };
}
