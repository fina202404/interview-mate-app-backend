const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users); // Send the full user objects
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error or invalid ID format' });
  }
};

// @desc    Update user by ID (by admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
   console.log(`--- ADMIN: Attempting to update user ${req.params.id} ---`);
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.subscriptionTier = req.body.subscriptionTier || user.subscriptionTier;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ success: true, message: 'User removed' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ THIS IS THE FIX: The missing function to create users from the admin panel.
// @desc    Create a new user (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    const { username, email, password, role, subscriptionTier } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
        }
        const newUser = new User({
            username,
            email,
            password,
            role: role || 'user',
            subscriptionTier: subscriptionTier || 'free',
        });
        if (newUser.subscriptionTier === 'enterprise') {
            const unlimited = 999999;
            newUser.maxVoiceInterviews = unlimited;
            newUser.maxAvatarInterviews = unlimited;
            newUser.maxRealInterviews = unlimited;
            newUser.maxResumeAnalyses = unlimited;
        } else if (newUser.subscriptionTier === 'pro') {
            newUser.maxVoiceInterviews = 20;
            newUser.maxAvatarInterviews = 20;
            newUser.maxRealInterviews = 20;
            newUser.maxResumeAnalyses = 20;
        }
        const createdUser = await newUser.save();
        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            user: createdUser
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ success: false, message: 'Server error during user creation.' });
    }
};

// @desc    Get all resume analyses
// @route   GET /api/admin/resume-analyses
// @access  Private/Admin
exports.getResumeAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find().populate('userId', 'username email');
    res.json({ success: true, analyses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching resume analyses' });
  }
};