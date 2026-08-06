import Cart from '../models/Cart.js';

// @desc    Get user cart
// @route   GET /api/v1/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug thumbnail price salePrice isOnSale totalStock');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, color, size } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already exists
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.color === color && item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, color, size });
    }

    await cart.save();
    await cart.populate('items.product', 'name slug thumbnail price salePrice isOnSale totalStock');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name slug thumbnail price salePrice isOnSale totalStock');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name slug thumbnail price salePrice isOnSale totalStock');

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, data: { items: [] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
