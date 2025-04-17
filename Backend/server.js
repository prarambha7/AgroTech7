const express = require("express");
const http = require("http"); // Required for creating an HTTP server
const { Server } = require("socket.io"); // Socket.IO library
const cors = require("cors");
const client = require("./db"); // PostgreSQL connection
require("dotenv").config();
const axios = require("axios");
const CryptoJS = require("crypto-js");
const app = express();
// Create HTTP server for Socket.IO integration
const server = http.createServer(app);

// Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Attach the Socket.IO instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import and pass the io instance to models and routes
const notificationModel = require("./models/notificationsModel");
const notificationRoutes = require("./routes/notifications");

// Routes
app.use("/api/auth", require("./routes/auth")); // Authentication Routes
app.use("/api/products", require("./routes/products")); // Product Routes (filtered for seller-specific data)
app.use("/api/buyer", require("./routes/buyer"));
app.use("/api/seller", require("./routes/seller")); // Seller Routes (dashboard, profile, and product management)
app.use("/api/recommendations", require("./routes/recommendation")); // Recommendation Routes
app.use("/api/orders", require("./routes/orders")); // Orders Route (for placing, viewing, and managing orders)
app.use("/api/notifications", notificationRoutes); // Notifications Route
app.use("/api/match", require("./routes/matching"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/address", require("./routes/address"));

// Proxy route for eSewa payment
app.post("/api/initiate-payment", async (req, res) => {
  try {
    var hash = CryptoJS.HmacSHA256("Message", "secret");
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

    const response = await axios.post(
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      { ...req.body, signature: hashInBase64 },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data); // Forward the response back to the frontend
  } catch (error) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      message: "Failed to initiate payment",
      error: error.response?.data || error.message,
    });
  }
});
// Example Route
app.get("/", (req, res) => {
  res.send("Welcome to the B2B Agro E-commerce platform");
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io }; // Export io instance for use in other modules
