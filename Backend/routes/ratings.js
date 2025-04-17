const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ratingsController = require('../controllers/ratingsController');

// Add a rating (only for authenticated users)
router.post('/add', auth(['user']), ratingsController.addRating);

// Fetch product ratings (average and count)
router.get('/product/:productId', ratingsController.fetchProductRatings);

// Fetch all ratings for a product
router.get('/product/:productId/all', ratingsController.fetchRatingsByProduct);

module.exports = router;
