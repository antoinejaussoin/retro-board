import getOrmConfig from './db/orm-config';
import path from 'path';
import fs from 'fs';

async function buildOrmConfig() {
  const config = getOrmConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).entities = [
    `${path.resolve(__dirname, 'db', 'entities')}/*.ts`,
  ];
  const jsonPath = path.resolve(__dirname, '..', 'ormconfig.json');
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
}

export default buildOrmConfig;
