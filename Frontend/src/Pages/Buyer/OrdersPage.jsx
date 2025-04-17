import { Card, List, message, Space, Tag, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AddRatingModal } from "../../Components/Rating/AddRatingModal";
import { formatNepaliRupees } from "../../Utils/NepaliPriceFormatter"; // Assuming this utility exists for price formatting
import { base_url } from "../../url";

const { Title, Text } = Typography;

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user orders when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${base_url}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use the auth token from localStorage
          },
        });
        setOrders(response.data.data); // Assuming response.data.data holds the order data
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

  if (loading) {
    return <Text>Loading orders...</Text>;
  }

  if (error) {
    return <Text type="danger">{error}</Text>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>My Orders</Title>

      {orders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={orders}
          renderItem={(order) => {
            console.log(order);
            return (
              <List.Item
                key={order.id}
                actions={[
                  <Text>{new Date(order.created_at).toLocaleString()}</Text>,
                  <div>
                    <AddRatingModal
                      product_id={order.product_id}
                      name={order.product_name}
                    />
                  </div>,
                ]}
              >
                <Card hoverable title={`Order ID: ${order.id}`} actions={[]}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong>Order Status: </Text>
                    <Tag color={getStatusColor(order.status)}>
                      {order.status}
                    </Tag>

                    <Text strong>Total: </Text>
                    <Text style={{ color: "green" }}>
                      {formatNepaliRupees(
                        parseFloat(order.total_price).toFixed(0)
                      )}
                    </Text>

                    <Text strong>Items: </Text>
                    <ul>
                      {/* Rendering each item in the order */}
                      <li key={order.id}>
                        {order.product_name} (x{order.quantity}) -{" "}
                        {formatNepaliRupees(
                          parseFloat(order.total_price).toFixed(0)
                        )}
                      </li>
                    </ul>
                  </Space>
                </Card>
              </List.Item>
            );
          }}
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

export default MyOrdersPage;
