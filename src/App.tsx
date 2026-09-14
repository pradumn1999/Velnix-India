// React's JSX runtime types are unavailable in the current project setup.
// @ts-nocheck
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { QuickViewProvider } from './context/QuickViewContext';

import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboardPlaceholderPage } from './pages/AdminDashboardPlaceholderPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <OrderProvider>
              <QuickViewProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="products" element={<ProductListingPage />} />
                      <Route path="product/:id" element={<ProductDetailPage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="order-details/:orderId" element={<OrderTrackingPage />} />
                      <Route path="track-order/:orderId" element={<OrderTrackingPage />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="admin" element={<AdminDashboardPlaceholderPage />} />
                      <Route path="admin/products" element={<AdminDashboardPlaceholderPage />} />
                      <Route path="admin/orders" element={<AdminDashboardPlaceholderPage />} />
                      <Route path="admin/cjdropshipping" element={<AdminDashboardPlaceholderPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </QuickViewProvider>
            </OrderProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
