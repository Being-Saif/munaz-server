import { Router } from 'express';
import { getWishlist, toggleWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All wishlist routes require auth

router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
