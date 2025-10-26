/**
 * Query Helpers for Drizzle
 *
 * Common query patterns and utilities for working with Drizzle ORM
 */

import {
  type SQL,
  sql,
  eq,
  and,
  or,
  inArray,
  isNull,
  isNotNull,
} from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { DrizzleDB } from './drizzle.js';

/**
 * Find one record by ID
 */
export async function findOneById<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  id: string,
): Promise<any> {
  const idColumn = (table as any).id;
  const results = await db
    .select()
    .from(table)
    .where(eq(idColumn, id))
    .limit(1);
  return results[0] || null;
}

/**
 * Find multiple records by IDs
 */
export async function findByIds<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  ids: string[],
): Promise<any[]> {
  if (ids.length === 0) return [];
  const idColumn = (table as any).id;
  return db.select().from(table).where(inArray(idColumn, ids));
}

/**
 * Check if record exists by ID
 */
export async function existsById<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  id: string,
): Promise<boolean> {
  const idColumn = (table as any).id;
  const results = await db
    .select({ id: idColumn })
    .from(table)
    .where(eq(idColumn, id))
    .limit(1);
  return results.length > 0;
}

/**
 * Count records with optional where condition
 */
export async function count<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  where?: SQL,
): Promise<number> {
  const query = db.select({ count: sql<number>`count(*)` }).from(table);

  if (where) {
    query.where(where);
  }

  const result = await query;
  return Number(result[0]?.count || 0);
}

/**
 * Delete record by ID
 */
export async function deleteById<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  id: string,
): Promise<boolean> {
  const idColumn = (table as any).id;
  const result = await db.delete(table).where(eq(idColumn, id));
  return (result.rowCount ?? 0) > 0;
}

/**
 * Delete multiple records by IDs
 */
export async function deleteByIds<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  ids: string[],
): Promise<number> {
  if (ids.length === 0) return 0;
  const idColumn = (table as any).id;
  const result = await db.delete(table).where(inArray(idColumn, ids));
  return result.rowCount ?? 0;
}

/**
 * Update record by ID
 */
export async function updateById<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  id: string,
  data: Partial<any>,
): Promise<any> {
  const idColumn = (table as any).id;
  const results = await db
    .update(table)
    .set(data)
    .where(eq(idColumn, id))
    .returning();
  return results[0] || null;
}

/**
 * Insert and return the created record
 */
export async function insertOne<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  data: any,
): Promise<any> {
  const results = await db.insert(table).values(data).returning();
  return results[0] || null;
}

/**
 * Insert multiple records and return them
 */
export async function insertMany<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  data: any[],
): Promise<any[]> {
  if (data.length === 0) return [];
  return db.insert(table).values(data).returning();
}

/**
 * Upsert (insert or update) a record
 */
export async function upsert<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  data: any,
  conflictColumn: any,
): Promise<any> {
  const results = await db
    .insert(table)
    .values(data)
    .onConflictDoUpdate({
      target: conflictColumn,
      set: data,
    })
    .returning();
  return results[0] || null;
}

/**
 * Build OR condition from multiple clauses
 */
export function buildOr(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return or(...conditions);
}

/**
 * Build AND condition from multiple clauses
 */
export function buildAnd(conditions: SQL[]): SQL | undefined {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return and(...conditions);
}

/**
 * Paginate query results
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function paginate<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  params: PaginationParams = {},
  where?: SQL,
): Promise<PaginatedResult<any>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Get total count
  const total = await count(db, table, where);

  // Get paginated data
  let query = db.select().from(table);
  if (where) {
    query = query.where(where) as any;
  }
  const data = await query.limit(pageSize).offset(offset);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Execute raw SQL query
 */
export async function rawQuery<T = any>(
  db: DrizzleDB,
  query: string,
  params?: any[],
): Promise<T[]> {
  const result = await db.execute(sql.raw(query));
  return result.rows as T[];
}

/**
 * Check if table is empty
 */
export async function isEmpty<T extends PgTable>(
  db: DrizzleDB,
  table: T,
): Promise<boolean> {
  const total = await count(db, table);
  return total === 0;
}

/**
 * Get first record or null
 */
export async function findFirst<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  where?: SQL,
): Promise<any> {
  let query = db.select().from(table);
  if (where) {
    query = query.where(where) as any;
  }
  const results = await query.limit(1);
  return results[0] || null;
}

/**
 * Get all records with optional where condition
 */
export async function findMany<T extends PgTable>(
  db: DrizzleDB,
  table: T,
  where?: SQL,
): Promise<any[]> {
  let query = db.select().from(table);
  if (where) {
    query = query.where(where) as any;
  }
  return query;
}

// Export common operators for convenience
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  and,
  or,
  not,
  sql,
} from 'drizzle-orm';
