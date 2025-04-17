const client = require('../db'); // PostgreSQL connection

// Fetch total users
const getTotalUsers = async () => {
  const query = `SELECT COUNT(*) AS total_users FROM users`;
  const result = await client.query(query);
  return result.rows[0]?.total_users || 0;
};

// Fetch total products
const getTotalProducts = async () => {
  const query = `SELECT COUNT(*) AS total_products FROM products`;
  const result = await client.query(query);
  return result.rows[0]?.total_products || 0;
};

// Fetch total orders
const getTotalOrders = async () => {
  const query = `SELECT COUNT(*) AS total_orders FROM orders`;
  const result = await client.query(query);
  return result.rows[0]?.total_orders || 0;
};

// Fetch best-selling products
const getBestSellingProducts = async (limit = 5) => {
  const query = `
    SELECT p.id, p.name, p.price, SUM(o.quantity) AS total_sold
    FROM products p
    JOIN orders o ON p.id = o.product_id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT $1
  `;
  const result = await client.query(query, [limit]);
  return result.rows;
};
// Fetch all users
const fetchAllUsers = async () => {
    const query = `SELECT id, full_name, email, role FROM users WHERE role = 'user' ORDER BY id ASC`;
    const result = await client.query(query);
    return result.rows;
  };
  
  // Fetch all sellers
  const fetchAllSellers = async () => {
    const query = `SELECT id, full_name, email, role, farm_name FROM users WHERE role = 'seller' ORDER BY id ASC`;
    const result = await client.query(query);
    return result.rows;
  };
  
  // Fetch admin profile by ID
  const getAdminById = async (adminId) => {
    const query = `
      SELECT id, full_name, email, phone_number, address, role
      FROM users
      WHERE id = $1 AND role IN ('admin', 'super admin')
    `;
    const result = await client.query(query, [adminId]);
    return result.rows[0];
  };
  
  // Update admin profile
  const updateAdminProfile = async (adminId, { fullName, email, phoneNumber, address }) => {
    const query = `
      UPDATE users
      SET full_name = $1, email = $2, phone_number = $3, address = $4
      WHERE id = $5 AND role = 'admin'
      RETURNING id, full_name, email, phone_number, address
    `;
    const values = [fullName, email, phoneNumber, address, adminId];
    const result = await client.query(query, values);
    return result.rows[0];
  };

module.exports = {
  getTotalUsers,
  getTotalProducts,
  getTotalOrders,
  getBestSellingProducts,
  fetchAllUsers,
  fetchAllSellers,
  getAdminById,
  updateAdminProfile,
};
