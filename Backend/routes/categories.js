const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Fetch all categories with UOMs
router.get('/', categoryController.fetchCategoriesWithUOM);

module.exports = router;
