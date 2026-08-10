import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Use the database connection string to establish a Postgres pool connection.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error on idle pool client:', err);
});

/**
 * Helper to run query strings and parameters using the pool client
 */
export const query = (text, params) => pool.query(text, params);
