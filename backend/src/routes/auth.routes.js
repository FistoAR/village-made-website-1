import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { broadcastInventoryUpdate, broadcastOrderUpdate, broadcastNewNotification } from '../config/socket.js';

export const authRouter = Router();

// Helper function to fetch a complete user object from relational tables
const fetchUserData = async (dbUser) => {
  const userId = dbUser.id;
  const addressesRes = await query('SELECT * FROM addresses WHERE user_id = $1', [userId]);
  const reviewsRes = await query('SELECT * FROM reviews WHERE user_id = $1', [userId]);
  const notificationsRes = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY date DESC', [userId]);
  const ordersRes = await query('SELECT * FROM orders WHERE user_id = $1', [userId]);

  return {
    id: dbUser.id,
    mobile: dbUser.mobile,
    name: dbUser.name || '',
    email: dbUser.email || '',
    phone: dbUser.phone || dbUser.mobile,
    role: dbUser.role || 'customer',
    is_guest: Boolean(dbUser.is_guest || !dbUser.password),
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
      remarks: o.remarks || null,
      appeal_submitted: o.appeal_submitted || false,
      status_history: typeof o.status_history === 'string' ? JSON.parse(o.status_history) : (o.status_history || []),
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
      date: r.date,
      title: r.title || 'Verified Purchase Review'
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
      const existing = checkUser.rows[0];
      if (!existing.is_guest && existing.password) {
        return res.status(400).json({ success: false, error: 'Mobile number already registered.' });
      }

      // Upgrade existing guest user account to a permanent account with password!
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);

      await query(
        `UPDATE users 
         SET password = $1, 
             name = COALESCE($2, name), 
             email = COALESCE($3, email), 
             phone = COALESCE($4, phone), 
             is_guest = false 
         WHERE id = $5`,
        [hashedPassword, name || null, email || null, phone || cleanMobile, existing.id]
      );

      const updatedRes = await query('SELECT * FROM users WHERE id = $1', [existing.id]);
      const userData = await fetchUserData(updatedRes.rows[0]);
      return res.status(200).json({
        success: true,
        message: 'Guest account upgraded successfully!',
        user: userData
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const insertQuery = `
      INSERT INTO users (mobile, password, name, email, phone, is_guest, created_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW())
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
        'Welcome to Village Made Organics!',
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
 * POST /api/auth/guest-login
 * Allows guests to access & track their orders using Name + Mobile Number
 */
authRouter.post('/guest-login', async (req, res, next) => {
  const { name, mobile } = req.body;

  if (!mobile || mobile.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
  }

  const cleanMobile = mobile.trim();
  const cleanName = (name || '').trim();

  try {
    const userRes = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);

    if (userRes.rows.length > 0) {
      const dbUser = userRes.rows[0];

      // SECURITY RULE: Deny guest login if user has a password-protected registered account
      if (!dbUser.is_guest && dbUser.password) {
        return res.status(403).json({
          success: false,
          isRegisteredUser: true,
          error: 'An account with password protection exists for this mobile number. Please log in using your password.'
        });
      }

      // Update name if provided
      if (cleanName && (!dbUser.name || dbUser.name !== cleanName)) {
        await query('UPDATE users SET name = $1 WHERE id = $2', [cleanName, dbUser.id]);
        dbUser.name = cleanName;
      }

      const userData = await fetchUserData(dbUser);
      return res.status(200).json({
        success: true,
        message: 'Guest session active.',
        user: { ...userData, is_guest: true }
      });
    } else {
      // Check if there are orders placed with this mobile number
      const ordersRes = await query(
        `SELECT * FROM orders WHERE address->>'phone' = $1 OR address->>'mobile' = $1`,
        [cleanMobile]
      );

      if (ordersRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No orders found for this mobile number. Please check your mobile number or create an account.'
        });
      }

      // Orders exist! Create guest user account and link orders
      const insertGuest = await query(
        `INSERT INTO users (mobile, name, is_guest, created_at)
         VALUES ($1, $2, true, NOW())
         RETURNING *`,
        [cleanMobile, cleanName || 'Guest Customer']
      );

      const newGuest = insertGuest.rows[0];

      await query(
        `UPDATE orders SET user_id = $1 WHERE address->>'phone' = $2 OR address->>'mobile' = $2`,
        [newGuest.id, cleanMobile]
      );

      const userData = await fetchUserData(newGuest);
      return res.status(200).json({
        success: true,
        message: 'Guest session active.',
        user: { ...userData, is_guest: true }
      });
    }
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
 * GET /api/auth/profile/:mobile
 * Retrieve user profile including database orders and notifications
 */
authRouter.get('/profile/:mobile', async (req, res, next) => {
  const mobile = req.params.mobile;

  try {
    const userRes = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const userPayload = await fetchUserData(userRes.rows[0]);
    return res.status(200).json({ success: true, user: userPayload });
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
      fieldsToUpdate.push(`is_guest = false`);
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
          `INSERT INTO reviews (id, user_id, product_id, product_name, rating, comment, date, title)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [rev.id, userId, rev.productId, rev.productName, rev.rating, rev.comment, rev.date, rev.title || 'Verified Purchase Review']
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
      for (const ord of orders) {
        const initialHistory = [{ status: ord.status || 'Processing', date: ord.date || new Date().toLocaleDateString('en-IN'), remarks: 'Order placed' }];
        await query(
          `INSERT INTO orders (id, user_id, date, subtotal, shipping, tax, total, status, address, items, status_history)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            ord.id, 
            userId, 
            ord.date, 
            ord.subtotal, 
            ord.shipping, 
            ord.tax, 
            ord.total, 
            ord.status || 'Processing', 
            JSON.stringify(ord.address), 
            JSON.stringify(ord.items),
            JSON.stringify(initialHistory)
          ]
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

    let history = [];
    if (order.status_history) {
      history = typeof order.status_history === 'string' ? JSON.parse(order.status_history) : order.status_history;
    }
    if (!Array.isArray(history)) {
      history = [];
    }
    history.push({
      status: 'Cancelled',
      date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
      remarks: 'Order cancelled by customer'
    });

    await query("UPDATE orders SET status = 'Cancelled', status_history = $1 WHERE id = $2", [JSON.stringify(history), orderId]);

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
    const userNotif = {
      id: notifId,
      user_id: order.user_id,
      title: 'Order Cancelled',
      message: `Your order ${orderId} has been successfully cancelled and your payment has been queued for refund.`,
      date: new Date().toLocaleDateString('en-IN'),
      read: false
    };
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [userNotif.id, userNotif.user_id, userNotif.title, userNotif.message, userNotif.date]
    );

    // Notify all admins
    const adminRes = await query("SELECT id FROM users WHERE role = 'admin'");
    const adminNotifs = [];
    for (const adminRow of adminRes.rows) {
      const adminNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
      const adminNotif = {
        id: adminNotifId,
        user_id: adminRow.id,
        title: 'Order Cancelled',
        message: `Order ${orderId} has been cancelled by the customer.`,
        date: new Date().toLocaleDateString('en-IN'),
        read: false
      };
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [adminNotif.id, adminNotif.user_id, adminNotif.title, adminNotif.message, adminNotif.date]
      );
      adminNotifs.push(adminNotif);
    }

    await query('COMMIT');

    for (const p of updatedProducts) {
      broadcastInventoryUpdate(p.id, p.stock);
    }

    // Broadcast user notification
    broadcastNewNotification(order.user_id, userNotif);
    // Broadcast admin notifications
    for (const an of adminNotifs) {
      broadcastNewNotification(an.user_id, an);
    }

    broadcastOrderUpdate(orderId, 'Cancelled', { remarks: 'Order cancelled by customer' });

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
  const { remarks } = req.body;

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

    let history = [];
    if (order.status_history) {
      history = typeof order.status_history === 'string' ? JSON.parse(order.status_history) : order.status_history;
    }
    if (!Array.isArray(history)) {
      history = [];
    }
    history.push({
      status: 'Return Requested',
      date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
      remarks: remarks || 'Return request submitted by customer'
    });

    await query("UPDATE orders SET status = 'Return Requested', status_history = $1 WHERE id = $2", [JSON.stringify(history), orderId]);

    // Insert user notification
    const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
    const userNotif = {
      id: notifId,
      user_id: order.user_id,
      title: 'Return Requested',
      message: `Your return request for order ${orderId} has been received. Our team will verify and approve the return shortly.`,
      date: new Date().toLocaleDateString('en-IN'),
      read: false
    };
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [userNotif.id, userNotif.user_id, userNotif.title, userNotif.message, userNotif.date]
    );

    // Notify all admins
    const adminRes = await query("SELECT id FROM users WHERE role = 'admin'");
    const adminNotifs = [];
    for (const adminRow of adminRes.rows) {
      const adminNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
      const adminNotif = {
        id: adminNotifId,
        user_id: adminRow.id,
        title: 'Return Requested',
        message: `Customer has requested a return for order ${orderId}. Please review and approve.`,
        date: new Date().toLocaleDateString('en-IN'),
        read: false
      };
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [adminNotif.id, adminNotif.user_id, adminNotif.title, adminNotif.message, adminNotif.date]
      );
      adminNotifs.push(adminNotif);
    }

    // Broadcast user notification
    broadcastNewNotification(order.user_id, userNotif);
    // Broadcast admin notifications
    for (const an of adminNotifs) {
      broadcastNewNotification(an.user_id, an);
    }

    broadcastOrderUpdate(orderId, 'Return Requested', { remarks: remarks || 'Return request submitted by customer' });

    return res.status(200).json({ 
      success: true, 
      message: 'Return request submitted successfully.',
      status: 'Return Requested' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/orders/:id/appeal
 * Appeal a rejected return request (allowed once)
 */
authRouter.post('/orders/:id/appeal', async (req, res, next) => {
  const orderId = req.params.id;
  const { remarks } = req.body;

  if (!remarks || !remarks.trim()) {
    return res.status(400).json({ success: false, error: 'Appeal remarks/reason is required.' });
  }

  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'Return Rejected') {
      return res.status(400).json({ 
        success: false, 
        error: `Only orders with "Return Rejected" status can be appealed. Current status: ${order.status}` 
      });
    }

    if (order.appeal_submitted) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already appealed the rejection for this order once.' 
      });
    }

    let history = [];
    if (order.status_history) {
      history = typeof order.status_history === 'string' ? JSON.parse(order.status_history) : order.status_history;
    }
    if (!Array.isArray(history)) {
      history = [];
    }
    const timestamp = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN');
    history.push({
      status: 'Return Requested',
      date: timestamp,
      remarks: `Rejection appealed by customer: ${remarks.trim()}`
    });

    await query(
      "UPDATE orders SET status = 'Return Requested', appeal_submitted = true, status_history = $1 WHERE id = $2",
      [JSON.stringify(history), orderId]
    );

    // Notify all admins
    const adminRes = await query("SELECT id FROM users WHERE role = 'admin'");
    const adminNotifs = [];
    for (const adminRow of adminRes.rows) {
      const adminNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
      const adminNotif = {
        id: adminNotifId,
        user_id: adminRow.id,
        title: 'Return Appeal Submitted',
        message: `Customer has appealed return rejection for order ${orderId}. Reason: ${remarks.trim()}`,
        date: new Date().toLocaleDateString('en-IN'),
        read: false
      };
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [adminNotif.id, adminNotif.user_id, adminNotif.title, adminNotif.message, adminNotif.date]
      );
      adminNotifs.push(adminNotif);
    }

    // Broadcast admin notifications
    for (const an of adminNotifs) {
      broadcastNewNotification(an.user_id, an);
    }

    broadcastOrderUpdate(orderId, 'Return Requested', { remarks: `Rejection appealed by customer: ${remarks.trim()}` });

    return res.status(200).json({ 
      success: true, 
      message: 'Appeal submitted successfully.',
      status: 'Return Requested'
    });
  } catch (error) {
    next(error);
  }
});
