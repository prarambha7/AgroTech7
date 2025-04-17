import { Button, Form, Input, Modal } from "antd";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const responseData = response.data;
      console.log("Login Response Data:", responseData);
      console.log(response.data);
      // Store token or user data in localStorage
      localStorage.setItem("token", responseData.token);
      localStorage.setItem("role", responseData.role);
      localStorage.setItem("name", responseData.name);
      localStorage.setItem("email", responseData.email);
      localStorage.setItem("phone", responseData.phone);
      localStorage.setItem("address", responseData.address);
      localStorage.setItem("userId", responseData.id);

      toast.success("Logged in successfully!");

      // Redirect based on user type

      if (responseData.role === "seller") {
        navigate("/seller-dashboard");
      } else if (
        responseData.role === "admin" ||
        responseData.role === "super admin"
      ) {
        navigate("/dashboard");
      } else {
        navigate("/products");
      }

      onClose();
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = (values) => {
    setIsLoading(true);
    handleLogin(values.email, values.password);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      onCancel={onClose}
      className="max-w-md"
      footer={null}
    >
      <div>
        <h1 className="text-xl font-semibold">Welcome Back</h1>
        <Form
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
          requiredMark={"optional"}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : `Sign in`}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <a
              onClick={onSwitchToSignup}
              className="text-primary hover:underline"
            >
              Create one
            </a>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default LoginModal;
