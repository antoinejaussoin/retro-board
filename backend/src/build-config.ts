import getOrmConfig from './db/orm-config';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

async function buildOrmConfig() {
  if (argv.ts) {
    console.log('Creating TypeScript ormconfig.json before migrations');
    await buildOrmConfigTs();
  } else {
    console.log('Creating JavaScript ormconfig.json before migrations');
    await buildOrmConfigJs();
  }
}

async function buildOrmConfigJs() {
  const config = getConfig('js');
  const jsonPath = path.resolve(__dirname, '..', '..', 'ormconfig.json');
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
}

async function buildOrmConfigTs() {
  const config = getConfig('ts');
  const jsonPath = path.resolve(__dirname, '..', 'ormconfig.json');
  fs.writeFileSync(jsonPath, JSON.stringify(config, null, 2));
}

function getConfig(extension: 'js' | 'ts') {
  const rootPath = path.resolve(__dirname);
  const entities = path.resolve(rootPath, 'db', 'entities');
  const migrations =
    extension === 'ts' ? 'src/db/migrations' : 'dist/src/db/migrations';

  const config = getOrmConfig({
    entities: [`${entities}/*.${extension}`],
    migrations: [`${migrations}/*.${extension}`],
    migrationDir: migrations,
  });

  return config;
}

export default buildOrmConfig;
