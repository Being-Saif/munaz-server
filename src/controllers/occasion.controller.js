import Occasion from '../models/Occasion.js';

// @desc    Get active occasions (public)
// @route   GET /api/v1/occasions
export const getOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: occasions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all occasions (admin)
// @route   GET /api/v1/occasions/admin/all
export const getAllOccasions = async (req, res) => {
  try {
    const occasions = await Occasion.find().sort({ order: 1 });
    res.json({ success: true, data: occasions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create occasion (admin)
// @route   POST /api/v1/occasions
export const createOccasion = async (req, res) => {
  try {
    const occasion = await Occasion.create(req.body);
    res.status(201).json({ success: true, data: occasion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update occasion (admin)
// @route   PUT /api/v1/occasions/:id
export const updateOccasion = async (req, res) => {
  try {
    const occasion = await Occasion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!occasion) return res.status(404).json({ error: 'Occasion not found' });
    res.json({ success: true, data: occasion });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete occasion (admin)
// @route   DELETE /api/v1/occasions/:id
export const deleteOccasion = async (req, res) => {
  try {
    await Occasion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Occasion deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
