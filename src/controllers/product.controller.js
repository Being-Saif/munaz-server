import Product from '../models/Product.js';

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/v1/products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, sort, search, minPrice, maxPrice, isOnSale, isNewArrival, isTrending, isBestSeller } = req.query;

    // Build filter
    const filter = { isActive: true };

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

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create product (admin)
// @route   POST /api/v1/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/v1/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

// @desc    Get featured/trending/new arrivals
// @route   GET /api/v1/products/featured
export const getFeaturedProducts = async (req, res) => {
  try {
    const { type = 'featured', limit = 10 } = req.query;
    const filter = { isActive: true };

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
