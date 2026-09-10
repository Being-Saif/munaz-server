import { Router } from 'express';
import { getStoreSettings, updateStoreSettings } from '../controllers/settings.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, adminOnly, getStoreSettings);
router.put('/', protect, adminOnly, updateStoreSettings);

export default router;
