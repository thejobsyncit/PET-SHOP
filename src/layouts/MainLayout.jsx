import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import LeadConsultationModal from '../components/widgets/LeadConsultationModal.jsx';
import ServicePackageAccessModal from '../components/widgets/ServicePackageAccessModal.jsx';
import CookieConsent from '../components/widgets/CookieConsent.jsx';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';
import { fetchCart } from '../store/slices/cartSlice.js';
import { fetchWishlist } from '../store/slices/wishlistSlice.js';
import { fetchProfile } from '../store/slices/authSlice.js';

const MainLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check local token or saved user session and trigger profile load
    const token = localStorage.getItem('joshpetshub_token');
    const user = localStorage.getItem('joshpetshub_user');
    if (token || user) {
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
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Premium Footer */}
      <Footer />

      {/* Lead Consultation Popup Modal */}
      <LeadConsultationModal />

      {/* Service Access & Package Comparison Modal (Div Cart + 2 Packages with Pros/Cons + Payment Gateway) */}
      <ServicePackageAccessModal />

      {/* Interactive Cookie Consent Banner & Preferences Modal */}
      <CookieConsent />
    </div>
  );
};

export default MainLayout;
