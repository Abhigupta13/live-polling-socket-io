const Student = require('../models/Student');
const Poll = require('../models/Poll');

// Student joins session
exports.joinSession = async (req, res) => {
  try {
    const { name, sessionId } = req.body;
    
    // Check if student with this session ID already exists
    let student = await Student.findOne({ sessionId });
    
    if (student) {
      // Update name if needed
      student.name = name;
      await student.save();
    } else {
      // Create new student
      student = await Student.create({
        name,
        sessionId
      });
    }
    
    // Emit WebSocket event
    req.io.emit('student:join', { 
      student: { id: student._id, name: student.name } 
    });
    
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Student submits answer
exports.submitAnswer = async (req, res) => {
  try {
    const { studentId, pollId, answer } = req.body;
    
    console.log('Received student answer:', { studentId, pollId, answer });
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    // Find the poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    
    if (poll.status === 'closed') {
      return res.status(400).json({ success: false, error: 'Poll is closed' });
    }
    
    // Store the current responses in a regular object 
    let responses = {};
    // Convert from Map if necessary
    if (poll.responses instanceof Map) {
      poll.responses.forEach((value, key) => {
        responses[key] = value;
      });
    } else {
      responses = { ...poll.responses };
    }
    
    console.log('Current responses before update:', responses);
    
    // Check if student already answered
    const existingAnswer = student.answers.find(a => a.pollId.toString() === pollId);
    
    if (existingAnswer) {
      // Update existing answer
      const oldAnswer = existingAnswer.answer;
      existingAnswer.answer = answer;
      
      // Update poll responses
      if (responses[oldAnswer] !== undefined) {
        responses[oldAnswer] = Math.max(0, (responses[oldAnswer] || 0) - 1);
      }
      
      if (responses[answer] !== undefined) {
        responses[answer] = (responses[answer] || 0) + 1;
      } else {
        responses[answer] = 1;
      }
    } else {
      // Add new answer
      student.answers.push({ pollId, answer });
      
      // Update poll responses
      if (responses[answer] !== undefined) {
        responses[answer] = (responses[answer] || 0) + 1;
      } else {
        responses[answer] = 1;
      }
    }
    
    // Make sure all options have at least 0 count
    poll.options.forEach(option => {
      if (responses[option] === undefined) {
        responses[option] = 0;
      }
    });
    
    console.log('Updated responses:', responses);
    
    // Update poll with new responses
    poll.responses = responses;
    await student.save();
    await poll.save();
    const allStudents = await Student.find({ sessionId: { $exists: true, $ne: null } });
const studentsAnswered = await Student.countDocuments({
  'answers.pollId': pollId.toString()
});

const allAnswered = allStudents.length > 0 && studentsAnswered === allStudents.length;
const responseRate = allStudents.length > 0 ? (studentsAnswered / allStudents.length) * 100 : 0;
    
    // Emit WebSocket event with updated results
    if (req.io) {
      // First emit the updated poll responses
      console.log('Emitting poll:resultsUpdate with:', { pollId, responses });
      req.io.emit('poll:resultsUpdate', { pollId, responses });
      
      // Then emit the response statistics
      console.log('Emitting poll:responseStats with:', { 
        pollId, 
        stats: {
          allAnswered,
          totalStudents: allStudents.length,
          studentsAnswered,
          responseRate: Math.round(responseRate)
        }
      });
      
      req.io.emit('poll:responseStats', {
        pollId,
        stats: {
          allAnswered,
          totalStudents: allStudents.length,
          studentsAnswered,
          responseRate: Math.round(responseRate)
        }
      });
    } else {
      console.warn('Socket event not emitted: io object missing');
    }
    
    res.status(200).json({ success: true, data: { student, poll } });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Kick a student (Good to Have feature)
exports.kickStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(studentId);
    
    // Emit WebSocket event
    req.io.emit('student:kick', { studentId });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};