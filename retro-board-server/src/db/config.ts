import fs from 'fs';
import path from 'path';
import { Configuration } from '../types';
import dotenv from 'dotenv';
const confPath = path.resolve(__dirname, '../../../.env');
const defaultConfPath = path.resolve(__dirname, '../../../.env.example');

const fileExist = fs.existsSync(confPath);

if (fileExist) {
  dotenv.config({ path: confPath });
} else {
  dotenv.config({ path: defaultConfPath });
}

const config: Configuration = {
  DB_TYPE: process.env.DB_TYPE! as 'postgres' | 'nedb',
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT!),
  JWT_SECRET: process.env.JWT_SECRET!,
  SERVER_SALT: process.env.SERVER_SALT!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  PORT: parseInt(process.env.PORT!),
};

export default config;
