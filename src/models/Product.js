import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  shortDescription: {
    type: String,
    maxlength: 300,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
    default: null,
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  gst: {
    type: Number,
    default: 5,
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subcategory: {
    type: String,
    trim: true,
  },
  tags: [{ type: String, trim: true }],
  brand: {
    type: String,
    default: 'Munaz Originals',
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
  }],
  thumbnail: {
    type: String,
  },
  colors: [{
    name: { type: String },
    hex: { type: String },
  }],
  sizes: [{
    name: { type: String },
    stock: { type: Number, default: 0 },
  }],

  // Basic Details (Step 2 — dynamic attributes)
  attributes: {
    fabric: { type: String, default: '' },
    fit: { type: String, default: '' },
    length: { type: String, default: '' },
    neck: { type: String, default: '' },
    occasion: [{ type: String }],
  },

  // Additional Details (Step 3)
  additionalDetails: {
    pattern: { type: String, default: '' },
    ornamentation: { type: String, default: '' },
    styleCode: { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    countryOfOrigin: { type: String, default: 'India' },
    manufacturer: { type: String, default: '' },
  },

  // Variants (Step 4 — color x size combinations)
  variants: [{
    color: { type: String },
    size: { type: String },
    sku: { type: String },
    stock: { type: Number, default: 0 },
    price: { type: Number },
  }],

  // Size Chart (clothing categories only)
  sizeChart: [{
    size: { type: String },
    chest: { type: String },
    waist: { type: String },
    length: { type: String },
  }],

  totalStock: {
    type: Number,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Draft/publish workflow
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'active',
  },
  // Which wizard step the draft was last saved at (1-5)
  draftStep: {
    type: Number,
    default: 1,
  },

  flashSale: {
    isActive: { type: Boolean, default: false },
    endTime: { type: Date },
  },
}, {
  timestamps: true,
});

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
