import { query } from './db.js';

export async function initDb() {
  const createTablesQuery = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      mobile VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255),
      name VARCHAR(100),
      email VARCHAR(255),
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'customer',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Addresses Table
    CREATE TABLE IF NOT EXISTS addresses (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      is_default BOOLEAN DEFAULT false
    );

    -- Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      comment TEXT NOT NULL,
      date VARCHAR(50) NOT NULL
    );

    -- Drop Wishlist Table if it exists
    DROP TABLE IF EXISTS wishlist CASCADE;

    -- Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      date VARCHAR(50) NOT NULL,
      read BOOLEAN DEFAULT false
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      date VARCHAR(50) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      shipping DECIMAL(10,2) NOT NULL,
      tax DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) NOT NULL,
      address JSONB NOT NULL,
      items JSONB NOT NULL
    );

    -- Migration alter tables if needed
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

    -- Drop old JSONB columns from the users table if they exist
    ALTER TABLE users DROP COLUMN IF EXISTS addresses;
    ALTER TABLE users DROP COLUMN IF EXISTS orders;
    ALTER TABLE users DROP COLUMN IF EXISTS wishlist;
    ALTER TABLE users DROP COLUMN IF EXISTS reviews;
    ALTER TABLE users DROP COLUMN IF EXISTS notifications;
  `;

  try {
    console.log('🔄  Checking/creating normalized relational database tables...');
    await query(createTablesQuery);
    console.log('✅  Relational database tables initialized.');

    // Seed default admin user if not exists
    const adminCheck = await query("SELECT * FROM users WHERE mobile = '9999999999'");
    if (adminCheck.rows.length === 0) {
      console.log('🔄  Seeding default admin user (9999999999 / admin123)...');
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      const hashedPassword = await bcrypt.default.hash('admin123', salt);
      await query(
        `INSERT INTO users (mobile, password, name, email, phone, role) 
         VALUES ('9999999999', $1, 'Admin User', 'admin@villagemade.com', '9999999999', 'admin')`,
        [hashedPassword]
      );
      console.log('✅  Default admin user seeded.');
    } else {
      // Ensure existing admin user has the admin role set
      await query("UPDATE users SET role = 'admin' WHERE mobile = '9999999999'");
    }
  } catch (error) {
    console.error('❌  Error initializing relational database tables:', error);
  }
}
