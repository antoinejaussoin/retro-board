/**
 * Database Health Check
 *
 * Provides health check utilities for both TypeORM and Drizzle connections
 */

import { getTypeORMConnection, getDrizzleConnection } from './connection.js';
import { sql } from 'drizzle-orm';

export interface HealthCheckResult {
  healthy: boolean;
  typeorm?: {
    connected: boolean;
    error?: string;
  };
  drizzle?: {
    connected: boolean;
    error?: string;
  };
  timestamp: Date;
}

/**
 * Check TypeORM connection health
 */
async function checkTypeORMHealth(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    const dataSource = getTypeORMConnection();

    if (!dataSource) {
      return { connected: false, error: 'TypeORM not initialized' };
    }

    if (!dataSource.isInitialized) {
      return { connected: false, error: 'TypeORM not connected' };
    }

    // Try a simple query
    await dataSource.query('SELECT 1');

    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Drizzle connection health
 */
async function checkDrizzleHealth(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    const db = getDrizzleConnection();

    if (!db) {
      return { connected: false, error: 'Drizzle not initialized' };
    }

    // Try a simple query
    await db.execute(sql`SELECT 1`);

    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Perform a comprehensive health check
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const [typeorm, drizzle] = await Promise.all([
    checkTypeORMHealth(),
    checkDrizzleHealth(),
  ]);

  const healthy = typeorm.connected && drizzle.connected;

  return {
    healthy,
    typeorm,
    drizzle,
    timestamp: new Date(),
  };
}

/**
 * Simple health check (returns true if at least one connection is healthy)
 */
export async function isHealthy(): Promise<boolean> {
  const result = await checkDatabaseHealth();
  return result.healthy;
}

/**
 * Health check endpoint handler
 */
export async function healthCheckHandler(
  _req: unknown,
  res: {
    status: (code: number) => {
      json: (data: unknown) => void;
      send: () => void;
    };
  },
): Promise<void> {
  const result = await checkDatabaseHealth();

  if (result.healthy) {
    res.status(200).json(result);
  } else {
    res.status(503).json(result);
  }
}
