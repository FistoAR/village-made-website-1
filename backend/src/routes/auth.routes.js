import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export const authRouter = Router();

/**
 * POST /api/auth/register
 * Register a user with mobile number, password, name, email, and phone.
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
    // Check if user already exists
    const checkUser = await query('SELECT * FROM users WHERE mobile = $1', [cleanMobile]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Mobile number already registered.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    // Insert user into Postgres
    const insertQuery = `
      INSERT INTO users (mobile, password, name, email, phone, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, mobile, name, email, phone, addresses, orders, wishlist, reviews, notifications, created_at
    `;
    const result = await query(insertQuery, [
      cleanMobile,
      hashedPassword,
      name || null,
      email || null,
      phone || cleanMobile,
    ]);

    const newUser = {
      ...result.rows[0],
      addresses: [],
      orders: [],
      wishlist: [],
      reviews: [],
      notifications: [
        {
          id: Math.random().toString(36).substring(2, 11),
          title: 'Welcome to Village Made!',
          message: 'Thank you for registering. Explore our organic village-crafted malts, millets, and cookies.',
          date: new Date().toLocaleDateString('en-IN'),
          read: false
        }
      ]
    };

    return res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Log in a user with mobile number and password.
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

    // Check if the user has a password set (legacy users might not have had one)
    if (!dbUser.password) {
      return res.status(400).json({ success: false, error: 'No password set for this account. Please use account recovery.' });
    }

    // Verify password matching using bcrypt
    const isMatch = await bcrypt.compare(password.trim(), dbUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    // Build the mock relations for the frontend (or fetch if you expand the schema later)
    const user = {
      mobile: dbUser.mobile,
      name: dbUser.name || '',
      email: dbUser.email || '',
      phone: dbUser.phone || dbUser.mobile,
      addresses: dbUser.addresses || [],
      orders: dbUser.orders || [],
      wishlist: dbUser.wishlist || [],
      reviews: dbUser.reviews || [],
      notifications: dbUser.notifications || [
        {
          id: Math.random().toString(36).substring(2, 11),
          title: 'Welcome Back!',
          message: 'Explore our latest village-crafted provisions.',
          date: new Date().toLocaleDateString('en-IN'),
          read: false
        }
      ]
    };

    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using OTP verification (OTP is hardcoded to 112233).
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
 * Synchronize user profile values (JSONB arrays & text fields).
 */
authRouter.put('/profile', async (req, res, next) => {
  const { mobile, name, email, phone, addresses, wishlist, reviews, notifications, orders } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, error: 'User mobile is required.' });
  }

  try {
    const cleanMobile = mobile.trim();
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
    if (addresses !== undefined) {
      fieldsToUpdate.push(`addresses = $${paramIdx++}`);
      params.push(JSON.stringify(addresses));
    }
    if (wishlist !== undefined) {
      fieldsToUpdate.push(`wishlist = $${paramIdx++}`);
      params.push(JSON.stringify(wishlist));
    }
    if (reviews !== undefined) {
      fieldsToUpdate.push(`reviews = $${paramIdx++}`);
      params.push(JSON.stringify(reviews));
    }
    if (notifications !== undefined) {
      fieldsToUpdate.push(`notifications = $${paramIdx++}`);
      params.push(JSON.stringify(notifications));
    }
    if (orders !== undefined) {
      fieldsToUpdate.push(`orders = $${paramIdx++}`);
      params.push(JSON.stringify(orders));
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ success: false, error: 'No update data provided.' });
    }

    params.push(cleanMobile);
    const updateQuery = `
      UPDATE users 
      SET ${fieldsToUpdate.join(', ')} 
      WHERE mobile = $${paramIdx}
      RETURNING id, mobile, name, email, phone, addresses, orders, wishlist, reviews, notifications, created_at
    `;

    const result = await query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});
