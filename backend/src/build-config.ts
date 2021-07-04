import getOrmConfig from './db/orm-config';
import path from 'path';
import fs from 'fs';

async function buildOrmConfig() {
  const config = getOrmConfig();
  const rootPath = path.resolve(__dirname);
  const entities = path.resolve(rootPath, 'db', 'entities');
  const migrations = path.resolve(rootPath, 'db', 'migrations');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).entities = [`${entities}/*.js`];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).migrations = [`${migrations}/*.js`];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).cli.migrationsDir = migrations;
  const jsonPath = path.resolve(__dirname, '..', 'ormconfig.json');
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
}

export default buildOrmConfig;
