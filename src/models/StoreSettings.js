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
