const Poll = require('../models/Poll');

const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Teacher creates a poll
    socket.on('teacher:createPoll', async (data) => {
      try {
        const { poll } = data;
        
        // Start timer for auto-closing if maxTime is set
        if (poll.maxTime > 0) {
          setTimeout(async () => {
            const currentPoll = await Poll.findById(poll._id);
            if (currentPoll && currentPoll.status === 'active') {
              currentPoll.status = 'closed';
              await currentPoll.save();
              io.emit('poll:timeout', { poll: currentPoll });
            }
          }, poll.maxTime * 1000);
        }
        
        io.emit('teacher:createPoll', { poll });
      } catch (error) {
        console.error('Socket error:', error);
      }
    });
    
    // Student submits answer
socket.on('student:submitAnswer', async (data) => {
  try {
    const { pollId, answers } = data;
    
    // First emit regular results update
    io.emit('poll:resultsUpdate', { pollId, responses: data.responses });
    
    // Then calculate and emit response statistics
    const poll = await Poll.findById(pollId);
    if (!poll) return;
    
    const students = await Student.find({ sessionId: { $exists: true } });
    const studentsAnswered = await Student.countDocuments({
      'answers.pollId': pollId
    });
    
    const allAnswered = students.length > 0 && studentsAnswered === students.length;
    const responseRate = students.length > 0 ? (studentsAnswered / students.length) * 100 : 0;
    
    io.emit('poll:responseStats', {
      pollId,
      stats: {
        allAnswered,
        totalStudents: students.length,
        studentsAnswered,
        responseRate: Math.round(responseRate)
      }
    });
  } catch (error) {
    console.error('Socket error:', error);
  }
});
    
    // Chat functionality (Brownie Points feature)
    socket.on('chat:message', (data) => {
      io.emit('chat:message', data);
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocketEvents;