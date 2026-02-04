const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const RefreshToken = require("../models/RefreshToken");
const asyncHandler = require("../middleware/asyncHandler");

const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "supersecretkey_change_me",
    {
      expiresIn: "15m",
    },
  );
};

const generateRefreshToken = async (adminId) => {
  const token = jwt.sign(
    { id: adminId },
    process.env.JWT_REFRESH_SECRET || "refresh_secret_key",
    {
      expiresIn: "7d",
    },
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    adminId,
    token,
    expiresAt,
  });

  return token;
};

// @desc    Register a new admin
// @route   POST /api/admin/signup
exports.registerAdmin = asyncHandler(async (req, res) => {
  const {
    restaurantName,
    panNumber,
    paymentTypes,
    contactInfo,
    address,
    logo,
    email,
    password,
  } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists with this email");
  }

  const admin = await Admin.create({
    restaurantName,
    panNumber,
    paymentTypes,
    contactInfo,
    address,
    logo,
    email,
    password,
  });

  if (admin) {
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = await generateRefreshToken(admin._id);

    res.status(201).json({
      _id: admin._id,
      restaurantName: admin.restaurantName,
      email: admin.email,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400);
    throw new Error("Invalid admin data received");
  }
});

// @desc    Auth admin & get token
// @route   POST /api/admin/login
exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = await generateRefreshToken(admin._id);

    res.json({
      _id: admin._id,
      restaurantName: admin.restaurantName,
      email: admin.email,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
exports.getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    res.json(admin);
  } else {
    res.status(404);
    throw new Error("Admin not found");
  }
});

// @desc    Update admin profile
// @route   PUT /api/admin/profile/update
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    admin.restaurantName = req.body.restaurantName || admin.restaurantName;
    admin.panNumber = req.body.panNumber || admin.panNumber;
    admin.paymentTypes = req.body.paymentTypes || admin.paymentTypes;
    admin.contactInfo = req.body.contactInfo || admin.contactInfo;
    admin.address = req.body.address || admin.address;
    admin.logo = req.body.logo || admin.logo;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    const accessToken = generateAccessToken(updatedAdmin._id);
    const refreshToken = await generateRefreshToken(updatedAdmin._id);

    res.json({
      _id: updatedAdmin._id,
      restaurantName: updatedAdmin.restaurantName,
      email: updatedAdmin.email,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(404);
    throw new Error("Admin not found");
  }
});

// @desc    Refresh access token
// @route   POST /api/admin/refresh
exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh_secret_key",
    );
    const adminId = decoded.id;

    // Delete the used refresh token (Rotation)
    await RefreshToken.deleteOne({ _id: storedToken._id });

    // Generate new pair
    const newAccessToken = generateAccessToken(adminId);
    const newRefreshToken = await generateRefreshToken(adminId);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid refresh token");
  }
});

// @desc    Logout admin
// @route   POST /api/admin/logout
exports.logoutAdmin = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.json({ message: "Logged out successfully" });
});
