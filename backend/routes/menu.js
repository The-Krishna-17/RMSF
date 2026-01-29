const express = require("express");
const router = express.Router();
const {
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getPublicMenu,
  bulkAddMenuItems,
  bulkAddFromCatalog,
} = require("../controllers/menuController");
const { protect } = require("../middleware/auth");

router.route("/").post(protect, addMenuItem).get(protect, getMenuItems);
router.route("/bulk").post(protect, bulkAddMenuItems);
router.route("/bulk-add").post(protect, bulkAddFromCatalog);
router
  .route("/:id")
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

router.get("/public/:adminId", getPublicMenu);

module.exports = router;
