import User from '../models/User.js';
import { generateToken, sendTokenResponse } from '../utils/token.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email.js';

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
        authProvider: 'google',
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

    // If Google user — check if they've set a password yet
    if (user.authProvider === 'google') {
      // Try matching the password (maybe they set one via setPassword endpoint)
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          error: 'This account was created with Google. Please login with Google or set a password first.',
          code: 'GOOGLE_ACCOUNT',
          email: user.email
        });
      }
    } else {
      // Normal password check
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated. Contact support.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Set password for Google users (or reset password)
// @route   POST /api/v1/auth/set-password
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = password;
    // Keep authProvider as google but now they can use both methods
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Forgot password — email a reset link
// @route   POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Always respond success to avoid leaking which emails are registered.
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Create a raw token (goes in the email link) and store only its hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'https://www.munazshop.com';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Respond immediately so the client never hangs on a slow SMTP connection.
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    // Send the email in the background (don't block the response).
    sendPasswordResetEmail(user.email, resetUrl, user.name).catch((mailErr) => {
      console.error('[forgotPassword] email send failed:', mailErr.message);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Reset password using the emailed token
// @route   POST /api/v1/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

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
