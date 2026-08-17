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

    const initialHistory = [{ status: 'Processing', date: date || new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'), remarks: 'Order placed' }];
    await query(
      `INSERT INTO orders (id, user_id, date, subtotal, shipping, tax, total, status, address, items, status_history)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Processing', $8, $9, $10)
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
        JSON.stringify(items),
        JSON.stringify(initialHistory)
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

/**
 * GET /api/orders/:id
 * Retrieve a single order by its ID (public/guest-friendly tracking)
 */
orderRouter.get('/:id', async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const o = orderRes.rows[0];
    const orderData = {
      id: o.id,
      date: o.date,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
      status: o.status,
      remarks: o.remarks || null,
      appeal_submitted: o.appeal_submitted || false,
      status_history: typeof o.status_history === 'string' ? JSON.parse(o.status_history) : (o.status_history || []),
      address: typeof o.address === 'string' ? JSON.parse(o.address) : o.address,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    };

    return res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    next(error);
  }
});
