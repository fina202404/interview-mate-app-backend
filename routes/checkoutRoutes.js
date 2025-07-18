const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router;