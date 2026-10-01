import { Router } from 'express';
import {
  getPublicCoupons, applyCoupon, getAllCoupons,
  createCoupon, updateCoupon, deleteCoupon, toggleCoupon,
} from '../controllers/coupon.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getPublicCoupons);
router.post('/apply', applyCoupon);

// Admin
router.get('/admin/all', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);
router.put('/:id/toggle', protect, adminOnly, toggleCoupon);

export default router;
