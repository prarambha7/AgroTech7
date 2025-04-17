import { LogoutOutlined, ShoppingCartOutlined, BellOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, ConfigProvider, Dropdown, Layout } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { RegisterAdminModal } from "./Components/Admin/RegisterAdminModal";
import { RoutesLayout } from "./Components/Routes/RoutesLayout";
import ChangePasswordModal from "./Pages/ChangePwdModel";
import { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "./url";

export const App = () => {
  const { Header, Content } = Layout;
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token") ? true : false;
  const username = localStorage.getItem("name");
  const isSeller = localStorage.getItem("role") === "seller";
  const isAdmin =
    localStorage.getItem("role") === "admin" ||
    localStorage.getItem("role") === "super admin";

  const isSuperAdmin = localStorage.getItem("role") === "super admin";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications for the dropdown
  const [currentUserId, setCurrentUserId] = useState(parseInt(localStorage.getItem("userId"), 10));

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token);
      console.log("Fetching notifications for userId:", currentUserId);
  
      try {
        const response = await axios.get(`${base_url}/api/notifications?userId=${currentUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("Dropdown API Response:", response.data);
  
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter((n) => !n.is_read).length);
      } catch (error) {
        console.error("Error fetching dropdown notifications:", error);
      }
    };
  
    if (currentUserId) fetchNotifications();
  }, [currentUserId]); // React state as dependency
  
  // Update userId on login/logout
  useEffect(() => {
    setCurrentUserId(parseInt(localStorage.getItem("userId"), 10));
  }, [localStorage.getItem("userId")]); // Trigger on userId change
  
  // Mark a notification as read
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => prev - 1); // Decrease unread count
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Notification menu for the dropdown
  const notificationMenuItems = notifications
  .filter((notification) => {
    const storedUserId = parseInt(localStorage.getItem("userId"), 10); // Ensure userId is parsed correctly
    console.log("Stored User ID:", storedUserId);
    console.log("Notification User ID:", notification.user_id);
    return notification.user_id === storedUserId;
  })
  .slice(0, 5)
  .map((notification) => ({
    key: notification.id,
    label: (
      <div
        onClick={() => markNotificationAsRead(notification.id)}
        style={{
          fontWeight: notification.is_read ? "normal" : "bold",
          backgroundColor: notification.is_read ? "transparent" : "#f6f6f6",
          cursor: "pointer",
        }}
      >
        {notification.message}
      </div>
    ),
  }));

  const notificationMenu = [
    ...notificationMenuItems,
    ...(notificationMenuItems.length === 0
      ? [
          {
            key: "no-notifications",
            label: "No notifications available",
            disabled: true,
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "view-all",
      label: (
        <div onClick={() => navigate("/all-notifications")}>
          See All Notifications
        </div>
      ),
    },
  ];

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const onCartClick = () => {
    navigate("/cart");
  };

  return (
    <ConfigProvider>
      <Layout className="w-screen h-screen overflow-hidden bg-black select-none font-Inter">
        {isLoggedIn ? (
          <Header
            className="p-0 bg-white"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 20px",
            }}
          >
            {isAdmin || isSuperAdmin ? (
              <div className="flex flex-row items-center justify-center gap-10">
                <p style={{ fontSize: "24px", fontWeight: "bold" }}>Agrotech</p>
                <Link to="/dashboard" className="text-neutral-800">
                  Dashboard
                </Link>
                <Link to="/users" className="text-neutral-800">
                  Users
                </Link>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center gap-10">
                <p style={{ fontSize: "24px", fontWeight: "bold" }}>Agrotech</p>
                {isSeller ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link to="/seller-dashboard" className="text-neutral-800">
                      Dashboard
                    </Link>
                    <Button
                      type="link"
                      className="font-sans text-neutral-800"
                      onClick={() => navigate("/showproducts")}
                    >
                      Show Products
                    </Button>
                    <Button
                      type="link"
                      className="font-sans text-neutral-800"
                      onClick={() => navigate("/addproduct")}
                    >
                      Add Products
                    </Button>
                    <Button
                      type="link"
                      className="font-sans text-neutral-800"
                      onClick={() => navigate("/seller-orders")}
                    >
                      Orders
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/products" className="text-neutral-800">
                      Products
                    </Link>
                    <Link to="/orders" className="text-neutral-800">
                      Orders
                    </Link>
                    <Link to="/recommended" className="text-neutral-800">
                      Recommended
                    </Link>
                    <Link to="/top-selling" className="text-neutral-800">
                      Top Selling
                    </Link>
                    <Link to="/nearby-sellers" className="text-neutral-800">
                      Nearby Seller
                    </Link>
                    <Link to="/find-matching" className="text-neutral-800">
                      Matching Seller
                    </Link>
                  </>
                )}
              </div>
            )}

            {isLoggedIn && (
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="gap-2"
              >
                {/* Notification Bell Icon */}
                <Dropdown
                  menu={{ items: notificationMenu }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Badge count={unreadCount} offset={[10, 0]}>
                    <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
                  </Badge>
                </Dropdown>

                <div
                  style={{ marginRight: "20px", fontSize: "16px" }}
                  onClick={() => {
                    if (isSeller) {
                      navigate("/user-detail");
                    } else {
                      navigate("/buyer-detail");
                    }
                  }}
                >
                  <Avatar style={{ marginRight: "10px" }} size="small">
                    {username ? username[0] : "U"}
                  </Avatar>
                  <span>{username}</span>
                </div>
                <ChangePasswordModal />
                {isSeller || isAdmin ? null : (
                  <Button
                    icon={<ShoppingCartOutlined />}
                    type="dashed"
                    style={{ marginRight: "20px" }}
                    onClick={onCartClick}
                  />
                )}
                {!isSuperAdmin ? null : <RegisterAdminModal />}
                <Button
                  icon={<LogoutOutlined />}
                  type="primary"
                  danger={true}
                  onClick={onLogout}
                ></Button>
              </div>
            )}
          </Header>
        ) : null}

        <Content className="py-0 overflow-x-hidden overflow-y-auto bg-gray-50 font-Inter">
          <RoutesLayout />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};
