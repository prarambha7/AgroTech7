const addressModel = require('../models/addressModel');

// Get all provinces
const getProvinces = async () => {
  return await addressModel.fetchProvinces();
};

// Get districts for a given province
const getDistrictsByProvince = async (provinceId) => {
  if (!provinceId) {
    throw new Error('Province ID is required');
  }
  return await addressModel.fetchDistrictsByProvince(provinceId);
};

// Validate province-district combination
const validateProvinceAndDistrict = async (provinceId, districtId) => {
  if (!provinceId || !districtId) {
    throw new Error('Province and District are required');
  }
  const isValid = await addressModel.validateProvinceDistrict(provinceId, districtId);
  if (!isValid) {
    throw new Error('Invalid province-district combination');
  }
  return true;
};

module.exports = {
  getProvinces,
  getDistrictsByProvince,
  validateProvinceAndDistrict,
};
