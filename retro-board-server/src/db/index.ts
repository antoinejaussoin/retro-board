import chalk from 'chalk';
import postgres from './postgres';
import { Store } from '../types';

export default (): Promise<Store> => {
  console.log(chalk`{yellow 💻  Using {red Postgres} database}`);
  return postgres();
};
