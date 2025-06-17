const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'user', // Public signup should always be 'user'
    });
    if (newUser) {
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error during signin' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  console.log("--- 1. EXECUTING getMe CONTROLLER ---"); 
  try {
    const user = await User.findById(req.user.id);
    console.log("--- 2. Fetched user from DB:", user?.email, "Tier:", user?.subscriptionTier); // <-- ADD THIS LINE
    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        console.log(`Password reset token for ${email}: ${resetToken}`);
        res.status(200).json({ success: true, message: 'Password reset instructions sent if email is registered.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};