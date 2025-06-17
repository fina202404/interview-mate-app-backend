// backend/routes/authRoutes.js (Corrected and Cleaned)
const express = require('express');
const router = express.Router();
const {
  signup,
  signin,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController'); // Import all functions from controller
const { protect } = require('../middleware/authMiddleware');

// Define routes to point to controller functions
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// This route now correctly uses the 'getMe' controller function
router.get('/me', protect, getMe);

module.exports = router;