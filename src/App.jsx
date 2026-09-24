import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';
import MainLayout from './layouts/MainLayout.jsx';
import PageLoader from './components/layout/PageLoader.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';

// Lazy Loaded Route Chunks for Blazing-Fast Page Transitions & Micro Bundle Sizes
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/shop/Shop.jsx'));
const ProductDetails = lazy(() => import('./pages/shop/ProductDetails.jsx'));
const PharmacyLanding = lazy(() => import('./pages/shop/PharmacyLanding.jsx'));
const Checkout = lazy(() => import('./pages/shop/Checkout.jsx'));
const AccountDashboard = lazy(() => import('./pages/dashboards/AccountDashboard.jsx'));
const Wishlist = lazy(() => import('./pages/shop/Wishlist.jsx'));
const BlogHub = lazy(() => import('./pages/blog/BlogHub.jsx'));
const BlogDetail = lazy(() => import('./pages/blog/BlogDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard.jsx'));
const SuperAdminDashboard = lazy(() => import('./pages/dashboards/SuperAdminDashboard.jsx'));
const ServiceProviderDashboard = lazy(() => import('./pages/dashboards/ServiceProviderDashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const PetCrmApp = lazy(() => import('./pages/crm/PetCrmApp.jsx'));

// India Pet Hub Pillars
const PetClassifieds = lazy(() => import('./pages/pets/PetClassifieds.jsx'));
const AdoptionShelter = lazy(() => import('./pages/pets/AdoptionShelter.jsx'));
const AdoptionPetDetail = lazy(() => import('./pages/pets/AdoptionPetDetail.jsx'));
const BreedingDirectory = lazy(() => import('./pages/pets/BreedingDirectory.jsx'));
const ServiceBooking = lazy(() => import('./pages/services/ServiceBooking.jsx'));
const GroomingServices = lazy(() => import('./pages/services/GroomingServices.jsx'));
const HostelServices = lazy(() => import('./pages/services/HostelServices.jsx'));
const WalkingServices = lazy(() => import('./pages/services/WalkingServices.jsx'));
const PetTransport = lazy(() => import('./pages/services/PetTransport.jsx'));
const PetTraining = lazy(() => import('./pages/services/PetTraining.jsx'));
const PetInsurance = lazy(() => import('./pages/services/PetInsurance.jsx'));
const VeterinaryServices = lazy(() => import('./pages/services/VeterinaryServices.jsx'));
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
              <Route path="provider-register" element={<Login />} />
              <Route path="provider/register" element={<Login />} />
              <Route path="partner-register" element={<Login />} />
              
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
            
            {/* Enterprise Pet Care CRM Suite */}
            <Route path="crm" element={<PetCrmApp />} />
            <Route path="crm/:tab" element={<PetCrmApp />} />
            
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
