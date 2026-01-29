const express = require("express");
const router = express.Router();
const {
  generateQR,
  getQRCodes,
  deleteQR,
} = require("../controllers/qrController");
const { protect } = require("../middleware/auth");

router.route("/generate").post(protect, generateQR);
router.route("/").get(protect, getQRCodes);
router.route("/:id").delete(protect, deleteQR);

module.exports = router;
