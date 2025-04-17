import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../url";

const { Title, Text } = Typography;

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${base_url}/api/seller/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        message.error("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading Dashboard..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Text type="danger">Failed to load dashboard data.</Text>
      </div>
    );
  }

  const {
    totalSales,
    totalOrders,
    totalProducts,
    lowStockProducts,
    topSellingProducts,
    latestOrders,
  } = dashboardData;

  const lowStockColumns = [
    { title: "Product Name", dataIndex: "name", key: "name" },
    {
      title: "Stock",
      dataIndex: "quantity",
      key: "stock",
      render: (stock) => <Tag color="red">{stock}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `Rs. ${price}`,
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <Title level={2} className="mb-4">
        Seller Dashboard
      </Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="shadow-lg" hoverable>
            <Title level={4} className="text-blue-500">
              Total Sales
            </Title>
            <Text className="text-lg font-semibold text-green-600">
              Rs. {totalSales}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-lg" hoverable>
            <Title level={4} className="text-blue-500">
              Total Orders
            </Title>
            <Text className="text-lg font-semibold text-orange-600">
              {totalOrders}
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-lg" hoverable>
            <Title level={4} className="text-blue-500">
              Total Products
            </Title>
            <Text className="text-lg font-semibold text-purple-600">
              {totalProducts}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Products */}
      <div className="mt-8">
        <Title level={3} className="mb-4">
          Low Stock Products
        </Title>
        {lowStockProducts && lowStockProducts.length > 0 ? (
          <Table
            columns={lowStockColumns}
            dataSource={lowStockProducts}
            rowKey="id"
            pagination={false}
            footer={() => (
              <Button
                onClick={() => {
                  navigate("/lowstock");
                }}
              >
                View All
              </Button>
            )}
          />
        ) : (
          <p>No low stock Products</p>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="mt-8">
        <Title level={3} className="mb-4">
          Top Selling Products
        </Title>
        <List
          dataSource={topSellingProducts}
          renderItem={(product) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={product.images[0] || "https://via.placeholder.com/50"}
                  />
                }
                title={product.name}
                description={`Sold: ${product.total_sold} | Revenue: Rs. ${
                  product.price * product.total_sold
                }`}
              />
            </List.Item>
          )}
        />
      </div>

      {/* Latest Orders */}
      <div className="mt-8">
        <Title level={3} className="mb-4">
          Latest Orders
        </Title>
        <List
          dataSource={latestOrders}
          renderItem={(order) => (
            <List.Item>
              <List.Item.Meta
                title={`Order ID: ${order.id}`}
                description={
                  <>
                    <Text>Buyer Name: {order.buyer_name}</Text>
                    <br />
                    <Text>Status:</Text>
                    <Tag color={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Tag>
                    <br />
                    <Text>Quantity: {order.quantity}</Text>
                    <br />
                    <Text>Total: Rs. {order.total_price}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

// Helper function for order status colors
const getOrderStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "blue";
    case "Confirmed":
      return "green";
    case "Shipped":
      return "orange";
    case "Delivered":
      return "purple";
    case "Canceled":
      return "red";
    default:
      return "gray";
  }
};

export default SellerDashboard;
