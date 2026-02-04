const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get all orders for admin
// @route   GET /api/order
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ adminId: req.admin._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get orders for a specific session
exports.getSessionOrders = asyncHandler(async (req, res) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const orders = await Order.find({
    sessionId: req.params.sessionId,
    createdAt: { $gte: twentyFourHoursAgo },
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
    if (req.body.cancellationReason) {
      order.cancellationReason = req.body.cancellationReason;
    }
    const updatedOrder = await order.save();

    // Emit socket event to the specific session room AND globally for admin
    if (req.io) {
      req.io.to(order.sessionId).emit("orderStatusUpdated", updatedOrder);
      req.io.emit("orderStatusUpdated", updatedOrder); // Notify admin dashboard
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

  // Notify admin via socket (and session)
  if (req.io) {
    // 1. Notify Session (Client)
    req.io.to(sessionId).emit("paymentUpdated", {
      sessionId,
      status: updates.paymentStatus || "Pending",
      paymentMethod: updates.paymentMethod,
    });

    // 2. Notify Admin (Dashboard) - We need to emit the FULL updated order objects
    // Fetch the fresh updated orders to send to admin
    const freshOrders = await Order.find({ sessionId });

    freshOrders.forEach((order) => {
      // Emit update for every order in the session (simplest to ensure consistency)
      req.io.emit("orderStatusUpdated", order);
    });
  }

  res.json({
    message:
      paymentMethod === "Cash"
        ? "Cash payment requested"
        : "Payment successful",
  });
});

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

  if (req.io) {
    req.io.to(sessionId).emit("new_order", createdOrder);
    req.io.emit("admin_new_order", createdOrder); // Optional: Notify admin dashboard globally if viewing all orders
  }

  res.status(201).json(createdOrder);
});
