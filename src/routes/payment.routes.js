import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All payment routes require auth

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
