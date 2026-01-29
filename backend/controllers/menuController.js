const MenuItem = require("../models/MenuItem");

// @desc    Add a menu item
// @route   POST /api/menu
exports.addMenuItem = async (req, res) => {
  const { name, price, image, category, description, vegType } = req.body;

  const menuItem = new MenuItem({
    adminId: req.admin._id,
    name,
    price,
    image,
    category,
    description,
    vegType,
  });

  const createdItem = await menuItem.save();
  res.status(201).json(createdItem);
};

// @desc    Get all menu items
// @route   GET /api/menu
exports.getMenuItems = async (req, res) => {
  const items = await MenuItem.find({ adminId: req.admin._id });
  res.json(items);
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
exports.updateMenuItem = async (req, res) => {
  const { name, price, image, category } = req.body;

  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    if (menuItem.adminId.toString() !== req.admin._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    menuItem.name = name || menuItem.name;
    menuItem.price = price || menuItem.price;
    menuItem.image = image || menuItem.image;
    menuItem.category = category || menuItem.category;
    menuItem.description = description || menuItem.description;
    menuItem.vegType = vegType || menuItem.vegType;

    const updatedItem = await menuItem.save();
    res.json(updatedItem);
  } else {
    res.status(404).json({ message: "Menu item not found" });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
exports.deleteMenuItem = async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    if (menuItem.adminId.toString() !== req.admin._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item removed" });
  } else {
    res.status(404).json({ message: "Menu item not found" });
  }
};
// @desc    Get all menu items for public view
// @route   GET /api/menu/public/:adminId
exports.getPublicMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ adminId: req.params.adminId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu" });
  }
};
// @desc    Bulk add menu items
// @route   POST /api/menu/bulk
exports.bulkAddMenuItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items data" });
    }

    const itemsWithAdmin = items.map((item) => ({
      ...item,
      adminId: req.admin._id,
    }));

    const createdItems = await MenuItem.insertMany(itemsWithAdmin);
    res.status(201).json(createdItems);
  } catch (error) {
    console.error("Bulk Import Error:", error);
    res
      .status(500)
      .json({ message: "Error importing menu items", error: error.message });
  }
};

// @desc    Bulk add menu items from catalog
// @route   POST /api/menu/bulk-add
exports.bulkAddFromCatalog = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items data" });
    }

    const itemsToInsert = items.map((item) => ({
      adminId: req.admin._id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      description: item.description || "",
      vegType: item.vegType || "Veg",
    }));

    const createdItems = await MenuItem.insertMany(itemsToInsert);
    res.status(201).json(createdItems);
  } catch (error) {
    console.error("Bulk Add Error:", error);
    res.status(500).json({ message: "Error adding items to menu" });
  }
};
