import 'reflect-metadata';
import chalk from 'chalk';
import { createConnection } from 'typeorm';
import ormConfig from './orm-config.js';

export default async function getDb(): Promise<void> {
  console.log(chalk`{yellow 💻  Using {red Postgres} database}`);
  await createConnection(ormConfig);
}
