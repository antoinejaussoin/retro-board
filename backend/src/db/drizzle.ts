import 'reflect-metadata';
import chalk from 'chalk-template';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import config from '../config.js';
import * as schema from './schema/index.js';

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle instance with schema
export const db = drizzle(pool, {
  schema,
  logger: config.SQL_LOG,
});

export type DrizzleDB = typeof db;

export default async function getDb(): Promise<DrizzleDB> {
  console.log(
    chalk`{yellow 💻  Using {red Postgres} database with {blue Drizzle}}`,
  );
  // Test connection
  try {
    await pool.query('SELECT 1');
    console.log(chalk`{green ✓ Database connection established}`);
  } catch (error) {
    console.error(chalk`{red ✗ Database connection failed:}`, error);
    throw error;
  }
  return db;
}
