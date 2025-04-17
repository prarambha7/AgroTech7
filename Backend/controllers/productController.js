const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary"); // Cloudinary integration
const { uploadImagesToCloudinary } = require("../utils/imageHelper");
const fs = require("fs");

// Add a new product (Only for sellers)
const addProduct = async (req, res) => {
  const {
    name,
    category_id,
    price,
    quantity,
    description,
    uom,
    minimum_order_quantity,
  } = req.body;
  const sellerId = req.user.id;

  try {
    const imageUrls = await uploadImagesToCloudinary(req.files);

    // Pass product data and image URLs to the service
    const newProduct = await productService.addProduct({
      name,
      category_id,
      price,
      quantity,
      description,
      images: imageUrls,
      sellerId,
      uom,
      minimum_order_quantity,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10); // Ensure it's an integer
  const sellerId = req.user.id;

  try {
    console.log("Product ID:", productId);
    console.log("Seller ID:", sellerId);

    // Verify ownership
    await productService.verifyOwnership(productId, sellerId);

    // Fetch current product details
    const currentProduct = await productService.fetchProductById(productId);
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Current Product:", currentProduct);

    // Filter valid fields from the request body
    const validFields = [
      "name",
      "category_id",
      "price",
      "quantity",
      "description",
      "images",
      "uom",
      "minimum_order_quantity",
    ];

    const filteredData = Object.keys(req.body)
      .filter((key) => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    console.log("Filtered Data:", filteredData);

    // Merge with current product data
    const updatedData = {
      ...currentProduct,
      ...filteredData,
      id: productId, // Explicitly include the product ID
    };

    console.log("Updated Data:", updatedData);

    // Update the product
    const updatedProduct = await productService.updateProduct(updatedData);
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete a product (Only for sellers)
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    await productService.deleteProduct(productId, req.user.id); // Pass sellerId for validation
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch all products with fuzzy search
const fetchAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category_id,
      minPrice,
      maxPrice,
      minQuantity,
      sortBy,
      sortOrder,
    } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      category: category_id ? parseInt( category_id, 10) : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minQuantity: minQuantity ? parseInt(minQuantity, 10) : null,
      sortBy,
      sortOrder,
    };

    const { totalProducts, totalPages, currentPage, data } = await productService.fetchAllProducts({
      search,
      limit: parseInt(limit, 10),
      offset,
      filters,
    });

    res.json({
      success: true,
      page: currentPage,
      limit: parseInt(limit, 10),
      total: data.length,
      totalProducts,
      totalPages,
      data,
    });
  } catch (err) {
    console.error("Error fetching all products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


// Fetch products by seller with fuzzy search
const fetchProductsBySeller = async (req, res) => {
  const sellerId = req.user.id;

  try {
    const {
      page = 1,
      limit = 10,
      search,
      category_id, // Capture category_id from query
      minPrice,
      maxPrice,
      minQuantity,
      sortBy,
      sortOrder,
    } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      category: category_id ? parseInt(category_id, 10) : null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      minQuantity: minQuantity ? parseInt(minQuantity, 10) : null,
      sortBy,
      sortOrder,
    };

    const { totalProducts, totalPages, currentPage, data } = await productService.fetchProductsBySeller(sellerId, {
      search,
      limit: parseInt(limit, 10),
      offset,
      filters,
    });

    res.json({
      success: true,
      page: currentPage,
      limit: parseInt(limit, 10),
      total: data.length,
      totalProducts,
      totalPages,
      data,
    });
  } catch (err) {
    console.error("Error fetching seller products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch a single product by ID (Accessible to buyers and sellers)
const fetchProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await productService.fetchProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add availability and price per unit dynamically
    const enrichedProduct = {
      ...product,
      availability:
        product.quantity > 100
          ? "Available"
          : product.quantity > 0
          ? "Low in Stock"
          : "Out of Stock",
      pricePerUnit: `NPR ${product.price} per ${product.uom}`,
    };

    res.json(enrichedProduct);
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    res.status(500).send("Server error");
  }
};

// Check product availability
const getProductAvailability = async (req, res) => {
  const productId = req.params.id;

  try {
    const availability = await productService.getProductAvailability(productId);
    res.json({ productId, availability });
  } catch (err) {
    console.error("Error checking product availability:", err.message);
    res.status(500).send("Server error");
  }
};
//fetchTopSellingProducts
const fetchTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await productService.getTopSellingProducts();
    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error(
      "Error fetching top-selling products in controller:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch top-selling products.",
    });
  }
};
module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  fetchAllProducts,
  fetchProductById,
  fetchProductsBySeller,
  getProductAvailability,
  fetchTopSellingProducts,
};
