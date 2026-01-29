const QRCode = require("qrcode");
const QRCodeModel = require("../models/QRCode");

// @desc    Generate unique QR codes per table/cabin
// @route   POST /api/qr/generate
exports.generateQR = async (req, res) => {
  const { tableNumber, type } = req.body;

  // Check if QR already exists for this table
  const existing = await QRCodeModel.findOne({
    adminId: req.admin._id,
    tableNumber,
  });
  if (existing) {
    return res
      .status(400)
      .json({ message: `QR already exists for ${type} ${tableNumber}` });
  }

  // Data to embed in QR (pointing to the web digital menu)
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const qrData = `${frontendUrl}/order/${req.admin._id}/${tableNumber}`;

  try {
    const qrImage = await QRCode.toDataURL(qrData);

    const newQR = await QRCodeModel.create({
      adminId: req.admin._id,
      tableNumber,
      type,
      qrData,
      qrImage,
    });

    res.status(201).json(newQR);
  } catch (error) {
    res.status(500).json({ message: "Error generating QR code" });
  }
};

// @desc    Get all QR codes
// @route   GET /api/qr
exports.getQRCodes = async (req, res) => {
  const qrs = await QRCodeModel.find({ adminId: req.admin._id });
  res.json(qrs);
};

// @desc    Delete a QR code
// @route   DELETE /api/qr/:id
exports.deleteQR = async (req, res) => {
  try {
    const qr = await QRCodeModel.findOneAndDelete({
      _id: req.params.id,
      adminId: req.admin._id,
    });

    if (!qr) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    res.json({ message: "QR Code deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting QR code" });
  }
};
