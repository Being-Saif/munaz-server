import Banner from '../models/Banner.js';

// @desc    Get active banners (public)
// @route   GET /api/v1/banners
export const getBanners = async (req, res) => {
  try {
    const { position } = req.query;
    const filter = { isActive: true };

    if (position) filter.position = position;

    // Check date validity
    const now = new Date();
    filter.$or = [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ];

    const banners = await Banner.find(filter).sort({ order: 1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all banners (admin - includes inactive)
// @route   GET /api/v1/banners/admin/all
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1, order: 1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create banner (admin)
// @route   POST /api/v1/banners
export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update banner (admin)
// @route   PUT /api/v1/banners/:id
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete banner (admin)
// @route   DELETE /api/v1/banners/:id
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle banner active status (admin)
// @route   PUT /api/v1/banners/:id/toggle
export const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
