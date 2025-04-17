import { DeleteOutlined, EditOutlined } from "@ant-design/icons"; // Import Ant Design icons
import { Button, Input, Modal, Table, notification } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ProductModal from "../../Components/Seller/ProductModal";

export const ShowSellingProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState();
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    align: "center",
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch data from API
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/my-products",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: pagination.current,
            limit: pagination.pageSize,
            search: search || null,
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
  }, [pagination.current, pagination.pageSize, refresh, search]);

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
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `NPR ${price}`,
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

      render: (category) => category || "N/A",
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",

      render: (availability) => availability || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
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
    <div className="flex flex-col gap-2 p-6">
      <div className="flex flex-row justify-between">
        <Input.Search
          placeholder="Search"
          value={search}
          size="large"
          className="w-96"
          onChange={(e) => {
            setSearch(e.target.value || undefined);
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          position: ["bottomCenter"],
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={(pagination) => {
          setPagination({
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          });
          // Update filters if necessary
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
