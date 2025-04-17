const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const AdminController = require("../controllers/adminController");

// Admin Dashboard Route
router.get(
  "/admin-dashboard",
  auth(["admin", "super admin"]),
  AdminController.getDashboard
);

// View All Users
router.get(
  "/users",
  auth(["admin", "super admin"]),
  AdminController.getAllUsers
);

// View All Sellers
router.get(
  "/sellers",
  auth(["admin", "super admin"]),
  AdminController.getAllSellers
);

// Admin Profile Routes
router.get(
  "/profile",
  auth(["admin", "super admin"]),
  AdminController.getProfile
);
router.put(
  "/profile",
  auth(["admin", "super admin"]),
  AdminController.updateProfile
);

module.exports = router;
