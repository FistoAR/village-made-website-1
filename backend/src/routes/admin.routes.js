import { Router } from 'express';
import { query } from '../config/db.js';
import { broadcastInventoryUpdate, broadcastOrderUpdate } from '../config/socket.js';

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
      LEFT JOIN users u ON o.user_id = u.id 
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
      recentOrders: recentOrders.rows.map(o => {
        const addrObj = typeof o.address === 'string' ? JSON.parse(o.address) : o.address;
        return {
          id: o.id,
          customerName: o.customer_name || addrObj?.name || 'Guest Customer',
          customerMobile: o.customer_mobile || addrObj?.phone || 'Guest Phone',
          date: o.date,
          total: parseFloat(o.total) || 0,
          status: o.status
        };
      })
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
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.id DESC
    `);
    
    return res.status(200).json({
      success: true,
      orders: result.rows.map(o => {
        const addrObj = typeof o.address === 'string' ? JSON.parse(o.address) : o.address;
        return {
          id: o.id,
          date: o.date,
          subtotal: parseFloat(o.subtotal) || 0,
          shipping: parseFloat(o.shipping) || 0,
          tax: parseFloat(o.tax) || 0,
          total: parseFloat(o.total) || 0,
          status: o.status,
          address: addrObj,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
          customerName: o.customer_name || addrObj?.name || 'Guest Customer',
          customerMobile: o.customer_mobile || addrObj?.phone || 'Guest Phone'
        };
      })
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
    const oldStatus = order.status;

    // Begin SQL Transaction to ensure stock matches status transitions
    await query('BEGIN');

    // Update order status
    await query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);

    // Handle stock changes
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const updatedProducts = [];
    
    const isRestoring = (status === 'Cancelled' || status === 'Returned') && (oldStatus !== 'Cancelled' && oldStatus !== 'Returned');
    const isDeducting = (oldStatus === 'Cancelled' || oldStatus === 'Returned') && (status !== 'Cancelled' && status !== 'Returned');

    if (isRestoring || isDeducting) {
      const multiplier = isRestoring ? 1 : -1;
      for (const item of items) {
        const prodRes = await query('SELECT weights, stock FROM products WHERE id = $1', [item.id]);
        if (prodRes.rows.length > 0) {
          const product = prodRes.rows[0];
          const weights = typeof product.weights === 'string' ? JSON.parse(product.weights) : product.weights;
          let stock = Number(product.stock);
          let nextWeights = weights;
          let nextStock = stock;
          let variantFound = false;

          if (Array.isArray(weights) && item.weight) {
            const cleanWeight = item.weight.toLowerCase().replace(/\s+/g, '');
            nextWeights = weights.map(w => {
              if (typeof w === 'object' && w !== null && w.weight && w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight) {
                variantFound = true;
                const currentVarStock = typeof w.stock === 'number' ? w.stock : stock;
                return { ...w, stock: Math.max(0, currentVarStock + (item.quantity * multiplier)) };
              }
              return w;
            });
          }

          if (variantFound) {
            const allHaveStock = nextWeights.every(w => typeof w === 'object' && w !== null && typeof w.stock === 'number');
            if (allHaveStock) {
              nextStock = nextWeights.reduce((sum, w) => sum + w.stock, 0);
            } else {
              nextStock = Math.max(0, stock + (item.quantity * multiplier));
            }
          } else {
            nextStock = Math.max(0, stock + (item.quantity * multiplier));
          }

          await query('UPDATE products SET weights = $1, stock = $2 WHERE id = $3', [JSON.stringify(nextWeights), nextStock, item.id]);
          updatedProducts.push({ id: item.id, stock: nextStock });
        }
      }
    }

    // Push alert notification to the user's notifications table list if they are registered
    if (order.user_id) {
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
    }

    await query('COMMIT');

    for (const p of updatedProducts) {
      broadcastInventoryUpdate(p.id, p.stock);
    }

    broadcastOrderUpdate(orderId, status);

    return res.status(200).json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    await query('ROLLBACK');
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
