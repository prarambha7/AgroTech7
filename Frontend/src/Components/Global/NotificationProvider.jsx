// src/Components/Notifications/NotificationProvider.jsx
import React, { useEffect, useState } from "react";
import { notification, Button } from "antd";
import socket from "../../Utils/socket";
import axios from "axios";
import { base_url } from "../../url";

const NotificationProvider = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on(`notification:${localStorage.getItem("userId")}`, (data) => {
      notification.info({
        message: "New Notification",
        description: data.message,
        placement: "topRight",
      });
  
      // Update state with the new notification
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  
    return () => {
      socket.off(`notification:${localStorage.getItem("userId")}`);
    };
  }, []);
  

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
        try {
          const response = await axios.get(`${base_url}/api/notifications`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setNotifications(response.data.data);
          setUnreadCount(response.data.data.filter((n) => !n.read).length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      };
      

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${base_url}/api/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Notification marked as read");

      // Update the notifications list to reflect the change
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Display notification list
  return (
    <div>
      <h2>Notifications</h2>
      {notifications.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <p>{item.message}</p>
          <Button
            type="primary"
            size="small"
            onClick={() => markNotificationAsRead(item.id)}
          >
            Mark as Read
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider;
