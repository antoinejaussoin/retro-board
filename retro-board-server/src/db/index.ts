import 'reflect-metadata';
import chalk from 'chalk';
import { createConnection } from 'typeorm';
import getOrmConfig from './orm-config';

export default async function getDb(): Promise<void> {
  console.log(chalk`{yellow 💻  Using {red Postgres} database}`);
  await createConnection(getOrmConfig());
}
