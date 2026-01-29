const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/admin");
const menuRoutes = require("./routes/menu");
const qrRoutes = require("./routes/qr");
const orderRoutes = require("./routes/order");
const foodCatalogRoutes = require("./routes/foodCatalog");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/food-catalog", foodCatalogRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
