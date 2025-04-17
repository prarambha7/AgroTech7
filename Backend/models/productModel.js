const client = require("../db"); // PostgreSQL connection
// Validate category and UOM
const validateCategoryAndUOM = async (categoryId, uom) => {
  const query = `
    SELECT uom 
    FROM categories 
    WHERE id = $1;
  `;
  const result = await client.query(query, [categoryId]);

  if (result.rowCount === 0) {
    throw new Error(`Category with ID '${categoryId}' not found.`);
  }

  const allowedUOMs = result.rows[0].uom; // PostgreSQL array

  // Ensure uom exists in the array
  if (!allowedUOMs.includes(uom)) {
    throw new Error(
      `Invalid UOM '${uom}' for the selected category. Allowed UOMs: ${allowedUOMs.join(
        ", "
      )}`
    );
  }
};

// Fetch category by ID
const fetchCategoryById = async (categoryId) => {
  const query = "SELECT name, uom FROM categories WHERE id = $1;";
  const result = await client.query(query, [categoryId]);

  if (result.rows.length === 0) {
    throw new Error("Category not found");
  }

  const category = result.rows[0];

  // PostgreSQL array is already in the correct format
  category.uoms = category.uom;

  return category;
};

// Add a new product
const addProduct = async ({
  name,
  category_id,
  price,
  quantity,
  description,
  images,
  sellerId,
  uom,
  minimum_order_quantity,
}) => {
  const query = `
    INSERT INTO products (name, category_id, price, quantity, description, images, seller_id, uom, minimum_order_quantity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
  `;
  const values = [
    name,
    category_id,
    price,
    quantity,
    description,
    images,
    sellerId,
    uom,
    minimum_order_quantity,
  ];
  const result = await client.query(query, values);
  return result.rows[0];
};

//update product
const updateProduct = async (productData) => {
  const { productId, ...fields } = productData;

  if (!productId) {
    console.error("Error: Product ID is missing in productData:", productData);
    throw new Error("Product ID is required for updating the product.");
  }

  // Filter out derived or invalid fields
  const validKeys = Object.keys(fields).filter(
    (key) =>
      key !== "seller_name" && // Derived field
      key !== "availability" && // Derived field
      key !== "pricePerUnit" && // Derived field
      key !== "category_name" &&
      key !== "average_rating" && // Exclude this derived field
      key !== "rating_count" // Exclude this derived field if used
    
  );
  const values = validKeys.map((key) => fields[key]);

  // Build the update query dynamically
  const setQuery = validKeys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const query = `
    UPDATE products
    SET ${setQuery}
    WHERE id = $${validKeys.length + 1}
    RETURNING *;
  `;
  values.push(productId);

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating product:", error.message);
    throw error;
  }
};

// Delete a product by ID
const deleteProduct = async (productId) => {
  const query = "DELETE FROM products WHERE id = $1;";
  await client.query(query, [productId]);
};

const fetchAllProducts = async (limit, offset, search, filters) => {
  const { category, minPrice, maxPrice, minQuantity, sortBy, sortOrder } = filters;

  let filterConditions = "";
  const filterParams = [];

  // Add filters
  if (search) {
    // Broader matching for names and descriptions
    filterConditions += ` AND (p.name ILIKE $${filterParams.length + 1} OR p.description ILIKE $${filterParams.length + 1})`;
    filterParams.push(`%${search[0]}%`); // Use the first letter to broaden results
  }
  if (category) {
    filterConditions += ` AND p.category_id = $${filterParams.length + 1}`;
    filterParams.push(category);
  }
  if (minPrice) {
    filterConditions += ` AND p.price >= $${filterParams.length + 1}`;
    filterParams.push(minPrice);
  }
  if (maxPrice) {
    filterConditions += ` AND p.price <= $${filterParams.length + 1}`;
    filterParams.push(maxPrice);
  }
  if (minQuantity) {
    filterConditions += ` AND p.minimum_order_quantity >= $${filterParams.length + 1}`;
    filterParams.push(minQuantity);
  }

  // Default sorting
  const sortField = sortBy || "created_at";
  const sortDirection = sortOrder || "DESC";

  const query = `
    SELECT 
      p.*, 
      c.name AS category_name,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      u.full_name AS seller_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN ratings r ON p.id = r.product_id
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE 1=1 ${filterConditions} -- Dynamic filters
    GROUP BY p.id, c.name, u.full_name
    ORDER BY ${sortField} ${sortDirection}, p.id ASC -- Sorting
    LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2};
  `;

  filterParams.push(limit, offset);

  try {
    const result = await client.query(query, filterParams);
    return result.rows;
  } catch (err) {
    console.error("Error fetching all products:", err.message);
    throw err;
  }
};


// Fetch products by seller with search, sort, and filter
const fetchProductsBySeller = async (sellerId, limit, offset, search, filters) => {
  const { category, minPrice, maxPrice, minQuantity, sortBy, sortOrder } = filters;

  let filterConditions = "WHERE p.seller_id = $1";
  const filterParams = [sellerId];

  // Add filters
  if (category) {
    filterConditions += ` AND p.category_id = $${filterParams.length + 1}`;
    filterParams.push(category);
  }
  if (minPrice) {
    filterConditions += ` AND p.price >= $${filterParams.length + 1}`;
    filterParams.push(minPrice);
  }
  if (maxPrice) {
    filterConditions += ` AND p.price <= $${filterParams.length + 1}`;
    filterParams.push(maxPrice);
  }
  if (minQuantity) {
    filterConditions += ` AND p.minimum_order_quantity >= $${filterParams.length + 1}`;
    filterParams.push(minQuantity);
  }
  if (search) {
    filterConditions += ` AND (p.name ILIKE $${filterParams.length + 1} OR p.description ILIKE $${filterParams.length + 1})`;
    filterParams.push(`%${search}%`);
  }

  const sortField = sortBy || "created_at";
  const sortDirection = sortOrder || "DESC";

  const query = `
    SELECT 
      p.*, 
      c.name AS category_name,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      u.full_name AS seller_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN ratings r ON p.id = r.product_id
    LEFT JOIN users u ON p.seller_id = u.id
    ${filterConditions}
    GROUP BY p.id, c.name, u.full_name
    ORDER BY ${sortField} ${sortDirection}
    LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2};
  `;

  filterParams.push(limit, offset);

  try {
    const result = await client.query(query, filterParams);
    return result.rows;
  } catch (err) {
    console.error("Error fetching seller products:", err.message);
    throw err;
  }
};

// Fetch product by ID
const fetchProductById = async (productId) => {
  const query = `
    SELECT 
      p.*, 
      c.name AS category_name,
      u.full_name AS seller_name,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.rating) AS rating_count
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.seller_id = u.id
    LEFT JOIN ratings r ON p.id = r.product_id
    WHERE p.id = $1
    GROUP BY p.id, c.name, u.full_name
  `;

  try {
    const result = await client.query(query, [productId]);
    console.log(`Database result for Product ID ${productId}:`, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Database error fetching product:", err.message);
    throw new Error("Database error");
  }
};

// Count products by seller
const countProductsBySeller = async (sellerId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE seller_id = $1;
  `;
  const result = await client.query(query, [sellerId]);
  return parseInt(result.rows[0].total, 10);
};

// Count all products (without search, sort, or filter)
const countAllProducts = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;

  try {
    const result = await client.query(query);
    return parseInt(result.rows[0].total, 10);
  } catch (err) {
    console.error("Error executing count query for all products:", err.message);
    throw err;
  }
};
// Get products the user has interacted with
const getProductsByUserInteraction = async (userId) => {
  const query = `
        SELECT DISTINCT p.*
        FROM products p
        JOIN orders o ON p.id = o.product_id
        WHERE o.buyer_id = $1
    `;
  const result = await client.query(query, [userId]);
  return result.rows;
};

// Find similar products based on category or description
const getSimilarProducts = async (productIds, limit) => {
  const query = `
        SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id NOT IN (${productIds.join(", ")}) AND p.quantity > 0
        ORDER BY p.category_id ASC, p.created_at DESC
        LIMIT $1
    `;
  const values = [limit];
  const result = await client.query(query, values);
  return result.rows;
};

//fetch al products descriptions
const fetchAllProductDescriptions = async () => {
  const query = `
      SELECT id, description
      FROM products
      WHERE description IS NOT NULL
  `;
  const result = await client.query(query);
  return result.rows;
};

module.exports = {
  validateCategoryAndUOM,
  fetchCategoryById,
  addProduct,
  updateProduct,
  deleteProduct,
  fetchAllProductDescriptions,
  fetchAllProducts,
  countProductsBySeller,
  fetchProductsBySeller,
  fetchProductById,
  countAllProducts,
  getProductsByUserInteraction,
  getSimilarProducts,
};
