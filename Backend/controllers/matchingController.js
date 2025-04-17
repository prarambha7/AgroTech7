const MatchingService = require("../services/matchingService");

const matchSellersForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // Extract the current user's ID
    const { category, uom, quantity, price, proximity } = req.body;

    // Validate required fields
    if (!category || !uom || !quantity || !price || !proximity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Call the service to match the current user
    const seller = await MatchingService.findBestSellerForUser(userId, {
      category,
      uom,
      quantity,
      price,
      proximity,
    });

    // Respond with the matched seller

    res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.error("Error matching seller for user:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to find a matching seller" });
  }
};

module.exports = { matchSellersForCurrentUser };
