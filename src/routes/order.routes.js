import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
