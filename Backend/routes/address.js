const express = require('express');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Route to get all provinces
router.get('/provinces', addressController.getProvinces);

// Route to get districts for a given province
router.get('/districts', addressController.getDistricts);

// Route to validate province-district combination (optional)
router.post('/validate', addressController.validateAddress);

module.exports = router;
