import { Card, List, message, Select, Space, Tag, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { base_url } from "../../url";

const { Title, Text } = Typography;
const { Option } = Select;

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const ALLOWED_ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Canceled",
  ];

  useEffect(() => {
    // Fetch orders for the seller when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/orders/seller-orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Authentication
            },
          }
        );
        setOrders(response.data.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
        message.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusChangeLoading(true);
    try {
      await axios.put(
        `${base_url}/api/orders/update-status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Authentication
          },
        }
      );
      message.success(`Order status updated to ${newStatus}`);
      // Update the order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("Failed to update order status.");
    } finally {
      setStatusChangeLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading orders...</Text>;
  }

  if (error) {
    return <Text type="danger">{error}</Text>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Seller Orders</Title>

      {orders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={orders}
          renderItem={(order) => (
            <List.Item key={order.id}>
              <Card
                hoverable
                title={`Order ID: ${order.id}`}
                actions={
                  [
                    //   <Button
                    //     type="link"
                    //     onClick={() => console.log(`View order ${order.id}`)}
                    //   >
                    //     View Details
                    //   </Button>,
                  ]
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>Order Status: </Text>
                  <Tag color={getStatusColor(order.status)}>{order.status}</Tag>

                  <Text strong>Total: </Text>
                  <Text style={{ color: "green" }}>
                    {formatNepaliRupees(order.total_price)}
                  </Text>

                  <Text strong>Items: </Text>
                  <ul>
                    <li>
                      {order.product_name} (x{order.quantity})
                    </li>
                  </ul>

                  {/* Change Order Status */}
                  <Space>
                    <Text strong>Change Status: </Text>
                    <Select
                      defaultValue={order.status}
                      style={{ width: 120 }}
                      onChange={(newStatus) =>
                        handleStatusChange(order.id, newStatus)
                      }
                      loading={statusChangeLoading}
                    >
                      {ALLOWED_ORDER_STATUSES.map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

// Helper function to determine the status color
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "blue";
    case "Confirmed":
      return "green";
    case "Shipped":
      return "orange";
    case "Delivered":
      return "green";
    case "Canceled":
      return "red";
    default:
      return "gray";
  }
};

// Utility to format Nepali Rupees (you can modify this based on your needs)
const formatNepaliRupees = (amount) => {
  return `Rs. ${parseFloat(amount).toLocaleString("en-NP")}`;
};

export default SellerOrdersPage;
