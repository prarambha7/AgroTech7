const client = require("../db"); // PostgreSQL connection

// Fetch Total Sales
const getTotalSales = async (sellerId) => {
  const query = `
    SELECT COALESCE(SUM(o.total_price), 0) AS total_sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE p.seller_id = $1
  `;
  const result = await client.query(query, [sellerId]);
  return result.rows[0]?.total_sales || 0;
};

// Fetch Total Orders
const getTotalOrders = async (sellerId) => {
  const query = `
    SELECT COUNT(o.id) AS total_orders
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE p.seller_id = $1
  `;
  const result = await client.query(query, [sellerId]);
  return result.rows[0]?.total_orders || 0;
};

// Fetch Total Products
const getTotalProducts = async (sellerId) => {
  const query = `
    SELECT COUNT(id) AS total_products
    FROM products
    WHERE seller_id = $1
  `;
  const result = await client.query(query, [sellerId]);
  return result.rows[0]?.total_products || 0;
};

// Fetch Low Stock Products
const getLowStockProducts = async (sellerId, limit = 10, offset = 0) => {
  const query = `
    SELECT id, name, quantity, price, images
    FROM products
    WHERE seller_id = $1 AND quantity < 100
    LIMIT $2 OFFSET $3
  `;
  const values = [sellerId, limit, offset];
  const result = await client.query(query, values);
  return result.rows;
};
// Fetch top selling products
const getTopSellingProducts = async (sellerId, limit = 3) => {
  const query = `
    SELECT p.id, p.name, p.price, p.images, SUM(o.quantity) AS total_sold
    FROM products p
    JOIN orders o ON p.id = o.product_id
    WHERE p.seller_id = $1
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT $2
  `;
  const values = [sellerId, limit];
  const result = await client.query(query, values);
  return result.rows;
};

// Fetch seller profile by seller ID
const getSellerById = async (sellerId) => {
  const query = `
    SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.phone_number, 
        u.address, 
        u.farm_name, 
        u.farm_address, 
        u.province_id, 
        u.district_id,
        p.name AS province_name,
        d.name AS district_name
    FROM users u
    LEFT JOIN provinces p ON u.province_id = p.id
    LEFT JOIN districts d ON u.district_id = d.id
    WHERE u.id = $1 AND u.role = $2;
  `;
  const values = [sellerId, "seller"];
  const result = await client.query(query, values);
  return result.rows[0];
};

// Fetch products only belonging to this specific seller
const fetchProductsBySeller = async (sellerId) => {
  const query = `
    SELECT id, name, category_id, price, quantity, description, images
    FROM products 
    WHERE seller_id = $1
  `;
  const values = [sellerId];
  const result = await client.query(query, values);
  return result.rows;
};
// Update seller profile
const updateSellerProfile = async (
  sellerId,
  { fullName, email, phoneNumber, address }
) => {
  const query = `
    UPDATE users 
    SET full_name = $1, email = $2, phone_number = $3, address = $4 
    WHERE id = $5 AND role = $6 
    RETURNING id, full_name, email, phone_number, address
  `;
  const values = [fullName, email, phoneNumber, address, sellerId, "seller"];
  const result = await client.query(query, values);
  return result.rows[0]; // Return updated seller data
};
//getuserid for nearby seller
const getUserById = async (userId) => {
  const query = `
    SELECT id, full_name, latitude, longitude
    FROM users
    WHERE id = $1
  `;
  const result = await client.query(query, [userId]);
  return result.rows[0];
};

//NearbySeller
const fetchAllSellersWithCoordinates = async () => {
  const query = `
    SELECT 
      u.id, 
      u.full_name, 
      u.latitude, 
      u.longitude, 
      u.farm_name, 
      u.farm_address,
      COALESCE(json_agg(json_build_object(
        'id', p.id,
        'name', p.name,
        'price', p.price,
        'quantity', p.quantity,
        'images', p.images
      )) FILTER (WHERE p.id IS NOT NULL), '[]') AS products
    FROM users u
    LEFT JOIN products p ON u.id = p.seller_id
    WHERE u.role = 'seller' AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
    GROUP BY u.id, u.full_name, u.latitude, u.longitude, u.farm_name, u.farm_address
  `;
  const result = await client.query(query);
  return result.rows;
};

module.exports = {
  getSellerById,
  getTotalSales,
  getTotalOrders,
  getTotalProducts,
  fetchProductsBySeller,
  updateSellerProfile,
  getLowStockProducts,
  getTopSellingProducts,
  getUserById,
  fetchAllSellersWithCoordinates,
};
