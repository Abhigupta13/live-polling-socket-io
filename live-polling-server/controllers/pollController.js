const Poll = require('../models/Poll');
const Student = require('../models/Student');
const { startPollTimer, cancelPollTimer } = require('../utils/pollTimer');

exports.createPoll = async (req, res) => {
  try {
    console.log('Received poll creation request:', req.body);
    const { question, options, maxTime, correctAnswers, createdBy } = req.body;
    
    // Validate required fields
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Poll must have a question and at least two options'
      });
    }

    // Validate correctAnswers
    if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Poll must have at least one correct answer'
      });
    }

    // End any active polls first
    const activePoll = await Poll.findOne({ status: 'active' });
    if (activePoll) {
      activePoll.status = 'closed';
      await activePoll.save();
    }

    // Initialize response map
    const responseMap = {};
    options.forEach(option => {
      responseMap[option] = 0;
    });

    // Create new poll
    const poll = new Poll({
      question,
      options,
      maxTime: maxTime || 60,
      correctAnswers,
      createdBy,
      responses: responseMap
    });

    await poll.save();

    // Start timer if maxTime is set
    if (maxTime > 0 && req.io) {
      setTimeout(async () => {
        const currentPoll = await Poll.findById(poll._id);
        if (currentPoll && currentPoll.status === 'active') {
          currentPoll.status = 'closed';
          await currentPoll.save();
          req.io.emit('poll:timeout', { poll: currentPoll });
        }
      }, maxTime * 1000);
    }

    // Emit socket event
    if (req.io) {
      req.io.emit('teacher:createPoll', { poll });
    }

    res.status(201).json({ success: true, data: poll });
  } catch (error) {
    console.error('Poll creation error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};
// Get the active poll
exports.getActivePoll = async (req, res) => {
  try {
    console.log("Fetching active poll");
    const poll = await Poll.findOne({ status: 'active' });
    
    if (!poll) {
      console.log("No active poll found");
      // Instead of returning 404, return success with null data
      return res.status(200).json({ 
        success: true, 
        message: 'No active poll found',
        data: null
      });
    }
    
    console.log(`Found active poll: ${poll._id}`);
    res.status(200).json({ success: true, data: poll });
  } catch (error) {
    console.error("Error fetching active poll:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};



// Add this function to your controller
exports.endPoll = async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await Poll.findById(id);
    
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    
    if (poll.status === 'closed') {
      return res.status(400).json({ success: false, error: 'Poll is already closed' });
    }
    
    // Update poll status
    poll.status = 'closed';
    await poll.save();
    
    // Cancel timer
    cancelPollTimer(id);
    
    // Emit socket event
    if (req.io) {
      req.io.emit('poll:end', { poll });
    } else {
      console.warn('Socket event not emitted: io object missing');
    }
    
    res.status(200).json({ success: true, data: poll });
  } catch (error) {
    console.error('Error ending poll:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get poll history
exports.getPollHistory = async (req, res) => {
  try {
    const polls = await Poll.find({ status: 'closed' }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: polls });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get poll results
exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    
    res.status(200).json({ success: true, data: poll.responses });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// Add this function to your controller
exports.getPollAnalytics = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    
    // Get all student answers for this poll
    const students = await Student.find({
      'answers.pollId': pollId
    });
    
    // Calculate analytics
    const totalResponses = Object.values(poll.responses).reduce((sum, count) => sum + count, 0);
    const responseRate = students.length > 0 ? (totalResponses / students.length) * 100 : 0;
    
    // Find most and least popular options
    let mostPopular = { option: null, count: 0 };
    let leastPopular = { option: null, count: Infinity };
    
    Object.entries(poll.responses).forEach(([option, count]) => {
      if (count > mostPopular.count) {
        mostPopular = { option, count };
      }
      if (count < leastPopular.count && count > 0) {
        leastPopular = { option, count };
      }
    });
    
    // If no responses yet
    if (leastPopular.count === Infinity) {
      leastPopular = { option: null, count: 0 };
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        poll,
        analytics: {
          totalResponses,
          responseRate: Math.round(responseRate),
          mostPopular,
          leastPopular
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
// Add a new endpoint to check if all students have answered
exports.checkAllAnswered = async (req, res) => {
  try {
    const { pollId } = req.params;
    
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    
    // Get all students in the system
    const students = await Student.find({ sessionId: { $exists: true } });
    
    // Count how many students have answered this poll
    const studentsAnswered = await Student.countDocuments({
      'answers.pollId': pollId
    });
    
    // Calculate if all students have answered
    const allAnswered = students.length > 0 && studentsAnswered === students.length;
    
    // Add response statistics
    const totalStudents = students.length;
    const responseRate = totalStudents > 0 ? (studentsAnswered / totalStudents) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        allAnswered,
        totalStudents,
        studentsAnswered,
        responseRate: Math.round(responseRate)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};