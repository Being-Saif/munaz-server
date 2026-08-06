import { Router } from 'express';
import { getOccasions, getAllOccasions, createOccasion, updateOccasion, deleteOccasion } from '../controllers/occasion.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getOccasions);

// Admin
router.get('/admin/all', protect, adminOnly, getAllOccasions);
router.post('/', protect, adminOnly, createOccasion);
router.put('/:id', protect, adminOnly, updateOccasion);
router.delete('/:id', protect, adminOnly, deleteOccasion);

export default router;
