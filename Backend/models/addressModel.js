const client = require('../db'); // PostgreSQL connection

// Fetch all provinces
const fetchProvinces = async () => {
  const query = 'SELECT id, name FROM provinces ORDER BY name;';
  const result = await client.query(query);
  return result.rows;
};

// Fetch districts by province ID
const fetchDistrictsByProvince = async (provinceId) => {
  const query = `
    SELECT id, name
    FROM districts
    WHERE province_id = $1
    ORDER BY name;
  `;
  const result = await client.query(query, [provinceId]);
  return result.rows;
};

// Validate Province-District combination
const validateProvinceDistrict = async (provinceId, districtId) => {
  const query = `
    SELECT 1
    FROM districts
    WHERE id = $1 AND province_id = $2;
  `;
  const result = await client.query(query, [districtId, provinceId]);
  return result.rowCount > 0; // Returns true if valid, false otherwise
};

module.exports = {
  fetchProvinces,
  fetchDistrictsByProvince,
  validateProvinceDistrict,
};
