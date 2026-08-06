import { Router } from 'express';
import { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAllUsers } from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin
router.get('/', protect, adminOnly, getAllUsers);

export default router;
