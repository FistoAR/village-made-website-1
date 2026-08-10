import { Router } from 'express';
import { query } from '../config/db.js';

export const healthRouter = Router();

/**
 * GET /api/health
 * Returns server status and database connectivity check.
 */
healthRouter.get('/', async (_req, res) => {
  let dbStatus = 'ok';
  let dbError = null;

  try {
    // Ping database directly using pg connection pool
    await query('SELECT NOW()');
  } catch (err) {
    dbStatus = 'error';
    dbError = err instanceof Error ? err.message : 'Unknown database error';
  }

  const status = dbStatus === 'ok' ? 200 : 503;

  res.status(status).json({
    success: dbStatus === 'ok',
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: 'ok',
      database: dbStatus,
    },
    ...(dbError && { error: dbError }),
  });
});
