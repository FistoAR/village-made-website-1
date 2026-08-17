import { Router } from 'express';
import { query } from '../config/db.js';
import { broadcastOrderPlaced } from '../config/socket.js';

export const orderRouter = Router();

/**
 * POST /api/orders
 * Place a new order (supports guest and registered users)
 */
orderRouter.post('/', async (req, res, next) => {
  const { id, mobile, date, subtotal, shipping, tax, total, address, items } = req.body;

  if (!id || !address || !items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Order ID, address, and items are required.' });
  }

  try {
    let userId = null;

    if (mobile) {
      const userRes = await query('SELECT id FROM users WHERE mobile = $1', [mobile]);
      if (userRes.rows.length > 0) {
        userId = userRes.rows[0].id;
      }
    }

    await query(
      `INSERT INTO orders (id, user_id, date, subtotal, shipping, tax, total, status, address, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Processing', $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        userId,
        date || new Date().toLocaleDateString('en-IN'),
        subtotal,
        shipping,
        tax,
        total,
        JSON.stringify(address),
        JSON.stringify(items)
      ]
    );

    // Seed notification if registered user
    if (userId) {
      const notifId = Math.random().toString(36).substring(2, 11);
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          notifId,
          userId,
          'Order Placed!',
          `Your order ${id} has been received and is being processed.`,
          date || new Date().toLocaleDateString('en-IN')
        ]
      );
    }

    const orderData = {
      id,
      date: date || new Date().toLocaleDateString('en-IN'),
      subtotal: parseFloat(subtotal) || 0,
      shipping: parseFloat(shipping) || 0,
      tax: parseFloat(tax) || 0,
      total: parseFloat(total) || 0,
      status: 'Processing',
      address,
      items
    };
    broadcastOrderPlaced(id, orderData);

    return res.status(201).json({ success: true, message: 'Order placed successfully.', orderId: id });
  } catch (error) {
    next(error);
  }
});
