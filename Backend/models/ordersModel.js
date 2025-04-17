const client = require("../db"); // PostgreSQL client

// Place an Order
const placeOrder = async (userId, productId, quantity) => {
  const checkProductQuery = `
      SELECT id, quantity as available_quantity, minimum_order_quantity, price 
      FROM products 
      WHERE id = $1;
    `;

  const insertOrderQuery = `
    INSERT INTO orders (product_id, buyer_id, quantity, total_price, status)
    SELECT $1::int, $2::int, $3::int, price * $3::int, 'Pending'
    FROM products
    WHERE id = $1::int AND quantity >= $3::int
    RETURNING *,
              (SELECT seller_id FROM products WHERE id = $1) AS seller_id,
              (SELECT full_name FROM users WHERE id = $2) AS buyer_name,
              (SELECT address FROM users WHERE id = $2) AS buyer_address,
              (SELECT phone_number FROM users WHERE id = $2) AS buyer_contact,
              (SELECT full_name FROM users WHERE id = (SELECT seller_id FROM products WHERE id = $1)) AS seller_name;
  `;

  try {
    await client.query("BEGIN");

    // First check product details and minimum order quantity
    const productCheck = await client.query(checkProductQuery, [productId]);

    if (productCheck.rows.length === 0) {
      throw new Error("Product not found.");
    }

    const product = productCheck.rows[0];

    // Validate minimum order quantity
    if (quantity < product.minimum_order_quantity) {
      throw new Error(
        `Minimum order quantity is ${product.minimum_order_quantity} units. Your order quantity: ${quantity}`
      );
    }

    // Validate available quantity
    if (quantity > product.available_quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.available_quantity}, Requested: ${quantity}`
      );
    }

    // Insert order
    const orderResult = await client.query(insertOrderQuery, [
      productId,
      userId,
      quantity,
    ]);

    // Update product quantity
    const updateProductQuantityQuery = `
            UPDATE products
            SET quantity = quantity - $1
            WHERE id = $2
            RETURNING quantity;
        `;
    const productUpdateResult = await client.query(updateProductQuantityQuery, [
      quantity,
      productId,
    ]);

    await client.query("COMMIT");

    return {
      ...orderResult.rows[0],
      remaining_quantity: productUpdateResult.rows[0].quantity,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

// Update Order Status
const updateOrderStatus = async (orderId, status) => {
  const query = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    RETURNING *,
              (SELECT buyer_id FROM orders WHERE id = $2) AS buyer_id;
  `;
  const values = [status, orderId];

  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Order not found.");
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error updating order status:", error.message);
    throw error;
  }
};

// Fetch Orders for a User
const fetchUserOrders = async (
  userId,
  limit,
  offset,
  sortBy,
  sortOrder,
  filters
) => {
  const baseQuery = `
  SELECT o.id, o.product_id, o.quantity, o.total_price, o.status, o.created_at,
         p.name AS product_name, p.category_id AS product_category
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.buyer_id = $1
  `;

  const filterConditions = [];
  const params = [userId, limit, offset];

  // Apply filters
  if (filters.status) {
    filterConditions.push(`o.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.minValue) {
    filterConditions.push(`o.total_price >= $${params.length + 1}`);
    params.push(filters.minValue);
  }
  if (filters.maxValue) {
    filterConditions.push(`o.total_price <= $${params.length + 1}`);
    params.push(filters.maxValue);
  }
  if (filters.startDate && filters.endDate) {
    filterConditions.push(
      `o.created_at BETWEEN $${params.length + 1} AND $${params.length + 2}`
    );
    params.push(filters.startDate, filters.endDate);
  }

  const filterQuery = filterConditions.length
    ? ` AND ${filterConditions.join(" AND ")}`
    : "";
  const orderQuery = ` ORDER BY ${sortBy || "o.created_at"} ${
    sortOrder || "DESC"
  } LIMIT $2 OFFSET $3`;

  const query = `${baseQuery} ${filterQuery} ${orderQuery}`;
  const result = await client.query(query, params);
  return result.rows;
};
// Fetch Orders for a Seller
const fetchSellerOrders = async (
  sellerId,
  limit,
  offset,
  sortBy,
  sortOrder,
  filters
) => {
  const baseQuery = `
  SELECT o.id, o.quantity, o.total_price, o.status, o.created_at,
         p.name AS product_name, p.category_id AS product_category, u.full_name AS buyer_name
  FROM orders o
  JOIN products p ON o.product_id = p.id
  JOIN users u ON o.buyer_id = u.id
  WHERE p.seller_id = $1
`;

  const filterConditions = [];
  const params = [sellerId, limit, offset];

  // Apply filters
  if (filters.status) {
    filterConditions.push(`o.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.minValue) {
    filterConditions.push(`o.total_price >= $${params.length + 1}`);
    params.push(filters.minValue);
  }
  if (filters.maxValue) {
    filterConditions.push(`o.total_price <= $${params.length + 1}`);
    params.push(filters.maxValue);
  }
  if (filters.startDate && filters.endDate) {
    filterConditions.push(
      `o.created_at BETWEEN $${params.length + 1} AND $${params.length + 2}`
    );
    params.push(filters.startDate, filters.endDate);
  }

  const filterQuery = filterConditions.length
    ? ` AND ${filterConditions.join(" AND ")}`
    : "";
  const orderQuery = ` ORDER BY ${sortBy || "o.created_at"} ${
    sortOrder || "DESC"
  } LIMIT $2 OFFSET $3`;

  const query = `${baseQuery} ${filterQuery} ${orderQuery}`;
  const result = await client.query(query, params);
  return result.rows;
};
// Fetch latest seller orders
const fetchLatestSellerOrders = async (sellerId, limit = 6) => {
  const query = `
    SELECT o.id, o.quantity, o.total_price, o.status, o.created_at,
           p.name AS product_name, u.full_name AS buyer_name
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users u ON o.buyer_id = u.id
    WHERE p.seller_id = $1
    ORDER BY o.created_at DESC
    LIMIT $2
  `;
  const result = await client.query(query, [sellerId, limit]);
  return result.rows;
};

// Revert Inventory on Cancellation
const revertInventory = async (productId, quantity) => {
  const query = "UPDATE products SET quantity = quantity + $1 WHERE id = $2";
  await client.query(query, [quantity, productId]);
};

const fetchOrderById = async (orderId) => {
  const query = `
    SELECT 
      o.id AS order_id, o.quantity, o.total_price, o.status, o.created_at, o.updated_at,
      p.id AS product_id, p.name AS product_name, p.price AS product_price, 
      u.id AS buyer_id, u.full_name AS buyer_name, u.email AS buyer_email,
      s.id AS seller_id, s.full_name AS seller_name, s.email AS seller_email
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN users u ON o.buyer_id = u.id
    JOIN users s ON p.seller_id = s.id
    WHERE o.id = $1;
  `;
  const result = await client.query(query, [orderId]);
  return result.rows[0]; // Return the first matching row
};

// Count orders for a user
const countUserOrders = async (userId, filters) => {
  const baseQuery = `
    SELECT COUNT(*) AS total
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = $1
  `;

  const filterConditions = [];
  const params = [userId];

  if (filters.status) {
    filterConditions.push(`o.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.minValue) {
    filterConditions.push(`o.total_price >= $${params.length + 1}`);
    params.push(filters.minValue);
  }
  if (filters.maxValue) {
    filterConditions.push(`o.total_price <= $${params.length + 1}`);
    params.push(filters.maxValue);
  }
  if (filters.startDate && filters.endDate) {
    filterConditions.push(
      `o.created_at BETWEEN $${params.length + 1} AND $${params.length + 2}`
    );
    params.push(filters.startDate, filters.endDate);
  }

  const filterQuery = filterConditions.length
    ? ` AND ${filterConditions.join(" AND ")}`
    : "";
  const query = `${baseQuery} ${filterQuery}`;
  const result = await client.query(query, params);
  return parseInt(result.rows[0].total, 10);
};

// Count orders for a seller
const countSellerOrders = async (sellerId, filters) => {
  const baseQuery = `
    SELECT COUNT(*) AS total
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE p.seller_id = $1
  `;

  const filterConditions = [];
  const params = [sellerId];

  if (filters.status) {
    filterConditions.push(`o.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.minValue) {
    filterConditions.push(`o.total_price >= $${params.length + 1}`);
    params.push(filters.minValue);
  }
  if (filters.maxValue) {
    filterConditions.push(`o.total_price <= $${params.length + 1}`);
    params.push(filters.maxValue);
  }
  if (filters.startDate && filters.endDate) {
    filterConditions.push(
      `o.created_at BETWEEN $${params.length + 1} AND $${params.length + 2}`
    );
    params.push(filters.startDate, filters.endDate);
  }

  const filterQuery = filterConditions.length
    ? ` AND ${filterConditions.join(" AND ")}`
    : "";
  const query = `${baseQuery} ${filterQuery}`;
  const result = await client.query(query, params);
  return parseInt(result.rows[0].total, 10);
};

// Fetch all orders with product IDs and quantities
const fetchAllOrdersWithProducts = async () => {
  const query = `
    SELECT product_id, SUM(quantity) AS total_quantity
    FROM orders
    WHERE status = 'Delivered' -- Only consider completed sales
    GROUP BY product_id;
  `;
  try {
    const result = await client.query(query);
    return result.rows; // [{ product_id: 1, total_quantity: 30 }, ...]
  } catch (error) {
    console.error(
      "Error fetching orders for top-selling products:",
      error.message
    );
    throw new Error(
      "Database error while fetching orders for top-selling products."
    );
  }
};

module.exports = {
  placeOrder,
  updateOrderStatus,
  fetchUserOrders,
  fetchSellerOrders,
  revertInventory, // New function added
  fetchLatestSellerOrders, // Fetch latest seller orders
  countUserOrders,
  countSellerOrders,
  fetchOrderById,
  fetchAllOrdersWithProducts,
};
