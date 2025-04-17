import {
  Button,
  Card,
  Col,
  Layout,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ProductModal from "../../Components/Seller/ProductModal";
import { base_url } from "../../url";

const { Title, Text } = Typography;
const { Content } = Layout;

const Recommended = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [cart, setCart] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/recommendations/`, {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      const { data, totalPages } = response.data;
      setProducts(data);
      setTotalPages(totalPages);
      setLoading(false);
    } catch (err) {
      setError("Error fetching products.");
      setLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    const updatedCart = [...cart, { ...product, quantity: 1 }];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Product added to cart");
  };

  // UseEffect hooks
  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout style={{ padding: "0 20px" }}>
        <Content style={{ padding: 20 }}>
          <Title level={3}>Here are recommended products for you.</Title>

          {loading ? (
            <Spin size="large" />
          ) : error ? (
            <Text>{error}</Text>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {products.map((product) => (
                  <Col key={product.id} span={8}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={product.name}
                          src={product.images[0] || "/bg1.webp"} // Display first image or fallback image
                        />
                      }
                      actions={[
                        <Button
                          type="primary"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>,
                        <ProductModal data={product} />,
                      ]}
                    >
                      <Title level={4}>{product.name}</Title>
                      <Space style={{ marginBottom: 10 }}>
                        <Tag color="blue">{product.category_name}</Tag>
                      </Space>
                      <div className="py-2">
                        <Text strong>Price: NPR {product.price}</Text>
                      </div>
                      <div className="py-2">
                        <Text strong>Stock: {product.quantity} units</Text>
                      </div>
                      <div className="py-2">
                        <Text>
                          {product.description.length > 100
                            ? `${product.description.substring(0, 100)}...`
                            : product.description}
                        </Text>
                      </div>
                      {/* Display similarity scores */}
                      <div className="py-2">
                        <Text>
                          <strong>Similarity Scores:</strong>
                          <ul>
                            <li>
                              <strong>Description Similarity:</strong>{" "}
                              {product.descriptionSimilarity.toFixed(2)}
                            </li>
                            <li>
                              <strong>Category Similarity:</strong>{" "}
                              {product.categorySimilarity}
                            </li>
                            <li>
                              <strong>Final Score:</strong>{" "}
                              {product.finalScore.toFixed(2)}
                            </li>
                          </ul>
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Recommended;
