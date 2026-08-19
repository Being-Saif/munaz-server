import { Router } from 'express';
import multer from 'multer';
import { uploadImage, uploadMultipleImages, deleteImage } from '../controllers/upload.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Multer config - store in memory (buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All upload routes require admin
router.use(protect, adminOnly);

router.post('/', upload.single('image'), uploadImage);
router.post('/multiple', upload.array('images', 10), uploadMultipleImages);
router.delete('/:publicId', deleteImage);

export default router;
