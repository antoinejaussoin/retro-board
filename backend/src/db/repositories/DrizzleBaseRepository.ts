/**
 * Drizzle Base Repository
 *
 * Provides a base repository class with common CRUD operations using Drizzle ORM.
 * Designed to gradually replace TypeORM repositories.
 */

import type { PgTable } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import { eq, and, inArray } from 'drizzle-orm';
import { getDrizzleConnection } from '../connection.js';
import type { DrizzleDB } from '../drizzle.js';
import {
  findOneById,
  findByIds,
  findMany,
  existsById,
  count,
  insertOne,
  insertMany,
  updateById,
  deleteById,
  paginate as paginateHelper,
  type PaginationParams,
  type PaginatedResult,
} from '../query-helpers.js';

export type DrizzleTransaction = Parameters<
  Parameters<DrizzleDB['transaction']>[0]
>[0];

export type WhereCondition = SQL<unknown> | undefined;

/**
 * Base Repository for Drizzle ORM
 *
 * Provides common CRUD operations for any table schema.
 */
export class DrizzleBaseRepository<
  TTable extends PgTable,
  TSelect = TTable['$inferSelect'],
  TInsert = TTable['$inferInsert'],
> {
  constructor(
    protected table: TTable,
    protected idColumn: keyof TSelect = 'id' as keyof TSelect,
  ) {}

  /**
   * Get database connection (supports both regular and transaction context)
   */
  protected getDb(tx?: DrizzleTransaction): DrizzleDB | DrizzleTransaction {
    return tx || getDrizzleConnection();
  }

  /**
   * Find a single record by ID
   */
  async findById(
    id: string | number,
    tx?: DrizzleTransaction,
  ): Promise<TSelect | undefined> {
    const db = this.getDb(tx);
    return (await findOneById(db, this.table, String(id))) as
      | TSelect
      | undefined;
  }

  /**
   * Find multiple records by IDs
   */
  async findByIds(
    ids: (string | number)[],
    tx?: DrizzleTransaction,
  ): Promise<TSelect[]> {
    const db = this.getDb(tx);
    return (await findByIds(db, this.table, ids.map(String))) as TSelect[];
  }

  /**
   * Find all records matching conditions
   */
  async findAll(
    where?: WhereCondition,
    tx?: DrizzleTransaction,
  ): Promise<TSelect[]> {
    const db = this.getDb(tx);
    return (await findMany(db, this.table, where)) as TSelect[];
  }

  /**
   * Find one record matching conditions
   */
  async findOne(
    where: WhereCondition,
    tx?: DrizzleTransaction,
  ): Promise<TSelect | undefined> {
    const db = this.getDb(tx);
    const results = await db.select().from(this.table).where(where).limit(1);
    return results[0] as TSelect | undefined;
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string | number, tx?: DrizzleTransaction): Promise<boolean> {
    const db = this.getDb(tx);
    return await existsById(db, this.table, String(id));
  }

  /**
   * Count records matching conditions
   */
  async count(
    where?: WhereCondition,
    tx?: DrizzleTransaction,
  ): Promise<number> {
    const db = this.getDb(tx);
    return await count(db, this.table, where);
  }

  /**
   * Insert a single record and return it
   */
  async insert(data: TInsert, tx?: DrizzleTransaction): Promise<TSelect> {
    const db = this.getDb(tx);
    return await insertOne(db, this.table, data);
  }

  /**
   * Insert multiple records and return them
   */
  async insertMany(
    data: TInsert[],
    tx?: DrizzleTransaction,
  ): Promise<TSelect[]> {
    const db = this.getDb(tx);
    return await insertMany(db, this.table, data);
  }

  /**
   * Update a record by ID and return the updated record
   */
  async update(
    id: string | number,
    data: Partial<TInsert>,
    tx?: DrizzleTransaction,
  ): Promise<TSelect | undefined> {
    const db = this.getDb(tx);
    return (await updateById(db, this.table, String(id), data)) as
      | TSelect
      | undefined;
  }

  /**
   * Update multiple records matching conditions
   */
  async updateWhere(
    where: WhereCondition,
    data: Partial<TInsert>,
    tx?: DrizzleTransaction,
  ): Promise<TSelect[]> {
    const db = this.getDb(tx);
    return (await db
      .update(this.table)
      .set(data as any)
      .where(where)
      .returning()) as unknown as TSelect[];
  }

  /**
   * Delete a record by ID and return whether it was deleted
   */
  async delete(id: string | number, tx?: DrizzleTransaction): Promise<boolean> {
    const db = this.getDb(tx);
    return await deleteById(db, this.table, String(id));
  }

  /**
   * Delete multiple records matching conditions
   */
  async deleteWhere(
    where: WhereCondition,
    tx?: DrizzleTransaction,
  ): Promise<TSelect[]> {
    const db = this.getDb(tx);
    return (await db
      .delete(this.table)
      .where(where)
      .returning()) as unknown as TSelect[];
  }

  /**
   * Save (insert or update) a record
   * If the record has an ID and exists, update it; otherwise insert
   */
  async save(
    data: TInsert & { id?: string | number },
    tx?: DrizzleTransaction,
  ): Promise<TSelect> {
    const db = this.getDb(tx);

    // If has ID and exists, update
    if (data.id && (await this.exists(data.id, tx))) {
      const { id, ...updateData } = data;
      const updated = await this.update(id, updateData as Partial<TInsert>, tx);
      return updated!;
    }

    // Otherwise insert
    return await this.insert(data as TInsert, tx);
  }

  /**
   * Paginate results
   */
  async paginate(
    options: PaginationParams,
    where?: WhereCondition,
    tx?: DrizzleTransaction,
  ): Promise<PaginatedResult<TSelect>> {
    const db = this.getDb(tx);
    return (await paginateHelper(
      db,
      this.table,
      options,
      where,
    )) as PaginatedResult<TSelect>;
  } /**
   * Build AND condition from filters
   */
  protected buildAnd(
    ...conditions: (SQL<unknown> | undefined)[]
  ): SQL<unknown> | undefined {
    const filtered = conditions.filter(
      (c): c is SQL<unknown> => c !== undefined,
    );
    return filtered.length > 0 ? and(...filtered) : undefined;
  }

  /**
   * Build WHERE clause from object
   */
  protected buildWhere(filters: Partial<TSelect>): SQL<unknown> | undefined {
    const conditions = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        const column = (this.table as any)[key];
        if (Array.isArray(value)) {
          return inArray(column, value);
        }
        return eq(column, value);
      });

    return this.buildAnd(...conditions);
  }
}

/**
 * Create a repository instance for a given table
 */
export function createRepository<
  TTable extends PgTable,
  TSelect = TTable['$inferSelect'],
  TInsert = TTable['$inferInsert'],
>(
  table: TTable,
  idColumn?: keyof TSelect,
): DrizzleBaseRepository<TTable, TSelect, TInsert> {
  return new DrizzleBaseRepository(table, idColumn);
}
