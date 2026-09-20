import mongoose from 'mongoose';

// Singleton document — there is only ever one StoreSettings record.
const storeSettingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Munaz',
    trim: true,
  },
  supportEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  supportPhone: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  // Public-facing contact email shown in the footer / contact section
  contactEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
  },
  // Flat shipping fee (₹) applied at checkout when the order is below the
  // free-shipping threshold.
  shippingFee: {
    type: Number,
    default: 10,
    min: 0,
  },
  // Orders at or above this subtotal (₹) ship free. Set to a very high number
  // to effectively always charge the shippingFee.
  freeShippingThreshold: {
    type: Number,
    default: 500,
    min: 0,
  },
  // Return window in days (e.g. 7-day return policy)
  returnWindowDays: {
    type: Number,
    default: 7,
    min: 0,
  },
  // Address customers ship returns back to
  returnAddress: {
    type: String,
    default: 'Hunsinkere Layout, near Shaneshwara Temple, Hassan 573201, Karnataka',
    trim: true,
  },
}, {
  timestamps: true,
});

// Always fetch (or lazily create) the single settings document.
storeSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettings;
