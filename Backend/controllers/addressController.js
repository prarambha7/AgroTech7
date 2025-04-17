const addressService = require('../services/addressService');

// Controller to get all provinces
const getProvinces = async (req, res) => {
  try {
    const provinces = await addressService.getProvinces();
    res.status(200).json(provinces);
  } catch (error) {
    console.error('Error fetching provinces:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get districts for a given province
const getDistricts = async (req, res) => {
  const { provinceId } = req.query;

  try {
    const districts = await addressService.getDistrictsByProvince(provinceId);
    res.status(200).json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// Controller to validate province-district combination (optional)
const validateAddress = async (req, res) => {
  const { provinceId, districtId } = req.body;

  try {
    await addressService.validateProvinceAndDistrict(provinceId, districtId);
    res.status(200).json({ success: true, message: 'Valid address' });
  } catch (error) {
    console.error('Error validating address:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  validateAddress,
};
