import {
  Button,
  Card,
  Col,
  Layout,
  Rate,
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
import { formatNepaliRupees } from "../../Utils/NepaliPriceFormatter";

const { Title, Text } = Typography;
const { Content } = Layout;

export const TopSellingPage = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [totalPages, setTotalPages] = useState(0); // Total pages for pagination
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${base_url}/api/products/top-selling`, {
        params: { page, category_id: category, product_name: search },
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data, totalPages } = response.data;
      console.log(data);
      setProducts(data);

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
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Save to localStorage
    alert("Product added to cart");
  };

  // UseEffect hooks
  useEffect(() => {
    fetchProducts(); // Fetch products on page or category change
  }, [page, category, search]);
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart); // Load the cart from localStorage
  }, [page, category]);

  console.log(products);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout style={{ padding: "0 20px" }}>
        <Content style={{ padding: 20 }}>
          <Title level={3}>Top Selling Products</Title>

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
                      </Space>
                      <div className="py-2">
                        <Text strong>
                          Price: {formatNepaliRupees(product.price)}
                        </Text>
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
