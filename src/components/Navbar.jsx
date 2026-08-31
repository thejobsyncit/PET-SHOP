import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, User, LogOut, MessageSquare, PawPrint } from 'lucide-react';
import SearchOverlay from './SearchOverlay.jsx';
import CartDrawer from './CartDrawer.jsx';
import { logout } from '../store/slices/authSlice.js';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [petsMenuOpen, setPetsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const petsDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Monitor scroll for compact header transitions
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const petsList = [
    { label: 'Dogs', path: '/pets?petType=dogs' },
    { label: 'Cats', path: '/pets?petType=cats' },
    { label: 'Birds', path: '/pets?petType=birds' },
    { label: 'Reptiles', path: '/pets?petType=reptiles' },
    { label: 'Small Pets', path: '/pets?petType=small-pets' }
  ];

  const servicesList = [
    { label: 'Pet Adoption', path: '/adopt' },
    { label: 'Pet Hostel', path: '/services?category=Hostel' },
    { label: 'Pet Grooming', path: '/grooming' },
    { label: 'Pet Walking', path: '/services?category=Walking' },
    { label: 'Pet Transport', path: '/services?category=Transport' },
    { label: 'Pet Insurance', path: '/services?category=Insurance' },
    { label: 'Pet Training', path: '/services?category=Training' },
    { label: 'Pet Mating', path: '/breeding' },
    { label: 'Consult a Vet', path: '/services?category=Veterinary' }
  ];

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-50 transition-all duration-300">

        {/* Top Announcement Bar */}
        <div className="bg-primary-dark text-white text-[10px] tracking-widest font-semibold py-2 px-4 text-center border-b border-white/5">
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </div>

        {/* Sticky Premium Main Navigation */}
        <nav
          className={`w-full bg-primary text-white transition-all duration-300 ${isScrolled ? 'py-3 shadow-lg' : 'py-4'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">

            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1 text-white hover:text-accent-light cursor-pointer"
            >
              <Menu size={22} />
            </button>

            {/* Left: Brand Logo */}
            <Link
              to="/"
              className="mr-4 flex items-center font-extrabold tracking-tight text-2xl md:text-3xl"
            >
              {/* J-Animal Logo (True Transparent Background) */}
              <img 
                src="/logo.png" 
                alt="Josh Pet Hub Logo" 
                className="h-10 md:h-12 w-auto object-contain mr-2" 
              />
              
              {/* JOSH PETS HUB (Uniform White) */}
              <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight">
                J
                <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-5 h-5 md:w-6 md:h-6 shadow-sm">
                  <PawPrint size={14} className="text-orange-500 fill-orange-500" />
                </div>
                SH 
                <span className="ml-1.5 md:ml-2">PETS</span> 
                <span className="ml-1.5 md:ml-2">HUB</span>
              </span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">

              {/* Home */}
              <Link
                to="/"
                className={`text-[11px] uppercase tracking-wider font-semibold transition py-1 ${isActive('/')
                  ? 'text-accent-light border-b-2 border-accent-light pb-1'
                  : 'text-white hover:text-accent-light'
                  }`}
              >
                Home
              </Link>

              {/* Pets Dropdown Menu */}
              <div
                ref={petsDropdownRef}
                onMouseEnter={() => setPetsMenuOpen(true)}
                onMouseLeave={() => setPetsMenuOpen(false)}
                className="relative py-2 cursor-pointer"
              >
                <Link
                  to="/pets"
                  className={`text-[11px] uppercase tracking-wider font-semibold transition flex items-center gap-1 py-1 ${isActive('/pets')
                    ? 'text-accent-light border-b-2 border-accent-light pb-1'
                    : 'text-white hover:text-accent-light'
                    }`}
                >
                  Pets <ChevronDown size={10} />
                </Link>

                {/* Dropdown Card */}
                {petsMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-44 bg-white border border-gray-100 shadow-xl py-1 z-50 rounded-none animate-in fade-in slide-in-from-top-1 duration-150">
                    {petsList.map((pet) => (
                      <Link
                        key={pet.label}
                        to={pet.path}
                        onClick={() => setPetsMenuOpen(false)}
                        className="block py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary text-center border-b border-gray-100 last:border-0 transition"
                      >
                        {pet.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Pet Services Dropdown Menu */}
              <div
                ref={servicesDropdownRef}
                onMouseEnter={() => setServicesMenuOpen(true)}
                onMouseLeave={() => setServicesMenuOpen(false)}
                className="relative py-2 cursor-pointer"
              >
                <Link
                  to="/services"
                  className={`text-[11px] uppercase tracking-wider font-semibold transition flex items-center gap-1 py-1 ${isActive('/services') || isActive('/adopt') || isActive('/breeding')
                    ? 'text-accent-light border-b-2 border-accent-light pb-1'
                    : 'text-white hover:text-accent-light'
                    }`}
                >
                  Pet Services <ChevronDown size={10} />
                </Link>

                {/* Dropdown Card */}
                {servicesMenuOpen && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-2xl py-1 z-50 rounded-none animate-in fade-in slide-in-from-top-1 duration-150">
                    {servicesList.map((service) => (
                      <Link
                        key={service.label}
                        to={service.path}
                        onClick={() => setServicesMenuOpen(false)}
                        className="block py-2 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-primary text-left border-b border-gray-100 last:border-0 transition"
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop */}
              <Link
                to="/shop"
                className={`text-[11px] uppercase tracking-wider font-semibold transition py-1 ${isActive('/shop')
                  ? 'text-accent-light border-b-2 border-accent-light pb-1'
                  : 'text-white hover:text-accent-light'
                  }`}
              >
                Shop
              </Link>

              {/* Blog */}
              <Link
                to="/pet-care"
                className={`text-[11px] uppercase tracking-wider font-semibold transition py-1 ${isActive('/pet-care')
                  ? 'text-accent-light border-b-2 border-accent-light pb-1'
                  : 'text-white hover:text-accent-light'
                  }`}
              >
                Blog
              </Link>

              {/* Contact Us */}
              <Link
                to="/contact"
                className={`text-[11px] uppercase tracking-wider font-semibold transition py-1 ${isActive('/contact')
                  ? 'text-accent-light border-b-2 border-accent-light pb-1'
                  : 'text-white hover:text-accent-light'
                  }`}
              >
                Contact Us
              </Link>

            </div>

            {/* Right Side Actions: Search, Chat, Wishlist, Cart + Login / Signup Buttons */}
            <div className="flex items-center space-x-4">

              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-white hover:text-accent-light transition cursor-pointer"
                title="Search Products"
              >
                <Search size={18} />
              </button>

              {/* Direct Live Chat Link */}
              {isAuthenticated && (
                <Link
                  to="/chat"
                  className={`p-1 hover:text-accent-light transition ${isActive('/chat') ? 'text-accent-light' : 'text-white'
                    }`}
                  title="Direct Messages / Chat"
                >
                  <MessageSquare size={18} />
                </Link>
              )}

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="p-1 text-white hover:text-accent-light transition relative"
                title="My Wishlist"
              >
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent text-primary font-bold text-[8px] flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-1 text-white hover:text-accent-light transition relative cursor-pointer"
                title="Open Cart"
              >
                <ShoppingBag size={18} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-primary font-bold text-[8px] flex items-center justify-center rounded-full">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Buttons: Log in & Sign up (Dynamic states) */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="border border-white/40 hover:bg-white/10 text-white font-bold px-4 py-2 text-xs tracking-wider rounded-none uppercase transition"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 text-xs tracking-wider rounded-none uppercase transition cursor-pointer flex items-center gap-1"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-2 text-xs tracking-wider rounded-none uppercase transition"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="border border-white/40 hover:bg-white/10 text-white font-bold px-4 py-2 text-xs tracking-wider rounded-md uppercase transition"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>

            </div>

          </div>
        </nav>
      </header>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>

          <div className="relative w-full max-w-xs bg-primary text-white shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center font-extrabold tracking-tight text-xl">
                  {/* J-Animal Logo */}
                  <img 
                    src="/logo.png" 
                    alt="Josh Pet Hub Logo" 
                    className="h-8 w-auto object-contain mr-1.5" 
                  />
                  <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight">
                    J
                    <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-4 h-4 shadow-sm">
                      <PawPrint size={10} className="text-orange-500 fill-orange-500" />
                    </div>
                    SH 
                    <span className="ml-1">PETS</span> 
                    <span className="ml-1">HUB</span>
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-white cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              {/* Mobile links list */}
              <div className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-accent-light border-b border-white/5">Home</Link>

                {/* Pets department expanded on mobile */}
                <div className="space-y-2 py-1 pl-2 border-l border-white/10">
                  <Link to="/pets" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] hover:text-accent-light tracking-widest font-bold">Pets Classifieds</Link>
                  {petsList.map(pet => (
                    <Link key={pet.label} to={pet.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-accent-light text-[11px] normal-case pl-2">{pet.label}</Link>
                  ))}
                </div>

                {/* Pet Services expanded on mobile */}
                <div className="space-y-2 py-1 pl-2 border-l border-white/10">
                  <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] hover:text-accent-light tracking-widest font-bold">Pet Services</Link>
                  {servicesList.map(service => (
                    <Link key={service.label} to={service.path} onClick={() => setIsMobileMenuOpen(false)} className="block py-1 hover:text-accent-light text-[11px] normal-case pl-2">{service.label}</Link>
                  ))}
                </div>

                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-accent-light border-b border-white/5">Shop</Link>
                <Link to="/pet-care" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-accent-light border-b border-white/5">Blog</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-accent-light border-b border-white/5">Contact Us</Link>

                {isAuthenticated && (
                  <Link to="/chat" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 hover:text-accent-light border-b border-white/5">Direct Messages</Link>
                )}
              </div>
            </div>

            {/* Mobile Footer Auth */}
            <div className="pt-6 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-accent-light flex items-center gap-1.5"><User size={14} /> {user?.name}</p>
                  <Link
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-xs font-bold text-white hover:text-accent-light"
                  >
                    MY PROFILE
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-accent text-white text-xs font-bold text-center uppercase tracking-widest rounded-none"
                  >
                    LOG IN
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 border border-white/40 text-white text-xs font-bold text-center uppercase tracking-widest rounded-none"
                  >
                    SIGN UP
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Overlays */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
