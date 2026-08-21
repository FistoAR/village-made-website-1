import { Router } from 'express';
import { query } from '../config/db.js';
import { broadcastInventoryUpdate, broadcastOrderUpdate, broadcastNewNotification } from '../config/socket.js';

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
    const result = await query(`SELECT id, name, email, mobile, phone, created_at FROM users WHERE role = $1 ORDER BY id DESC`, ['customer']);
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
          customerMobile: o.customer_mobile || addrObj?.phone || 'Guest Phone',
          remarks: o.remarks || null,
          appeal_submitted: o.appeal_submitted || false,
          status_history: typeof o.status_history === 'string' ? JSON.parse(o.status_history) : (o.status_history || []),
          paymentMethod: o.payment_method || null,
          paymentStatus: o.payment_status || null,
          razorpayOrderId: o.razorpay_order_id || null,
          razorpayPaymentId: o.razorpay_payment_id || null,
          refundId: o.refund_id || null,
          refundStatus: o.refund_status || null
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
  const { status, remarks } = req.body;

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

    // Parse current history
    let history = [];
    if (order.status_history) {
      history = typeof order.status_history === 'string' ? JSON.parse(order.status_history) : order.status_history;
    }
    if (!Array.isArray(history)) {
      history = [];
    }
    history.push({
      status,
      date: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
      remarks: remarks || 'Status updated by administrator'
    });

    // Begin SQL Transaction to ensure stock matches status transitions
    await query('BEGIN');

    // Update order status, remarks, and history
    await query('UPDATE orders SET status = $1, remarks = $2, status_history = $3 WHERE id = $4', [status, remarks || null, JSON.stringify(history), orderId]);

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
      const userNotif = {
        id: notifId,
        user_id: order.user_id,
        title: status === 'Returned' ? 'Return Request Approved' : (status === 'Return Rejected' ? 'Return Request Rejected' : 'Order Status Update'),
        message: `Your order ${orderId} status is updated to ${status}.${remarks ? ` Remarks: ${remarks}` : ''} Check the tracker page for updates.`,
        date: new Date().toLocaleDateString('en-IN'),
        read: false
      };
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [userNotif.id, userNotif.user_id, userNotif.title, userNotif.message, userNotif.date]
      );
      broadcastNewNotification(order.user_id, userNotif);
    }

    await query('COMMIT');

    for (const p of updatedProducts) {
      broadcastInventoryUpdate(p.id, p.stock);
    }

    broadcastOrderUpdate(orderId, status, { remarks: remarks || null });

    return res.status(200).json({ success: true, message: 'Order status updated successfully.', remarks: remarks || null });
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

/**
 * GET /api/admin/inventory/purchase
 * Get all purchase/inventory entry logs
 */
adminRouter.get('/inventory/purchase', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT ib.*, p.name as product_name
      FROM inventory_batches ib
      JOIN products p ON ib.product_id = p.id
      ORDER BY ib.id DESC
    `);
    
    return res.status(200).json({
      success: true,
      purchases: result.rows.map(row => ({
        id: row.entry_id,
        productId: row.product_id,
        productName: row.product_name,
        weight: row.weight,
        batchNumber: row.batch_number,
        quantity: row.quantity,
        unitCost: parseFloat(row.unit_cost) || 0,
        totalCost: parseFloat(row.total_cost) || 0,
        barcodes: typeof row.barcodes === 'string' ? JSON.parse(row.barcodes) : row.barcodes,
        date: new Date(row.created_at).toLocaleDateString('en-IN')
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/inventory/purchase
 * Record a purchase entry (receives a batch with multiple products/quantities)
 */
adminRouter.post('/inventory/purchase', async (req, res, next) => {
  const { batchNumber, items } = req.body;

  if (!batchNumber || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Batch number and a non-empty items list are required.' });
  }

  try {
    await query('BEGIN');

    // Generate a single entry_id for the entire batch
    const entryId = `PE-${Math.floor(1000 + Math.random() * 9000)}`;
    const savedPurchases = [];

    for (const item of items) {
      const { productId, weight, quantity } = item;

      if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        await query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Each item must have a product ID and a valid stock quantity value.' 
        });
      }

      // Retrieve product
      const prodRes = await query('SELECT weights, stock, name FROM products WHERE id = $1', [productId]);
      if (prodRes.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ success: false, error: `Product not found: ${productId}` });
      }

      const product = prodRes.rows[0];
      const weights = typeof product.weights === 'string' ? JSON.parse(product.weights) : product.weights;
      let stock = Number(product.stock);
      let nextWeights = weights;
      let nextStock = stock;
      let variantFound = false;

      if (Array.isArray(weights) && weight) {
        const cleanWeight = weight.toLowerCase().replace(/\s+/g, '');
        nextWeights = weights.map(w => {
          if (typeof w === 'object' && w !== null && w.weight && w.weight.toLowerCase().replace(/\s+/g, '') === cleanWeight) {
            variantFound = true;
            const currentVarStock = typeof w.stock === 'number' ? w.stock : stock;
            return { ...w, stock: currentVarStock + Number(quantity) };
          }
          return w;
        });
      }

      if (variantFound) {
        const allHaveStock = nextWeights.every(w => typeof w === 'object' && w !== null && typeof w.stock === 'number');
        if (allHaveStock) {
          nextStock = nextWeights.reduce((sum, w) => sum + w.stock, 0);
        } else {
          nextStock = stock + Number(quantity);
        }
      } else {
        nextStock = stock + Number(quantity);
      }

      // Update product stock and weights in DB (NO purchase_price update!)
      await query(
        `UPDATE products 
         SET weights = $1, stock = $2 
         WHERE id = $3`,
        [JSON.stringify(nextWeights), nextStock, productId]
      );

      // Insert purchase entry batch log (with 0 unit_cost and total_cost)
      await query(
        `INSERT INTO inventory_batches (entry_id, product_id, weight, batch_number, quantity, unit_cost, total_cost, barcodes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [entryId, productId, weight || null, batchNumber, quantity, 0, 0, JSON.stringify([])]
      );

      savedPurchases.push({
        id: entryId,
        productId,
        productName: product.name,
        weight: weight || null,
        batchNumber,
        quantity,
        unitCost: 0,
        totalCost: 0,
        barcodes: [],
        date: new Date().toLocaleDateString('en-IN')
      });
    }

    await query('COMMIT');

    // Broadcast inventory update via socket for each updated product
    for (const item of items) {
      // Fetch fresh values to broadcast
      const prodRes = await query('SELECT weights, stock FROM products WHERE id = $1', [item.productId]);
      if (prodRes.rows.length > 0) {
        const product = prodRes.rows[0];
        const nextWeights = typeof product.weights === 'string' ? JSON.parse(product.weights) : product.weights;
        broadcastInventoryUpdate(item.productId, Number(product.stock), nextWeights);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Batch purchase entry recorded successfully.',
      purchases: savedPurchases
    });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
});




