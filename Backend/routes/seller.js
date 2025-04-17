const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SellerController = require('../controllers/sellerController');

// Seller Dashboard Route
router.get('/dashboard', auth(['seller']), SellerController.getDashboard);

// Seller Profile Route
router.get('/profile', auth(['seller']), SellerController.getProfile);

router.get('/low-stock', auth(['seller']), SellerController.getLowStockProducts);

router.get('/nearby', auth(['user']), SellerController.fetchNearbySellers);

// Update Seller Profile Route
router.put('/profile', auth(['seller']), SellerController.updateProfile);

module.exports = router;
