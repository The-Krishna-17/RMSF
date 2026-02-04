const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supersecretkey_change_me",
      );
      console.log("Token verified for admin ID:", decoded.id);
      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        console.warn("Admin not found in DB for ID:", decoded.id);
        return res
          .status(401)
          .json({ message: "Not authorized, admin not found" });
      }
      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  console.warn("No Authorization header provided");
  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };
