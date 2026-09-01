import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import LeadConsultationModal from '../components/LeadConsultationModal.jsx';
import { fetchCart } from '../store/slices/cartSlice.js';
import { fetchWishlist } from '../store/slices/wishlistSlice.js';
import { fetchProfile } from '../store/slices/authSlice.js';

const MainLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check local token and trigger profile load
    const token = localStorage.getItem('pawora_token');
    if (token) {
      dispatch(fetchProfile());
    }
    // Fetch cart and wishlist (synchronizes guest or user state)
    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      {/* Premium Sticky Header */}
      <Navbar />

      {/* Main Outlet page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <Footer />

      {/* Lead Consultation Popup Modal */}
      <LeadConsultationModal />
    </div>
  );
};

export default MainLayout;
