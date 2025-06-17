// backend/routes/adminRoutes.js (Corrected and Cleaned)
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getResumeAnalyses
} = require('../controllers/adminController');
const { getProgress } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this file are protected and require admin authorization first
router.use(protect, authorize('admin'));

// Routes for managing users
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Routes for other admin data
router.get('/resume-analyses', getResumeAnalyses);
router.get('/progress', getProgress);

module.exports = router;