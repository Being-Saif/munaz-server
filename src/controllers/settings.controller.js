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

// @desc    Get public store settings (customer-facing fields only)
// @route   GET /api/v1/settings/public
export const getPublicSettings = async (req, res) => {
  try {
    const s = await StoreSettings.getSingleton();
    res.json({
      success: true,
      data: {
        storeName: s.storeName,
        contactEmail: s.contactEmail || s.supportEmail || '',
        supportPhone: s.supportPhone || '',
        address: s.address || '',
        shippingFee: s.shippingFee ?? 10,
        freeShippingThreshold: s.freeShippingThreshold ?? 500,
        returnWindowDays: s.returnWindowDays ?? 7,
        returnAddress: s.returnAddress || '',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update store settings (admin)
// @route   PUT /api/v1/settings
export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, supportEmail, supportPhone, address, contactEmail, shippingFee, freeShippingThreshold, returnWindowDays, returnAddress } = req.body;
    const settings = await StoreSettings.getSingleton();

    if (storeName !== undefined) settings.storeName = storeName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (address !== undefined) settings.address = address;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (returnWindowDays !== undefined) settings.returnWindowDays = Number(returnWindowDays);
    if (returnAddress !== undefined) settings.returnAddress = returnAddress;

    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
