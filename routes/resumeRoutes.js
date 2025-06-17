// backend/routes/resumeRoutes.js (Corrected and Complete)

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResumeWithJob } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/subscriptionMiddleware');

// Set up multer for memory storage (to handle file uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post(
  '/job-analyze',
  protect,                          // 1. Checks if user is logged in
  upload.single('resume'),          // 2. Handles the PDF file upload
  checkUsageLimit('resumeAnalysis'),// 3. Tracks usage and decrements the counter
  analyzeResumeWithJob              // 4. Finally, runs the analysis controller
);

module.exports = router;