import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import occasionRoutes from './routes/occasion.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import statsRoutes from './routes/stats.routes.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Trust proxy (required for Render/Vercel behind reverse proxy)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: [
    'https://munazshop.com',
    'https://www.munazshop.com',
    'https://munaz.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/occasions', occasionRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Munaz API is running' });
});

// Temporary: clean all dummy data (products, orders, reviews) - remove after use
app.get('/api/clean-dummy/:secret', async (req, res) => {
  try {
    if (req.params.secret !== 'munaz-clean-2026') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { default: Product } = await import('./models/Product.js');
    const { default: Order } = await import('./models/Order.js');
    const { default: Review } = await import('./models/Review.js');
    const { default: Cart } = await import('./models/Cart.js');

    const [p, o, r] = await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
    ]);
    await Cart.updateMany({}, { items: [] });

    res.json({
      success: true,
      message: 'Dummy data cleaned',
      deleted: { products: p.deletedCount, orders: o.deletedCount, reviews: r.deletedCount },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Munaz Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;
