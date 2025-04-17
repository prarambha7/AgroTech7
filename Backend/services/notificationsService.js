const notificationsModel = require('../models/notificationsModel');
const addAndEmitNotification = async (io, userId, message) => {
    console.log('Notification Debug:', { userId, message });
    try {
        // Add the notification to the database
        const notification = await notificationsModel.addNotification(userId, message);

        // Emit the notification in real-time
        if (io) {
            io.emit(`notification:${userId}`, notification);
        }

        return notification;
    } catch (error) {
        console.error('Error in addAndEmitNotification:', error.message);
        throw error;
    }
};

// Fetch Notifications
const fetchNotifications = async (userId) => {
    return await notificationsModel.fetchNotifications(userId);
  };

// Mark All Notifications as Read
const markAllNotificationsAsRead = async (userId) => {
    await notificationsModel.markAllNotificationsAsRead(userId);
};

// Mark a Specific Notification as Read
const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await notificationsModel.markNotificationAsRead(notificationId, userId);
    if (!notification) {
        throw new Error('Notification not found or unauthorized');
    }
    return notification;
};

// Delete a Specific Notification
const deleteNotification = async (notificationId, userId) => {
    const notification = await notificationsModel.deleteNotification(notificationId, userId);
    if (!notification) {
        throw new Error('Notification not found or unauthorized');
    }
    return notification;
};

module.exports = {
    addAndEmitNotification, // Ensure this function is exported
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
};
