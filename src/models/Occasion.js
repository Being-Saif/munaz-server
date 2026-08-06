import mongoose from 'mongoose';

const occasionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Occasion name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  tagline: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Occasion image is required'],
  },
  link: {
    type: String,
    default: '/shop',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Occasion = mongoose.model('Occasion', occasionSchema);
export default Occasion;
