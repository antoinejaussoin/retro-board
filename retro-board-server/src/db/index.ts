import chalk from 'chalk';
import nedb from './nedb';
import postgres from './postgres';
import config from './config';
import { Store } from '../types';

export default (): Promise<Store> => {
  if (config.DB_TYPE === 'postgres') {
    console.log(chalk`{yellow 💻  Using {red Postgres} database}`);
    return postgres();
  }
  chalk`{yellow 💻  Using {red NeDB} database}`;
  return nedb();
};
