const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSessionOrders,
  processPayment,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.route("/").post(createOrder).get(protect, getOrders);
router.route("/:id/status").put(protect, updateOrderStatus);
router.route("/session/:sessionId").get(getSessionOrders);
router.route("/pay").post(processPayment);

module.exports = router;
