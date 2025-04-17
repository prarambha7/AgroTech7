import React, { useEffect, useState } from "react";
import { List, Button } from "antd";
import axios from "axios";
import { base_url } from "../url";

const AllNotifications = () => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(parseInt(localStorage.getItem("userId"), 10)); // State for userId

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token
        console.log("Fetching all notifications for userId:", currentUserId);

        if (!currentUserId || !token) {
          console.error("Missing userId or token");
          return;
        }

        const response = await axios.get(`${base_url}/api/notifications?userId=${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        // Update notifications state with the response data
        setAllNotifications(response.data.data);
      } catch (error) {
        console.error("Error fetching all notifications:", error);
      }
    };

    fetchAllNotifications();
  }, [currentUserId]); // Refetch notifications when `currentUserId` changes

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Missing token");
        return;
      }

      await axios.put(
        `${base_url}/api/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update notification list to mark the specific notification as read
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  console.log("State of allNotifications:", allNotifications); // Debug log

  return (
    <div>
      <h2>All Notifications</h2>
      {allNotifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={allNotifications}
          renderItem={(notification) => (
            <List.Item
              actions={[
                !notification.is_read && (
                  <Button
                    type="link"
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    Mark as Read
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta title={notification.message} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default AllNotifications;
