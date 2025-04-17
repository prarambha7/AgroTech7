const client = require("../db");

// Fetch current buyer's details by ID
const fetchBuyerById = async (buyerId) => {
  const query = `
    SELECT id, latitude, longitude
    FROM users
    WHERE id = $1 AND role = 'user';
  `;

  const result = await client.query(query, [buyerId]);
  return result.rows[0]; // Return buyer details
};

// Fetch sellers matching criteria
const fetchSellers = async (criteria) => {
  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      p.price::NUMERIC AS price_per_unit,
      p.quantity AS available_quantity,
      p.uom,
      p.seller_id,
      u.latitude,
      u.longitude,
      u.farm_address,
      c.name AS category
    FROM products p
    INNER JOIN users u ON p.seller_id = u.id
    INNER JOIN categories c ON p.category_id = c.id
    WHERE 
      c.name = $1 AND 
      p.uom = $2 AND 
      p.price <= $3 AND
      u.role = 'seller';
  `;
  const values = [criteria.category, criteria.uom, criteria.price];
  const result = await client.query(query, values);
  return result.rows;
};


module.exports = { fetchBuyerById, fetchSellers };
