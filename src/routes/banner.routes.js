import { Router } from 'express';
import { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner, toggleBanner } from '../controllers/banner.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getBanners);

// Admin
router.get('/admin/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);
router.put('/:id/toggle', protect, adminOnly, toggleBanner);

export default router;
