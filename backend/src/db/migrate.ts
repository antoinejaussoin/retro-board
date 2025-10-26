import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import config from '../config.js';
import chalk from 'chalk-template';

const { Pool } = pg;

async function runMigrations() {
  console.log(chalk`{yellow 🔄 Running Drizzle migrations...}`);

  const pool = new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './src/db/drizzle-migrations' });
    console.log(chalk`{green ✓ Migrations completed successfully}`);
  } catch (error) {
    console.error(chalk`{red ✗ Migration failed:}`, error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
