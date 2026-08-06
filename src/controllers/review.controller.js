import Review from '../models/Review.js';

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/:productId
export const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name avatar'),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create review
// @route   POST /api/v1/reviews/:productId
export const createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    // Check if already reviewed
    const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ error: 'You already reviewed this product' });
    }

    const review = await Review.create({
      product: req.params.productId,
      user: req.user._id,
      rating,
      title,
      comment,
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { rating, title, comment } = req.body;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
