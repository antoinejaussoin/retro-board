import { defineConfig } from 'drizzle-kit';
import config from './src/config.js';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/drizzle-migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
