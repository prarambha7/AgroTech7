const client = require("../db"); // PostgreSQL client setup

// Fetch products the user has interacted with
const getUserInteractedProducts = async (userId) => {
  const query = `
    SELECT DISTINCT p.id, p.description, p.category_id, p.name
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = $1
  `;
  const result = await client.query(query, [userId]);
  console.log("User Interacted Products:", result.rows); // Log user interacted products
  return result.rows;
};

// Fetch all products
// Fetch all products with category name
const getAllProducts = async () => {
  const query = `
    SELECT 
      products.id, 
      products.description, 
      products.category_id, 
      categories.name AS category_name, 
      products.name, 
      products.price, 
      products.quantity, 
      products.images
    FROM products
    JOIN categories ON products.category_id = categories.id
    WHERE products.description IS NOT NULL
  `;
  const result = await client.query(query);
  console.log("All Products Fetched:", result.rows); // Log all fetched products
  return result.rows;
};

module.exports = {
  getUserInteractedProducts,
  getAllProducts,
};
