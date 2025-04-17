import { Button, Form, Input, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { base_url } from "../../url";

// Set up Axios default headers

const BuyerProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${base_url}/api/buyer/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data.data);
      form.setFieldsValue({
        fullName: response.data.data.full_name,
        email: response.data.data.email,
        phoneNumber: response.data.data.phone_number,
        address: response.data.data.address,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      message.error("Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [form]);

  // Update user profile
  const onFinish = async (values) => {
    try {
      const response = await axios.put(
        `${base_url}/api/buyer/profile`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(response.data.data);
      fetchUserProfile();
      message.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      message.error("Failed to update user profile");
    }
  };

  if (loading)
    return <div className="py-6 text-center text-gray-600">Loading...</div>;

  return (
    <div className="max-w-lg p-8 mx-auto bg-white rounded-lg shadow-xl">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        User Profile
      </h2>

      {/* Display non-editable user information */}
      <div className="mb-6 space-y-2">
        <p className="text-gray-600">
          <strong className="font-medium text-gray-800">Province:</strong>{" "}
          {user.province_name} ({user.province_id})
        </p>
        <p className="text-gray-600">
          <strong className="font-medium text-gray-800">District:</strong>{" "}
          {user.district_name} ({user.district_id})
        </p>
      </div>

      {/* Editable Form */}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: "Please input your full name!" }]}
        >
          <Input className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid email!",
            },
          ]}
        >
          <Input className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Phone Number">
          <Input className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea
            rows={4}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500"
          >
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BuyerProfile;
