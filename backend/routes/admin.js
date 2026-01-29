const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");

router.post("/signup", registerAdmin);
router.post("/login", loginAdmin);
router.route("/profile").get(protect, getAdminProfile);
router.route("/profile/update").put(protect, updateAdminProfile);

module.exports = router;
