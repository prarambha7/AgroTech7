const client = require('../db'); // PostgreSQL connection

// Fetch all notifications for a user
const fetchNotifications = async (userId) => {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userId]);
    return result.rows;
  };

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = $1';
    await client.query(query, [userId]);
};

// Mark a specific notification as read
const markNotificationAsRead = async (notificationId, userId) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1 AND user_id = $2
        RETURNING *`;
    const result = await client.query(query, [notificationId, userId]);
    return result.rows[0];
};

// Delete a specific notification
const deleteNotification = async (notificationId, userId) => {
    const query = `
        DELETE FROM notifications
        WHERE id = $1 AND user_id = $2
        RETURNING *`;
    const result = await client.query(query, [notificationId, userId]);
    return result.rows[0];
};

// Add a notification
const addNotification = async (userId, message) => {
    const query = `
        INSERT INTO notifications (user_id, message, is_read, created_at)
        VALUES ($1, $2, FALSE, CURRENT_TIMESTAMP)
        RETURNING *`;
    const values = [userId, message];
    const result = await client.query(query, values);
    return result.rows[0];
};

module.exports = {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    addNotification, // Ensure this function is exported
};
