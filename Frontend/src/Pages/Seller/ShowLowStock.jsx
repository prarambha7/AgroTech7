import { DeleteOutlined, EditOutlined } from "@ant-design/icons"; // Import Ant Design icons
import { Button, Input, Modal, Table, notification } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ProductModal from "../../Components/Seller/ProductModal";

export const ShowLowStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    availability: null,
    priceRange: [],
  });
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data from API
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/low-stock",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
            ...filters,
            ...params, // Merge any additional params passed from the table
          },
        }
      );

      const { data, total, page } = response.data;
      setData(data);
      setPagination({
        ...pagination,
        total,
        current: page,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Use effect to fetch data when component mounts or pagination/filters change
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters, refresh]);

  // Handle filter change
  const handleFilterChange = (value, field) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [field]: value };
      fetchData({ filters: updatedFilters });
      return updatedFilters;
    });
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/products/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Product deleted successfully");
      fetchData(); // Re-fetch data to update the table
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div>
          <Input
            placeholder="Search Name"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
          />
          <Button onClick={() => confirm()}>Search</Button>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `NPR ${price}`,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div>
          <Input
            placeholder="Search Price"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
          />
          <Button onClick={() => confirm()}>Search</Button>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      filters: [
        { text: "Fruits", value: "Fruits" },
        { text: "Vegetables", value: "Vegetables" },
      ],
      onFilter: (value, record) => record.category_name.includes(value),
      render: (category) => category || "N/A",
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      filters: [
        { text: "Available", value: "Available" },
        { text: "Out of Stock", value: "Out of Stock" },
      ],
      onFilter: (value, record) => record.availability.includes(value),
      render: (availability) => availability || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        console.log(record);
        return (
          <div className="flex flex-row gap-2">
            <EditQuantityModal
              currentQuantity={record.quantity}
              productId={record.id}
              key={record.id}
              onChange={(e) => {
                if (e) {
                  setRefresh(!refresh);
                }
              }}
            />
            <Button
              danger={true}
              type={"primary"}
              onClick={() => handleDelete(record.id)}
              icon={<DeleteOutlined />} // Adding the Delete icon
            ></Button>
            <ProductModal data={record} />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={(pagination, filters, sorter) => {
          setPagination({
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          });
          // Update filters if necessary
          handleFilterChange(filters, "category");
        }}
        rowKey="id"
      />
      <Toaster />
    </div>
  );
};

import { Form, InputNumber } from "antd";
import { base_url } from "../../url";

const EditQuantityModal = ({ productId, currentQuantity, onChange }) => {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [open, setOpen] = useState(false);

  // Handle input change
  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `${base_url}/api/products/update/${productId}`,
        {
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with the actual token
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "Product quantity updated successfully!",
        });
        setOpen(false);
        onChange(true);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to update quantity.",
      });
    }
  };

  return (
    <div>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        icon={<EditOutlined />} // Adding the Edit icon to the button
      />
      <Modal
        title="Edit Product Quantity"
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onOk={handleSubmit}
        okText="Save"
        cancelText="Cancel"
      >
        <Form>
          <Form.Item label="Quantity" name="quantity">
            <InputNumber
              min={0}
              value={quantity}
              onChange={handleQuantityChange}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
