const ratingsModel = require('../models/ratingsModel');

// Add a new rating
const addRating = async (ratingData) => {
    return await ratingsModel.addRating(ratingData);
};

// Fetch ratings for a product
const fetchProductRatings = async (product_id) => {
    return await ratingsModel.fetchProductRatings(product_id);
};

// Fetch all ratings for a product
const fetchRatingsByProduct = async (product_id) => {
    return await ratingsModel.fetchRatingsByProduct(product_id);
};

module.exports = {
    addRating,
    fetchProductRatings,
    fetchRatingsByProduct,
};
