const AdminModel = require('../models/adminModel');

class AdminService {
  static async getDashboardData() {
    const [totalUsers, totalProducts, totalOrders, bestSellingProducts] = await Promise.all([
      AdminModel.getTotalUsers(),
      AdminModel.getTotalProducts(),
      AdminModel.getTotalOrders(),
      AdminModel.getBestSellingProducts(5), // Top 5 best-sellers
    ]);
    return { totalUsers, totalProducts, totalOrders, bestSellingProducts };
  }

  static async getAllUsers() {
    return await AdminModel.fetchAllUsers();
  }

  static async getAllSellers() {
    return await AdminModel.fetchAllSellers();
  }

  static async getAdminProfile(adminId) {
    return await AdminModel.getAdminById(adminId);
  }

  static async updateAdminProfile(adminId, profileData) {
    return await AdminModel.updateAdminProfile(adminId, profileData);
  }
}

module.exports = AdminService;