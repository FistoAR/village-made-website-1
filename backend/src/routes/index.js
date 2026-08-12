import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { adminRouter } from './admin.routes.js';

export const router = Router();

// ─── Mount Routes ────────────────────────────────────────────────────────────
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
