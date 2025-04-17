import { ShoppingCartOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatNepaliRupees } from "../../Utils/NepaliPriceFormatter";
import { base_url } from "../../url";

const { Title, Text } = Typography;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  console.log(cartItems);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
    calculateTotal(storedCart);
  }, []);

  const calculateTotal = (items) => {
    const totalPrice = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(totalPrice);
  };

  const handleQuantityChange = (id, value) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: value };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const handleProceedToCheckout = async () => {
    // const purchaseOrderId = `Order-${Date.now()}`;
    const paymentPayload = {
      transaction_uuid: 11 - 201 - 13,
      product_code: "EPAYTEST",
      total_amount: total * 100, // Convert to paisa
      // purchase_order_id: purchaseOrderId,
      // purchase_order_name: "Shopping Cart Order",
      // customer_info: {
      //   name: localStorage.getItem("name") || "Test User",
      //   email: localStorage.getItem("email") || "testuser@example.com",
      //   phone: localStorage.getItem("phone") || "9800000001",
      // },
      // product_details: cartItems.map((item) => ({
      //   identity: item.id.toString(),
      //   name: item.name,
      //   total_price: item.price * item.quantity * 100, // Convert to paisa
      //   quantity: item.quantity,
      //   unit_price: item.price * 100, // Convert to paisa
      // })),
    };

    try {
      const response = await axios.post(
        `${base_url}/api/initiate-payment`, // Call your backend proxy
        paymentPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url; // Redirect user to eSewa payment page
      }
    } catch (error) {
      console.error(
        "Error initiating payment:",
        error.response?.data || error.message
      );
      message.error("Failed to initiate payment. Please try again.");
    }
  };
  const handleProceedCashonDelivery = async () => {
    const orderDetails = cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    }));
    console.log(orderDetails);
    try {
      const response = await axios.post(
        `${base_url}/api/orders/create`,
        { items: orderDetails },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send authentication token
          },
        }
      );
      if (response.data.success) {
        message.success("Order placed successfully!");
        // Optionally, redirect to the order details page or reset the cart
        localStorage.removeItem("cart");
        setCartItems([]);
        setTotal(0);
      }
    } catch (error) {
      message.error("Failed to place the order. Please try again.");
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Shopping Cart</Title>

      {cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        <Row gutter={[16, 16]}>
          {cartItems.map((item) => (
            <Col key={item.id} span={8}>
              <Card
                hoverable
                cover={
                  <img alt={item.name} src={item.images[0] || "/bg1.webp"} />
                }
                actions={[
                  <Button type="link" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>,
                ]}
              >
                <Title level={4}>
                  {item.name} <Tag color={"blue"}>{item.category_name}</Tag>{" "}
                  <Tag
                    color={item.availability === "Available" ? "green" : "red"}
                  >
                    {item.availability}
                  </Tag>
                </Title>

                <div style={{ marginTop: "10px" }} className="flex gap-2">
                  <Text strong>Price:</Text>
                  <Text>{item.pricePerUnit}</Text>
                </div>
                <div style={{ marginTop: "10px" }} className="flex gap-2">
                  <Text strong>Minimum Order Quantity:</Text>
                  <Text>{item.minimum_order_quantity}</Text>
                </div>
                <div className="flex items-center gap-2 my-1">
                  <Text strong>Quantity:</Text>
                  <InputNumber
                    min={item.minimum_order_quantity}
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item.id, value)}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <Space style={{ marginBottom: "20px" }}>
          <Text strong>Total:</Text>
          <Text style={{ fontSize: "18px", color: "green" }}>
            {formatNepaliRupees(total.toFixed(0))}
          </Text>
        </Space>
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="large"
            onClick={handleProceedCashonDelivery}
          >
            Pay with Cash
          </Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="large"
            onClick={handleProceedToCheckout}
          >
            Pay with eSewa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
