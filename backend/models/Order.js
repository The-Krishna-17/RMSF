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
    status: {
      type: String,
      enum: ["Received", "Preparing", "Ready", "Served"],
      default: "Received",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
