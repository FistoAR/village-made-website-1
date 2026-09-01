import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { adminRouter } from './admin.routes.js';
import { productRouter } from './product.routes.js';
import { orderRouter } from './order.routes.js';
import { ticketRouter } from './ticket.routes.js';
import { galleryRouter } from './gallery.routes.js';
import { settingsRouter } from './settings.routes.js';
import { bulkRouter } from './bulk.routes.js';

export const router = Router();

// ─── Mount Routes ────────────────────────────────────────────────────────────
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/tickets', ticketRouter);
router.use('/gallery', galleryRouter);
router.use('/settings', settingsRouter);
router.use('/bulk', bulkRouter);
