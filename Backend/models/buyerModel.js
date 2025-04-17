const client = require('../db');

// Fetch user profile by user ID
const getUserById = async (userId) => {
  const query = `
    SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.phone_number, 
        u.address, 
        u.province_id, 
        u.district_id,
        p.name AS province_name,
        d.name AS district_name
    FROM users u
    LEFT JOIN provinces p ON u.province_id = p.id
    LEFT JOIN districts d ON u.district_id = d.id
    WHERE u.id = $1 AND u.role = 'user';
  `;
  const result = await client.query(query, [userId]);
  return result.rows[0];
};

// Update user profile
const updateUserProfile = async (userId, { fullName, email, phoneNumber, address }) => {
  const query = `
    UPDATE users 
    SET full_name = $1, email = $2, phone_number = $3, address = $4
    WHERE id = $5 AND role = 'user'
    RETURNING id, full_name, email, phone_number, address;
  `;
  const values = [fullName, email, phoneNumber, address, userId];
  const result = await client.query(query, values);
  return result.rows[0];
};

module.exports = {
  getUserById,
  updateUserProfile,
};
