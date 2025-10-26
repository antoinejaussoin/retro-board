/**
 * Create Transition Snapshot
 *
 * This script marks the transition point from TypeORM to Drizzle.
 * Run this once when deploying Drizzle for the first time.
 *
 * Usage: npm run migration:snapshot
 */

import pg from 'pg';
import config from '../config.js';
import { createTransitionSnapshot } from './migration-tracker.js';
import chalk from 'chalk-template';

const { Pool } = pg;

async function main() {
  console.log(chalk`{yellow 🔄 Creating Migration Transition Snapshot...}\n`);

  const pool = new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log(chalk`{green ✓ Database connection successful}\n`);

    // Create snapshot
    await createTransitionSnapshot(pool);

    console.log(chalk`\n{green ✓ Transition snapshot created successfully!}`);
    console.log(chalk`\n{cyan ℹ Next steps:}`);
    console.log(
      chalk`  1. Future migrations should use: {bold npm run db:generate}`,
    );
    console.log(chalk`  2. Run migrations with: {bold npm run migrate}`);
    console.log(
      chalk`  3. Check status anytime with: {bold npm run migration:report}`,
    );
  } catch (error) {
    console.error(chalk`{red ✗ Error creating snapshot:}`, error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
