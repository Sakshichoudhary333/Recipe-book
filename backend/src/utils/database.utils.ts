// ============================================================
// utils/database.utils.ts - Database Helper Functions
// ============================================================

import type mysql from "mysql2/promise";

/**
 * Execute a query and return results
 */
export const executeQuery = async <T = any>(
  connection: mysql.Connection | mysql.Pool,
  query: string,
  params?: any[]
): Promise<T[]> => {
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

/**
 * Execute a query and return a single result
 */
export const executeQuerySingle = async <T = any>(
  connection: mysql.Connection | mysql.Pool,
  query: string,
  params?: any[]
): Promise<T | null> => {
  const results = await executeQuery<T>(connection, query, params);
  return results[0] ?? null;
};

/**
 * Execute an insert query and return the inserted ID
 */
export const executeInsert = async (
  connection: mysql.Connection | mysql.Pool,
  query: string,
  params?: any[]
): Promise<number> => {
  try {
    const [result] = await connection.execute(query, params);
    return (result as any).insertId;
  } catch (error) {
    console.error("Database insert error:", error);
    throw error;
  }
};

/**
 * Execute an update/delete query and return affected rows
 */
export const executeUpdate = async (
  connection: mysql.Connection | mysql.Pool,
  query: string,
  params?: any[]
): Promise<number> => {
  try {
    const [result] = await connection.execute(query, params);
    return (result as any).affectedRows;
  } catch (error) {
    console.error("Database update error:", error);
    throw error;
  }
};

/**
 * Begin a transaction
 */
export const beginTransaction = async (
  connection: mysql.Connection
): Promise<void> => {
  await connection.beginTransaction();
};

/**
 * Commit a transaction
 */
export const commitTransaction = async (
  connection: mysql.Connection
): Promise<void> => {
  await connection.commit();
};

/**
 * Rollback a transaction
 */
export const rollbackTransaction = async (
  connection: mysql.Connection
): Promise<void> => {
  await connection.rollback();
};

/**
 * Execute multiple queries in a transaction
 */
export const executeTransaction = async <T>(
  pool: mysql.Pool,
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> => {
  const connection = await pool.getConnection();

  try {
    await beginTransaction(connection);
    const result = await callback(connection);
    await commitTransaction(connection);
    return result;
  } catch (error) {
    await rollbackTransaction(connection);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Build a WHERE clause from filters
 */
export const buildWhereClause = (
  filters: Record<string, any>,
  parameterized: boolean = true
): { clause: string; values: any[] } => {
  const conditions: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      if (parameterized) {
        conditions.push(`${key} = ?`);
        values.push(value);
      } else {
        conditions.push(`${key} = '${value}'`);
      }
    }
  }

  const clause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { clause, values };
};

/**
 * Build an ORDER BY clause
 */
export const buildOrderByClause = (
  sortBy?: string,
  sortOrder: "asc" | "desc" = "asc"
): string => {
  if (!sortBy) return "";
  return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
};

/**
 * Build a LIMIT clause with pagination
 */
export const buildLimitClause = (
  page: number,
  limit: number
): { clause: string; offset: number } => {
  const offset = (page - 1) * limit;
  return {
    clause: `LIMIT ${limit} OFFSET ${offset}`,
    offset,
  };
};
