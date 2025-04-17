const { preprocessText } = require('../utils/textHelper');
const { generateTFIDFVectors, calculateCosineSimilarity } = require('../utils/vectorHelper');
const recommendationModel = require('../models/recommendationModel');
const { fetchProductById } = require('../services/productService');

const getRecommendations = async (userId, limit = 6) => {
  try {
    const userProducts = await recommendationModel.getUserInteractedProducts(userId);
    const allProducts = await recommendationModel.getAllProducts();

    if (!userProducts.length) return [];

    const allDescriptions = allProducts.map((p) => preprocessText(p.description || '').join(' '));
    const tfIdfVectors = generateTFIDFVectors(allDescriptions);

    const recommendations = [];
    userProducts.forEach((userProduct) => {
      const userIndex = allProducts.findIndex((p) => p.id === userProduct.id);
      if (userIndex === -1) return;

      const userVector = tfIdfVectors[userIndex];
      allProducts.forEach((product, index) => {
        if (product.id !== userProduct.id) {
          const descriptionSimilarity = calculateCosineSimilarity(userVector, tfIdfVectors[index]);
          const categorySimilarity = userProduct.category_id === product.category_id ? 1 : 0;

          const finalScore = (0.6 * descriptionSimilarity) + (0.4 * categorySimilarity);

          recommendations.push({
            ...product,
            descriptionSimilarity,
            categorySimilarity,
            finalScore,
          });
        }
      });
    });

    const sortedRecommendations = recommendations
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    const enrichedRecommendations = await Promise.all(
      sortedRecommendations.map(async (product) => {
        const productDetails = await fetchProductById(product.id);
        return {
          ...productDetails,
          descriptionSimilarity: product.descriptionSimilarity,
          categorySimilarity: product.categorySimilarity,
          finalScore: product.finalScore,
        };
      })
    );

    return enrichedRecommendations;
  } catch (err) {
    console.error('Error in recommendation logic:', err.message);
    throw err;
  }
};

module.exports = { getRecommendations };
