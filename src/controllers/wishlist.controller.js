import Wishlist from '../models/Wishlist.js';

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name slug thumbnail price salePrice isOnSale ratingsAverage');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/v1/wishlist/:productId
export const toggleWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const productId = req.params.productId;
    const index = wishlist.products.indexOf(productId);

    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate('products', 'name slug thumbnail price salePrice isOnSale ratingsAverage');

    res.json({
      success: true,
      data: wishlist,
      action: index > -1 ? 'removed' : 'added',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/v1/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.products.pull(req.params.productId);
    await wishlist.save();
    await wishlist.populate('products', 'name slug thumbnail price salePrice isOnSale ratingsAverage');

    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
