import { Router } from 'express';
import { query } from '../config/db.js';

export const adminRouter = Router();

/**
 * GET /api/admin/dashboard
 * Aggregated dashboard stats
 */
adminRouter.get('/dashboard', async (req, res, next) => {
  try {
    const usersCount = await query('SELECT COUNT(*) FROM users');
    const ordersCount = await query('SELECT COUNT(*) FROM orders');
    const pendingCount = await query('SELECT COUNT(*) FROM orders WHERE status = $1', ['Processing']);
    const salesTotal = await query("SELECT SUM(total) FROM orders WHERE status != 'Cancelled'");
    
    // Recent orders
    const recentOrders = await query(`
      SELECT o.*, u.name as customer_name, u.mobile as customer_mobile 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.id DESC 
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers: parseInt(usersCount.rows[0].count) || 0,
        totalOrders: parseInt(ordersCount.rows[0].count) || 0,
        pendingOrders: parseInt(pendingCount.rows[0].count) || 0,
        totalSales: parseFloat(salesTotal.rows[0].sum) || 0
      },
      recentOrders: recentOrders.rows.map(o => ({
        id: o.id,
        customerName: o.customer_name,
        customerMobile: o.customer_mobile,
        date: o.date,
        total: parseFloat(o.total) || 0,
        status: o.status
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/customers
 * Get all registered customers
 */
adminRouter.get('/customers', async (req, res, next) => {
  try {
    const result = await query('SELECT id, name, email, mobile, phone, created_at FROM users ORDER BY id DESC');
    return res.status(200).json({
      success: true,
      customers: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/orders
 * Get all orders placed across the system
 */
adminRouter.get('/orders', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT o.*, u.name as customer_name, u.mobile as customer_mobile 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.id DESC
    `);
    
    return res.status(200).json({
      success: true,
      orders: result.rows.map(o => ({
        id: o.id,
        date: o.date,
        subtotal: parseFloat(o.subtotal) || 0,
        shipping: parseFloat(o.shipping) || 0,
        tax: parseFloat(o.tax) || 0,
        total: parseFloat(o.total) || 0,
        status: o.status,
        address: typeof o.address === 'string' ? JSON.parse(o.address) : o.address,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        customerName: o.customer_name,
        customerMobile: o.customer_mobile
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/orders/:id
 * Update status of an order and notify the customer
 */
adminRouter.put('/orders/:id', async (req, res, next) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status parameter is required.' });
  }

  try {
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    // Update order status
    await query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);

    // Push alert notification to the user's notifications table list
    const notifId = Math.random().toString(36).substring(2, 11);
    await query(
      `INSERT INTO notifications (id, user_id, title, message, date, read)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [
        notifId,
        order.user_id,
        'Order Status Update',
        `Your order ${orderId} is now ${status}. Check the tracker page for updates.`,
        new Date().toLocaleDateString('en-IN')
      ]
    );

    return res.status(200).json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/sales
 * Aggregate sales statistics
 */
adminRouter.get('/sales', async (req, res, next) => {
  try {
    // Category sales distribution
    const ordersResult = await query("SELECT items FROM orders WHERE status != 'Cancelled'");
    const categorySales = {};
    const productLeaderboard = {};

    ordersResult.rows.forEach(row => {
      let items = row.items;
      if (typeof items === 'string') {
        items = JSON.parse(items);
      }
      if (Array.isArray(items)) {
        items.forEach(item => {
          const qty = item.quantity || 1;
          const cost = (item.price || 0) * qty;
          const cat = item.category || 'Malt';
          const name = item.name || 'Unknown Item';

          categorySales[cat] = (categorySales[cat] || 0) + cost;
          productLeaderboard[name] = (productLeaderboard[name] || 0) + qty;
        });
      }
    });

    const categoryData = Object.entries(categorySales).map(([category, amount]) => ({ category, amount }));
    const leaderboardData = Object.entries(productLeaderboard)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      categorySales: categoryData,
      leaderboard: leaderboardData
    });
  } catch (error) {
    next(error);
  }
});
