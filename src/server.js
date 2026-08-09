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

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Munaz API is running' });
});

// Temporary seed endpoint (remove after seeding)
app.get('/api/seed', async (req, res) => {
  try {
    const { default: User } = await import('./models/User.js');
    const { default: Category } = await import('./models/Category.js');
    const { default: Product } = await import('./models/Product.js');
    const { default: Banner } = await import('./models/Banner.js');
    const { default: Occasion } = await import('./models/Occasion.js');

    // Clear
    await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Banner.deleteMany(), Occasion.deleteMany()]);

    // Admin + Demo user
    const admin = await User.create({ name: 'Munaz Admin', email: 'admin@munaz.com', password: 'admin123456', role: 'admin' });
    const demoUser = await User.create({ name: 'Saif Ali', email: 'saif@munaz.com', password: '123456', role: 'user' });

    // Categories
    const cats = await Category.insertMany([
      { name: 'Kurta Sets & Kurtis', slug: 'kurta-sets', description: 'Elegant ethnic kurtis and kurta sets.', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Shirt', productCount: 85, order: 1 },
      { name: 'Elegant Sarees', slug: 'sarees', description: 'Silk, georgette, and chiffon sarees.', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Layers', productCount: 65, order: 2 },
      { name: 'Co-ord Sets', slug: 'co-ord-sets', description: 'Contemporary matching sets.', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Gem', productCount: 50, order: 3 },
      { name: 'Palazzo & Indo-Western', slug: 'palazzo-suits', description: 'Palazzo suits and indo-western outfits.', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Scissors', productCount: 45, order: 4 },
      { name: 'Dress Materials', slug: 'dress-materials', description: 'Premium unstitched fabrics.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Scissors', productCount: 40, order: 5 },
      { name: 'Accessories', slug: 'accessories', description: 'Jewelry, dupattas, clutches.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Gem', productCount: 55, order: 6 },
    ]);
    const catMap = {}; cats.forEach(c => { catMap[c.slug] = c._id; });

    // Products
    await Product.insertMany([
      { name: 'Lavender Maxi Dress', slug: 'lavender-maxi-dress', shortDescription: 'Elegant lavender maxi dress.', description: 'Stunning lavender maxi dress with A-line silhouette.', price: 2999, salePrice: 2399, discountPercent: 20, isOnSale: true, category: catMap['co-ord-sets'], subcategory: 'Maxi Dresses', tags: ['maxi','lavender','party'], images: [{url:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',alt:'Lavender dress'}], thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300', colors: [{name:'Lavender',hex:'#B39DDB'}], sizes: [{name:'S',stock:12},{name:'M',stock:18},{name:'L',stock:8}], totalStock: 38, sold: 128, ratingsAverage: 4.8, ratingsCount: 128, isFeatured: true, isTrending: true, isBestSeller: true },
      { name: 'Pink Blazer Set', slug: 'pink-blazer-set', shortDescription: 'Tailored pink blazer.', description: 'Beautiful tailored pink blazer set.', price: 3499, salePrice: 2799, discountPercent: 20, isOnSale: true, category: catMap['palazzo-suits'], subcategory: 'Indo-Western', tags: ['blazer','pink','office'], images: [{url:'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600',alt:'Pink blazer'}], thumbnail: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=300', colors: [{name:'Pink',hex:'#EC4899'}], sizes: [{name:'S',stock:10},{name:'M',stock:15},{name:'L',stock:7}], totalStock: 32, sold: 85, ratingsAverage: 4.6, ratingsCount: 85, isFeatured: true, isNewArrival: true, isTrending: true },
      { name: 'Floral Kurta Set', slug: 'floral-kurta-set', shortDescription: 'Beautiful floral kurta.', description: 'Gorgeous floral printed kurta set.', price: 1999, salePrice: 1599, discountPercent: 20, isOnSale: true, category: catMap['kurta-sets'], subcategory: 'Printed Kurtas', tags: ['kurta','floral','festive'], images: [{url:'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600',alt:'Floral kurta'}], thumbnail: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=300', colors: [{name:'Multi',hex:'#F472B6'}], sizes: [{name:'S',stock:20},{name:'M',stock:25},{name:'L',stock:15}], totalStock: 60, sold: 210, ratingsAverage: 4.7, ratingsCount: 210, isFeatured: true, isNewArrival: true, isBestSeller: true },
      { name: 'Silk Banarasi Saree', slug: 'silk-banarasi-saree', shortDescription: 'Traditional Banarasi silk saree.', description: 'Handcrafted Banarasi silk saree with gold zari.', price: 5999, salePrice: null, discountPercent: 0, isOnSale: false, category: catMap['sarees'], subcategory: 'Silk Sarees', tags: ['saree','silk','wedding'], images: [{url:'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600',alt:'Banarasi saree'}], thumbnail: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=300', colors: [{name:'Red',hex:'#DC2626'}], sizes: [{name:'Free Size',stock:30}], totalStock: 30, sold: 95, ratingsAverage: 4.9, ratingsCount: 95, isFeatured: true, isTrending: true, isBestSeller: true },
      { name: 'Cotton Co-ord Set', slug: 'cotton-coord-set', shortDescription: 'Comfortable cotton co-ord.', description: 'Effortlessly chic cotton co-ord set.', price: 1499, salePrice: 1199, discountPercent: 20, isOnSale: true, category: catMap['co-ord-sets'], subcategory: 'Cotton Sets', tags: ['co-ord','cotton','casual'], images: [{url:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',alt:'Cotton co-ord'}], thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300', colors: [{name:'Beige',hex:'#D2B48C'}], sizes: [{name:'S',stock:15},{name:'M',stock:20},{name:'L',stock:12}], totalStock: 47, sold: 160, ratingsAverage: 4.5, ratingsCount: 160, isNewArrival: true, isTrending: true },
      { name: 'Embroidered Anarkali', slug: 'embroidered-anarkali', shortDescription: 'Heavy embroidered Anarkali.', description: 'Stunning Anarkali with thread and mirror work.', price: 4499, salePrice: 3599, discountPercent: 20, isOnSale: true, category: catMap['kurta-sets'], subcategory: 'Anarkali', tags: ['anarkali','embroidered','festive'], images: [{url:'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',alt:'Anarkali'}], thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300', colors: [{name:'Maroon',hex:'#800020'}], sizes: [{name:'S',stock:8},{name:'M',stock:12},{name:'L',stock:10}], totalStock: 30, sold: 75, ratingsAverage: 4.8, ratingsCount: 75, isFeatured: true, isNewArrival: true, isBestSeller: true },
      { name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', shortDescription: 'Elegant pearl earrings.', description: 'Delicate pearl drop earrings with gold plating.', price: 899, salePrice: 699, discountPercent: 22, isOnSale: true, category: catMap['accessories'], subcategory: 'Earrings', tags: ['earrings','pearl','gold'], images: [{url:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',alt:'Pearl earrings'}], thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300', colors: [{name:'Gold',hex:'#D97706'}], sizes: [{name:'Free Size',stock:50}], totalStock: 50, sold: 320, ratingsAverage: 4.4, ratingsCount: 320, isTrending: true, isBestSeller: true },
      { name: 'Palazzo Suit Set', slug: 'palazzo-suit-set', shortDescription: 'Elegant palazzo suit.', description: 'Beautiful palazzo suit with printed dupatta.', price: 2499, salePrice: null, discountPercent: 0, isOnSale: false, category: catMap['palazzo-suits'], subcategory: 'Palazzo Sets', tags: ['palazzo','suit','ethnic'], images: [{url:'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',alt:'Palazzo suit'}], thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300', colors: [{name:'Teal',hex:'#0D9488'}], sizes: [{name:'S',stock:10},{name:'M',stock:14},{name:'L',stock:12}], totalStock: 36, sold: 55, ratingsAverage: 4.3, ratingsCount: 55, isNewArrival: true },
      { name: 'Unstitched Dress Material', slug: 'unstitched-dress-material', shortDescription: 'Premium cotton dress material.', description: 'High-quality cotton dress material with prints.', price: 1299, salePrice: 999, discountPercent: 23, isOnSale: true, category: catMap['dress-materials'], subcategory: 'Cotton Material', tags: ['unstitched','cotton','printed'], images: [{url:'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',alt:'Dress material'}], thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300', colors: [{name:'Multi',hex:'#F472B6'}], sizes: [{name:'Free Size',stock:60}], totalStock: 60, sold: 180, ratingsAverage: 4.6, ratingsCount: 180, isNewArrival: true, isTrending: true },
      { name: 'Georgette Party Saree', slug: 'georgette-party-saree', shortDescription: 'Lightweight georgette saree.', description: 'Stunning georgette saree with sequin border.', price: 3299, salePrice: 2799, discountPercent: 15, isOnSale: true, category: catMap['sarees'], subcategory: 'Party Wear', tags: ['saree','georgette','party'], images: [{url:'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600',alt:'Georgette saree'}], thumbnail: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=300', colors: [{name:'Purple',hex:'#7E57C2'}], sizes: [{name:'Free Size',stock:25}], totalStock: 25, sold: 110, ratingsAverage: 4.7, ratingsCount: 110, isFeatured: true, isBestSeller: true },
    ]);

    // Banners
    await Banner.insertMany([
      { title: 'New Collection', subtitle: 'Festive Elegance', description: 'Explore our latest festive collection.', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1920&h=800', buttonText: 'Shop Now', link: '/shop', position: 'hero', order: 1 },
      { title: 'Flat 20% Off', subtitle: 'Luxury Fabrics Sale', description: 'Premium dress materials at unbeatable prices.', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1920&h=800', buttonText: 'Shop Sale', link: '/shop?filter=sale', position: 'hero', order: 2 },
      { title: 'Ethnic Wear', subtitle: 'Tradition Meets Grace', description: 'Handpicked kurta sets for every occasion.', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=1920&h=800', buttonText: 'Explore', link: '/shop?category=kurta-sets', position: 'hero', order: 3 },
      { title: 'Wedding Special', subtitle: 'Up to 30% Off Bridal', description: 'Exclusive bridal range.', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1920&h=500', buttonText: 'Shop Bridal', link: '/shop?category=sarees', position: 'promotional', order: 1 },
      { title: 'Buy 2 Get 1 Free', subtitle: 'On All Kurta Sets', description: 'Mix and match.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1920&h=500', buttonText: 'Grab Deal', link: '/shop?category=kurta-sets', position: 'promotional', order: 2 },
    ]);

    // Occasions
    await Occasion.insertMany([
      { name: 'Wedding', slug: 'wedding', tagline: 'Bridal & Wedding Guest Looks', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=wedding', order: 1 },
      { name: 'Festive', slug: 'festive', tagline: 'Celebrate in Style', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=festive', order: 2 },
      { name: 'Casual', slug: 'casual', tagline: 'Everyday Elegance', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=casual', order: 3 },
      { name: 'Office Wear', slug: 'office', tagline: 'Power Dressing', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=office', order: 4 },
    ]);

    res.json({ success: true, message: 'Database seeded!', data: { users: 2, categories: cats.length, products: 10, banners: 5, occasions: 4 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
