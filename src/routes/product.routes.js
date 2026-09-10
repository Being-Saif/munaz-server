import { Router } from 'express';
import { getProducts, getProductBySlug, getAdminProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts } from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);

// Admin routes (must be registered before the /:slug catch-all)
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/admin/:id', protect, adminOnly, getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Public — must be last since it's a catch-all for any non-matched path
router.get('/:slug', getProductBySlug);

export default router;
