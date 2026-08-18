import { Router } from 'express';
import { query } from '../config/db.js';
import multer from 'multer';

export const galleryRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/gallery/upload - Upload file directly to Supabase storage (gallery-items bucket)
galleryRouter.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided.' });
    }

    const bucket = 'gallery-items';
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

// GET /api/gallery - Fetch active gallery items
galleryRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, title, url, type, display_order, active, last_updated FROM gallery_items WHERE active = true ORDER BY display_order ASC, id ASC'
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/gallery/all - Fetch all gallery items (for admin panel)
galleryRouter.get('/all', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, title, url, type, display_order, active, last_updated FROM gallery_items ORDER BY display_order ASC, id ASC'
    );
    res.json({ success: true, items: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/gallery - Create a new gallery item
galleryRouter.post('/', async (req, res, next) => {
  try {
    const { title, url, type, display_order, active } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, error: 'Title and URL are required' });
    }
    const result = await query(
      `INSERT INTO gallery_items (title, url, type, display_order, active, last_updated)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, title, url, type, display_order, active, last_updated`,
      [title, url, type || 'image', display_order || 0, active !== false]
    );
    res.status(201).json({ success: true, item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/gallery/:id - Update an existing gallery item
galleryRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url, type, display_order, active } = req.body;
    
    const check = await query('SELECT * FROM gallery_items WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    const current = check.rows[0];
    const newTitle = title !== undefined ? title : current.title;
    const newUrl = url !== undefined ? url : current.url;
    const newType = type !== undefined ? type : current.type;
    const newDisplayOrder = display_order !== undefined ? display_order : current.display_order;
    const newActive = active !== undefined ? active : current.active;

    const result = await query(
      `UPDATE gallery_items
       SET title = $1, url = $2, type = $3, display_order = $4, active = $5, last_updated = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, title, url, type, display_order, active, last_updated`,
      [newTitle, newUrl, newType, newDisplayOrder, newActive, id]
    );

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/gallery/:id - Delete a gallery item
galleryRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await query('SELECT * FROM gallery_items WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }
    await query('DELETE FROM gallery_items WHERE id = $1', [id]);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (err) {
    next(err);
  }
});
