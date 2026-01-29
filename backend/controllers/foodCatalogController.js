const FoodCatalog = require("../models/FoodCatalog");

// @desc    Get all food catalog items
// @route   GET /api/food-catalog
exports.getCatalogItems = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Error fetching catalog" });
  }
};

// @desc    Search food catalog items
// @route   GET /api/food-catalog/search
exports.searchCatalog = async (req, res) => {
  try {
    const { q } = req.query;
    const items = await FoodCatalog.find({
      name: { $regex: q, $options: "i" },
    }).limit(10);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error searching catalog" });
  }
};
