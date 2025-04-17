import { Table, Tabs, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

// Destructuring the Tabs component
const { TabPane } = Tabs;

export const UserPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Column configuration for Users
  const userColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Full Name", dataIndex: "full_name", key: "full_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  // Column configuration for Sellers
  const sellerColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Full Name", dataIndex: "full_name", key: "full_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Farm Name", dataIndex: "farm_name", key: "farm_name" },
  ];

  // Fetch Users Data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setData(response.data.data); // Assuming data is returned in a 'data' property
      setLoading(false);
    } catch (err) {
      message.error("Failed to fetch users.");
      setLoading(false);
    }
  };

  // Fetch Sellers Data
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/sellers",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setData(response.data.data); // Assuming data is returned in a 'data' property
      setLoading(false);
    } catch (err) {
      message.error("Failed to fetch sellers.");
      setLoading(false);
    }
  };

  // useEffect to fetch data on mount
  useEffect(() => {
    fetchUsers(); // Default is to fetch users when the page loads
  }, []);

  // Handle Tab Change
  const handleTabChange = (key) => {
    if (key === "1") {
      fetchUsers(); // Fetch users when tab 1 is selected
    } else {
      fetchSellers(); // Fetch sellers when tab 2 is selected
    }
  };

  return (
    <div className="px-10">
      <Tabs defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab="Users" key="1" className="">
          <Table
            columns={userColumns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={false}
          />
        </TabPane>
        <TabPane tab="Sellers" key="2">
          <Table
            columns={sellerColumns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={false}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};
