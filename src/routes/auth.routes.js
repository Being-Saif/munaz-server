import { Router } from 'express';
import { register, login, logout, getMe, updatePassword, googleAuth } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

export default router;
