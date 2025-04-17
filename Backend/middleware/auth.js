const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
      const token = authHeader.split(" ")[1]; // Extract the token after "Bearer "
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token

      // Fetch the user details from the database
      const user = await userModel.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if the role is allowed
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user; // Attach the full user object to the request
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error("Error verifying token:", err.message);
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = auth;
