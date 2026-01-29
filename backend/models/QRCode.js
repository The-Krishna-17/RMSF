const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    tableNumber: { type: String, required: true },
    type: { type: String, enum: ["Table", "Room", "Cabin"], default: "Table" },
    qrData: { type: String, required: true }, // The URL or ID encrypted in the QR
    qrImage: { type: String }, // Base64 or path
  },
  { timestamps: true },
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
