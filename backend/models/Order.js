const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    tableNumber: { type: String, required: true },
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    sessionId: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "Cash"],
      default: "Online",
    },
    status: {
      type: String,
      enum: ["Pending", "Cooking", "Ready", "Served", "Cancelled"],
      default: "Pending",
    },
    estimatedTime: { type: Number }, // in minutes
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
