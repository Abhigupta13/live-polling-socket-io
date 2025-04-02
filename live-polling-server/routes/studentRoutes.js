const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student participation routes
router.post('/join', studentController.joinSession);
router.post('/answer', studentController.submitAnswer);
router.delete('/kick/:studentId', studentController.kickStudent);

module.exports = router;