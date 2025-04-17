// In routes/recommendation.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

router.get('/', auth(['user']), recommendationController.fetchRecommendations);

module.exports = router;
