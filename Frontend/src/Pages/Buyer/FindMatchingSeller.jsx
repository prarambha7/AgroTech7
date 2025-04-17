import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatNepaliRupees } from "../../Utils/NepaliPriceFormatter";

const { Title } = Typography;

export const FindMatchSeller = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryUom, setCurrentCategoryUom] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        setCategories(response.data); // Assuming the response contains an array of categories
      } catch (err) {
        message.error("Error fetching categories");
      }
    };

    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/match/match",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        setResults([response.data.data]); // Assuming data contains the matched seller info
        message.success("Matching seller found!");
      } else {
        message.error("No matching sellers found .");
        setResults([]); // Clear results if no match or invalid data
      }
    } catch (err) {
      message.error("Failed to fetch matching sellers.");
      setResults([]); // Clear results in case of an error
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection and update UOM dropdown
  const handleCategoryChange = (value) => {
    const selectedCategory = categories.find(
      (category) => category.name === value
    );
    if (selectedCategory?.uoms) {
      const uomOptions = selectedCategory.uoms.map((uom) => ({
        label: uom,
        value: uom,
      }));
      setCurrentCategoryUom(uomOptions);
    } else {
      setCurrentCategoryUom([]);
    }
  };

  return (
    <div className="container p-8 mx-auto">
      <Row gutter={16}>
        {/* Form Section (Left) */}
        <Col xs={24} md={12} className="p-4">
          <Card className="shadow-lg">
            <Title level={3} className="mb-4 text-center">
              Find Matching Sellers
            </Title>
            <Form
              onFinish={handleSubmit}
              layout="vertical"
              form={form}
              className="space-y-4"
              requiredMark={"optional"}
            >
              <Form.Item
                label="Category"
                name="category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select
                  options={categories.map((item) => ({
                    label: item.name,
                    value: item.name,
                  }))}
                  placeholder="Select a category"
                  onChange={handleCategoryChange}
                />
              </Form.Item>

              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: "Please enter a price" }]}
              >
                <Input type="number" placeholder="Enter price" />
              </Form.Item>

              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <Input type="number" placeholder="Enter quantity" />
              </Form.Item>

              <Form.Item
                label="Unit of Measurement (UOM)"
                name="uom"
                rules={[{ required: true, message: "Please select a UOM" }]}
              >
                <Select
                  options={currentCategoryUom}
                  placeholder="Select UOM"
                  disabled={currentCategoryUom.length === 0}
                />
              </Form.Item>

              <Form.Item
                label="Proximity (KM)"
                name="proximity"
                rules={[{ required: true, message: "Please enter proximity" }]}
              >
                <InputNumber
                  placeholder="Enter proximity in KM"
                  className="w-full"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Find Matching Sellers
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Results Section (Right) */}
        <Col xs={24} md={12} className="p-4">
          {results.length > 0 ? (
            <div>
              <Title level={3} className="mb-4 text-center">
                Matching Sellers
              </Title>
              {results.map((result, index) => (
                <Card key={index} className="mb-4">
                  <p>
                    <strong>Name:</strong> {result.name || "N/A"}
                  </p>
                  <p>
                    <strong>Price per Unit:</strong>
                    {formatNepaliRupees(result.pricePerUnit) || "N/A"}
                  </p>
                  <p>
                    <strong>Available Quantity:</strong>{" "}
                    {result.availableQuantity} {result.uom || "units"}
                  </p>
                  <p>
                    <strong>Category:</strong> {result.category || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {result.farm_address || "Not avaiable"}
                  </p>
                  <p>
                    <strong>Quality Score:</strong>{" "}
                    {parseFloat(result.totalScore).toFixed(2) || "N/A"}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p>No results to display. Please try searching again.</p>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};
