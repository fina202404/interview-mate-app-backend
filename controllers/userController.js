const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  // req.user is populated by protect middleware
  const user = await User.findById(req.user._id); // Use _id consistently

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    // Password change should be a separate, more secure endpoint if needed

    try {
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      });
    } catch (error) {
      // Handle potential validation errors (e.g., duplicate email/username if changed)
      console.error('Profile update error:', error);
      if (error.code === 11000 || error.name === 'MongoError' && error.message.includes('duplicate key')) {
         let field = Object.keys(error.keyValue)[0];
         field = field.charAt(0).toUpperCase() + field.slice(1); // Capitalize field name
         return res.status(400).json({ success: false, message: `${field} already exists.` });
      }
      res.status(400).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }

};

exports.upgradeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { plan } = req.body;
    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan specified.' });
    }
    
    if (plan === 'pro') {
      user.subscriptionTier = 'pro';
      user.maxResumeAnalyses = 20;
      user.maxRealInterviews = 20;
      user.maxVoiceInterviews = 20;
      user.maxAvatarInterviews = 20;
    } else if (plan === 'enterprise') {
      user.subscriptionTier = 'enterprise';
      const unlimited = 999999;
      user.maxResumeAnalyses = unlimited;
      user.maxRealInterviews = unlimited;
      user.maxVoiceInterviews = unlimited;
      user.maxAvatarInterviews = unlimited;
    }
    
    user.resumeAnalysisCount = 0;
    user.realInterviewCount = 0;
    user.voiceInterviewCount = 0;
    user.avatarInterviewCount = 0;

    await user.save();
    res.json({ success: true, message: `Subscription upgraded to ${plan}`, user: user });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during subscription upgrade.' });
  }
};
exports.getSubscriptionStatus = async (req, res) => {
    try {
        // ✅ Re-fetch the user directly from the database
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            subscriptionTier: user.subscriptionTier
        });

    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};