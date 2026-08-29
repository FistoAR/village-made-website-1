import { Router } from 'express';
import { query } from '../config/db.js';

export const settingsRouter = Router();

// GET /api/settings/active-deal-banners
// Returns all active deal banners
settingsRouter.get('/active-deal-banners', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, title, discount_text as "discountText", description, button_text as "buttonText", button_link as "buttonLink", image_url as "imageUrl", schedule_type as "scheduleType", start_date as "startDate", end_date as "endDate", days_of_week as "daysOfWeek", position, active FROM deal_of_the_day_banners WHERE active = true'
    );
    return res.status(200).json({ success: true, banners: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /api/settings/:key
settingsRouter.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT key, value FROM settings WHERE key = $1', [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }
    
    return res.status(200).json({
      success: true,
      setting: {
        key: result.rows[0].key,
        value: typeof result.rows[0].value === 'string' ? JSON.parse(result.rows[0].value) : result.rows[0].value
      }
    });
  } catch (error) {
    next(error);
  }
});
