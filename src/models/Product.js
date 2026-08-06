import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  shortDescription: {
    type: String,
    maxlength: 300,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
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
  isOnSale: {
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
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
  }],
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required'],
  },
  colors: [{
    name: { type: String },
    hex: { type: String },
  }],
  sizes: [{
    name: { type: String },
    stock: { type: Number, default: 0 },
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
productSchema.index({ name: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
