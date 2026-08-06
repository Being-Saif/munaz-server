import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Banner image is required'],
  },
  mobileImage: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  link: {
    type: String,
    default: '/shop',
  },
  position: {
    type: String,
    enum: ['hero', 'promotional', 'category', 'popup'],
    default: 'hero',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
