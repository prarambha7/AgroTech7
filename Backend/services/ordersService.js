const ordersModel = require('../models/ordersModel');
const notificationsService = require('./notificationsService'); // For real-time notifications

// Place an Order
const placeOrder = async (io, userId, productId, quantity) => {
  const order = await ordersModel.placeOrder(userId, productId, quantity);

  // Send notifications
  const sellerNotification = `New order for Product ID ${productId}.`;
  const buyerNotification = `Your order for Product ID ${productId} has been placed.`;

  await notificationsService.addAndEmitNotification(io, order.seller_id, sellerNotification);
  await notificationsService.addAndEmitNotification(io, userId, buyerNotification);

  // Check and notify if inventory is low
  const remainingQuantity = order.remaining_quantity;
  if (remainingQuantity <= 100) { // Adjust threshold as needed
    const lowStockMessage = `Low stock alert: Product ID ${productId} has only ${remainingQuantity} items left.`;
    await notificationsService.addAndEmitNotification(io, order.seller_id, lowStockMessage);
  }

  return order;
};

// Update Order Status
const updateOrderStatus = async (io, orderId, status) => {
  const order = await ordersModel.updateOrderStatus(orderId, status);

  // Handle cancellation logic
  if (status === 'Canceled') {
    await ordersModel.revertInventory(order.product_id, order.quantity);
    const cancellationMessage = `Your order ID ${orderId} has been canceled.`;
    await notificationsService.addAndEmitNotification(io, order.buyer_id, cancellationMessage);
  } else {
    const statusUpdateMessage = `Your order ID ${orderId} status has been updated to "${status}".`;
    await notificationsService.addAndEmitNotification(io, order.buyer_id, statusUpdateMessage);
  }

  return order;
};


// Fetch Orders for a User
const fetchUserOrders = async (userId, limit, offset, sortBy, sortOrder, filters) => {
  // Default sorting and validation
  const validSortByFields = ['created_at', 'total_price'];
  const validSortOrder = ['asc', 'desc'];

  if (sortBy && !validSortByFields.includes(sortBy)) {
    throw new Error(`Invalid sortBy field. Allowed fields: ${validSortByFields.join(', ')}`);
  }
  if (sortOrder && !validSortOrder.includes(sortOrder.toLowerCase())) {
    throw new Error(`Invalid sortOrder. Use 'asc' or 'desc'.`);
  }

  // Fetch orders and total count
  const orders = await ordersModel.fetchUserOrders(userId, limit, offset, sortBy || 'created_at', sortOrder || 'desc', filters);
  const totalItems = await ordersModel.countUserOrders(userId, filters);

  return {
    data: orders,
    totalItems,
  };
};

// Fetch Orders for a Seller
const fetchSellerOrders = async (sellerId, limit, offset, sortBy, sortOrder, filters) => {
  // Default sorting and validation
  const validSortByFields = ['created_at', 'total_price'];
  const validSortOrder = ['asc', 'desc'];

  if (sortBy && !validSortByFields.includes(sortBy)) {
    throw new Error(`Invalid sortBy field. Allowed fields: ${validSortByFields.join(', ')}`);
  }
  if (sortOrder && !validSortOrder.includes(sortOrder.toLowerCase())) {
    throw new Error(`Invalid sortOrder. Use 'asc' or 'desc'.`);
  }

  
  // Fetch orders and total count
  const orders = await ordersModel.fetchSellerOrders(sellerId, limit, offset, sortBy || 'created_at', sortOrder || 'desc', filters);
  const totalItems = await ordersModel.countSellerOrders(sellerId, filters);

  return {
    data: orders,
    totalItems,
  };
};

const fetchOrderById = async (userId, userRole, orderId) => {
  const order = await ordersModel.fetchOrderById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Authorization: Ensure the user is either the buyer or the seller
  if (userRole === 'user' && order.buyer_id !== userId) {
    throw new Error('You are not authorized to view this order');
  }

  if (userRole === 'seller' && order.seller_id !== userId) {
    throw new Error('You are not authorized to view this order');
  }

  return order;
};


module.exports = {
  placeOrder,
  updateOrderStatus,
  fetchUserOrders,
  fetchSellerOrders,
  fetchOrderById,
};
