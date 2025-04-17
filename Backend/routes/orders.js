const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware for authentication
const ordersController = require('../controllers/ordersController'); // Import ordersController

// Place an Order
router.post('/create', auth(['user']), ordersController.placeOrder);

// Update Order Status
router.put('/update-status/:orderId', auth(['seller', 'admin']), ordersController.updateOrderStatus);

// Fetch Orders for a User
router.get('/my-orders', auth(['user']), ordersController.fetchUserOrders);

// Fetch Orders for a Seller
router.get('/seller-orders', auth(['seller']), ordersController.fetchSellerOrders);
// Fetch order by ID
router.get('/:orderId', auth(['user', 'seller']), ordersController.fetchOrderById);

module.exports = router;
