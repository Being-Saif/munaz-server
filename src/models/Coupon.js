import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  // The code the customer types at checkout (stored uppercase, unique).
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    trim: true,
    uppercase: true,
    unique: true,
  },
  // Display name / title of the offer (e.g. "Festive Sale").
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  // Percentage (e.g. 10 => 10%) or a fixed ₹ amount depending on discountType.
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0,
  },
  // Minimum cart subtotal required to use the coupon.
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Optional cap on the discount for percentage coupons (0 = no cap).
  maxDiscount: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Where to surface this coupon in the storefront.
  displayLocation: {
    type: String,
    enum: ['none', 'checkout', 'cart', 'home'],
    default: 'checkout',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Optional expiry date (null = never expires).
  expiresAt: {
    type: Date,
    default: null,
  },
  // Optional overall usage cap (0 = unlimited).
  usageLimit: {
    type: Number,
    default: 0,
    min: 0,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

couponSchema.index({ isActive: 1, displayLocation: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
