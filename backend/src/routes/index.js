import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';

// ── Import additional feature routers here ──────────────────────────────────
// import { productRouter } from './product.routes.js';
// import { userRouter } from './user.routes.js';

export const router = Router();

// ─── Mount Routes ────────────────────────────────────────────────────────────
router.use('/health', healthRouter);
router.use('/auth', authRouter);

// router.use('/products', productRouter);
// router.use('/users', userRouter);
