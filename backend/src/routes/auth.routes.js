import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { broadcastInventoryUpdate } from '../config/socket.js';

export const authRouter = Router();

// Helper function to fetch a complete user object from relational tables
const fetchUserData = async (dbUser) => {
  const userId = dbUser.id;
  const addressesRes = await query('SELECT * FROM addresses WHERE user_id = $1', [userId]);
  const reviewsRes = await query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
  const notificationsRes = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY date DESC', [userId]);
  const ordersRes = await query('SELECT * FROM orders WHERE user_id = $1', [userId]);

  return {
    mobile: dbUser.mobile,
    name: dbUser.name || '',
    email: dbUser.email || '',
    phone: dbUser.phone || dbUser.mobile,
    role: dbUser.role || 'customer',
    addresses: addressesRes.rows.map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      address: a.address,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.is_default
    })),
    orders: ordersRes.rows.map(o => ({
      id: o.id,
      date: o.date,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
      status: o.status,
      address: typeof o.address === 'string' ? JSON.parse(o.address) : o.address,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    })),
    wishlist: [],
    reviews: reviewsRes.rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      rating: Number(r.rating),
      comment: r.comment,
      date: r.date
    })),
    notifications: notificationsRes.rows.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      date: n.date,
      read: n.read
    }))
  };
};

/**
 * POST /api/auth/register
 */
authRouter.post('/register', async (req, res, next) => {
  const { mobile, password, name, email, phone } = req.body;

  if (!mobile || mobile.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Valid mobile number is required.' });
  }

  if (!password || password.trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const cleanMobile = mobile.trim();

  try {
    const checkUser = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Mobile number already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const insertQuery = `
      INSERT INTO users (mobile, password, name, email, phone, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, mobile, name, email, phone, created_at
    `;
    const result = await query(insertQuery, [
      cleanMobile,
      hashedPassword,
      name || null,
      email || null,
      phone || cleanMobile,
    ]);

    const newUser = result.rows[0];

    // Seed welcoming notification in notifications table
    const notifId = Math.random().toString(36).substring(2, 11);
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [
        notifId,
        newUser.id,
        'Welcome to Village Made!',
        'Thank you for registering. Explore our organic village-crafted malts, millets, and cookies.',
        new Date().toLocaleDateString('en-IN')
      ]
    );

    const userPayload = await fetchUserData(newUser);
    return res.status(201).json({ success: true, user: userPayload });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', async (req, res, next) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ success: false, error: 'Mobile number and password are required.' });
  }

  const cleanMobile = mobile.trim();

  try {
    const userResult = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Mobile number not found. Please register first.' });
    }

    const dbUser = userResult.rows[0];

    if (!dbUser.password) {
      return res.status(400).json({ success: false, error: 'No password set for this account. Please use account recovery.' });
    }

    const isMatch = await bcrypt.compare(password.trim(), dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    const user = await fetchUserData(dbUser);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 */
authRouter.post('/reset-password', async (req, res, next) => {
  const { mobile, otp, newPassword } = req.body;

  if (!mobile || !otp || !newPassword) {
    return res.status(400).json({ success: false, error: 'Mobile, OTP, and new password are required.' });
  }

  if (otp !== '112233') {
    return res.status(400).json({ success: false, error: 'Invalid verification OTP.' });
  }

  if (newPassword.trim().length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  try {
    const cleanMobile = mobile.trim();
    const userResult = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User mobile number not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    await query('UPDATE users SET password = $1 WHERE mobile = $2', [hashedPassword, cleanMobile]);
    return res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 */
authRouter.put('/profile', async (req, res, next) => {
  const { mobile, name, email, phone, addresses, wishlist, reviews, notifications, orders } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, error: 'User mobile is required.' });
  }

  try {
    const cleanMobile = mobile.trim();
    const userResult = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const dbUser = userResult.rows[0];
    const userId = dbUser.id;

    // Update main user profile info
    const fieldsToUpdate = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) {
      fieldsToUpdate.push(`name = $${paramIdx++}`);
      params.push(name);
    }
    if (email !== undefined) {
      fieldsToUpdate.push(`email = $${paramIdx++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      fieldsToUpdate.push(`phone = $${paramIdx++}`);
      params.push(phone);
    }
    if (req.body.password !== undefined && req.body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
      fieldsToUpdate.push(`password = $${paramIdx++}`);
      params.push(hashedPassword);
    }

    if (fieldsToUpdate.length > 0) {
      params.push(userId);
      const updateQuery = `
        UPDATE users 
        SET ${fieldsToUpdate.join(', ')} 
        WHERE id = $${paramIdx}
      `;
      await query(updateQuery, params);
    }

    // Sync Addresses
    if (addresses !== undefined) {
      await query('DELETE FROM addresses WHERE user_id = $1', [userId]);
      for (const addr of addresses) {
        await query(
          `INSERT INTO addresses (id, user_id, name, phone, address, city, state, pincode, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [addr.id, userId, addr.name, addr.phone, addr.address, addr.city, addr.state || '', addr.pincode, addr.isDefault || false]
        );
      }
    }


    // Sync Reviews
    if (reviews !== undefined) {
      await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
      for (const rev of reviews) {
        await query(
          `INSERT INTO reviews (id, user_id, product_id, product_name, rating, comment, date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [rev.id, userId, rev.productId, rev.productName, rev.rating, rev.comment, rev.date]
        );
      }
    }

    // Sync Notifications
    if (notifications !== undefined) {
      await query('DELETE FROM notifications WHERE user_id = $1', [userId]);
      for (const notif of notifications) {
        await query(
          `INSERT INTO notifications (id, user_id, title, message, date, read)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO NOTHING`,
          [notif.id, userId, notif.title, notif.message, notif.date, notif.read || false]
        );
      }
    }

    // Sync Orders
    if (orders !== undefined) {
      await query('DELETE FROM orders WHERE user_id = $1', [userId]);
      for (const ord of orders) {
        await query(
          `INSERT INTO orders (id, user_id, date, subtotal, shipping, tax, total, status, address, items)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [ord.id, userId, ord.date, ord.subtotal, ord.shipping, ord.tax, ord.total, ord.status, JSON.stringify(ord.address), JSON.stringify(ord.items)]
        );
      }
    }

    // Get the updated fresh record
    const freshUserResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const updatedUser = await fetchUserData(freshUserResult.rows[0]);

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/orders/:id/cancel
 * Cancel order and restore product stock
 */
authRouter.post('/orders/:id/cancel', async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'Processing') {
      return res.status(400).json({ 
        success: false, 
        error: `Only orders in "Processing" status can be cancelled. Current status: ${order.status}` 
      });
    }

    // Begin SQL Transaction to update status and restore stock
    await query('BEGIN');

    await query("UPDATE orders SET status = 'Cancelled' WHERE id = $1", [orderId]);

    // Restore stock
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const updatedProducts = [];
    for (const item of items) {
      const prodRes = await query('UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING stock', [item.quantity, item.id]);
      if (prodRes.rows.length > 0) {
        updatedProducts.push({ id: item.id, stock: Number(prodRes.rows[0].stock) });
      }
    }

    // Insert user notification
    const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [
        notifId,
        order.user_id,
        'Order Cancelled',
        `Your order ${orderId} has been successfully cancelled and your payment has been queued for refund.`,
        new Date().toLocaleDateString('en-IN')
      ]
    );

    await query('COMMIT');

    for (const p of updatedProducts) {
      broadcastInventoryUpdate(p.id, p.stock);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Order cancelled successfully and inventory restored.',
      status: 'Cancelled' 
    });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
});

/**
 * POST /api/auth/orders/:id/return
 * Request a return/refund for a delivered order
 */
authRouter.post('/orders/:id/return', async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        error: `Only orders that are in "Delivered" status can be returned. Current status: ${order.status}` 
      });
    }

    await query("UPDATE orders SET status = 'Return Requested' WHERE id = $1", [orderId]);

    // Insert user notification
    const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [
        notifId,
        order.user_id,
        'Return Requested',
        `Your return request for order ${orderId} has been received. Our team will verify and approve the return shortly.`,
        new Date().toLocaleDateString('en-IN')
      ]
    );

    return res.status(200).json({ 
      success: true, 
      message: 'Return request submitted successfully.',
      status: 'Return Requested' 
    });
  } catch (error) {
    next(error);
  }
});
