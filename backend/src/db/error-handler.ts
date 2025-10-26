/**
 * Database Error Handler
 *
 * Handles and translates database errors from both TypeORM and Drizzle
 */

import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';

export interface DBError {
  code: string;
  message: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
}

/**
 * Check if error is a database error
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError || error instanceof QueryFailedError;
}

/**
 * Check if error is a unique constraint violation
 */
export function isUniqueViolation(error: unknown): boolean {
  if (!isDatabaseError(error)) return false;

  // PostgreSQL unique violation code
  const code = (error as any).code;
  return code === '23505';
}

/**
 * Check if error is a foreign key violation
 */
export function isForeignKeyViolation(error: unknown): boolean {
  if (!isDatabaseError(error)) return false;

  // PostgreSQL foreign key violation code
  const code = (error as any).code;
  return code === '23503';
}

/**
 * Check if error is a not null violation
 */
export function isNotNullViolation(error: unknown): boolean {
  if (!isDatabaseError(error)) return false;

  // PostgreSQL not null violation code
  const code = (error as any).code;
  return code === '23502';
}

/**
 * Check if error is a check constraint violation
 */
export function isCheckViolation(error: unknown): boolean {
  if (!isDatabaseError(error)) return false;

  // PostgreSQL check violation code
  const code = (error as any).code;
  return code === '23514';
}

/**
 * Extract constraint name from error
 */
export function getConstraintName(error: unknown): string | undefined {
  if (!isDatabaseError(error)) return undefined;
  return (error as any).constraint;
}

/**
 * Extract table name from error
 */
export function getTableName(error: unknown): string | undefined {
  if (!isDatabaseError(error)) return undefined;
  return (error as any).table;
}

/**
 * Extract column name from error
 */
export function getColumnName(error: unknown): string | undefined {
  if (!isDatabaseError(error)) return undefined;
  return (error as any).column;
}

/**
 * Parse database error into a structured format
 */
export function parseDatabaseError(error: unknown): DBError | null {
  if (!isDatabaseError(error)) return null;

  const dbError = error as any;

  return {
    code: dbError.code || 'UNKNOWN',
    message: dbError.message || 'Database error occurred',
    detail: dbError.detail,
    constraint: dbError.constraint,
    table: dbError.table,
    column: dbError.column,
  };
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (!isDatabaseError(error)) {
    return 'An unexpected error occurred';
  }

  if (isUniqueViolation(error)) {
    const constraint = getConstraintName(error);
    if (constraint?.includes('email')) {
      return 'This email address is already in use';
    }
    if (constraint?.includes('username')) {
      return 'This username is already taken';
    }
    return 'This value already exists in the database';
  }

  if (isForeignKeyViolation(error)) {
    return 'Cannot delete this item because it is referenced by other data';
  }

  if (isNotNullViolation(error)) {
    const column = getColumnName(error);
    return column
      ? `The field '${column}' is required`
      : 'A required field is missing';
  }

  if (isCheckViolation(error)) {
    return 'The provided value does not meet the required constraints';
  }

  return 'A database error occurred';
}

/**
 * Log database error with details
 */
export function logDatabaseError(error: unknown, context?: string): void {
  const parsed = parseDatabaseError(error);

  if (parsed) {
    console.error(`Database Error${context ? ` in ${context}` : ''}:`);
    console.error(`  Code: ${parsed.code}`);
    console.error(`  Message: ${parsed.message}`);
    if (parsed.detail) console.error(`  Detail: ${parsed.detail}`);
    if (parsed.constraint) console.error(`  Constraint: ${parsed.constraint}`);
    if (parsed.table) console.error(`  Table: ${parsed.table}`);
    if (parsed.column) console.error(`  Column: ${parsed.column}`);
  } else {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }
}

/**
 * Wrap a database operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logDatabaseError(error, context);
    throw error;
  }
}

// Re-export for backward compatibility
export { QueryFailedError, DatabaseError };
