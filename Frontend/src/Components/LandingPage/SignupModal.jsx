import { Button, DatePicker, Form, Input, Modal, Radio, Select } from "antd";
import axios from "axios";
import moment from "moment"; // Import moment for date validation
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("buyer");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/address/provinces")
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(
          `http://localhost:5000/api/address/districts?provinceId=${selectedProvince}`
        )
        .then((response) => setDistricts(response.data))
        .catch((error) => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  const handleSignup = async (values) => {
    setIsLoading(true);
    try {
      const endpoint =
        userType === "buyer"
          ? "http://localhost:5000/api/auth/register/user"
          : "http://localhost:5000/api/auth/register/seller";

      await axios.post(endpoint, values);
      toast.success("Registration successful!");
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="min-w-96 w-[400px]"
    >
      <div>
        <h1 className="text-xl font-semibold">Create an Account</h1>
        <Form
          form={form}
          onFinish={handleSignup}
          layout="vertical"
          requiredMark="optional"
          className="space-y-4"
        >
          <Radio.Group
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="mb-4"
          >
            <Radio value="buyer">Buyer</Radio>
            <Radio value="seller">Seller</Radio>
          </Radio.Group>
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
            label="Phone Number"
            name="phoneNumber"
            rules={[
              { required: true, message: "Please input your phone number!" },
              {
                pattern: /^\d{10,15}$/,
                message: "Phone number must be between 10 and 15 digits!",
              },
            ]}
          >
            <Input />
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
            label="Province"
            name="provinceId"
            rules={[{ required: true, message: "Please select a province!" }]}
          >
            <Select onChange={setSelectedProvince}>
              {provinces.map((province) => (
                <Select.Option key={province.id} value={province.id}>
                  {province.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="District"
            name="districtId"
            rules={[{ required: true, message: "Please select a district!" }]}
          >
            <Select disabled={!selectedProvince}>
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.id}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please input your address!" }]}
          >
            <Input />
          </Form.Item>
          {userType === "seller" && (
            <>
              <Form.Item
                label="Farm Name"
                name="farm_name"
                rules={[
                  { required: true, message: "Please input your farm name!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Farm Address"
                name="farm_address"
                rules={[
                  {
                    required: true,
                    message: "Please input your farm address!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </>
          )}
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <a
              onClick={onSwitchToLogin}
              className="text-primary hover:underline"
            >
              Login
            </a>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default SignupModal;
