const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  answers: [{
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll'
    },
    answer: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);