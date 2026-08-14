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

    -- Tickets Table
    CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      order_id VARCHAR(50) REFERENCES orders(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'Open',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      code VARCHAR(50) PRIMARY KEY,
      discount_type VARCHAR(20) NOT NULL,
      discount_value DECIMAL(10,2) NOT NULL,
      min_cart_value DECIMAL(10,2) DEFAULT 0,
      expiry_date TIMESTAMP WITH TIME ZONE,
      active BOOLEAN DEFAULT true
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
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(255);
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful INTEGER DEFAULT 0;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs JSONB;

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

    // Seed/Update categories
    console.log('🔄  Syncing categories...');
    const defaultCategories = [
      { id: 'malt', name: 'Malt', description: 'Wholesome nourishing energy malts and health mixes.' },
      { id: 'natural-health-mix', name: 'Natural Health Mix', description: 'Power-packed multigrain health mixes for all ages.' },
      { id: 'millets', name: 'Millets', description: 'Gluten-free traditional whole millet grains.' },
      { id: 'millet-flours', name: 'Millet Flours', description: 'Stone-ground multi-purpose healthy millet flours.' },
      { id: 'millet-tiffin-mix', name: 'Millet Tiffin mix', description: 'Instant traditional healthy breakfast mixes.' },
      { id: 'millet-noodles', name: 'Millet Noodles', description: 'Delicious preservative-free instant noodles.' },
      { id: 'rice', name: 'Rice', description: 'Traditional and organic rice varieties.' },
      { id: 'natural-sugar', name: 'Natural Sugar', description: 'Healthy and unrefined natural sweeteners.' },
      { id: 'millet-cookies', name: 'Millet Cookies', description: 'Delicious and healthy baked millet cookies.' },
      { id: 'snacks', name: 'Snacks', description: 'Traditional and healthy snacks.' }
    ];
    for (const cat of defaultCategories) {
      await query(
        `INSERT INTO categories (id, name, description) 
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [cat.id, cat.name, cat.description]
      );
    }
    console.log('✅  Categories synced.');

    // Seed/Update products
    console.log('🔄  Syncing products catalog...');
    const defaultProducts = [
      // MALT (6)
      { id: 'm-1', category_id: 'malt', name: 'BANANA BABY MALT', description: 'Traditionally prepared nutritional energy mix for infants and kids.', price: 250, badge: 'BEST SELLER', stock: 35, purchase_price: 160 },
      { id: 'm-2', category_id: 'malt', name: 'SWEET POTATO MALT', description: 'Rich in fiber and vitamins, naturally sweet energy booster.', price: 280, badge: 'BEST SELLER', stock: 40, purchase_price: 180 },
      { id: 'm-3', category_id: 'malt', name: 'RAGI MALT', description: 'Traditional calcium-rich drink prepared from premium red millet.', price: 210, stock: 50, purchase_price: 135 },
      { id: 'm-4', category_id: 'malt', name: 'SPROUTED RAGI MALT', description: 'Enhanced nutrition and easy digestibility from sprouted grains.', price: 230, stock: 45, purchase_price: 150 },
      { id: 'm-5', category_id: 'malt', name: 'SPROUTED MULTIGRAIN MALT', description: 'Wholesome blend of sprouted millets and nuts for daily health.', price: 290, stock: 20, purchase_price: 190 },
      { id: 'm-6', category_id: 'malt', name: 'PEARL MILLET MALT', description: 'Iron-rich, refreshing traditional drink to beat the summer heat.', price: 220, stock: 30, purchase_price: 140 },

      // NUTRITION HEALTH MIX (4)
      { id: 'hm-1', category_id: 'natural-health-mix', name: 'KIDS JUNIOR HEALTH MIX', description: 'Perfect balance of nutrients for growing children.', price: 320, badge: 'BEST SELLER', stock: 25, purchase_price: 210 },
      { id: 'hm-2', category_id: 'natural-health-mix', name: 'MULTI MILLET HEALTH MIX', description: 'Premium blend of 10+ millets and traditional cereals.', price: 350, badge: 'BEST SELLER', stock: 30, purchase_price: 230 },
      { id: 'hm-3', category_id: 'natural-health-mix', name: 'PROTEIN HEALTH MIX', description: 'High-protein grain mix to aid muscle strength and active lifestyle.', price: 380, stock: 35, purchase_price: 245 },
      { id: 'hm-4', category_id: 'natural-health-mix', name: 'DIABETIC HEALTH MIX', description: 'Low glycemic index cereal mix for healthy sugar management.', price: 340, stock: 40, purchase_price: 220 },

      // MILLETS (6)
      { id: 'ml-1', category_id: 'millets', name: 'FINGER MILLET', description: 'Calcium-rich whole grain, perfect for traditional porridge.', price: 90, stock: 60, purchase_price: 55 },
      { id: 'ml-2', category_id: 'millets', name: 'PEARL MILLET', description: 'High fiber whole millet grain loaded with essential minerals.', price: 80, stock: 70, purchase_price: 48 },
      { id: 'ml-3', category_id: 'millets', name: 'FOXTAIL MILLET', description: 'Traditional gluten-free grain rich in protein and iron.', price: 95, stock: 50, purchase_price: 60 },
      { id: 'ml-4', category_id: 'millets', name: 'LITTLE MILLET', description: 'Tiny nutrient powerhouses suitable for traditional rice recipes.', price: 85, stock: 55, purchase_price: 52 },
      { id: 'ml-5', category_id: 'millets', name: 'BARNYARD MILLET', description: 'Low-calorie ancient grain, excellent alternative to white rice.', price: 90, stock: 48, purchase_price: 58 },
      { id: 'ml-6', category_id: 'millets', name: 'KODO MILLET', description: 'Rich in antioxidants and fiber, keeps you full for longer.', price: 85, stock: 52, purchase_price: 52 },

      // MILLET FLOUR (6)
      { id: 'fl-1', category_id: 'millet-flours', name: 'FINGER MILLET FLOUR', description: 'Finely ground stone-milled ragi flour for soft rotis.', price: 95, stock: 55, purchase_price: 60 },
      { id: 'fl-2', category_id: 'millet-flours', name: 'PEARL MILLET FLOUR', description: 'Nutritious pearl millet flour for authentic traditional flatbreads.', price: 90, stock: 40, purchase_price: 55 },
      { id: 'fl-3', category_id: 'millet-flours', name: 'FOXTAIL MILLET FLOUR', description: 'Light and premium flour for backing and health porridges.', price: 100, stock: 42, purchase_price: 65 },
      { id: 'fl-4', category_id: 'millet-flours', name: 'LITTLE MILLET FLOUR', description: 'Pure ground little millet flour for diverse healthy cooking.', price: 95, stock: 45, purchase_price: 60 },
      { id: 'fl-5', category_id: 'millet-flours', name: 'BARNYARD MILLET FLOUR', description: 'High fiber barnyard millet flour suitable for healthy snacks.', price: 100, stock: 38, purchase_price: 65 },
      { id: 'fl-6', category_id: 'millet-flours', name: 'KODO MILLET FLOUR', description: 'Excellent dietary fiber source for traditional kitchen recipes.', price: 95, stock: 40, purchase_price: 60 },

      // MILLET TIFFIN MIX (4)
      { id: 'tm-1', category_id: 'millet-tiffin-mix', name: 'MULTI MILLET DOSA MIX', description: 'Instant, healthy, and crispy millet dosa batter mix.', price: 120, stock: 35, purchase_price: 75 },
      { id: 'tm-2', category_id: 'millet-tiffin-mix', name: 'MULTI MILLET IDLY MIX', description: 'Soft and nutritious steaming millet idly prepared instantly.', price: 115, stock: 38, purchase_price: 72 },
      { id: 'tm-3', category_id: 'millet-tiffin-mix', name: 'MULTI MILLET PONGAL MIX', description: 'Comfort food made healthy with premium millets and lentils.', price: 130, stock: 30, purchase_price: 82 },
      { id: 'tm-4', category_id: 'millet-tiffin-mix', name: 'MULTI MILLET UPMA MIX', description: 'Coarse millet rava mix with traditional spices for breakfast.', price: 110, stock: 32, purchase_price: 68 },

      // MILLET NOODLES (5)
      { id: 'nd-1', category_id: 'millet-noodles', name: 'INSTANT MAGIC MASALA NOODLES', description: 'Delicious instant noodles with traditional Indian spice seasoning.', price: 85, stock: 100, purchase_price: 50 },
      { id: 'nd-2', category_id: 'millet-noodles', name: 'INSTANT CLASSIC MASALA NOODLES', description: 'Perfect classic flavor seasoning paired with healthy millet noodles.', price: 80, stock: 95, purchase_price: 48 },
      { id: 'nd-3', category_id: 'millet-noodles', name: 'INSTANT SCHEZWAN MASALA NOODLES', description: 'Spicy Schezwan kick blended with wholesome multi-millet base.', price: 90, stock: 90, purchase_price: 55 },
      { id: 'nd-4', category_id: 'millet-noodles', name: 'INSTANT MILD MASALA NOODLES', description: 'Soft and gentle spice blend, perfect for toddlers and kids.', price: 80, stock: 85, purchase_price: 48 },
      { id: 'nd-5', category_id: 'millet-noodles', name: 'HAKKA MULTIMILLET NOODLES', description: 'Pure Hakka style multi-millet noodles without tastemakers.', price: 95, stock: 80, purchase_price: 58 },

      // RICE (6)
      { id: 'rc-1', category_id: 'rice', name: 'BLACK KAVUNI RICE', description: 'Traditional royal black rice rich in anthocyanin antioxidants.', price: 190, stock: 50, purchase_price: 120 },
      { id: 'rc-2', category_id: 'rice', name: 'MAPPILLAI SAMBA RICE', description: 'Bridegroom rice, traditional variety known for strength and stamina.', price: 140, stock: 55, purchase_price: 90 },
      { id: 'rc-3', category_id: 'rice', name: 'RED RICE', description: 'Unpolished traditional red rice variety with high nutrient profile.', price: 120, stock: 60, purchase_price: 75 },
      { id: 'rc-4', category_id: 'rice', name: 'THOOYAMALLI RICE', description: 'Pure white jasmine rice variety, soft texture and highly aromatic.', price: 135, stock: 45, purchase_price: 85 },
      { id: 'rc-5', category_id: 'rice', name: 'KATTUYANAM RICE', description: 'Wild forest rice variety known for bone strength and immunity.', price: 150, stock: 40, purchase_price: 95 },
      { id: 'rc-6', category_id: 'rice', name: 'SEERAGA SAMBA RICE', description: 'Short grain aromatic rice, perfect for traditional village biryani.', price: 160, stock: 50, purchase_price: 100 },

      // NATURAL SUGAR (5)
      { id: 'sg-1', category_id: 'natural-sugar', name: 'DATES POWDER', description: '100% natural sweetener made from dehydrated premium dates.', price: 290, stock: 35, purchase_price: 180 },
      { id: 'sg-2', category_id: 'natural-sugar', name: 'JAGGERY POWDER', description: 'Traditional unrefined cane sugar powder, chemical free.', price: 110, stock: 65, purchase_price: 70 },
      { id: 'sg-3', category_id: 'natural-sugar', name: 'CANE JAGGERY', description: 'Solid blocks of traditional country jaggery, rich in iron.', price: 120, stock: 60, purchase_price: 75 },
      { id: 'sg-4', category_id: 'natural-sugar', name: 'PALM JAGGERY', description: 'Pure karupatti made from palm tree sap, high mineral value.', price: 260, stock: 30, purchase_price: 165 },
      { id: 'sg-5', category_id: 'natural-sugar', name: 'PALM CANDY', description: 'Panakarkandu, natural cooling sweetener for throat health.', price: 280, stock: 25, purchase_price: 175 },

      // MILLET COOKIES (6)
      { id: 'ck-1', category_id: 'millet-cookies', name: 'MULTI MILLET CHOCO COOKIES', description: 'Guilt-free baked cookies with rich cocoa and multi millets.', price: 140, stock: 45, purchase_price: 90 },
      { id: 'ck-2', category_id: 'millet-cookies', name: 'RAGI COOKIES', description: 'Crispy cookies baked with pure ragi flour and country sugar.', price: 120, stock: 50, purchase_price: 75 },
      { id: 'ck-3', category_id: 'millet-cookies', name: 'FOXTAIL MILLET COOKIES', description: 'High fiber, light, and delicious healthy tea-time snack.', price: 130, stock: 40, purchase_price: 82 },
      { id: 'ck-4', category_id: 'millet-cookies', name: 'LITTLE MILLET COOKIES', description: 'Healthy baked cookies made of nutritious little millets.', price: 130, stock: 40, purchase_price: 82 },
      { id: 'ck-5', category_id: 'millet-cookies', name: 'KODO MILLET COOKIES', description: 'Baked to perfection using premium kodo millet grains.', price: 130, stock: 40, purchase_price: 82 },
      { id: 'ck-6', category_id: 'millet-cookies', name: 'BARNYARD MILLET COOKIES', description: 'Gluten-free cookies loaded with natural sweetness and fiber.', price: 130, stock: 40, purchase_price: 82 },

      // SNACKS (7)
      { id: 'sk-1', category_id: 'snacks', name: 'BANANA CHIPS', description: 'Crispy wood-fired banana chips prepared in pure coconut oil.', price: 110, stock: 50, purchase_price: 70 },
      { id: 'sk-2', category_id: 'snacks', name: 'MILLET CHIKKI', description: 'Traditional peanut chikki with healthy multi-millet grains.', price: 75, stock: 70, purchase_price: 45 },
      { id: 'sk-3', category_id: 'snacks', name: 'PEANUT CANDY', description: 'Kadalai mittai, traditional crunchy sweet peanut blocks.', price: 60, stock: 80, purchase_price: 36 },
      { id: 'sk-4', category_id: 'snacks', name: 'PEANUT CHOCO BALL', description: 'Delicious fusion of roasted peanuts and sweet cocoa coating.', price: 90, stock: 60, purchase_price: 55 },
      { id: 'sk-5', category_id: 'snacks', name: 'ALMOND HEARTS', description: 'Premium heart-shaped snacks made with pure almonds and honey.', price: 180, stock: 30, purchase_price: 115 },
      { id: 'sk-6', category_id: 'snacks', name: 'MAKANA ONION BALL', description: 'Spiced and roasted lotus seeds flavored with rich onion spices.', price: 120, stock: 45, purchase_price: 75 },
      { id: 'sk-7', category_id: 'snacks', name: 'MULTIGRAIN BALL', description: 'Healthy roasted balls packed with traditional grains and nuts.', price: 100, stock: 50, purchase_price: 62 }
    ];

    for (const p of defaultProducts) {
      const defaultFaqs = [
        { q: `What is ${p.name}?`, a: `${p.name} is a nutritional wholesome product prepared from premium ingredients to deliver authentic taste and natural nourishment.` },
        { q: `Does it contain sugar or preservatives?`, a: `No. ${p.name} contains no artificial preservatives, synthetic colours, or chemical additives.` },
        { q: `How do I prepare or serve it?`, a: `Mix with water or warm milk, cook for 5-7 minutes over low heat if required, and serve. Best consumed fresh.` }
      ];
      await query(
        `INSERT INTO products (
          id, category_id, name, description, price, weights, badge, stock, purchase_price, benefits, ingredients, features, faqs
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          category_id = EXCLUDED.category_id,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          badge = COALESCE(EXCLUDED.badge, products.badge),
          stock = EXCLUDED.stock,
          purchase_price = EXCLUDED.purchase_price,
          faqs = COALESCE(EXCLUDED.faqs, products.faqs)`,
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
          JSON.stringify({ shelf_life: '6 Months', suitable_for: 'Babies (6+ months), Toddlers' }),
          JSON.stringify(defaultFaqs)
        ]
      );
    }
    console.log('✅  Products catalog synced.');

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

    // Seed default coupons
    console.log('🔄  Syncing coupons catalog...');
    const defaultCoupons = [
      { code: 'VILLAGE10', discount_type: 'percentage', discount_value: 10.00, min_cart_value: 0.00 },
      { code: 'WELCOME100', discount_type: 'flat', discount_value: 100.00, min_cart_value: 300.00 },
      { code: 'FRESH50', discount_type: 'flat', discount_value: 50.00, min_cart_value: 200.00 }
    ];
    for (const c of defaultCoupons) {
      await query(
        `INSERT INTO coupons (code, discount_type, discount_value, min_cart_value, active) 
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (code) DO UPDATE SET 
           discount_type = EXCLUDED.discount_type,
           discount_value = EXCLUDED.discount_value,
           min_cart_value = EXCLUDED.min_cart_value`,
        [c.code, c.discount_type, c.discount_value, c.min_cart_value]
      );
    }
    console.log('✅  Coupons synced.');
  } catch (error) {
    console.error('❌  Error initializing relational database tables:', error);
  }
}
