import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard stats (admin)
// @route   GET /api/v1/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [orders, productCount, userCount] = await Promise.all([
      Order.find(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
    ]);

    // Total revenue = sum of delivered/paid orders (exclude cancelled)
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: userCount,
        totalProducts: productCount,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
