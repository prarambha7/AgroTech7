const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware for authentication
const notificationsController = require('../controllers/notificationsController');

// Fetch Notifications for the Logged-in User
router.get('/', auth(['user', 'seller']), notificationsController.fetchNotifications);

// Mark All Notifications as Read for the Logged-in User
router.put('/mark-read', auth(['user', 'seller']), notificationsController.markAllNotificationsAsRead);

// Mark a Specific Notification as Read
router.put('/:notificationId/mark-read', auth(['user', 'seller']), notificationsController.markNotificationAsRead);

// Delete a Specific Notification
router.delete('/:notificationId', auth(['user', 'seller']), notificationsController.deleteNotification);

module.exports = router;
