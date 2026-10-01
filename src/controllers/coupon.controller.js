import Coupon from '../models/Coupon.js';

// Compute the discount a coupon gives for a given subtotal (shared logic).
const computeDiscount = (coupon, subtotal) => {
  let discount = coupon.discountType === 'percentage'
    ? Math.round((subtotal * coupon.discountValue) / 100)
    : coupon.discountValue;

  // Cap percentage discounts if maxDiscount is set.
  if (coupon.discountType === 'percentage' && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }
  // Never discount more than the subtotal.
  discount = Math.min(discount, subtotal);
  return Math.max(0, discount);
};

// A date-only expiry (e.g. "2026-10-01") should mean valid through the END of
// that day, not midnight at its start. Normalize to 23:59:59.999 of the day.
const normalizeExpiry = (body) => {
  if (body.expiresAt) {
    const d = new Date(body.expiresAt);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      body.expiresAt = d;
    }
  }
  return body;
};

// @desc    Get active, displayable coupons (public) — optionally by location
// @route   GET /api/v1/coupons?location=checkout
export const getPublicCoupons = async (req, res) => {
  try {
    const { location } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      displayLocation: { $ne: 'none' },
      $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
    };
    if (location) filter.displayLocation = location;

    const coupons = await Coupon.find(filter)
      .select('code name description image discountType discountValue minOrderValue maxDiscount displayLocation')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Apply / validate a coupon against a subtotal
// @route   POST /api/v1/coupons/apply
export const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const sub = Number(subtotal) || 0;
    const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    }
    if (sub < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order of ₹${coupon.minOrderValue} required for this coupon` });
    }

    const discount = computeDiscount(coupon, sub);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== Admin ==========

// @desc    Get all coupons (admin)
// @route   GET /api/v1/coupons/admin/all
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/v1/coupons
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(normalizeExpiry({ ...req.body }));
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/v1/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, normalizeExpiry({ ...req.body }), { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/v1/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle coupon active status (admin)
// @route   PUT /api/v1/coupons/:id/toggle
export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
