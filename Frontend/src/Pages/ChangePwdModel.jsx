import { Button, Form, Input, message, Modal } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { base_url } from "../url";

// Set up Axios default headers

const ChangePasswordModal = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const handleModal = () => {
    setVisible(!visible);
  };

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${base_url}/api/auth/change-password`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success(response.data.message);
      form.resetFields();
      handleModal(); // Close the modal after successful password change
    } catch (error) {
      console.error("Error changing password:", error);
      message.error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleModal}>
        Change Password
      </Button>
      <Modal
        title="Change Password"
        open={visible}
        onCancel={handleModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              {
                required: true,
                message: "Please enter your current password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChangePasswordModal;
