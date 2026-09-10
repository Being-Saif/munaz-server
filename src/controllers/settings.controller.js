import StoreSettings from '../models/StoreSettings.js';

// @desc    Get store settings (admin)
// @route   GET /api/v1/settings
export const getStoreSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.getSingleton();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update store settings (admin)
// @route   PUT /api/v1/settings
export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, supportEmail, supportPhone, address } = req.body;
    const settings = await StoreSettings.getSingleton();

    if (storeName !== undefined) settings.storeName = storeName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (address !== undefined) settings.address = address;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
