import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { customAlphabet } from 'nanoid';

// @desc    Get all products (with filtering, sorting, pagination) — public, active only
// @route   GET /api/v1/products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, sort, search, minPrice, maxPrice, isOnSale, isNewArrival, isTrending, isBestSeller } = req.query;

    // Build filter — public storefront only ever sees active products
    const filter = { status: 'active', isActive: true };

    if (category) filter.category = category;
    if (isOnSale === 'true') filter.isOnSale = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (isTrending === 'true') filter.isTrending = true;
    if (isBestSeller === 'true') filter.isBestSeller = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'popular') sortObj = { sold: -1 };
    else if (sort === 'rating') sortObj = { ratingsAverage: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all products for admin (any status) — search, category, status filters
// @route   GET /api/v1/products/admin/all
export const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single product by slug — public, active only
// @route   GET /api/v1/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active', isActive: true }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single product by ID (admin — any status, used for edit/resume draft)
// @route   GET /api/v1/products/admin/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const slugify = (str = '') =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Generate a unique, readable style code like "MNZ-KUR-A7X9K2".
// Uses nanoid (random, collision-resistant) for the suffix — no DB counting.
// A short DB check is kept purely as a defensive guarantee.
const styleIdAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no confusing 0/O/1/I
const randomStyleId = customAlphabet(styleIdAlphabet, 6);

const generateStyleCode = async (categoryId) => {
  let abbr = 'GEN';
  try {
    if (categoryId) {
      const cat = await Category.findById(categoryId).select('name');
      if (cat?.name) {
        abbr = cat.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
      }
    }
  } catch { /* fall back to GEN */ }

  // Generate a random code; on the astronomically-unlikely collision, retry.
  let code;
  let attempts = 0;
  do {
    code = `MNZ-${abbr}-${randomStyleId()}`;
    attempts += 1;
  } while ((await Product.findOne({ 'additionalDetails.styleCode': code })) && attempts < 5);

  return code;
};

// @desc    Create product (admin) — supports draft (partial data) and active (full data)
// @route   POST /api/v1/products
export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      let baseSlug = slugify(body.name);
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }
      body.slug = slug;
    }

    // Fallback thumbnail from first image
    if (!body.thumbnail && body.images?.length > 0) {
      body.thumbnail = body.images[0].url;
    }

    // Auto-generate a unique style code for active products (skip early drafts).
    if (body.status === 'active' && !body.additionalDetails?.styleCode) {
      const code = await generateStyleCode(body.category);
      body.additionalDetails = { ...(body.additionalDetails || {}), styleCode: code };
    }

    const product = await Product.create(body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update product (admin) — used for edits and continuing drafts
// @route   PUT /api/v1/products/:id
export const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.name && !body.slug) {
      const existing = await Product.findById(req.params.id);
      if (!existing?.slug) {
        let baseSlug = slugify(body.name);
        let slug = baseSlug;
        let counter = 1;
        while (await Product.findOne({ slug, _id: { $ne: req.params.id } })) {
          slug = `${baseSlug}-${counter++}`;
        }
        body.slug = slug;
      }
    }

    if (!body.thumbnail && body.images?.length > 0) {
      body.thumbnail = body.images[0].url;
    }

    // Ensure an active product has a unique style code (e.g. a draft going live,
    // or an older active product that predates this feature).
    const willBeActive = body.status === 'active';
    const incomingCode = body.additionalDetails?.styleCode;
    if (willBeActive && !incomingCode) {
      const existing = await Product.findById(req.params.id).select('additionalDetails.category category');
      const hasCode = existing?.additionalDetails?.styleCode;
      if (!hasCode) {
        const code = await generateStyleCode(body.category || existing?.category);
        body.additionalDetails = { ...(body.additionalDetails || {}), styleCode: code };
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/v1/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get featured/trending/new arrivals — public, active only
// @route   GET /api/v1/products/featured
export const getFeaturedProducts = async (req, res) => {
  try {
    const { type = 'featured', limit = 10 } = req.query;
    const filter = { status: 'active', isActive: true };

    if (type === 'featured') filter.isFeatured = true;
    else if (type === 'trending') filter.isTrending = true;
    else if (type === 'new-arrivals') filter.isNewArrival = true;
    else if (type === 'best-sellers') filter.isBestSeller = true;

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
