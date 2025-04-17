const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MatchingController = require('../controllers/matchingController');

router.post('/match', auth(['user']), MatchingController.matchSellersForCurrentUser);

module.exports = router;
