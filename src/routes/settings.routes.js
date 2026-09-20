import { Router } from 'express';
import { getStoreSettings, getPublicSettings, updateStoreSettings } from '../controllers/settings.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/public', getPublicSettings);
router.get('/', protect, adminOnly, getStoreSettings);
router.put('/', protect, adminOnly, updateStoreSettings);

export default router;
