import { Button, Col, Modal, Row, Space, Tag, Typography } from "antd";
import React, { useState } from "react";
import { BsEyeglasses } from "react-icons/bs";

const { Title, Text } = Typography;

const ProductModal = ({ data }) => {
  const [open, setOpen] = useState(false);

  if (!data) {
    return <div>No data to show</div>;
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)} icon={<BsEyeglasses />}>
        View Product
      </Button>

      <Modal
        title="Product Details"
        open={open}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <ProductDetail product={data} />
      </Modal>
    </div>
  );
};

const ProductDetail = ({ product }) => {
  const {
    id,
    name,
    category_name,
    pricePerUnit,
    quantity,
    uom,
    minimum_order_quantity,
    description,
    seller_name,
    availability,
    average_rating,
    rating_count,
    created_at,
    images,
  } = product || {}; // Destructure with null safety

  return (
    <div>
      <Title level={4}>{name || "Product Name Not Available"}</Title>
      <Space style={{ marginBottom: 10 }}>
        <Tag color="blue">{category_name || "Category Not Available"}</Tag>
        <Tag color={availability === "Available" ? "green" : "red"}>
          {availability || "Availability Not Specified"}
        </Tag>
      </Space>

      <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Text strong>Price:</Text>{" "}
          <Text>{pricePerUnit || "Price Not Available"}</Text>
        </Col>
        <Col span={12}>
          <Text strong>Quantity Available:</Text>{" "}
          <Text>
            {quantity !== undefined
              ? `${quantity} ${uom}`
              : "Quantity Not Available"}
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Text strong>Minimum Order Quantity:</Text>{" "}
          <Text>
            {minimum_order_quantity !== undefined
              ? `${minimum_order_quantity} ${uom}`
              : "Not Specified"}
          </Text>
        </Col>
        <Col span={12}>
          <Text strong>Seller:</Text>{" "}
          <Text>{seller_name || "Seller Not Specified"}</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 10 }}>
        <Col span={12}>
          <Text strong>Created At:</Text>
          <Text>
            {created_at
              ? new Date(created_at).toLocaleString()
              : "Creation Date Not Available"}
          </Text>
        </Col>
        <Col span={12}>
          <Text strong>Rating:</Text>
          <Space>
            {/* Display average rating and count */}
            <span>{average_rating || 0} / 5</span>
            <Text>
              {rating_count !== undefined
                ? `${rating_count} ratings`
                : "No Ratings"}
            </Text>
          </Space>
        </Col>
      </Row>

      {/* Description */}
      <Row style={{ marginTop: 10 }}>
        <Text strong>Description:</Text>
        <Text>{description || "Description Not Available"}</Text>
      </Row>

      {/* Images */}
      {images && images.length > 0 && (
        <>
          <Title level={5} style={{ marginTop: 20 }}>
            Images
          </Title>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Product Image ${index + 1}`}
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ProductModal;
