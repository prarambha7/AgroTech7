import {
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Typography,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const { Title } = Typography;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/admin-dashboard",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDashboardData(response.data.data);
        setLoading(false);
      } catch (error) {
        message.error("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "auto" }} />;
  }

  const bestSellingColumns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text) => {
        return text;
      }, // Add link if needed
    },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Total Sold", dataIndex: "total_sold", key: "total_sold" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Admin Dashboard
      </Title>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="dashboard-card" bordered={false}>
            <Statistic title="Total Users" value={dashboardData.totalUsers} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="dashboard-card" bordered={false}>
            <Statistic
              title="Total Products"
              value={dashboardData.totalProducts}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="dashboard-card" bordered={false}>
            <Statistic title="Total Orders" value={dashboardData.totalOrders} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={24}>
          <Card title="Top Selling Products" bordered={false}>
            <Table
              columns={bestSellingColumns}
              dataSource={dashboardData.bestSellingProducts}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
