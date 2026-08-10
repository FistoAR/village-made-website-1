import { query } from './db.js';

export async function initDb() {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      mobile VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255),
      name VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(20),
      addresses JSONB DEFAULT '[]'::jsonb,
      orders JSONB DEFAULT '[]'::jsonb,
      wishlist JSONB DEFAULT '[]'::jsonb,
      reviews JSONB DEFAULT '[]'::jsonb,
      notifications JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Migration query to add password column if it doesn't exist
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
  `;

  try {
    console.log('🔄  Checking/creating database tables...');
    await query(createUsersTableQuery);
    console.log('✅  Database tables initialized.');
  } catch (error) {
    console.error('❌  Error initializing database tables:', error);
    // Do not crash the process, but log the error
  }
}
