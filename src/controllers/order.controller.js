import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

// @desc    Create new order
// @route   POST /api/v1/orders
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingMethod, itemsTotal, shippingCost, discount, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      itemsTotal,
      shippingCost,
      discount,
      totalAmount,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    });

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/v1/orders
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('items.product', 'name slug thumbnail'),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product', 'name slug thumbnail');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders/admin/all
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email').populate('items.product', 'name slug thumbnail'),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
