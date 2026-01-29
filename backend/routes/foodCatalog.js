const express = require("express");
const router = express.Router();
const {
  getCatalogItems,
  searchCatalog,
} = require("../controllers/foodCatalogController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getCatalogItems);
router.get("/search", protect, searchCatalog);

module.exports = router;
