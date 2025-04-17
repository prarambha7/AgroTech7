const client = require('../db');

// Register a user
const registerUser = async ({ fullName, email, password, role, provinceId, districtId, phoneNumber, address, farm_name, farm_address, dateOfBirth, latitude, longitude }) => {
  const query = `
    INSERT INTO users (full_name, email, password, role, province_id, district_id, phone_number, address, farm_name, farm_address, date_of_birth, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, full_name, email, role, province_id, district_id, latitude, longitude;
  `;
  const values = [fullName, email, password, role, provinceId, districtId, phoneNumber, address, farm_name, farm_address, dateOfBirth, latitude, longitude];
  const result = await client.query(query, values);
  return result.rows[0];
};

// Find user by email
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await client.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await client.query(query, [userId]);
  return result.rows[0];
};


// Update user password
const updatePassword = async (userId, password) => {
  const query = 'UPDATE users SET password = $1 WHERE id = $2';
  await client.query(query, [password, userId]);
};


module.exports = {
  registerUser,
  findUserByEmail,
  updatePassword,
  findUserById,
};
