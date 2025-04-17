const MatchingModel = require("../models/matchingModel");

class MatchingService {
  // Haversine formula to calculate distance
  static haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static async findBestSellerForUser(userId, criteria) {
    // Fetch the current user's location
    const buyer = await MatchingModel.fetchBuyerById(userId);

    if (!buyer) {
      throw new Error("User not found");
    }

    // Fetch all sellers matching the category and UOM
    const sellers = await MatchingModel.fetchSellers(criteria);

    // Filter sellers based on hard constraints
    const filteredSellers = sellers.filter((seller) => {
      const distance = this.haversine(
        buyer.latitude,
        buyer.longitude,
        seller.latitude,
        seller.longitude
      );
      return (
        seller.price_per_unit <= criteria.price && // Within price limit
        distance <= criteria.proximity && // Within proximity limit
        seller.available_quantity >= criteria.quantity // Sufficient stock
      );
    });

    // If no sellers match, return null
    if (filteredSellers.length === 0) {
      return null;
    }

    // Calculate scores for remaining sellers
    const scoredSellers = filteredSellers.map((seller) => {
      const distance = this.haversine(
        buyer.latitude,
        buyer.longitude,
        seller.latitude,
        seller.longitude
      );

      const proximityScore = 1 - Math.min(distance / criteria.proximity, 1);
      const priceScore =
        1 - Math.min(Number(seller.price_per_unit) / criteria.price, 1); // Ensure number
      const quantityScore = Math.min(
        seller.available_quantity / criteria.quantity,
        1
      );

      const totalScore =
        proximityScore * 0.4 + priceScore * 0.3 + quantityScore * 0.3;

      return { ...seller, totalScore };
    });

    // Find the best seller based on the total score
    const bestSeller = scoredSellers.sort(
      (a, b) => b.totalScore - a.totalScore
    )[0];
    console.log("Best Seller:", bestSeller);

    return {
      name: bestSeller.product_name,
      pricePerUnit: Number(bestSeller.price_per_unit).toFixed(2),
      availableQuantity: bestSeller.available_quantity,
      category: bestSeller.category,
      uom: bestSeller.uom,
      latitude: bestSeller.latitude,
      longitude: bestSeller.longitude,
      totalScore: bestSeller.totalScore.toFixed(2),
      farm_address: bestSeller.farm_address || null,
    };
  }
}

module.exports = MatchingService;
