import { Button, DatePicker, Form, Input, Modal } from "antd";
import axios from "axios";
import moment from "moment"; // Import moment for date validation
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
export const RegisterAdminModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  function handleModal() {
    setOpen(!open);
    form.resetFields();
  }
  const handleSignup = async (values) => {
    setIsLoading(true);
    try {
      const endpoint = "http://localhost:5000/api/auth/register/admin";

      await axios.post(endpoint, values, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Registration successful!");
      form.resetFields();
      handleModal();
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleModal} icon={<FaPlus />} />
      <Modal
        open={open}
        onCancel={handleModal}
        footer={null}
        className="min-w-96 w-[400px]"
      >
        <div>
          <h1 className="text-xl font-semibold">Create an Admin</h1>
          <Form
            form={form}
            onFinish={handleSignup}
            layout="vertical"
            requiredMark="optional"
            className="space-y-4"
          >
            {/*  email, password, address, dateOfBirth  */}
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input a valid email!" },
                { type: "email", message: "Invalid email format!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
              rules={[
                { required: true, message: "Please input your date of birth!" },
                {
                  validator: (_, value) => {
                    if (!value || !moment(value).isValid()) {
                      return Promise.reject("Invalid date of birth");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD" // Set the format here
              />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isLoading}
            >
              {isLoading ? "Registering" : "Create"}
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
