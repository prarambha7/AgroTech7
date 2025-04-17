const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const userModel = require("../models/userModel");
const addressService = require("../services/addressService");
const client = require("../db"); // For province-district validation

const registerUser = async (data) => {
  data.role = "user";

  // Validate province and district combination
  const { provinceId, districtId } = data;
  await addressService.validateProvinceAndDistrict(provinceId, districtId);

  return register(data);
};

const registerSeller = async (data) => {
  data.role = "seller";

  // Validate province and district combination
  const { provinceId, districtId } = data;
  await addressService.validateProvinceAndDistrict(provinceId, districtId);

  return register(data);
};

const registerAdmin = async (data) => {
  data.role = "admin";
  return register(data);
};

const register = async (data) => {
  const { email, password, address, dateOfBirth } = data;

  // Check if the user already exists
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Geocode the address to get latitude and longitude
  const { latitude, longitude } = await getCoordinates(address);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Register the user in the database
  return userModel.registerUser({
    ...data,
    password: hashedPassword,
    dateOfBirth,
    latitude,
    longitude,
  });
};
const getDistrictNameById = async (districtId) => {
  const query = "SELECT name FROM districts WHERE id = $1";
  const result = await client.query(query, [districtId]);
  if (result.rows.length === 0) {
    throw new Error(`District with ID ${districtId} not found.`);
  }
  return result.rows[0].name;
};

// Get province name by ID
const getProvinceNameById = async (provinceId) => {
  const query = "SELECT name FROM provinces WHERE id = $1";
  const result = await client.query(query, [provinceId]);
  if (result.rows.length === 0) {
    throw new Error(`Province with ID ${provinceId} not found.`);
  }
  return result.rows[0].name;
};

// Validate province and district combination
const validateProvinceAndDistrict = async (provinceId, districtId) => {
  const query = `
    SELECT 1
    FROM districts
    WHERE id = $1 AND province_id = $2
  `;
  const result = await client.query(query, [districtId, provinceId]);
  if (result.rows.length === 0) {
    throw new Error("Invalid province-district combination");
  }
};

const getCoordinates = async (address, district, province) => {
  const apiKey = "9dc03f517cb14604af8f9256dbf32cf8"; 
  const query = `${address}, ${district}, ${province}, Nepal`;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    query
  )}&key=${apiKey}&countrycode=np&limit=5`;

  try {
    console.log("Geocoding Request URL:", url); // Debugging log
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

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);

  // Validate email and password
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "100h" }
  );
  // Generate JWT token
  return {
    token: token,
    role: user.role,
    name: user.full_name,
    email: user.email,
    phone: user.phone_number,
    id: user.id,
  };
};

const forgotPassword = async (email) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  console.log("Reset token:", resetToken);
};

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(decoded.id, hashedPassword);
};

module.exports = {
  registerUser,
  getDistrictNameById,
  getProvinceNameById,
  validateProvinceAndDistrict,
  registerSeller,
  registerAdmin,
  login,
  forgotPassword,
  resetPassword,
};
