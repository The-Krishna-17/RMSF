const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
    res.status(201).json({
      _id: admin._id,
      restaurantName: admin.restaurantName,
      email: admin.email,
      token: generateToken(admin._id),
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
    res.json({
      _id: admin._id,
      restaurantName: admin.restaurantName,
      email: admin.email,
      token: generateToken(admin._id),
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

    res.json({
      _id: updatedAdmin._id,
      restaurantName: updatedAdmin.restaurantName,
      email: updatedAdmin.email,
      token: generateToken(updatedAdmin._id),
    });
  } else {
    res.status(404);
    throw new Error("Admin not found");
  }
});
