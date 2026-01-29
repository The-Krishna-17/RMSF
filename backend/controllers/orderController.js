const Order = require("../models/Order");

// @desc    Create a new order
// @route   POST /api/order
exports.createOrder = async (req, res) => {
  const { adminId, tableNumber, items, totalAmount } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in order" });
  }

  const order = new Order({
    adminId,
    tableNumber,
    items,
    totalAmount,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Get all orders for admin
// @route   GET /api/order
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ adminId: req.admin._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/order/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.adminId.toString() !== req.admin._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
