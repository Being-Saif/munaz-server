import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add address
// @route   POST /api/v1/users/addresses
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/v1/users/addresses/:addressId
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/v1/users/addresses/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/v1/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
