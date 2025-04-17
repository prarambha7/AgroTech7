const AdminService = require('../services/adminService');

const getDashboard = async (req, res) => {
  try {
    const dashboardData = await AdminService.getDashboardData();

    res.json({
      message: 'Admin dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
    try {
      const users = await AdminService.getAllUsers();
      res.json({ message: 'Users fetched successfully', data: users });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  const getAllSellers = async (req, res) => {
    try {
      const sellers = await AdminService.getAllSellers();
      res.json({ message: 'Sellers fetched successfully', data: sellers });
    } catch (error) {
      console.error('Error fetching sellers:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  const getProfile = async (req, res) => {
    try {
      const profile = await AdminService.getAdminProfile(req.user.id);
      if (!profile) return res.status(404).json({ success: false, message: 'Admin not found' });
      res.json({ message: 'Profile fetched successfully', data: profile });
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  
  const updateProfile = async (req, res) => {
    try {
      const updatedProfile = await AdminService.updateAdminProfile(req.user.id, req.body);
      res.json({ message: 'Profile updated successfully', data: updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

module.exports = {
  getDashboard,
  getAllUsers,
  getAllSellers,
  getProfile,
  updateProfile,
};
