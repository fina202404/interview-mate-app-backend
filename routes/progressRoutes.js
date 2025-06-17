const express = require('express');
const router = express.Router();
const { saveProgress, getProgress, resetProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
 // 👈 make sure this is a function

router.post('/', protect, saveProgress);
router.get('/', protect, getProgress);
router.delete('/reset', protect, resetProgress);


module.exports = router;
