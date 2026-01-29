const mongoose = require("mongoose");

const foodCatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    defaultImage: { type: String },
    defaultDescription: { type: String },
    vegType: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
    popularityRank: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FoodCatalog", foodCatalogSchema);
