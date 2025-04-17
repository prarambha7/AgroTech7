const BuyerModel = require('../models/buyerModel');

class BuyerService {
  static async getProfile(userId) {
    const user = await BuyerModel.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateProfile(userId, profileData) {
    return await BuyerModel.updateUserProfile(userId, profileData);
  }
}

module.exports = BuyerService;
