const FoodCatalog = require("../models/FoodCatalog");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get all food catalog items
// @route   GET /api/food-catalog
exports.getCatalogItems = asyncHandler(async (req, res) => {
  const { q, category, vegType } = req.query;

  let query = {};

  if (q) {
    query.name = { $regex: q, $options: "i" };
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (vegType && vegType !== "All") {
    query.vegType = vegType;
  }

  const items = await FoodCatalog.find(query).sort({ popularityRank: -1 });
  res.json(items);
});

// @desc    Search food catalog items
// @route   GET /api/food-catalog/search
exports.searchCatalog = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const items = await FoodCatalog.find({
    name: { $regex: q, $options: "i" },
  }).limit(10);
  res.json(items);
});
