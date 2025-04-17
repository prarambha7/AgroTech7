const ratingsService = require("../services/ratingsService");

// Add a new rating
const addRating = async (req, res) => {
  const { product_id, rating, review } = req.body;
  const user_id = req.user.id; // Assume authenticated user
  console.log(req.body);
  try {
    const newRating = await ratingsService.addRating({
      product_id,
      user_id,
      rating,
      review,
    });
    res.status(201).json({ success: true, data: newRating });
  } catch (err) {
    console.error("Error adding rating:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch product ratings
const fetchProductRatings = async (req, res) => {
  const product_id = req.params.productId;

  try {
    const ratings = await ratingsService.fetchProductRatings(product_id);
    res.status(200).json({ success: true, data: ratings });
  } catch (err) {
    console.error("Error fetching product ratings:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all ratings for a product
const fetchRatingsByProduct = async (req, res) => {
  const product_id = req.params.productId;

  try {
    const ratings = await ratingsService.fetchRatingsByProduct(product_id);
    res.status(200).json({ success: true, data: ratings });
  } catch (err) {
    console.error("Error fetching all ratings:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addRating,
  fetchProductRatings,
  fetchRatingsByProduct,
};
