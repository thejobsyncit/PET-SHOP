import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/index.js';

// Layout & Pages
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import PharmacyLanding from './pages/PharmacyLanding.jsx';
import Checkout from './pages/Checkout.jsx';
import AccountDashboard from './pages/AccountDashboard.jsx';
import Wishlist from './pages/Wishlist.jsx';
import BlogHub from './pages/BlogHub.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// India Pet Hub pages
import PetClassifieds from './pages/PetClassifieds.jsx';
import AdoptionShelter from './pages/AdoptionShelter.jsx';
import AdoptionPetDetail from './pages/AdoptionPetDetail.jsx';
import BreedingDirectory from './pages/BreedingDirectory.jsx';
import ServiceBooking from './pages/ServiceBooking.jsx';
import GroomingServices from './pages/GroomingServices.jsx';
import ChatConsole from './pages/ChatConsole.jsx';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {/* Toast Alerts Overlay */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0F2E23',
              color: '#FAF9F5',
              borderRadius: '0px',
              border: '1px solid #FAF9F5',
              fontSize: '12px',
              letterSpacing: '0.05em'
            }
          }}
        />

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
            <Route path="chat" element={<ChatConsole />} />
          </Route>

          {/* Admin Panels */}
          <Route path="Admin.com" element={<AdminDashboard />} />
          <Route path="superadmin.com" element={<SuperAdminDashboard />} />
          
          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
