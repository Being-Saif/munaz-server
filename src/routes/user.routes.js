import { Router } from 'express';
import { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getAllUsers, updateUserRole, bootstrapSuperAdmin } from '../controllers/user.controller.js';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Admin
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:userId/role', protect, superAdminOnly, updateUserRole);
// One-time bootstrap of the first super admin (self-disables once one exists)
router.post('/bootstrap-superadmin', protect, adminOnly, bootstrapSuperAdmin);

export default router;
