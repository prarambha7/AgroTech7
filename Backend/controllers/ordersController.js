const ordersService = require("../services/ordersService");

// Allowed statuses directly in the controller
const ALLOWED_ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Canceled",
];

// Place an Order
// Place a Bulk Order
const placeOrder = async (req, res) => {
  const items = req.body.items; // Array of { product_id, quantity }
  const userId = req.user.id; // Authenticated user ID

  // Validate input
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one product is required to place an order.",
    });
  }

  // Validate each item in the bulk order
  for (const item of items) {
    if (!item.product_id || !item.quantity) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a product_id and quantity.",
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer for each item.",
      });
    }
  }

  try {
    // Place bulk order by calling the service for each item in the bulk
    const orders = [];
    for (const item of items) {
      const order = await ordersService.placeOrder(
        req.io,
        userId,
        item.product_id,
        item.quantity
      );
      orders.push(order);
    }

    res.status(201).json({
      success: true,
      message: "Bulk order placed successfully",
      orders,
    });
  } catch (error) {
    console.error("Error placing bulk order:", error.message);

    // Handle specific errors with appropriate status codes
    if (error.message.includes("Minimum order quantity")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        type: "MINIMUM_QUANTITY_ERROR",
      });
    }

    if (error.message.includes("Insufficient stock")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        type: "INSUFFICIENT_STOCK_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to place bulk order",
      error: error.message,
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate the status
  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed statuses are: ${ALLOWED_ORDER_STATUSES.join(
        ", "
      )}`,
    });
  }

  try {
    const updatedOrder = await ordersService.updateOrderStatus(
      req.io,
      orderId,
      status
    );
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Orders for a User
const fetchUserOrders = async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    status,
    minValue,
    maxValue,
    startDate,
    endDate,
  } = req.query;

  const offset = (page - 1) * limit;
  const filters = { status, minValue, maxValue, startDate, endDate };

  try {
    const { data, totalItems } = await ordersService.fetchUserOrders(
      userId,
      parseInt(limit),
      offset,
      sortBy,
      sortOrder,
      filters
    );
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      page: parseInt(page),
      limit,
      total: data.length,
      totalPages,
      totalItems,
      data,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Orders for a Seller
const fetchSellerOrders = async (req, res) => {
  const sellerId = req.user.id;
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    status,
    minValue,
    maxValue,
    startDate,
    endDate,
  } = req.query;

  const offset = (page - 1) * limit;
  const filters = { status, minValue, maxValue, startDate, endDate };

  try {
    const { data, totalItems } = await ordersService.fetchSellerOrders(
      sellerId,
      parseInt(limit),
      offset,
      sortBy,
      sortOrder,
      filters
    );
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      page: parseInt(page),
      limit,
      total: data.length,
      totalPages,
      totalItems,
      data,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const fetchOrderById = async (req, res) => {
  const { id: userId, role: userRole } = req.user; // Authenticated user
  const { orderId } = req.params;

  try {
    const order = await ordersService.fetchOrderById(userId, userRole, orderId);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  updateOrderStatus,
  fetchUserOrders,
  fetchSellerOrders,
  fetchOrderById,
};
