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
  const config = getOrmConfig();
  const rootPath = path.resolve(__dirname);
  const entities = path.resolve(rootPath, 'db', 'entities');
  const migrations = path.resolve(rootPath, 'db', 'migrations');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).entities = [`${entities}/*.${extension}`];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).migrations = [`${migrations}/*.${extension}`];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config as any).cli.migrationsDir = migrations;
  return config;
}

export default buildOrmConfig;
