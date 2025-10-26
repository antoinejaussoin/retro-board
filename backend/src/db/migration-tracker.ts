/**
 * Migration Tracker
 *
 * This utility helps track the transition from TypeORM to Drizzle migrations.
 * It ensures we don't lose migration history during the transition.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import config from '../config.js';

const { Pool } = pg;

interface TypeORMMigration {
  id: number;
  timestamp: number;
  name: string;
}

interface DrizzleMigration {
  id: number;
  hash: string;
  created_at: number;
}

/**
 * Check if TypeORM migrations table exists
 */
export async function hasTypeORMMigrations(pool: pg.Pool): Promise<boolean> {
  const db = drizzle(pool);
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'migrations'
    ) as exists
  `);
  return (result.rows[0] as { exists: boolean })?.exists || false;
}

/**
 * Get all applied TypeORM migrations
 */
export async function getTypeORMMigrations(
  pool: pg.Pool,
): Promise<TypeORMMigration[]> {
  const db = drizzle(pool);
  const result = await db.execute(sql`
    SELECT id, timestamp, name 
    FROM migrations 
    ORDER BY timestamp ASC
  `);
  return result.rows as unknown as TypeORMMigration[];
}

/**
 * Check if Drizzle migrations table exists
 */
export async function hasDrizzleMigrations(pool: pg.Pool): Promise<boolean> {
  const db = drizzle(pool);
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
    ) as exists
  `);
  return (result.rows[0] as { exists: boolean })?.exists || false;
}

/**
 * Create a snapshot migration marking the transition point
 */
export async function createTransitionSnapshot(pool: pg.Pool): Promise<void> {
  const db = drizzle(pool);

  console.log('Creating transition snapshot...');

  // Check if we already have a transition marker
  const hasTypeORM = await hasTypeORMMigrations(pool);
  const hasDrizzle = await hasDrizzleMigrations(pool);

  if (hasTypeORM && !hasDrizzle) {
    const migrations = await getTypeORMMigrations(pool);
    console.log(`Found ${migrations.length} TypeORM migrations`);
    console.log(
      `Last TypeORM migration: ${migrations[migrations.length - 1]?.name}`,
    );

    // Create a comment in the database marking the transition
    await db.execute(sql`
      COMMENT ON TABLE migrations IS 
      'TypeORM migrations - preserved for history. Last migration: ${sql.raw(
        migrations[migrations.length - 1]?.name || 'unknown',
      )}. Transitioned to Drizzle on ${sql.raw(new Date().toISOString())}'
    `);

    console.log('✓ Transition snapshot created');
  } else if (hasDrizzle) {
    console.log('✓ Already using Drizzle migrations');
  } else {
    console.log('⚠ No migration history found');
  }
}

/**
 * Generate a report of migration status
 */
export async function generateMigrationReport(): Promise<void> {
  const pool = new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });

  try {
    console.log('\n=== Migration Status Report ===\n');

    const hasTypeORM = await hasTypeORMMigrations(pool);
    const hasDrizzle = await hasDrizzleMigrations(pool);

    if (hasTypeORM) {
      const migrations = await getTypeORMMigrations(pool);
      console.log(`✓ TypeORM migrations table exists`);
      console.log(`  Total migrations: ${migrations.length}`);
      if (migrations.length > 0) {
        console.log(`  First: ${migrations[0].name}`);
        console.log(`  Last: ${migrations[migrations.length - 1].name}`);
      }
    } else {
      console.log(`✗ TypeORM migrations table not found`);
    }

    console.log('');

    if (hasDrizzle) {
      console.log(`✓ Drizzle migrations table exists`);
    } else {
      console.log(`✗ Drizzle migrations table not found`);
    }

    console.log('\n=== End Report ===\n');
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMigrationReport().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
