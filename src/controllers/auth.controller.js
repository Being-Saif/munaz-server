import User from '../models/User.js';
import { generateToken, sendTokenResponse } from '../utils/token.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Login/Signup
// @route   POST /api/v1/auth/google
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (signup via Google)
      user = await User.create({
        name,
        email,
        password: `google_${googleId}_${Date.now()}`, // Random password (won't be used)
        avatar: picture,
        isActive: true,
      });
    } else {
      // Update avatar if not set
      if (!user.avatar && picture) {
        user.avatar = picture;
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({ error: 'Google authentication failed' });
  }
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated. Contact support.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
