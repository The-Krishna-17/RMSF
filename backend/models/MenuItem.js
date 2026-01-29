const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    description: { type: String },
    vegType: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
