import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';
import MainLayout from './layouts/MainLayout.jsx';
import PageLoader from './components/PageLoader.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Lazy Loaded Route Chunks for Blazing-Fast Page Transitions & Micro Bundle Sizes
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const PharmacyLanding = lazy(() => import('./pages/PharmacyLanding.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const AccountDashboard = lazy(() => import('./pages/AccountDashboard.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const BlogHub = lazy(() => import('./pages/BlogHub.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard.jsx'));
const ServiceProviderDashboard = lazy(() => import('./pages/ServiceProviderDashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// India Pet Hub Pillars
const PetClassifieds = lazy(() => import('./pages/PetClassifieds.jsx'));
const AdoptionShelter = lazy(() => import('./pages/AdoptionShelter.jsx'));
const AdoptionPetDetail = lazy(() => import('./pages/AdoptionPetDetail.jsx'));
const BreedingDirectory = lazy(() => import('./pages/BreedingDirectory.jsx'));
const ServiceBooking = lazy(() => import('./pages/ServiceBooking.jsx'));
const GroomingServices = lazy(() => import('./pages/GroomingServices.jsx'));
const HostelServices = lazy(() => import('./pages/HostelServices.jsx'));
const WalkingServices = lazy(() => import('./pages/WalkingServices.jsx'));
const PetTransport = lazy(() => import('./pages/PetTransport.jsx'));
const PetTraining = lazy(() => import('./pages/PetTraining.jsx'));
const PetInsurance = lazy(() => import('./pages/PetInsurance.jsx'));
const VeterinaryServices = lazy(() => import('./pages/VeterinaryServices.jsx'));
const ChatConsole = lazy(() => import('./pages/ChatConsole.jsx'));

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTop />
        {/* Toast Alerts Overlay */}
        <Toaster 
          position="top-right"
          containerStyle={{
            top: 75,
            right: 20
          }}
          toastOptions={{
            duration: 3000,
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
              <Route path="checkout" element={<Checkout />} />
              <Route path="wishlist" element={<Wishlist />} />
              
              {/* Editorial / Info */}
              <Route path="pet-care" element={<BlogHub />} />
              <Route path="pet-care/:slug" element={<BlogDetail />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              
              {/* User Account */}
              <Route path="account" element={<AccountDashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Login />} />
              <Route path="register" element={<Login />} />
              
              {/* India Pet Hub Pillars */}
              <Route path="pets" element={<PetClassifieds />} />
              <Route path="adopt" element={<AdoptionShelter />} />
              <Route path="adopt/:id" element={<AdoptionPetDetail />} />
              <Route path="breeding" element={<BreedingDirectory />} />
              <Route path="services" element={<ServiceBooking />} />
              <Route path="grooming" element={<GroomingServices />} />
              <Route path="services/grooming" element={<GroomingServices />} />
              <Route path="hostel" element={<HostelServices />} />
              <Route path="services/hostel" element={<HostelServices />} />
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
              <Route path="provider-dashboard" element={<ServiceProviderDashboard />} />
              <Route path="provider/dashboard" element={<ServiceProviderDashboard />} />
            </Route>

            {/* Admin Panels */}
            <Route path="Admin.com" element={<AdminDashboard />} />
            <Route path="superadmin.com" element={<SuperAdminDashboard />} />
            
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
