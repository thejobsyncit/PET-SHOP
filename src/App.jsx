import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';
import MainLayout from './layouts/MainLayout.jsx';
import PageLoader from './components/layout/PageLoader.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import AuthModal from './components/widgets/AuthModal.jsx';
import { fetchSubscriptionPlans } from './services/subscriptionPlanService.js';

// Resilient dynamic chunk loader with auto-retry and cache-bust recovery
const lazyWithRetry = (componentImport, moduleName = 'component') =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn(`[Dynamic Import Recovery] Failed to fetch ${moduleName}, retrying...`, error);
      try {
        // Immediate second attempt in case of momentary HMR recompilation lock
        return await componentImport();
      } catch (retryError) {
        // If second attempt fails, perform a clean single page reload to synchronize client chunks
        try {
          const lastRetry = parseInt(sessionStorage.getItem(`retry_lazy_${moduleName}`) || '0', 10);
          const now = Date.now();
          if (now - lastRetry > 15000) {
            sessionStorage.setItem(`retry_lazy_${moduleName}`, String(now));
            window.location.reload();
            return new Promise(() => {});
          }
        } catch (_) {}
        throw retryError;
      }
    }
  });

// Lazy Loaded Route Chunks for Blazing-Fast Page Transitions & Micro Bundle Sizes
const Home = lazyWithRetry(() => import('./pages/Home.jsx'), 'Home');
const Shop = lazyWithRetry(() => import('./pages/shop/Shop.jsx'), 'Shop');
const ProductDetails = lazyWithRetry(() => import('./pages/shop/ProductDetails.jsx'), 'ProductDetails');
const PharmacyLanding = lazyWithRetry(() => import('./pages/shop/PharmacyLanding.jsx'), 'PharmacyLanding');
const Cart = lazyWithRetry(() => import('./pages/shop/Cart.jsx'), 'Cart');
const Checkout = lazyWithRetry(() => import('./pages/shop/Checkout.jsx'), 'Checkout');
const AccountDashboard = lazyWithRetry(() => import('./pages/dashboards/AccountDashboard.jsx'), 'AccountDashboard');
const Wishlist = lazyWithRetry(() => import('./pages/shop/Wishlist.jsx'), 'Wishlist');
const BlogHub = lazyWithRetry(() => import('./pages/blog/BlogHub.jsx'), 'BlogHub');
const BlogDetail = lazyWithRetry(() => import('./pages/blog/BlogDetail.jsx'), 'BlogDetail');
const About = lazyWithRetry(() => import('./pages/About.jsx'), 'About');
const Contact = lazyWithRetry(() => import('./pages/Contact.jsx'), 'Contact');
const Login = lazyWithRetry(() => import('./pages/Login.jsx'), 'Login');
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword.jsx'), 'ForgotPassword');
const AdminDashboard = lazyWithRetry(() => import('./pages/dashboards/AdminDashboard.jsx'), 'AdminDashboard');
const SuperAdminDashboard = lazyWithRetry(() => import('./pages/dashboards/SuperAdminDashboard.jsx'), 'SuperAdminDashboard');
const ServiceProviderDashboard = lazyWithRetry(() => import('./pages/dashboards/ServiceProviderDashboard.jsx'), 'ServiceProviderDashboard');
const CrmPortal = lazyWithRetry(() => import('./pages/crm/CrmPortal.jsx'), 'CrmPortal');
const NotFound = lazyWithRetry(() => import('./pages/NotFound.jsx'), 'NotFound');

// India Pet Hub Pillars
const PetClassifieds = lazy(() => import('./pages/pets/PetClassifieds.jsx'));
const PetClassifiedDetail = lazy(() => import('./pages/pets/PetClassifiedDetail.jsx'));
const AdoptionShelter = lazy(() => import('./pages/pets/AdoptionShelter.jsx'));
const AdoptionPetDetail = lazy(() => import('./pages/pets/AdoptionPetDetail.jsx'));
const BreedingDirectory = lazy(() => import('./pages/pets/BreedingDirectory.jsx'));
const ServiceBooking = lazy(() => import('./pages/services/ServiceBooking.jsx'));
const GroomingServices = lazy(() => import('./pages/services/GroomingServices.jsx'));
const HostelServices = lazy(() => import('./pages/services/HostelServices.jsx'));
const HostelDetail = lazy(() => import('./pages/services/HostelDetail.jsx'));
const WalkingServices = lazy(() => import('./pages/services/WalkingServices.jsx'));
const PetTransport = lazy(() => import('./pages/services/PetTransport.jsx'));
const PetTraining = lazy(() => import('./pages/services/PetTraining.jsx'));
const PetInsurance = lazy(() => import('./pages/services/PetInsurance.jsx'));
const VeterinaryServices = lazy(() => import('./pages/services/VeterinaryServices.jsx'));
const ChatConsole = lazy(() => import('./pages/ChatConsole.jsx'));

function App() {
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
          {/* Global Guest Auth Popup Modal */}
          <AuthModal />
        {/* Toast Alerts Overlay */}
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 75,
            right: 20
          }}
          toastOptions={{
            duration: 2000,
            style: {
              background: '#0F2E23',
              color: '#FAF9F5',
              borderRadius: '8px',
              border: '1px solid rgba(250, 249, 245, 0.2)',
              fontSize: '12px',
              letterSpacing: '0.03em',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              
              {/* Catalog Pages */}
              <Route path="shop" element={<Shop />} />
              <Route path="dogs" element={<Shop />} />
              <Route path="birds" element={<Shop />} />
              <Route path="reptiles" element={<Shop />} />
              <Route path="fish" element={<Shop />} />
              
              {/* Product Details & Pharmacy */}
              <Route path="product/:slug" element={<ProductDetails />} />
              <Route path="pharmacy" element={<PharmacyLanding />} />
              
              {/* Cart & Checkout */}
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="wishlist" element={<Wishlist />} />
              
              {/* Editorial / Info */}
              <Route path="pet-care" element={<BlogHub />} />
              <Route path="pet-care/:slug" element={<BlogDetail />} />
              <Route path="blog" element={<BlogHub />} />
              <Route path="blog/:slug" element={<BlogDetail />} />
              <Route path="blogs" element={<BlogHub />} />
              <Route path="blogs/:slug" element={<BlogDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              
              {/* User Account */}
              <Route path="account" element={<AccountDashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="signup" element={<Login />} />
              <Route path="register" element={<Login />} />
              <Route path="provider-register" element={<Login />} />
              <Route path="provider/register" element={<Login />} />
              <Route path="partner-register" element={<Login />} />
              
              {/* India Pet Hub Pillars */}
              <Route path="pets" element={<PetClassifieds />} />
              <Route path="pets/:id" element={<PetClassifiedDetail />} />
              <Route path="adopt" element={<AdoptionShelter />} />
              <Route path="adopt/:id" element={<AdoptionPetDetail />} />
              <Route path="breeding" element={<BreedingDirectory />} />
              <Route path="services" element={<ServiceBooking />} />
              <Route path="grooming" element={<GroomingServices />} />
              <Route path="services/grooming" element={<GroomingServices />} />
              <Route path="hostel" element={<HostelServices />} />
              <Route path="hostel/:id" element={<HostelDetail />} />
              <Route path="services/hostel" element={<HostelServices />} />
              <Route path="services/hostel/:id" element={<HostelDetail />} />
              <Route path="walking" element={<WalkingServices />} />
              <Route path="services/walking" element={<WalkingServices />} />
              <Route path="dog-walking" element={<WalkingServices />} />
              <Route path="transport" element={<PetTransport />} />
              <Route path="services/transport" element={<PetTransport />} />
              <Route path="pet-transport" element={<PetTransport />} />
              <Route path="training" element={<PetTraining />} />
              <Route path="services/training" element={<PetTraining />} />
              <Route path="pet-training" element={<PetTraining />} />
              <Route path="dog-training" element={<PetTraining />} />
              <Route path="insurance" element={<PetInsurance />} />
              <Route path="services/insurance" element={<PetInsurance />} />
              <Route path="pet-insurance" element={<PetInsurance />} />
              <Route path="veterinary" element={<VeterinaryServices />} />
              <Route path="services/veterinary" element={<VeterinaryServices />} />
              <Route path="vet" element={<VeterinaryServices />} />
              <Route path="consult-a-vet" element={<VeterinaryServices />} />
              <Route path="chat" element={<ChatConsole />} />

              {/* Service Provider Platform */}
              <Route path="dashboard" element={<ServiceProviderDashboard />} />
              <Route path="provider-dashboard" element={<ServiceProviderDashboard />} />
              <Route path="provider/dashboard" element={<ServiceProviderDashboard />} />
            </Route>

            {/* Admin Panels - Completely shifted into CRM (/crm) */}
            <Route path="Admin.com" element={<Navigate to="/crm" replace />} />
            <Route path="admin" element={<Navigate to="/crm" replace />} />
            <Route path="admin/*" element={<Navigate to="/crm" replace />} />

            {/* Super Admin Panel - Single unified access route: /superadmin */}
            <Route path="superadmin" element={<SuperAdminDashboard />} />
            <Route path="superadmin.com" element={<Navigate to="/superadmin" replace />} />
            <Route path="superadmin/dashboard" element={<Navigate to="/superadmin" replace />} />

            {/* Standalone Enterprise CRM Operations Portal */}
            <Route path="crm" element={<CrmPortal />} />
            <Route path="crm/*" element={<CrmPortal />} />
            
            {/* Fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
