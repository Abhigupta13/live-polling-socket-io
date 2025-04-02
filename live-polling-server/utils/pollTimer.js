const Poll = require('../models/Poll');

// Store active timers
const activeTimers = {};

// Start a timer for a poll
exports.startPollTimer = (io, pollId, seconds) => {
  // Clear any existing timer for this poll
  if (activeTimers[pollId]) {
    clearTimeout(activeTimers[pollId]);
  }
  
  console.log(`Starting timer for poll ${pollId}: ${seconds} seconds`);
  
  // Set new timer
  activeTimers[pollId] = setTimeout(async () => {
    try {
      // Find and update poll status
      const poll = await Poll.findById(pollId);
      if (!poll || poll.status === 'closed') return;
      
      poll.status = 'closed';
      await poll.save();
      
      // Emit event to all clients
      console.log(`Poll ${pollId} timer expired, emitting poll:timeout`);
      io.emit('poll:timeout', { poll });
      
      // Clean up timer
      delete activeTimers[pollId];
    } catch (error) {
      console.error('Error handling poll timeout:', error);
    }
  }, seconds * 1000);
  
  return activeTimers[pollId];
};

// Cancel a timer
exports.cancelPollTimer = (pollId) => {
  if (activeTimers[pollId]) {
    clearTimeout(activeTimers[pollId]);
    delete activeTimers[pollId];
    console.log(`Timer for poll ${pollId} cancelled`);
    return true;
  }
  return false;
};

// Get all active timers
exports.getActiveTimers = () => {
  return Object.keys(activeTimers);
};