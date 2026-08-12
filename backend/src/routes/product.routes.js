import { Router } from 'express';
import { query } from '../config/db.js';
import multer from 'multer';

export const productRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/products
 * Fetch all persist catalog products
 */
productRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
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
      rating: Number(row.rating),
      reviews: Number(row.reviews),
      weights: typeof row.weights === 'string' ? JSON.parse(row.weights) : row.weights,
      badge: row.badge || undefined,
      stock: Number(row.stock),
      purchasePrice: row.purchase_price ? Number(row.purchase_price) : undefined,
      image: row.image_url || undefined,
      video: row.video_url || undefined,
      benefits: typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits,
      ingredients: typeof row.ingredients === 'string' ? JSON.parse(row.ingredients) : row.ingredients,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
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
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
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
    weights, badge, stock, purchasePrice, imageUrl, videoUrl, benefits, ingredients, features
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
        weights, badge, stock, purchase_price, image_url, video_url, benefits, ingredients, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
        JSON.stringify(features || {})
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
    weights, badge, stock, purchasePrice, imageUrl, videoUrl, benefits, ingredients, features
  } = req.body;

  try {
    const checkExist = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await query(
      `UPDATE products 
       SET category_id = $1, name = $2, description = $3, price = $4, original_price = $5, discount = $6,
           weights = $7, badge = $8, stock = $9, purchase_price = $10, image_url = $11, video_url = $12,
           benefits = $13, ingredients = $14, features = $15
       WHERE id = $16`,
      [
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
        productId
      ]
    );

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
      'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3)',
      [id, name, description || '']
    );

    return res.status(201).json({ success: true, message: 'Category added successfully.' });
  } catch (error) {
    next(error);
  }
});

