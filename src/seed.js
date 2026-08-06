import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Banner from './models/Banner.js';
import Occasion from './models/Occasion.js';
import Review from './models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ====== SEED DATA ======

const categories = [
  { name: 'Kurta Sets & Kurtis', slug: 'kurta-sets', description: 'Elegant ethnic kurtis and kurta sets for festivals, office, and everyday wear.', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Shirt', productCount: 85, order: 1 },
  { name: 'Elegant Sarees', slug: 'sarees', description: 'Silk, georgette, and chiffon sarees for weddings, festivals, and special occasions.', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Layers', productCount: 65, order: 2 },
  { name: 'Co-ord Sets', slug: 'co-ord-sets', description: 'Contemporary matching sets for effortless modern ethnic style.', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Gem', productCount: 50, order: 3 },
  { name: 'Palazzo & Indo-Western', slug: 'palazzo-suits', description: 'Palazzo suits and indo-western outfits that blend tradition with modern flair.', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Scissors', productCount: 45, order: 4 },
  { name: 'Dress Materials', slug: 'dress-materials', description: 'Premium unstitched fabrics and dupattas for custom tailoring.', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Scissors', productCount: 40, order: 5 },
  { name: 'Accessories', slug: 'accessories', description: 'Jewelry, dupattas, clutches, and more to complete your look.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400&h=400', icon: 'Gem', productCount: 55, order: 6 },
];

const banners = [
  { title: 'New Collection', subtitle: 'Festive Elegance', description: 'Explore our latest festive collection — kurtis, sarees & co-ord sets crafted for celebrations.', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1920&h=800', mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800&h=1000', buttonText: 'Shop Now', link: '/shop', position: 'hero', order: 1 },
  { title: 'Flat 20% Off', subtitle: 'Luxury Fabrics Sale', description: 'Premium unstitched dress materials & dupattas at unbeatable prices.', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1920&h=800', mobileImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800&h=1000', buttonText: 'Shop Sale', link: '/shop?filter=sale', position: 'hero', order: 2 },
  { title: 'Ethnic Wear', subtitle: 'Tradition Meets Grace', description: 'Handpicked kurta sets and kurtis for festivals, gatherings, and everyday elegance.', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=1920&h=800', mobileImage: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800&h=1000', buttonText: 'Explore', link: '/shop?category=kurta-sets', position: 'hero', order: 3 },
  { title: 'Wedding Season Special', subtitle: 'Up to 30% Off on Bridal Collection', description: 'Make your special day unforgettable with our exclusive bridal range.', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1920&h=500', mobileImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800&h=600', buttonText: 'Shop Bridal', link: '/shop?category=sarees', position: 'promotional', order: 1 },
  { title: 'Buy 2 Get 1 Free', subtitle: 'On All Kurta Sets', description: 'Mix and match from our extensive kurta collection.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1920&h=500', mobileImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800&h=600', buttonText: 'Grab Deal', link: '/shop?category=kurta-sets', position: 'promotional', order: 2 },
];

const occasions = [
  { name: 'Wedding', slug: 'wedding', tagline: 'Bridal & Wedding Guest Looks', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=wedding', order: 1 },
  { name: 'Festive', slug: 'festive', tagline: 'Celebrate in Style', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=festive', order: 2 },
  { name: 'Casual', slug: 'casual', tagline: 'Everyday Elegance', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=casual', order: 3 },
  { name: 'Office Wear', slug: 'office', tagline: 'Power Dressing', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=600&h=750', link: '/shop?occasion=office', order: 4 },
];

const seedDB = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Banner.deleteMany(),
      Occasion.deleteMany(),
      Review.deleteMany(),
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'Munaz Admin',
      email: 'admin@munaz.com',
      password: 'admin123456',
      role: 'admin',
    });
    console.log(`   Admin: admin@munaz.com / admin123456`);

    // Create demo user
    const demoUser = await User.create({
      name: 'Saif Ali',
      email: 'saif@munaz.com',
      password: '123456',
      role: 'user',
    });
    console.log(`   User: saif@munaz.com / 123456\n`);

    // Seed categories
    console.log('📁 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`   ✅ ${createdCategories.length} categories created\n`);

    // Create a map of category slugs to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => { categoryMap[cat.slug] = cat._id; });

    // Seed products
    console.log('🛍️  Seeding products...');
    const products = [
      {
        name: 'Lavender Maxi Dress', slug: 'lavender-maxi-dress',
        shortDescription: 'Elegant lavender maxi dress with a flowy silhouette.',
        description: 'This stunning lavender maxi dress features a flattering A-line silhouette with delicate ruching at the waist. Made from premium chiffon fabric.',
        price: 2999, salePrice: 2399, discountPercent: 20, isOnSale: true,
        category: categoryMap['co-ord-sets'], subcategory: 'Maxi Dresses',
        tags: ['maxi', 'lavender', 'party', 'wedding'],
        images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', alt: 'Lavender maxi dress' }],
        thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300',
        colors: [{ name: 'Lavender', hex: '#B39DDB' }, { name: 'Blush', hex: '#F9A8D4' }],
        sizes: [{ name: 'S', stock: 12 }, { name: 'M', stock: 18 }, { name: 'L', stock: 8 }, { name: 'XL', stock: 3 }],
        totalStock: 41, sold: 128, ratingsAverage: 4.8, ratingsCount: 128,
        isFeatured: true, isNewArrival: false, isTrending: true, isBestSeller: true,
      },
      {
        name: 'Pink Blazer Set', slug: 'pink-blazer-set',
        shortDescription: 'Tailored pink blazer with structured shoulders.',
        description: 'Make a statement with this beautifully tailored pink blazer set. Features structured shoulders and a modern slim fit.',
        price: 3499, salePrice: 2799, discountPercent: 20, isOnSale: true,
        category: categoryMap['palazzo-suits'], subcategory: 'Indo-Western',
        tags: ['blazer', 'pink', 'office', 'formal'],
        images: [{ url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600', alt: 'Pink blazer' }],
        thumbnail: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=300',
        colors: [{ name: 'Pink', hex: '#EC4899' }, { name: 'White', hex: '#FFFFFF' }],
        sizes: [{ name: 'S', stock: 10 }, { name: 'M', stock: 15 }, { name: 'L', stock: 7 }],
        totalStock: 32, sold: 85, ratingsAverage: 4.6, ratingsCount: 85,
        isFeatured: true, isNewArrival: true, isTrending: true, isBestSeller: false,
      },
      {
        name: 'Floral Kurta Set', slug: 'floral-kurta-set',
        shortDescription: 'Beautiful floral printed kurta with palazzo pants.',
        description: 'A gorgeous floral printed kurta set featuring intricate patterns, comfortable cotton fabric, and matching palazzo pants.',
        price: 1999, salePrice: 1599, discountPercent: 20, isOnSale: true,
        category: categoryMap['kurta-sets'], subcategory: 'Printed Kurtas',
        tags: ['kurta', 'floral', 'cotton', 'festive'],
        images: [{ url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600', alt: 'Floral kurta set' }],
        thumbnail: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=300',
        colors: [{ name: 'Multi', hex: '#F472B6' }, { name: 'Blue', hex: '#3B82F6' }],
        sizes: [{ name: 'S', stock: 20 }, { name: 'M', stock: 25 }, { name: 'L', stock: 15 }, { name: 'XL', stock: 10 }],
        totalStock: 70, sold: 210, ratingsAverage: 4.7, ratingsCount: 210,
        isFeatured: true, isNewArrival: true, isTrending: false, isBestSeller: true,
      },
      {
        name: 'Silk Banarasi Saree', slug: 'silk-banarasi-saree',
        shortDescription: 'Traditional Banarasi silk saree with gold zari work.',
        description: 'Handcrafted Banarasi silk saree with intricate gold zari weaving. Perfect for weddings and grand celebrations.',
        price: 5999, salePrice: null, discountPercent: 0, isOnSale: false,
        category: categoryMap['sarees'], subcategory: 'Silk Sarees',
        tags: ['saree', 'silk', 'banarasi', 'wedding', 'traditional'],
        images: [{ url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600', alt: 'Banarasi saree' }],
        thumbnail: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=300',
        colors: [{ name: 'Red', hex: '#DC2626' }, { name: 'Gold', hex: '#D97706' }],
        sizes: [{ name: 'Free Size', stock: 30 }],
        totalStock: 30, sold: 95, ratingsAverage: 4.9, ratingsCount: 95,
        isFeatured: true, isNewArrival: false, isTrending: true, isBestSeller: true,
      },
      {
        name: 'Cotton Co-ord Set', slug: 'cotton-coord-set',
        shortDescription: 'Comfortable cotton co-ord set for everyday elegance.',
        description: 'Effortlessly chic cotton co-ord set perfect for daily wear. Features a crop top and matching pants with pockets.',
        price: 1499, salePrice: 1199, discountPercent: 20, isOnSale: true,
        category: categoryMap['co-ord-sets'], subcategory: 'Cotton Sets',
        tags: ['co-ord', 'cotton', 'casual', 'comfort'],
        images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', alt: 'Cotton co-ord set' }],
        thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300',
        colors: [{ name: 'Beige', hex: '#D2B48C' }, { name: 'Mint', hex: '#98D8C8' }],
        sizes: [{ name: 'S', stock: 15 }, { name: 'M', stock: 20 }, { name: 'L', stock: 12 }],
        totalStock: 47, sold: 160, ratingsAverage: 4.5, ratingsCount: 160,
        isFeatured: false, isNewArrival: true, isTrending: true, isBestSeller: false,
      },
      {
        name: 'Embroidered Anarkali', slug: 'embroidered-anarkali',
        shortDescription: 'Heavy embroidered Anarkali suit for festive occasions.',
        description: 'Stunning Anarkali suit with intricate thread and mirror work. Comes with matching dupatta and churidar.',
        price: 4499, salePrice: 3599, discountPercent: 20, isOnSale: true,
        category: categoryMap['kurta-sets'], subcategory: 'Anarkali',
        tags: ['anarkali', 'embroidered', 'festive', 'heavy-work'],
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600', alt: 'Embroidered Anarkali' }],
        thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300',
        colors: [{ name: 'Maroon', hex: '#800020' }, { name: 'Navy', hex: '#1E3A5F' }],
        sizes: [{ name: 'S', stock: 8 }, { name: 'M', stock: 12 }, { name: 'L', stock: 10 }, { name: 'XL', stock: 5 }],
        totalStock: 35, sold: 75, ratingsAverage: 4.8, ratingsCount: 75,
        isFeatured: true, isNewArrival: true, isTrending: false, isBestSeller: true,
      },
      {
        name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings',
        shortDescription: 'Elegant pearl drop earrings with gold plating.',
        description: 'Delicate pearl drop earrings with 18k gold plating. Perfect accessory for ethnic and western wear.',
        price: 899, salePrice: 699, discountPercent: 22, isOnSale: true,
        category: categoryMap['accessories'], subcategory: 'Earrings',
        tags: ['earrings', 'pearl', 'gold', 'jewellery'],
        images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', alt: 'Pearl earrings' }],
        thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300',
        colors: [{ name: 'Gold', hex: '#D97706' }, { name: 'Silver', hex: '#9CA3AF' }],
        sizes: [{ name: 'Free Size', stock: 50 }],
        totalStock: 50, sold: 320, ratingsAverage: 4.4, ratingsCount: 320,
        isFeatured: false, isNewArrival: false, isTrending: true, isBestSeller: true,
      },
      {
        name: 'Palazzo Suit Set', slug: 'palazzo-suit-set',
        shortDescription: 'Elegant palazzo suit with printed dupatta.',
        description: 'A beautiful palazzo suit set featuring a straight-cut kurti, flared palazzo pants, and a printed dupatta.',
        price: 2499, salePrice: null, discountPercent: 0, isOnSale: false,
        category: categoryMap['palazzo-suits'], subcategory: 'Palazzo Sets',
        tags: ['palazzo', 'suit', 'dupatta', 'ethnic'],
        images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600', alt: 'Palazzo suit' }],
        thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300',
        colors: [{ name: 'Teal', hex: '#0D9488' }, { name: 'Mustard', hex: '#D97706' }],
        sizes: [{ name: 'S', stock: 10 }, { name: 'M', stock: 14 }, { name: 'L', stock: 12 }, { name: 'XL', stock: 6 }],
        totalStock: 42, sold: 55, ratingsAverage: 4.3, ratingsCount: 55,
        isFeatured: false, isNewArrival: true, isTrending: false, isBestSeller: false,
      },
      {
        name: 'Unstitched Dress Material', slug: 'unstitched-dress-material',
        shortDescription: 'Premium cotton unstitched dress material with dupatta.',
        description: 'High-quality cotton dress material with beautiful prints. Includes top, bottom, and dupatta fabric.',
        price: 1299, salePrice: 999, discountPercent: 23, isOnSale: true,
        category: categoryMap['dress-materials'], subcategory: 'Cotton Material',
        tags: ['unstitched', 'cotton', 'dress-material', 'printed'],
        images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', alt: 'Dress material' }],
        thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300',
        colors: [{ name: 'Multi', hex: '#F472B6' }],
        sizes: [{ name: 'Free Size', stock: 60 }],
        totalStock: 60, sold: 180, ratingsAverage: 4.6, ratingsCount: 180,
        isFeatured: false, isNewArrival: true, isTrending: true, isBestSeller: false,
      },
      {
        name: 'Georgette Party Saree', slug: 'georgette-party-saree',
        shortDescription: 'Lightweight georgette saree with sequin border.',
        description: 'A stunning party-wear georgette saree with shimmer sequin border. Comes with a matching unstitched blouse piece.',
        price: 3299, salePrice: 2799, discountPercent: 15, isOnSale: true,
        category: categoryMap['sarees'], subcategory: 'Party Wear Sarees',
        tags: ['saree', 'georgette', 'party', 'sequin'],
        images: [{ url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=600', alt: 'Georgette saree' }],
        thumbnail: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=300',
        colors: [{ name: 'Purple', hex: '#7E57C2' }, { name: 'Peach', hex: '#FBBF24' }],
        sizes: [{ name: 'Free Size', stock: 25 }],
        totalStock: 25, sold: 110, ratingsAverage: 4.7, ratingsCount: 110,
        isFeatured: true, isNewArrival: false, isTrending: false, isBestSeller: true,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`   ✅ ${createdProducts.length} products created\n`);

    // Seed banners
    console.log('🖼️  Seeding banners...');
    const createdBanners = await Banner.insertMany(banners);
    console.log(`   ✅ ${createdBanners.length} banners created\n`);

    // Seed occasions
    console.log('🎉 Seeding occasions...');
    const createdOccasions = await Occasion.insertMany(occasions);
    console.log(`   ✅ ${createdOccasions.length} occasions created\n`);

    // Seed some reviews
    console.log('⭐ Seeding reviews...');
    const reviews = [
      { product: createdProducts[0]._id, user: demoUser._id, rating: 5, title: 'Absolutely stunning!', comment: 'This dress exceeded all expectations. The fabric is premium and the fit is perfect.', isVerifiedPurchase: true },
      { product: createdProducts[2]._id, user: demoUser._id, rating: 5, title: 'Love this kurta set!', comment: 'Beautiful print, comfortable fabric, and amazing quality for the price.', isVerifiedPurchase: true },
      { product: createdProducts[3]._id, user: demoUser._id, rating: 5, title: 'Worth every penny', comment: 'The Banarasi work is stunning. Received so many compliments at the wedding!', isVerifiedPurchase: true },
    ];
    await Review.insertMany(reviews);
    console.log(`   ✅ ${reviews.length} reviews created\n`);

    console.log('========================================');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================');
    console.log('\n📋 Admin Login:');
    console.log('   Email: admin@munaz.com');
    console.log('   Password: admin123456');
    console.log('\n📋 Demo User Login:');
    console.log('   Email: saif@munaz.com');
    console.log('   Password: 123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDB();
