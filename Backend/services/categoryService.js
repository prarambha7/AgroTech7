const categoryModel = require('../models/categoryModel');

const getAllCategoriesWithUOM = async () => {
  return await categoryModel.fetchCategoriesWithUOM();
};

module.exports = {
  getAllCategoriesWithUOM,
};
