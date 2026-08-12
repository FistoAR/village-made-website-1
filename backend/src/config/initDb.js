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

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(100) PRIMARY KEY,
      category_id VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      discount VARCHAR(50),
      rating DECIMAL(3,2) DEFAULT 4.7,
      reviews INTEGER DEFAULT 128,
      weights JSONB,
      badge VARCHAR(50),
      stock INTEGER DEFAULT 50,
      purchase_price DECIMAL(10,2),
      image_url VARCHAR(512),
      video_url VARCHAR(512),
      benefits JSONB,
      ingredients JSONB,
      features JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

    // Seed default categories if empty
    const catCheck = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) === 0) {
      console.log('🔄  Seeding default categories...');
      const defaultCategories = [
        { id: 'malt', name: 'Malt', description: 'Wholesome nourishing energy malts and health mixes.' },
        { id: 'natural-health-mix', name: 'Natural Health Mix', description: 'Power-packed multigrain health mixes for all ages.' },
        { id: 'millets', name: 'Millets', description: 'Gluten-free traditional whole millet grains.' },
        { id: 'millet-flours', name: 'Millet Flours', description: 'Stone-ground multi-purpose healthy millet flours.' },
        { id: 'millet-tiffin-mix', name: 'Millet Tiffin mix', description: 'Instant traditional healthy breakfast mixes.' },
        { id: 'millet-noodles', name: 'Millet Noodles', description: 'Delicious preservative-free instant noodles.' }
      ];
      for (const cat of defaultCategories) {
        await query(
          'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3)',
          [cat.id, cat.name, cat.description]
        );
      }
      console.log('✅  Default categories seeded.');
    }

    // Seed default products if empty
    const prodCheck = await query('SELECT COUNT(*) FROM products');
    if (parseInt(prodCheck.rows[0].count) === 0) {
      console.log('🔄  Seeding default products catalog...');
      const defaultProducts = [
        { id: 'm-1', category_id: 'malt', name: 'BANANA BABY MALT', description: 'Traditionally prepared nutritional energy mix for infants and kids.', price: 250, badge: 'BEST SELLER', stock: 35, purchase_price: 160 },
        { id: 'm-2', category_id: 'malt', name: 'SWEET POTATO MALT', description: 'Rich in fiber and vitamins, naturally sweet energy booster.', price: 280, badge: 'BEST SELLER', stock: 40, purchase_price: 180 },
        { id: 'm-3', category_id: 'malt', name: 'RAGI MALT', description: 'Traditional calcium-rich drink prepared from premium red millet.', price: 210, stock: 50, purchase_price: 135 },
        { id: 'm-4', category_id: 'malt', name: 'SPROUTED RAGI MALT', description: 'Enhanced nutrition and easy digestibility from sprouted grains.', price: 230, stock: 45, purchase_price: 150 },
        { id: 'm-5', category_id: 'malt', name: 'SPROUTED MULTIGRAIN MALT', description: 'Wholesome blend of sprouted millets and nuts for daily health.', price: 290, stock: 20, purchase_price: 190 },
        { id: 'm-6', category_id: 'malt', name: 'PEARL MILLET MALT', description: 'Iron-rich, refreshing traditional drink to beat the summer heat.', price: 220, stock: 30, purchase_price: 140 },
        
        { id: 'hm-1', category_id: 'natural-health-mix', name: 'KIDS JUNIOR HEALTH MIX', description: 'Perfect balance of nutrients for growing children.', price: 320, badge: 'BEST SELLER', stock: 25, purchase_price: 210 },
        { id: 'hm-2', category_id: 'natural-health-mix', name: 'MULTI MILLET HEALTH MIX', description: 'Premium blend of 10+ millets and traditional cereals.', price: 350, badge: 'BEST SELLER', stock: 30, purchase_price: 230 },
        
        { id: 'ml-1', category_id: 'millets', name: 'FINGER MILLET', description: 'Calcium-rich whole grain, perfect for traditional porridge.', price: 90, stock: 60, purchase_price: 55 },
        { id: 'ml-2', category_id: 'millets', name: 'PEARL MILLET', description: 'High fiber whole millet grain loaded with essential minerals.', price: 80, stock: 70, purchase_price: 48 },
        
        { id: 'fl-1', category_id: 'millet-flours', name: 'FINGER MILLET FLOUR', description: 'Finely ground stone-milled ragi flour for soft rotis.', price: 95, stock: 55, purchase_price: 60 },
        { id: 'fl-2', category_id: 'millet-flours', name: 'PEARL MILLET FLOUR', description: 'Nutritious pearl millet flour for authentic traditional flatbreads.', price: 90, stock: 40, purchase_price: 55 },
        
        { id: 'tm-1', category_id: 'millet-tiffin-mix', name: 'MULTI MILLET DOSA MIX', description: 'Instant, healthy, and crispy millet dosa batter mix.', price: 120, stock: 35, purchase_price: 75 },
        { id: 'nd-1', category_id: 'millet-noodles', name: 'INSTANT MAGIC MASALA NOODLES', description: 'Delicious instant noodles with traditional Indian spice seasoning.', price: 85, stock: 100, purchase_price: 50 }
      ];

      for (const p of defaultProducts) {
        await query(
          `INSERT INTO products (id, category_id, name, description, price, weights, badge, stock, purchase_price, benefits, ingredients, features)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            p.id,
            p.category_id,
            p.name,
            p.description,
            p.price,
            JSON.stringify(['250 g', '500 g', '1 kg']),
            p.badge || null,
            p.stock,
            p.purchase_price,
            JSON.stringify(['Traditional Nutrition', 'Easy to Digest', 'Natural Goodness']),
            JSON.stringify(['Sprouted grains', 'Natural sweetness', 'Nuts powder']),
            JSON.stringify({ shelf_life: '6 Months', suitable_for: 'Babies (6+ months), Toddlers' })
          ]
        );
      }
      console.log('✅  Default products catalog seeded.');
    }

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
