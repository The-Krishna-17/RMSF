const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  refreshAccessToken,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../validators/auth");

router.post("/signup", validate(signupSchema), registerAdmin);
router.post("/login", validate(loginSchema), loginAdmin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutAdmin);
router.route("/profile").get(protect, getAdminProfile);
router.route("/profile/update").put(protect, updateAdminProfile);

module.exports = router;
