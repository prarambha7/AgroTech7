const SellerModel = require("../models/sellerModel");
const OrdersModel = require("../models/ordersModel");

class SellerService {
  static async getDashboardData(sellerId) {
    try {
      const [
        totalSales,
        totalOrders,
        totalProducts,
        lowStockProducts,
        topSellingProducts,
        latestOrders,
      ] = await Promise.all([
        SellerModel.getTotalSales(sellerId),
        SellerModel.getTotalOrders(sellerId),
        SellerModel.getTotalProducts(sellerId),
        SellerModel.getLowStockProducts(sellerId, 3), // Fetch top 3 low-stock products
        SellerModel.getTopSellingProducts(sellerId, 3), // Fetch top 3 selling products
        OrdersModel.fetchLatestSellerOrders(sellerId, 6), // Fetch latest 6 orders
      ]);

      return {
        totalSales,
        totalOrders,
        totalProducts,
        lowStockProducts,
        topSellingProducts, 
        latestOrders, 
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
      throw new Error("Failed to fetch dashboard data");
    }
  }
  //lowstockproducts
  static async getLowStockProducts(sellerId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [products, totalCount] = await Promise.all([
        SellerModel.getLowStockProducts(sellerId, limit, offset),
        SellerModel.getLowStockProductsCount(sellerId),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products,
        meta: {
          totalCount,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching low stock products:", error.message);
      throw new Error("Failed to fetch low stock products");
    }
  }
  //topsellingproducts
  static async getTopSellingProducts(sellerId, limit = 3) {
    try {
      return await SellerModel.getTopSellingProducts(sellerId, limit);
    } catch (error) {
      console.error("Error fetching top selling products:", error.message);
      throw new Error("Failed to fetch top selling products");
    }
  }
  //getprofile
  static async getProfile(sellerId) {
    if (!sellerId) {
      throw new Error("Seller not found");
    }
    return await SellerModel.getSellerById(sellerId);
  }
  //Updateprofile
  static async updateProfile(sellerId, profileData) {
    return await SellerModel.updateSellerProfile(sellerId, profileData);
  }
  //getuserid for nearby seller
  static async getUserById(userId) {
    try {
      return await SellerModel.getUserById(userId); // Fetch user details by ID
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      throw new Error("Failed to fetch user details");
    }
  }
  //NearbySeller
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (degree) => (degree * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  static async getNearbySellers(userId, radius = 100) {
    try {
      // Fetch user details (latitude and longitude)
      const user = await SellerModel.getUserById(userId);
      if (!user || !user.latitude || !user.longitude) {
        throw new Error("User location is not available");
      }

      const userLatitude = user.latitude;
      const userLongitude = user.longitude;

      // Fetch all sellers
      const sellers = await SellerModel.fetchAllSellersWithCoordinates();

      // Filter sellers within the radius
      const nearbySellers = sellers.filter((seller) => {
        if (!seller.latitude || !seller.longitude) return false;
        const distance = SellerService.calculateDistance(
          userLatitude,
          userLongitude,
          seller.latitude,
          seller.longitude
        );
        return distance <= radius;
      });

      // Sort by distance
      nearbySellers.sort((a, b) => {
        const distanceA = SellerService.calculateDistance(
          userLatitude,
          userLongitude,
          a.latitude,
          a.longitude
        );
        const distanceB = SellerService.calculateDistance(
          userLatitude,
          userLongitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });

      return nearbySellers;
    } catch (error) {
      console.error("Error in getNearbySellers:", error.message);
      throw new Error("Failed to get nearby sellers");
    }
  }
}

module.exports = SellerService;
