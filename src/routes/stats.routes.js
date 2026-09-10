import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, adminOnly, getDashboardStats);

export default router;
