import { Router } from 'express';
import { query } from '../config/db.js';

export const bulkRouter = Router();

/**
 * POST /api/bulk/inquire
 * Submit a new bulk order inquiry or sample request
 */
bulkRouter.post('/inquire', async (req, res, next) => {
  const {
    name,
    companyName,
    email,
    phone,
    purpose,
    neededByDate,
    city,
    pincode,
    estimatedQty,
    selectedProducts,
    customizations,
    notes,
    isSampleRequest
  } = req.body;

  if (!name || !email || !phone || !purpose) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, phone number, and purpose are required.'
    });
  }

  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `VMB-${new Date().getFullYear()}-${randomSuffix}`;

    const formattedProducts = JSON.stringify(selectedProducts || []);
    const formattedCustomizations = JSON.stringify(customizations || {});

    const result = await query(
      `INSERT INTO bulk_inquiries (
        id, name, company_name, email, phone, purpose, needed_by_date, 
        city, pincode, estimated_qty, selected_products, customizations, 
        notes, is_sample_request, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'Pending')
      RETURNING *`,
      [
        id,
        name,
        companyName || '',
        email,
        phone,
        purpose,
        neededByDate || '',
        city || '',
        pincode || '',
        parseInt(estimatedQty) || 1,
        formattedProducts,
        formattedCustomizations,
        notes || '',
        !!isSampleRequest
      ]
    );

    return res.status(201).json({
      success: true,
      message: isSampleRequest
        ? 'Sample request submitted successfully! Our bulk team will get in touch shortly.'
        : 'Bulk inquiry submitted successfully! Reference number: ' + id,
      inquiry: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bulk/inquiries
 * Admin: Get all bulk order inquiries
 */
bulkRouter.get('/inquiries', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM bulk_inquiries ORDER BY created_at DESC`
    );
    return res.status(200).json({
      success: true,
      inquiries: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bulk/inquiries/:id/status
 * Admin: Update inquiry status, quoted price, and admin notes
 */
bulkRouter.put('/inquiries/:id/status', async (req, res, next) => {
  const { id } = req.params;
  const { status, quotedPrice, adminNotes } = req.body;

  try {
    const checkRes = await query('SELECT * FROM bulk_inquiries WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found.' });
    }

    const price = quotedPrice !== undefined && quotedPrice !== '' ? parseFloat(quotedPrice) : null;

    const result = await query(
      `UPDATE bulk_inquiries 
       SET status = COALESCE($1, status),
           quoted_price = $2,
           admin_notes = COALESCE($3, admin_notes),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status || null, price, adminNotes || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Bulk inquiry updated successfully.',
      inquiry: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/bulk/inquiries/:id
 * Admin: Delete a bulk inquiry
 */
bulkRouter.delete('/inquiries/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    await query('DELETE FROM bulk_inquiries WHERE id = $1', [id]);
    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});
