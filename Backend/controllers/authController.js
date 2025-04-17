const axios = require("axios");
const authService = require("../services/authService");
const addressService = require("../services/addressService");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const getCoordinates = async (address, district, province) => {
  const apiKey = "9dc03f517cb14604af8f9256dbf32cf8"; 
  const query = `${address}, ${district}, ${province}, Nepal`;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    query
  )}&key=${apiKey}&countrycode=np&limit=5`;

  try {
    console.log("Geocoding Request URL:", url);
    const response = await axios.get(url);

    if (
      response.data.status.code !== 200 ||
      response.data.results.length === 0
    ) {
      throw new Error(
        "Failed to fetch coordinates. Address, district, or province not found."
      );
    }

    // Find the best match
    const bestMatch = response.data.results[0]; // Always take the first result

    return {
      latitude: bestMatch.geometry.lat,
      longitude: bestMatch.geometry.lng,
      formattedAddress: bestMatch.formatted,
      confidence: bestMatch.confidence,
    };
  } catch (error) {
    console.error("Geocoding API Error:", error.message);
    throw new Error(
      "Failed to fetch coordinates. Please check the address, district, and province."
    );
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      provinceId,
      districtId,
      phoneNumber,
      address,
      dateOfBirth,
    } = req.body;

    // Validate province and district combination
    if (!provinceId || !districtId) {
      return res.status(400).json({
        success: false,
        message: "Province and district are required.",
      });
    }
    await addressService.validateProvinceAndDistrict(provinceId, districtId);

    // Fetch district and province names from IDs
    const districtName = await authService.getDistrictNameById(districtId);
    const provinceName = await authService.getProvinceNameById(provinceId);

    // Fetch latitude and longitude based on address, district, and province
    const { latitude, longitude, formattedAddress, confidence } =
      await getCoordinates(address, districtName, provinceName);

    console.log(
      `Geocoded Location: ${formattedAddress} (Confidence: ${confidence})`
    );

    const newUser = await authService.registerUser({
      fullName,
      email,
      password,
      provinceId,
      districtId,
      phoneNumber,
      address,
      dateOfBirth, // Pass the date of birth
      latitude,
      longitude,
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    if (err.message.includes("already exists")) {
      res.status(400).json({ success: false, message: "User already exists" });
    } else if (err.message.includes("Invalid province-district combination")) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

const registerSeller = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      provinceId,
      districtId,
      phoneNumber,
      farm_name,
      farm_address,
      address,
      dateOfBirth,
    } = req.body;

    // Validate province and district combination
    if (!provinceId || !districtId) {
      return res.status(400).json({
        success: false,
        message: "Province and district are required.",
      });
    }
    await addressService.validateProvinceAndDistrict(provinceId, districtId);

    // Fetch district and province names from IDs
    const districtName = await authService.getDistrictNameById(districtId);
    const provinceName = await authService.getProvinceNameById(provinceId);

    // Fetch latitude and longitude based on address, district, and province
    const { latitude, longitude, formattedAddress, confidence } =
      await getCoordinates(address, districtName, provinceName);

    console.log(
      `Geocoded Location: ${formattedAddress} (Confidence: ${confidence})`
    );

    const newSeller = await authService.registerSeller({
      fullName,
      email,
      password,
      provinceId,
      districtId,
      phoneNumber,
      address,
      farm_name,
      farm_address,
      dateOfBirth, // Pass the date of birth
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: "Seller registered successfully",
      data: newSeller,
    });
  } catch (err) {
    console.error("Error registering seller:", err.message);
    if (err.message.includes("already exists")) {
      res
        .status(400)
        .json({ success: false, message: "Seller already exists" });
    } else if (err.message.includes("Invalid province-district combination")) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

const registerAdmin = async (req, res) => {
  try {
    const newAdmin = await authService.registerAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: newAdmin,
    });
  } catch (err) {
    console.error("Error registering admin:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const token = await authService.login(req.body.email, req.body.password);

    res.status(200).json({ success: true, ...token });
  } catch (err) {
    console.error("Error logging in:", err.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("Error in forgot password:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in reset password:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated token
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new passwords are required",
      });
    }

    // Fetch user from the database
    const user = await userModel.findUserById(userId);
    console.log("Just hit the change password route");

    console.log(user.full_name);
    console.log(user);
    console.log("Ended password route");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await userModel.updatePassword(userId, hashedPassword);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerUser,
  registerSeller,
  registerAdmin,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
