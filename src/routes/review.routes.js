import { Router } from 'express';
import { getProductReviews, createReview, updateReview, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/:productId', getProductReviews);

// Protected
router.post('/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
