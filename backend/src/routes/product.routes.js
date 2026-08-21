import { Router } from 'express';
import { query } from '../config/db.js';
import multer from 'multer';
import { broadcastInventoryUpdate } from '../config/socket.js';

export const productRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/products
 * Fetch all persist catalog products
 */
productRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*, c.name as category_name,
             ROUND(CAST(COALESCE(rev.avg_rating, p.rating) AS NUMERIC), 1) as aggregated_rating,
             COALESCE(rev.review_count, p.reviews) as aggregated_reviews
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT product_id, 
               AVG(rating) as avg_rating, 
               COUNT(id) as review_count
        FROM reviews
        GROUP BY product_id
      ) rev ON rev.product_id = p.id
      ORDER BY p.id ASC
    `);

    const products = result.rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      category: row.category_name,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      discount: row.discount || undefined,
      rating: Number(row.aggregated_rating),
      reviews: Number(row.aggregated_reviews),
      weights: typeof row.weights === 'string' ? JSON.parse(row.weights) : row.weights,
      badge: row.badge || undefined,
      stock: Number(row.stock),
      purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
      image: row.image_url || undefined,
      video: row.video_url || undefined,
      benefits: typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
      faqs: typeof row.faqs === 'string' ? JSON.parse(row.faqs) : (row.faqs || []),
      shelfLife: row.shelf_life || undefined,
      shelfLifeDetails: row.shelf_life_details || undefined,
      suitableFor: typeof row.suitable_for === 'string' ? JSON.parse(row.suitable_for) : (row.suitable_for || undefined),
      recipes: typeof row.recipes === 'string' ? JSON.parse(row.recipes) : (row.recipes || []),
      descriptionImage: row.description_image || undefined
    }));

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/categories
 * Fetch all categories
 */
productRouter.get('/categories', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    return res.status(200).json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create a new catalog product
 */
productRouter.post('/', async (req, res, next) => {
  const {
    id, categoryId, name, description, price, originalPrice, discount,
    weights, badge, stock, purchasePrice, imageUrl, videoUrl, benefits, ingredients, features, faqs,
    shelfLife, shelfLifeDetails, suitableFor, recipes, descriptionImage
  } = req.body;

  if (!id || !categoryId || !name || !price) {
    return res.status(400).json({ success: false, error: 'Product ID, category, name, and price are required.' });
  }

  try {
    const checkExist = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ success: false, error: `Product with ID "${id}" already exists.` });
    }

    await query(
      `INSERT INTO products (
        id, category_id, name, description, price, original_price, discount,
        weights, badge, stock, purchase_price, image_url, video_url, benefits, ingredients, features, faqs,
        shelf_life, shelf_life_details, suitable_for, recipes, description_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [
        id,
        categoryId,
        name,
        description || '',
        price,
        originalPrice || null,
        discount || null,
        JSON.stringify(weights || ['250 g', '500 g', '1 kg']),
        badge || null,
        stock || 50,
        purchasePrice || null,
        imageUrl || null,
        videoUrl || null,
        JSON.stringify(benefits || []),
        JSON.stringify(ingredients || []),
        JSON.stringify(features || {}),
        JSON.stringify(faqs || []),
        shelfLife || null,
        shelfLifeDetails || null,
        JSON.stringify(suitableFor || null),
        JSON.stringify(recipes || []),
        descriptionImage || null
      ]
    );

    return res.status(201).json({ success: true, message: 'Product created successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id
 * Update an existing catalog product details
 */
productRouter.put('/:id', async (req, res, next) => {
  const productId = req.params.id;
  const {
    categoryId, name, description, price, originalPrice, discount,
    weights, badge, stock, purchasePrice, imageUrl, videoUrl, benefits, ingredients, features, faqs,
    shelfLife, shelfLifeDetails, suitableFor, recipes, descriptionImage
  } = req.body;

  try {
    const checkExist = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const currentProduct = checkExist.rows[0];
    const currentStock = Number(currentProduct.stock);
    const currentWeights = typeof currentProduct.weights === 'string' ? JSON.parse(currentProduct.weights) : (currentProduct.weights || []);

    // Merge incoming weights with existing weights to preserve their stocks.
    // If a weight variant did not exist previously, its stock starts at 0.
    let finalWeights = [];
    if (Array.isArray(weights)) {
      finalWeights = weights.map(w => {
        const weightName = typeof w === 'object' && w !== null ? w.weight : w;
        
        // Search for existing variant to preserve stock
        const existingVariant = Array.isArray(currentWeights) && currentWeights.find(cw => {
          const cwName = typeof cw === 'object' && cw !== null ? cw.weight : cw;
          return String(cwName).toLowerCase().replace(/\s+/g, '') === String(weightName).toLowerCase().replace(/\s+/g, '');
        });

        const existingStock = (existingVariant && typeof existingVariant === 'object' && typeof existingVariant.stock === 'number')
          ? existingVariant.stock
          : 0;

        if (typeof w === 'object' && w !== null) {
          return { ...w, stock: existingStock };
        } else {
          return { weight: w, price: price, stock: existingStock };
        }
      });
    } else {
      finalWeights = currentWeights;
    }

    const finalStock = currentStock;

    await query(
      `UPDATE products 
       SET category_id = $1, name = $2, description = $3, price = $4, original_price = $5, discount = $6,
           weights = $7, badge = $8, stock = $9, purchase_price = $10, image_url = $11, video_url = $12,
           benefits = $13, ingredients = $14, features = $15, faqs = $16,
           shelf_life = $17, shelf_life_details = $18, suitable_for = $19, recipes = $20,
           description_image = $21
       WHERE id = $22`,
      [
        categoryId,
        name,
        description || '',
        price,
        originalPrice || null,
        discount || null,
        JSON.stringify(finalWeights),
        badge || null,
        finalStock,
        purchasePrice || currentProduct.purchase_price || null,
        imageUrl || null,
        videoUrl || null,
        JSON.stringify(benefits || []),
        JSON.stringify(ingredients || []),
        JSON.stringify(features || {}),
        JSON.stringify(faqs || []),
        shelfLife || null,
        shelfLifeDetails || null,
        JSON.stringify(suitableFor || null),
        JSON.stringify(recipes || []),
        descriptionImage || null,
        productId
      ]
    );

    broadcastInventoryUpdate(productId, finalStock, finalWeights);

    return res.status(200).json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id
 * Remove a catalog product
 */
productRouter.delete('/:id', async (req, res, next) => {
  const productId = req.params.id;
  try {
    const checkExist = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await query('DELETE FROM products WHERE id = $1', [productId]);
    return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products/upload
 * Upload a file directly to Supabase storage (product-images or product-videos bucket)
 */
productRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided.' });
    }

    const { bucket } = req.body; // e.g. 'product-images' or 'product-videos'
    if (!bucket || !['product-images', 'product-videos'].includes(bucket)) {
      return res.status(400).json({ success: false, error: 'Invalid bucket destination.' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.floor(Math.random() * 100000)}.${fileExt}`;
    
    const supabaseUrl = 'https://npkywzfheuvmdiybxrwr.supabase.co';
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`;

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        'Content-Type': req.file.mimetype,
      },
      body: req.file.buffer
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error('Supabase upload error:', uploadData);
      return res.status(uploadRes.status).json({ success: false, error: uploadData.error || 'Failed to upload to Supabase.' });
    }

    // Public URL format:
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;

    return res.status(200).json({
      success: true,
      url: publicUrl
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products/categories
 * Add a new category
 */
productRouter.post('/categories', async (req, res, next) => {
  const { id, name, description } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, error: 'Category ID and name are required.' });
  }

  try {
    const checkExist = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ success: false, error: `Category with ID "${id}" already exists.` });
    }

    await query(
      `INSERT INTO categories (id, name, description, display_order) 
       VALUES ($1, $2, $3, COALESCE((SELECT MAX(display_order) + 10 FROM categories), 10))`,
      [id, name, description || '']
    );

    return res.status(201).json({ success: true, message: 'Category added successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/categories/reorder
 * Reorder categories in bulk
 */
productRouter.put('/categories/reorder', async (req, res, next) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ success: false, error: 'Invalid orders data. Must be an array of category order items.' });
  }

  try {
    for (const item of orders) {
      if (item.id && typeof item.display_order === 'number') {
        await query('UPDATE categories SET display_order = $1 WHERE id = $2', [item.display_order, item.id]);
      }
    }
    return res.status(200).json({ success: true, message: 'Categories reordered successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id/reviews
 * Fetch all reviews for a product
 */
productRouter.get('/:id/reviews', async (req, res, next) => {
  const productId = req.params.id;
  try {
    const result = await query(`
      SELECT r.id, r.user_id, r.product_id, r.product_name, r.rating, r.comment, r.date, r.title, r.helpful, u.name as author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.id DESC
    `, [productId]);

    const reviews = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      productName: row.product_name,
      rating: Number(row.rating),
      comment: row.comment,
      date: row.date,
      title: row.title || 'Verified Purchase Review',
      helpful: Number(row.helpful || 0),
      author: row.author || 'Anonymous'
    }));

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products/:id/reviews
 * Add a review for a product (gated by auth/login via body mobile check)
 */
productRouter.post('/:id/reviews', async (req, res, next) => {
  const productId = req.params.id;
  const { author, rating, title, comment, mobile } = req.body;

  if (!comment || rating === undefined) {
    return res.status(400).json({ success: false, error: 'Rating and comment are required.' });
  }

  try {
    // Check if user exists by mobile
    const userRes = await query('SELECT id, name FROM users WHERE mobile = $1', [mobile]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User session not found. Please log in first.' });
    }
    const userId = userRes.rows[0].id;
    const authorName = author || userRes.rows[0].name || 'Anonymous';

    const prodRes = await query('SELECT name FROM products WHERE id = $1', [productId]);
    const productName = prodRes.rows.length > 0 ? prodRes.rows[0].name : 'Product';

    const reviewId = `rev-${Math.random().toString(36).substring(2, 11)}`;
    const dateStr = new Date().toLocaleDateString('en-IN');

    await query(
      `INSERT INTO reviews (id, user_id, product_id, product_name, rating, comment, date, title, helpful)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)`,
      [reviewId, userId, productId, productName, rating, comment, dateStr, title || 'Verified Purchase Review']
    );

    return res.status(201).json({ success: true, message: 'Review saved successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id/reviews/:reviewId
 * Edit a review for a product
 */
productRouter.put('/:id/reviews/:reviewId', async (req, res, next) => {
  const { id: productId, reviewId } = req.params;
  const { rating, title, comment, mobile } = req.body;

  if (!comment || rating === undefined) {
    return res.status(400).json({ success: false, error: 'Rating and comment are required.' });
  }

  try {
    // Check if user exists by mobile
    const userRes = await query('SELECT id FROM users WHERE mobile = $1', [mobile]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User session not found. Please log in first.' });
    }
    const userId = userRes.rows[0].id;

    // Verify ownership of the review
    const reviewRes = await query('SELECT user_id FROM reviews WHERE id = $1 AND product_id = $2', [reviewId, productId]);
    if (reviewRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    if (reviewRes.rows[0].user_id !== userId) {
      return res.status(403).json({ success: false, error: 'You are not authorized to edit this review.' });
    }

    await query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, title = $3, date = $4
       WHERE id = $5 AND product_id = $6`,
      [rating, comment, title || 'Verified Purchase Review', new Date().toLocaleDateString('en-IN'), reviewId, productId]
    );

    return res.status(200).json({ success: true, message: 'Review updated successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id/reviews/:reviewId
 * Delete a review for a product
 */
productRouter.delete('/:id/reviews/:reviewId', async (req, res, next) => {
  const { id: productId, reviewId } = req.params;
  const { mobile } = req.body;

  try {
    // Check if user exists by mobile
    const userRes = await query('SELECT id, role FROM users WHERE mobile = $1', [mobile]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User session not found. Please log in first.' });
    }
    const userId = userRes.rows[0].id;
    const userRole = userRes.rows[0].role;

    // Verify ownership or check if admin
    const reviewRes = await query('SELECT user_id FROM reviews WHERE id = $1 AND product_id = $2', [reviewId, productId]);
    if (reviewRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    if (reviewRes.rows[0].user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this review.' });
    }

    await query('DELETE FROM reviews WHERE id = $1 AND product_id = $2', [reviewId, productId]);
    return res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products/decrement-stock
 * Decrease product stock after validation in checkout flow
 */
productRouter.post('/decrement-stock', async (req, res, next) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Items list is required.' });
  }

  try {
    // Run validation & updates in a SQL Transaction
    await query('BEGIN');

    const updatedStocks = [];
    for (const item of items) {
      const prodRes = await query('SELECT weights, stock, name FROM products WHERE id = $1', [item.id]);
      if (prodRes.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Product with ID ${item.id} not found.` });
      }

      const product = prodRes.rows[0];
      const weights = typeof product.weights === 'string' ? JSON.parse(product.weights) : product.weights;
      let availableStock = Number(product.stock);
      let variantFound = false;

      if (Array.isArray(weights) && item.weight) {
        const cleanWeight = item.weight.toLowerCase().replace(/\s+/g, '');
        const variant = weights.find(w => typeof w === 'object' && w !== null && w.weight && w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight);
        if (variant && typeof variant.stock === 'number') {
          availableStock = variant.stock;
          variantFound = true;
        }
      }

      if (availableStock < item.quantity) {
        await query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock for "${product.name}" (${item.weight || 'Default'}). Available: ${availableStock}, requested: ${item.quantity}.` 
        });
      }

      let nextWeights = weights;
      let nextStock = Number(product.stock);

      if (variantFound) {
        const cleanWeight = item.weight.toLowerCase().replace(/\s+/g, '');
        nextWeights = weights.map(w => {
          if (typeof w === 'object' && w !== null && w.weight && w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight) {
            return { ...w, stock: Math.max(0, w.stock - item.quantity) };
          }
          return w;
        });
        
        const allHaveStock = nextWeights.every(w => typeof w === 'object' && w !== null && typeof w.stock === 'number');
        if (allHaveStock) {
          nextStock = nextWeights.reduce((sum, w) => sum + w.stock, 0);
        } else {
          nextStock = Math.max(0, nextStock - item.quantity);
        }
      } else {
        nextStock = Math.max(0, nextStock - item.quantity);
      }

      await query('UPDATE products SET weights = $1, stock = $2 WHERE id = $3', [JSON.stringify(nextWeights), nextStock, item.id]);
      updatedStocks.push({ id: item.id, stock: nextStock });
    }

    await query('COMMIT');

    for (const u of updatedStocks) {
      broadcastInventoryUpdate(u.id, u.stock);
    }

    return res.status(200).json({ success: true, message: 'Stock allocated and decremented successfully.' });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
});

/**
 * POST /api/products/validate-coupon
 * Validate coupon code against the DB coupons table
 */
productRouter.post('/validate-coupon', async (req, res, next) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Coupon code is required.' });
  }

  try {
    const couponRes = await query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND active = true', [code.trim()]);
    if (couponRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code.' });
    }

    const coupon = couponRes.rows[0];
    
    // Validate minimum cart value
    const minVal = Number(coupon.min_cart_value);
    if (cartTotal < minVal) {
      return res.status(400).json({ 
        success: false, 
        error: `Minimum cart purchase value of ₹${minVal} is required for this coupon.` 
      });
    }

    // Check expiry if any
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, error: 'This coupon code has expired.' });
    }

    let discountValue = 0;
    if (coupon.discount_type === 'percentage') {
      discountValue = Math.round(cartTotal * (Number(coupon.discount_value) / 100));
    } else {
      discountValue = Number(coupon.discount_value);
    }

    return res.status(200).json({ 
      success: true, 
      discountType: coupon.discount_type, 
      discountValue: discountValue,
      message: `${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : 'Flat ₹' + coupon.discount_value} discount applied successfully!` 
    });
  } catch (error) {
    next(error);
  }
});

