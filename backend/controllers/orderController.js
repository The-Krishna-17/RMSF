const Order = require("../models/Order");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc    Create a new order
// @route   POST /api/order
exports.createOrder = asyncHandler(async (req, res) => {
  const { adminId, tableNumber, items, totalAmount, sessionId } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in order");
  }

  if (!sessionId) {
    res.status(400);
    throw new Error("Session ID is required");
  }

  const order = new Order({
    adminId,
    tableNumber,
    items,
    totalAmount,
    sessionId,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get all orders for admin
// @route   GET /api/order
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ adminId: req.admin._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get orders for a specific session
// @route   GET /api/order/session/:sessionId
exports.getSessionOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    sessionId: req.params.sessionId,
    paymentStatus: "Pending",
  }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/order/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, estimatedTime, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (order) {
    // Only verify admin if we have one (some routes might be public)
    if (req.admin && order.adminId.toString() !== req.admin._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    // If setting to Paid, maybe we should also set status to Completed if it was Served? Optional.

    if (estimatedTime !== undefined) {
      order.estimatedTime = estimatedTime;
    }
    const updatedOrder = await order.save();

    // Emit socket event to the specific session room
    if (req.io) {
      req.io.to(order.sessionId).emit("orderStatusUpdated", updatedOrder);
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Process payment for session
// @route   POST /api/order/pay
exports.processPayment = asyncHandler(async (req, res) => {
  const { sessionId, paymentMethod } = req.body;

  const orders = await Order.find({ sessionId, paymentStatus: "Pending" });

  if (orders.length === 0) {
    res.status(404);
    throw new Error("No pending orders found for this session");
  }

  const updates = {};
  if (paymentMethod) updates.paymentMethod = paymentMethod;

  if (paymentMethod === "Cash") {
    // For Cash, we keep it Pending but update the method so admin knows
    updates.paymentStatus = "Pending";
    // We don't complete the order yet
  } else {
    // Assume Online is instant success for this demo
    updates.paymentStatus = "Paid";
    // Do NOT auto-complete the order status. Let the kitchen finish it.
    // updates.status = "Completed";
  }

  // Update all orders for this session
  await Order.updateMany(
    { sessionId, paymentStatus: "Pending" },
    { $set: updates },
  );

  // Notify admin via socket (implementation depends on admin room, for now basic emit)
  if (req.io) {
    // Just emit to session so they know request is sent
    req.io.to(sessionId).emit("paymentRequested", { paymentMethod });

    // Also, we should probably emit an update event so the frontend refreshes the order list status immediately
    // The frontend listens for "orderStatusUpdated" but processPayment updates MANY orders.
    // We'll emit a generic "sessionPaymentUpdated" or simply let the user refresh/poll?
    // Better: Emit paymentUpdate to the session room
    req.io
      .to(sessionId)
      .emit("paymentUpdated", { sessionId, status: updates.paymentStatus });
  }

  res.json({
    message:
      paymentMethod === "Cash"
        ? "Cash payment requested"
        : "Payment successful",
  });
});
