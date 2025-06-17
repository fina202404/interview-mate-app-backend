const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: String,
  question: String,
  answer: String,
  clarity: Number,
  relevance: Number,
  suggestions: [String],
  date: String // You can also use `Date` if you want proper sorting
});

module.exports = mongoose.model('Progress', progressSchema);
