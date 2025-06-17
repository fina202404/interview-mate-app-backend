const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware'); 
const { checkUsageLimit } = require('../middleware/subscriptionMiddleware'); 




router.post('/analyze', protect, interviewController.analyzeAnswer);


router.post('/get-questions', protect, checkUsageLimit('voiceInterview'), interviewController.getInterviewQuestions);

router.post('/converse', protect, checkUsageLimit('realInterview'), interviewController.converse);

router.post('/get-questions', protect, checkUsageLimit('voiceInterview'), interviewController.getInterviewQuestions);

router.post(
  '/analyze',
  (req, res, next) => {
    console.log('--- LOG 1: Route /api/analyze was hit ---');
    next();
  },
  protect,
  checkUsageLimit('resumeAnalysis'),
  interviewController.analyzeAnswer
);

module.exports = router;