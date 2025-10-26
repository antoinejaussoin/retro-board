/**
 * Database Connection Manager
 *
 * Manages both TypeORM and Drizzle connections during the migration period.
 * Allows gradual migration by providing access to both systems.
 */

import chalk from 'chalk-template';
import config from '../config.js';

// TypeORM imports
import { dataSource as typeormDataSource } from './index.js';
import type { DataSource } from 'typeorm';

// Drizzle imports
import { db as drizzleDb, pool as drizzlePool } from './drizzle.js';
import type { DrizzleDB } from './drizzle.js';

export type ConnectionType = 'typeorm' | 'drizzle' | 'both';

interface ConnectionConfig {
  useTypeORM: boolean;
  useDrizzle: boolean;
}

// Configuration for which connection(s) to use
const connectionConfig: ConnectionConfig = {
  useTypeORM: true, // Still needed for legacy code
  useDrizzle: true, // New code should use this
};

let initialized = false;
let typeormConnection: DataSource | null = null;
let drizzleConnection: DrizzleDB | null = null;

/**
 * Initialize database connections
 */
export async function initializeConnections(): Promise<void> {
  if (initialized) {
    console.log(chalk`{yellow ⚠ Database already initialized}`);
    return;
  }

  console.log(chalk`{cyan 🔄 Initializing database connections...}`);

  try {
    // Initialize TypeORM if needed
    if (connectionConfig.useTypeORM) {
      console.log(chalk`{yellow   - Initializing TypeORM...}`);
      typeormConnection = await typeormDataSource.initialize();
      console.log(chalk`{green   ✓ TypeORM initialized}`);
    }

    // Initialize Drizzle if needed
    if (connectionConfig.useDrizzle) {
      console.log(chalk`{yellow   - Initializing Drizzle...}`);
      // Test connection
      await drizzlePool.query('SELECT 1');
      drizzleConnection = drizzleDb;
      console.log(chalk`{green   ✓ Drizzle initialized}`);
    }

    initialized = true;
    console.log(chalk`{green ✓ All database connections initialized}\n`);
  } catch (error) {
    console.error(chalk`{red ✗ Database initialization failed:}`, error);
    throw error;
  }
}

/**
 * Get TypeORM connection
 */
export function getTypeORMConnection(): DataSource {
  if (!typeormConnection) {
    throw new Error(
      'TypeORM connection not initialized. Call initializeConnections() first.',
    );
  }
  return typeormConnection;
}

/**
 * Get Drizzle connection
 */
export function getDrizzleConnection(): DrizzleDB {
  if (!drizzleConnection) {
    throw new Error(
      'Drizzle connection not initialized. Call initializeConnections() first.',
    );
  }
  return drizzleConnection;
}

/**
 * Close all database connections
 */
export async function closeConnections(): Promise<void> {
  console.log(chalk`{yellow 🔄 Closing database connections...}`);

  try {
    if (typeormConnection?.isInitialized) {
      await typeormConnection.destroy();
      console.log(chalk`{green   ✓ TypeORM connection closed}`);
    }

    if (drizzleConnection) {
      await drizzlePool.end();
      console.log(chalk`{green   ✓ Drizzle connection closed}`);
    }

    typeormConnection = null;
    drizzleConnection = null;
    initialized = false;

    console.log(chalk`{green ✓ All connections closed}\n`);
  } catch (error) {
    console.error(chalk`{red ✗ Error closing connections:}`, error);
    throw error;
  }
}

/**
 * Check if connections are initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Get connection configuration
 */
export function getConnectionConfig(): ConnectionConfig {
  return { ...connectionConfig };
}

/**
 * Update connection configuration (for testing or migration purposes)
 */
export function setConnectionConfig(config: Partial<ConnectionConfig>): void {
  Object.assign(connectionConfig, config);
  console.log(chalk`{cyan ℹ Connection config updated:}`, connectionConfig);
}

// Export connections for backward compatibility
export { typeormDataSource, drizzleDb, drizzlePool };
