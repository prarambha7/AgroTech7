import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  Rate,
  Row,
  Select,
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

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/categories`);
      setCategories(response.data);
    } catch (err) {
      console.log("Error fetching categories", err);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/products`, {
        params: { page, category_id: category, search },
        headers: { Authorization: `Bearer ${token}` },
      });

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
  }, [page, category, search]);
  useEffect(() => {
    fetchCategories();
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout style={{ padding: "0 20px" }}>
        <Content style={{ padding: 20 }}>
          <div className="flex items-center justify-between">
            <div>
              <Input
                className="w-96"
                placeholder="Search With Product Name"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <label>Filter:</label>
              <Select
                options={categories.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={category}
                onChange={handleCategoryChange}
                className="w-56"
                placeholder="Select Category"
              />
            </div>
          </div>
          <Title level={3}>Product List</Title>

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
                          src={product.images[0] || "/bg1.webp"}
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
                        <Tag
                          color={
                            product.availability === "Available"
                              ? "green"
                              : "red"
                          }
                        >
                          {product.availability}
                        </Tag>
                      </Space>
                      <div className="py-2">
                        <Text strong>Price: {product.pricePerUnit}</Text>
                      </div>
                      <div className="py-2">
                        <Text strong>
                          Minimum Order: {product.minimum_order_quantity}
                        </Text>
                      </div>
                      <div>
                        <Rate disabled value={product.average_rating} />
                        <Text>{product.rating_count} ratings</Text>
                      </div>
                      {/* Display Relevance and Distance Scores */}
                      {product.relevanceScore && (
                        <div className="py-2">
                          <Text strong>Relevance Score: </Text>
                          {product.relevanceScore.toFixed(2)}
                        </div>
                      )}
                      {product.nameDistance && product.descriptionDistance && (
                        <div className="py-2">
                          <Text strong>Name Distance: </Text>
                          {product.nameDistance}
                          <br />
                          <Text strong>Description Distance: </Text>
                          {product.descriptionDistance}
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  style={{ marginRight: 10 }}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  style={{ marginLeft: 10 }}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductPage;
