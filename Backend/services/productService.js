const productModel = require('../models/productModel');
const ratingsService = require('./ratingsService');
const { uploadImagesToCloudinary } = require('../utils/imageHelper');
const { fetchAllOrdersWithProducts } = require('../models/ordersModel');

// Levenshtein Distance Algorithm
const levenshteinDistance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j], // Deletion
          dp[i][j - 1], // Insertion
          dp[i - 1][j - 1] // Substitution
        ) + 1;
      }
    }
  }

  return dp[a.length][b.length];
};

// Fuzzy Search Helper
const preprocess = (str) => str.toLowerCase().trim();

const fuzzySearchProducts = (products, query, threshold = 3) => { 
  const processedQuery = preprocess(query);

  console.log(`Searching for: "${processedQuery}"`);
  console.log("Available products:", products);

  return products
    .map((product) => {
      const processedName = preprocess(product.name);
      const processedDescription = preprocess(product.description);

      console.log(`Product: "${product.name}", Processed Name: "${processedName}", Processed Description: "${processedDescription}"`);

      // Check if query is an exact match in name or description
      const isExactMatch = processedName.includes(processedQuery) || processedDescription.includes(processedQuery);
      if (isExactMatch) {
        console.log(`Exact match found for: "${product.name}"`);
      }

      // Calculate Levenshtein distances
      const nameDistance = levenshteinDistance(processedQuery, processedName);
      const descriptionDistance = levenshteinDistance(processedQuery, processedDescription);

      console.log(`Name Distance: ${nameDistance}, Description Distance: ${descriptionDistance}`);

      // Calculate relevance score (lower distance = higher relevance)
      const nameScore = 1 - Math.min(nameDistance / processedName.length, 1); // Normalize to [0, 1]
      const descriptionScore = 1 - Math.min(descriptionDistance / processedDescription.length, 1); // Normalize to [0, 1]
      const relevanceScore = (0.7 * nameScore) + (0.3 * descriptionScore); // Weighted average

      return {
        ...product,
        nameDistance,
        descriptionDistance,
        relevanceScore,
        isExactMatch,
      };
    })
    .filter((product) => 
      product.relevanceScore > 0.5 || 
      product.isExactMatch || 
      product.nameDistance <= threshold || 
      product.descriptionDistance <= threshold
    ) // Include exact matches, relevant products, and those below the threshold
    .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
};



// Validate category and UOM using the database
const validateCategoryAndUOM = async (categoryId, uom) => {
  const category = await productModel.fetchCategoryById(categoryId);
  if (!category) {
    throw new Error(`Invalid category ID: ${categoryId}`);
  }

  // Check if the provided UOM is valid for the category
  const validUOMs = category.uoms; // Assuming `uoms` is an array from the `categories` table
  if (!validUOMs.includes(uom)) {
    throw new Error(
      `Invalid UOM '${uom}' for category '${category.name}'. Allowed UOMs: ${validUOMs.join(', ')}`
    );
  }
};

const verifyOwnership = async (productId, sellerId) => {
  const product = await productModel.fetchProductById(productId);

  if (!product) {
    console.error(`Product not found for ID: ${productId}`);
    throw new Error('Product not found');
  }

  if (product.seller_id !== sellerId) {
    console.error(`Seller mismatch: Product Seller ID ${product.seller_id}, Requesting Seller ID ${sellerId}`);
    throw new Error('You are not authorized to update this product');
  }

  return true; // Ownership verified
};

// Add a new product
const addProduct = async (productData) => {
  return await productModel.addProduct(productData); // Directly delegates to the model
};

const validFields = [
  'name',
  'category_id',
  'price',
  'quantity',
  'description',
  'images',
  'uom',
  'minimum_order_quantity',
];

const updateProduct = async (productData) => {
  console.log('Product Data in Service:', productData);

  const { id: productId, ...fields } = productData;

  if (!productId) {
    console.error('Error: Product ID is missing in productData:', productData);
    throw new Error('Product ID is required for updating the product.');
  }

  console.log('Product ID:', productId);
  console.log('Fields to Update:', fields); 

  const updatedProduct = await productModel.updateProduct({ productId, ...fields });
  console.log('Updated Product (From Model):', updatedProduct);

  return updatedProduct;
};

// Delete a product (Validate seller's ownership before deletion)
const deleteProduct = async (productId, sellerId) => {
  const product = await productModel.fetchProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if the seller owns the product
  if (product.seller_id !== sellerId) {
    throw new Error('You are not authorized to delete this product');
  }

  // Proceed with deletion
  return await productModel.deleteProduct(productId);
};

// Fetch all products with filters and sorting
const fetchAllProducts = async ({ search, limit = 10, offset = 0, filters }) => {
  const allMatchingProducts = await productModel.fetchAllProducts(null, null, search, filters);

  let filteredProducts = allMatchingProducts;

  if (search) {
    filteredProducts = fuzzySearchProducts(allMatchingProducts, search);
  }

  const totalProducts = filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  const enrichedProducts = await Promise.all(
    paginatedProducts.map(async (product) => ({
      ...product,
      availability: product.quantity > 100 ? 'Available' : product.quantity > 0 ? 'Low in Stock' : 'Out of Stock',
      pricePerUnit: `NPR ${product.price} per ${product.uom}`,
    }))
  );

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    totalProducts,
    totalPages,
    currentPage: Math.ceil(offset / limit) + 1,
    limit,
    data: enrichedProducts,
  };
};


// Fetch products by seller with filters and sorting
const fetchProductsBySeller = async (sellerId, { search, limit = 10, offset = 0, filters }) => {
  // Fetch all matching products for the seller without pagination
  const allMatchingProducts = await productModel.fetchProductsBySeller(sellerId, null, null, search, filters);

  let filteredProducts = allMatchingProducts;

  // Apply fuzzy search if a search term is provided
  if (search) {
    filteredProducts = fuzzySearchProducts(allMatchingProducts, search);
  }

  // Calculate totalProducts after fuzzy search
  const totalProducts = filteredProducts.length;

  // Apply pagination to the filtered results
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  // Add derived fields to paginated results
  const enrichedProducts = await Promise.all(
    paginatedProducts.map(async (product) => {
      const ratings = await ratingsService.fetchProductRatings(product.id);
      return {
        ...product,
        availability: product.quantity > 100 ? 'Available' : product.quantity > 0 ? 'Low in Stock' : 'Out of Stock',
        pricePerUnit: `NPR ${product.price} per ${product.uom}`,
        average_rating: parseFloat(ratings.average_rating) || 0,
        rating_count: parseInt(ratings.rating_count, 10) || 0,
      };
    })
  );

  // Calculate totalPages
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    totalProducts,
    totalPages,
    currentPage: Math.ceil(offset / limit) + 1,
    limit,
    data: enrichedProducts,
  };
};

const fetchProductById = async (productId) => {
  const product = await productModel.fetchProductById(productId);
  console.log(`Fetched Product for ID ${productId}:`, product);

  if (!product) {
    throw new Error('Product not found');
  }

  // Add derived fields
  return {
    ...product,
    availability: product.quantity > 100 ? 'Available' : product.quantity > 0 ? 'Low in Stock' : 'Out of Stock',
    pricePerUnit: `NPR ${product.price} per ${product.uom}`,
    average_rating: parseFloat(product.average_rating) || 0,
    rating_count: parseInt(product.rating_count, 10) || 0,
  };
};


// Check product availability
const getProductAvailability = async (productId) => {
  const product = await productModel.fetchProductById(productId);
  if (!product) throw new Error('Product not found');

  return {
    availability: product.quantity > 100 ? 'Available' : product.quantity > 0 ? 'Low in Stock' : 'Out of Stock',
    pricePerUnit: `NPR ${product.price} per ${product.uom}`,
  };
};
// Count products by seller
const countProductsBySeller = async (sellerId) => {
  return await productModel.countProductsBySeller(sellerId);
};

const countAllProducts = async () => {
  return await productModel.countAllProducts();
};
//getTopSellingProducts
const getTopSellingProducts = async () => {
  try {
    // Fetch sales data for all products
    const orderData = await fetchAllOrdersWithProducts();

    // Sort the products by sales quantity in descending order
    const sortedProducts = orderData.sort((a, b) => b.total_quantity - a.total_quantity);

    // Get the top 10 products
    const topProductIds = sortedProducts.slice(0, 10).map(product => ({
      productId: product.product_id,
      totalQuantitySold: product.total_quantity, // Keep track of quantity sold
    }));

    // Fetch product details for each top product and include totalQuantitySold
    const topProducts = [];
    for (const { productId, totalQuantitySold } of topProductIds) {
      const product = await fetchProductById(productId);
      if (product) {
        topProducts.push({ ...product, totalQuantitySold });
      }
    }

    return topProducts; // Return the enriched top products
  } catch (error) {
    console.error("Error in service for top-selling products:", error.message);
    throw error;
  }
};


module.exports = {
  validateCategoryAndUOM,
  verifyOwnership,
  addProduct, // Directly adds the minimal version
  updateProduct,
  deleteProduct,
  fetchAllProducts,
  fetchProductById,
  fetchProductsBySeller,
  getProductAvailability,
  countProductsBySeller,
  countAllProducts,
  getTopSellingProducts,
  fuzzySearchProducts,
};
