const categoryService = require('../services/categoryService');

const fetchCategoriesWithUOM = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategoriesWithUOM();
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  fetchCategoriesWithUOM,
};
