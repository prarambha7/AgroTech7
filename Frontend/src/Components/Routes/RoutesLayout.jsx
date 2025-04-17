import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

// Components
import AdminDashboard from "../../Pages/Admin/AdminDashboard";
import { UserPage } from "../../Pages/Admin/UserPage";
import CartPage from "../../Pages/Buyer/CartPage";
import { FindMatchSeller } from "../../Pages/Buyer/FindMatchingSeller";
import { NearbySellersPage } from "../../Pages/Buyer/NearbySellersPage";
import MyOrdersPage from "../../Pages/Buyer/OrdersPage";
import ProductPage from "../../Pages/Buyer/ProductPage";
import Recommended from "../../Pages/Buyer/Recommended";
import { TopSellingPage } from "../../Pages/Buyer/TopSellingPage";
import BuyerProfile from "../../Pages/Buyer/UserPage";
import Dashboard from "../../Pages/LandingPage";
import PaymentSuccess from "../../Pages/PaymentSuccess";
import AddSellerProduct from "../../Pages/Seller/AddSellerProduct";
import SellerOrdersPage from "../../Pages/Seller/OrdersPage";
import SellerProfile from "../../Pages/Seller/SellerUserPage";
import { ShowLowStock } from "../../Pages/Seller/ShowLowStock";
import { ShowSellingProducts } from "../../Pages/Seller/ShowSellingProducts";
import SellerDashboard from "../SellerDashboard/SellerDashboard";
import AllNotifications from "../../Pages/AllNotifications";

// Mock Authentication
const isAuthenticated = () => {
  // Replace this with your actual authentication logic
  return localStorage.getItem("token") !== null;
};
const isSeller = () => {
  return localStorage.getItem("role") === "seller";
};
const isAdmin = () => {
  return (
    localStorage.getItem("role") === "super admin" ||
    localStorage.getItem("role") === "admin"
  );
};

// Protected Route Wrapper
const ProtectedRoute = () => {
  return isAuthenticated() && !isSeller() ? (
    <Outlet />
  ) : (
    <Navigate to="/products" />
  );
};

const AdminRoute = () => {
  return isAuthenticated() && isAdmin() ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

// Public Route Wrapper
const PublicRoute = () => {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};

const SellerRoute = () => {
  return isSeller() && isAuthenticated() ? (
    <Outlet />
  ) : (
    <Navigate to="/seller-dashboard" />
  );
};

export const RoutesLayout = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute />}>
        <Route index element={<Dashboard />} />
      </Route>
      {/* Admin Routes */}
      <Route path="/" element={<AdminRoute />}>
        <Route path="/users" element={<UserPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Route>{" "}
      <Route path="/" element={<SellerRoute />}>
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/showproducts" element={<ShowSellingProducts />} />
        <Route path="/lowstock" element={<ShowLowStock />} />

        <Route path="/addproduct" element={<AddSellerProduct />} />
        <Route path="/seller-orders" element={<SellerOrdersPage />} />
        <Route path="/user-detail" element={<SellerProfile />} />
      </Route>
       {/* Shared Routes for Both Buyers and Sellers */}
       <Route path="/all-notifications" element={<AllNotifications />} />
      {/* Buyer Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/products" element={<ProductPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/buyer-detail" element={<BuyerProfile />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/recommended" element={<Recommended />} />
        <Route path="/top-selling" element={<TopSellingPage />} />
        <Route path="/nearby-sellers" element={<NearbySellersPage />} />
        <Route path="/find-matching" element={<FindMatchSeller />} />

      </Route>
      {/* Seller Routes */}
      {/* 404 Not Found */}
      

      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
};
