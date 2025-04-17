// controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');

const fetchRecommendations = async (req, res) => {
  const userId = req.user.id; // Assuming user is authenticated
  try {
    const recommendations = await recommendationService.getRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
    });
  }
};

module.exports = { fetchRecommendations };
