const express = require("express");
const { check, validationResult } = require("express-validator");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Registration Routes
router.post(
  "/register/user",
  [
    check("fullName", "Full Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must meet security requirements")
      .isLength({ min: 8 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    check("phoneNumber", "Phone number must be valid").matches(/^\d{10,15}$/),
    check("provinceId", "Province ID is required").not().isEmpty(),
    check("districtId", "District ID is required").not().isEmpty(),
    check("address", "Address is required").not().isEmpty(),
  ],
  handleValidationErrors,
  authController.registerUser
);

router.post(
  "/register/seller",
  [
    check("fullName", "Full Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must meet security requirements")
      .isLength({ min: 8 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    check("phoneNumber", "Phone number must be valid").matches(/^\d{10,15}$/),
    check("provinceId", "Province ID is required").not().isEmpty(),
    check("districtId", "District ID is required").not().isEmpty(),
    check("address", "Address is required").not().isEmpty(),
    check("farm_name", "Farm name is required for sellers").not().isEmpty(),
    check("farm_address", "Farm address is required for sellers")
      .not()
      .isEmpty(),
  ],
  handleValidationErrors,
  authController.registerSeller
);

// Other Routes
router.post(
  "/register/admin",
  authMiddleware(["super admin"]),
  authController.registerAdmin
);
router.post(
  "/login",
  loginLimiter,
  [check("email").isEmail(), check("password").exists()],
  authController.login
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.put(
  "/change-password",
  authMiddleware(["user", "seller", "admin"]),
  authController.changePassword
);
module.exports = router;
