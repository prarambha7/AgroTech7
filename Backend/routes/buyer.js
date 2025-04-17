const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BuyerController = require('../controllers/buyerController');

// Fetch user profile
router.get('/profile', auth(['user']), BuyerController.getProfile);

// Update user profile
router.put('/profile', auth(['user']), BuyerController.updateProfile);

module.exports = router;
