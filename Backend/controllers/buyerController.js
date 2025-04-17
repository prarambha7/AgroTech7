const BuyerService = require('../services/buyerService');

// Fetch User Profile
const getProfile = async (req, res) => {
  try {
    const user = await BuyerService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, address } = req.body;
    const updatedUser = await BuyerService.updateProfile(req.user.id, { fullName, email, phoneNumber, address });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user profile' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
