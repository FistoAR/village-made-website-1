import { Router } from 'express';
import { query } from '../config/db.js';

export const ticketRouter = Router();

/**
 * POST /api/tickets
 * Raise a new support ticket
 */
ticketRouter.post('/', async (req, res, next) => {
  const { userId, subject, description, category, orderId } = req.body;

  if (!subject || !description || !category) {
    return res.status(400).json({ success: false, error: 'Subject, description, and category are required.' });
  }

  try {
    const id = `TCK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    await query(
      `INSERT INTO tickets (id, user_id, subject, description, category, order_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Open')`,
      [
        id,
        userId || null,
        subject,
        description,
        category,
        orderId || null
      ]
    );

    // If registered user, send a notification
    if (userId) {
      const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          notifId,
          userId,
          'Support Ticket Created',
          `Your ticket ${id} ("${subject}") has been registered. Our support team will reply within 24 hours.`,
          new Date().toLocaleDateString('en-IN')
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully.',
      ticket: { id, userId, subject, description, category, orderId, status: 'Open', created_at: new Date() }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tickets/user/:userId
 * Fetch support tickets for a specific user
 */
ticketRouter.get('/user/:userId', async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const result = await query(
      `SELECT t.*, o.id as order_ref_id 
       FROM tickets t
       LEFT JOIN orders o ON t.order_id = o.id
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.status(200).json({ success: true, tickets: result.rows });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tickets
 * Admin: Get all tickets
 */
ticketRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT t.*, u.mobile as customer_mobile, u.name as customer_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    return res.status(200).json({ success: true, tickets: result.rows });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tickets/:id/status
 * Admin: Update ticket status
 */
ticketRouter.put('/:id/status', async (req, res, next) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  try {
    const ticketRes = await query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    await query(
      `UPDATE tickets 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [status, ticketId]
    );

    const ticket = ticketRes.rows[0];
    if (ticket.user_id) {
      // Send notification to user
      const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
      await query(
        `INSERT INTO notifications (id, user_id, title, message, date, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          notifId,
          ticket.user_id,
          `Ticket Status Updated: ${status}`,
          `Support ticket ${ticketId} status has been updated to "${status}".`,
          new Date().toLocaleDateString('en-IN')
        ]
      );
    }

    return res.status(200).json({ success: true, message: 'Ticket status updated successfully.', status });
  } catch (error) {
    next(error);
  }
});
