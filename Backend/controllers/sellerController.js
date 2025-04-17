const SellerService = require('../services/sellerService');

const getDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id; 
    const dashboardData = await SellerService.getDashboardData(sellerId);

    res.json({
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Low Stock Products
const getLowStockProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; 

    const { products, meta } = await SellerService.getLowStockProducts(sellerId, page, limit);

    res.json({
      message: 'Low stock products fetched successfully',
      data: products,
      meta, // Include pagination metadata
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get Seller Profile
const getProfile = async (req, res) => {
  try {
    const seller = await SellerService.getProfile(req.user.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json(seller);
  } catch (err) {
    console.error('Error fetching seller profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Seller Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address } = req.body;
    const updatedProfile = await SellerService.updateProfile(req.user.id, { fullName, email, phoneNumber, address });
    res.json(updatedProfile);
  } catch (err) {
    console.error('Error updating seller profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
//nearby sellers
const fetchNearbySellers = async (req, res) => {
  try {
    const userId = req.user.id; 

    // Fetch user's location from the database
    const user = await SellerService.getUserById(userId);
    if (!user || !user.latitude || !user.longitude) {
      return res.status(400).json({
        success: false,
        message: 'User location is not available',
      });
    }

    // Fetch nearby sellers with distance included
    const sellers = await SellerService.getNearbySellers(userId, 100);

    // Add distance field to the response
    const sellersWithDistance = sellers.map((seller) => {
      const distance = SellerService.calculateDistance(
        user.latitude,
        user.longitude,
        seller.latitude,
        seller.longitude
      );
      return { ...seller, distance };
    });

    res.status(200).json({
      success: true,
      message: 'Nearby sellers fetched successfully.',
      data: sellersWithDistance,
    });
  } catch (error) {
    console.error('Error fetching nearby sellers:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getLowStockProducts,
  fetchNearbySellers,
};
