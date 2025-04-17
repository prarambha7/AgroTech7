import { App, Button, Form, Input, Select, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddSellerProduct = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategoryUom, setCurrentCategoryUom] = useState();
  const notify = App.useApp();
  useEffect(() => {
    // Function to get categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );

        setCategories(response.data); // Assuming the response is an array of categories
      } catch (err) {
        console.log("Error fetching categories");
      }
    };

    fetchCategories();
  }, []);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const handleSubmit = async (e) => {
    const formDataToSubmit = new FormData();
    Object.keys(e).forEach((key) => {
      if (key !== "images") {
        formDataToSubmit.append(key, e[key]);
      } else {
        Array.from(e.images).forEach((file) => {
          formDataToSubmit.append("images", file);
        });
      }
    });

    try {
      await axios.post(
        "http://localhost:5000/api/products/add", // URL
        formDataToSubmit, // Data to be sent (formData)
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      form.resetFields();

      message.success("Product added successfully");
      navigate("/showproducts");
    } catch (err) {
      message.error("Failed to add product.");
    }
  };

  return (
    <div className="px-10">
      <h2 className="mb-6 text-3xl font-semibold text-center">
        Add New Product
      </h2>
      <Form onFinish={handleSubmit} className="" layout="vertical" form={form}>
        <Form.Item label={"Product Name"} name={"name"}>
          <Input type="text" name="name" />
        </Form.Item>

        <Form.Item label={"Category"} name={"category_id"}>
          <Select
            options={categories.map((item) => {
              return { label: item.name, value: item.id };
            })}
            name="category_id"
            className="w-full"
            onChange={(e) => {
              const category = categories.find((category) => e === category.id);
              if (category) {
                console.log(category);
                if (category.uoms) {
                  console.log(category.uoms);

                  const dropdown = category.uoms.map((e) => {
                    return { label: e, value: e };
                  });
                  setCurrentCategoryUom(dropdown);
                }
              }
            }}
          />
        </Form.Item>

        <Form.Item label={"Price"} name={"price"}>
          <Input type="number" name="price" />
        </Form.Item>

        <Form.Item label={"Quantity"} name={"quantity"}>
          <Input type="number" name="quantity" />
        </Form.Item>

        <Form.Item label={"Description"} name={"description"}>
          <Input.TextArea rows="4" />
        </Form.Item>

        <Form.Item label={"Unit of Measurement (UOM)"} name={"uom"}>
          <Select
            options={currentCategoryUom || []}
            disabled={currentCategoryUom == undefined ? true : false}
          />
        </Form.Item>

        <Form.Item
          label={"Minimum Order Quantity"}
          name={"minimum_order_quantity"}
        >
          <Input
            type="number"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item name={"images"} label="Product Images (Up to 5)">
          <Input
            type="file"
            name="images"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            multiple
            accept="image/*"
          />
        </Form.Item>

        <Button type="primary" className="w-full" htmlType="submit">
          Add Product
        </Button>
      </Form>
    </div>
  );
};

export default AddSellerProduct;
