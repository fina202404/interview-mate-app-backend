const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: String,
  feedback: String,
  reportLink: String,
  score: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
