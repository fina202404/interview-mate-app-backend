const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, 
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

    subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },

  voiceInterviewCount: { type: Number, default: 0 },
  maxVoiceInterviews: { type: Number, default: 5 },

  avatarInterviewCount: { type: Number, default: 0 },
  maxAvatarInterviews: { type: Number, default: 5 },

  realInterviewCount: { type: Number, default: 0 },
  maxRealInterviews: { type: Number, default: 5 },

  resumeAnalysisCount: { type: Number, default: 0 },
  maxResumeAnalyses: { type: Number, default: 5 },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return the unhashed token
};

module.exports = mongoose.model('User', UserSchema);