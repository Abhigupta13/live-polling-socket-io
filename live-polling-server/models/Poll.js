const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question']
  },
  options: {
    type: [String],
    required: [true, 'Please provide at least one option']
  },
  responses: {
    type: Map,
    of: Number,
    default: {}
  },
  correctAnswers: {
    type: [String],
    default: []
  },
  createdBy: {
    type: String,
    required: [true, 'Please provide a creator name']
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  maxTime: {
    type: Number,
    default: 60
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', PollSchema);