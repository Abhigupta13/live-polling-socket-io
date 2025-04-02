const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

// Poll management routes
router.post('/create', pollController.createPoll);
router.get('/active', pollController.getActivePoll);
router.post('/:id/end', pollController.endPoll);
router.get('/history', pollController.getPollHistory);
router.get('/results/:pollId', pollController.getPollResults);
router.get('/analytics/:pollId', pollController.getPollAnalytics);
router.get('/:pollId/check-answers', pollController.checkAllAnswered);

module.exports = router;