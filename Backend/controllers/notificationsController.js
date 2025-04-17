const notificationsService = require('../services/notificationsService');

const fetchNotifications = async (req, res) => {
    try {
      const userId = req.user.id; // Get the logged-in user's ID
      const notifications = await notificationsService.fetchNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

const markAllNotificationsAsRead = async (req, res) => {
    try {
        await notificationsService.markAllNotificationsAsRead(req.user.id);
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await notificationsService.markNotificationAsRead(notificationId, req.user.id);
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(404).json({ success: false, message: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await notificationsService.deleteNotification(notificationId, req.user.id);
        res.json({ message: 'Notification deleted', notification });
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        res.status(404).json({ success: false, message: error.message });
    }
};

module.exports = {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
};
