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

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
