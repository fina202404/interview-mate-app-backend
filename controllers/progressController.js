const Progress = require('../models/Progress');

// ✅ Save new progress entry
exports.saveProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const entry = { ...req.body, userId };

    const saved = await Progress.create(entry);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Save progress error:', error);
    res.status(500).json({ message: 'Failed to save progress.' });
  }
};

// ✅ Fetch all progress for a user (or all users if admin)
exports.getProgress = async (req, res) => {
  try {
    let progress;

    if (req.user.role === 'admin') {
      progress = await Progress.find()
        .sort({ date: -1 })
        .populate('userId', 'email'); // ✅ populate email from User

      console.log('✅ Admin fetched progress entries:', progress); // 🔍 ADD THIS
    } else {
      progress = await Progress.find({ userId: req.user.id }).sort({ date: -1 });
    }

    res.json(progress);
  } catch (error) {
    console.error('❌ Get progress error:', error);
    res.status(500).json({ message: 'Failed to fetch progress.' });
  }
};



// ✅ Optional: Delete all progress for a user
exports.resetProgress = async (req, res) => {
  try {
    await Progress.deleteMany({ userId: req.user.id });
    res.json({ message: 'Progress reset successfully.' });
  } catch (error) {
    console.error('❌ Reset progress error:', error);
    res.status(500).json({ message: 'Failed to reset progress.' });
  }
};
