import 'reflect-metadata';
import chalk from 'chalk';
import { DataSource } from 'typeorm';
import ormConfig from './orm-config';

export const dataSource = new DataSource(ormConfig);

export default async function getDb(): Promise<DataSource> {
  console.log(chalk`{yellow 💻  Using {red Postgres} database}`);
  await dataSource.initialize();
  return dataSource;
}
