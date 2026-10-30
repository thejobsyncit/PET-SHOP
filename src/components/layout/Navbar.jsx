import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingBag, ShoppingCart, Store, Menu, X, ChevronDown, User, LogOut, PawPrint, Briefcase, Lock, ShieldAlert, Home, Scissors, Footprints, Truck, GraduationCap, Stethoscope } from 'lucide-react';
import SearchOverlay from './SearchOverlay.jsx';
import CartDrawer from './CartDrawer.jsx';
import { logout, openAuthModal } from '../../store/slices/authSlice.js';
import { openCart, closeCart, setCartOpen } from '../../store/slices/cartSlice.js';
import { isServicePathLockedForUser } from '../ui/ServiceAccessLock.jsx';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../ui/LogoutConfirmModal.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [petsMenuOpen, setPetsMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState('');

  const petsDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const reduxCartOpen = useSelector((state) => state.cart?.isCartOpen);

  useEffect(() => {
    if (typeof reduxCartOpen === 'boolean') {
      setIsCartOpen(reduxCartOpen);
    }
  }, [reduxCartOpen]);

  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
      dispatch(setCartOpen(true));
    };
    window.addEventListener('open-cart-drawer', handleOpenCart);
    window.addEventListener('josh_open_cart', handleOpenCart);
    return () => {
      window.removeEventListener('open-cart-drawer', handleOpenCart);
      window.removeEventListener('josh_open_cart', handleOpenCart);
    };
  }, [dispatch]);

  // Monitor scroll for compact header transitions with RAF and passive listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (petsDropdownRef.current && !petsDropdownRef.current.contains(event.target)) {
        setPetsMenuOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setPetsMenuOpen(false);
    setServicesMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully.');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isServicesActive = () => {
    return ['/services', '/adopt', '/hostel', '/grooming', '/walking', '/transport', '/training', '/insurance', '/breeding'].some(
      (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isNonSellerProvider = user?.role === 'SERVICE_PROVIDER' && 
    (user?.serviceCategory || '').toLowerCase() !== 'pet seller';

  const isPetSeller = user?.role === 'SERVICE_PROVIDER' && 
    (user?.serviceCategory || '').toLowerCase() === 'pet seller';

  const handlePetsNavigation = (e, targetPath = '/pets', isHubRedirect = false) => {
    if (isNonSellerProvider) {
      if (e) e.preventDefault();
      if (isHubRedirect) {
        setPetsMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/provider-dashboard');
      } else {
        toast.error(`Access Restricted: The Pet Marketplace is exclusively reserved for registered Pet Sellers. (Your account: ${user?.serviceCategory || 'Service Provider'})`, { id: 'pet-restrict' });
      }
      return;
    }
    setPetsMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (targetPath) navigate(targetPath);
  };

  const handleServicesNavigation = (e, targetPath = '/services', isHubRedirect = false) => {
    if (isServicePathLockedForUser(user, targetPath)) {
      if (e) e.preventDefault();
      if (isHubRedirect) {
        setServicesMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/provider-dashboard');
      } else {
        toast.error(`🔒 Access Locked: You are signed in as a ${user?.serviceCategory || 'Service Provider'}. This service is locked for your account. Please access your dedicated Provider Dashboard.`, { id: 'srv-restrict' });
      }
      return;
    }
    setServicesMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (targetPath) navigate(targetPath);
  };

  const petsList = [
    { label: 'Dogs', path: '/pets?petType=dogs', image: '/images/departments/dogs.png', desc: 'Puppies & Adult Dogs' },
    { label: 'Cats', path: '/pets?petType=cats', image: '/images/departments/cats.png', desc: 'Kittens & Adult Cats' },
    { label: 'Birds', path: '/pets?petType=birds', image: '/images/departments/birds.png', desc: 'Parrots, Finches & more' },
    { label: 'Fish', path: '/pets?petType=fish', image: '/images/departments/fish.png', desc: 'Aquariums, Arowana & Exotic Fish' },
    { label: 'Reptiles', path: '/pets?petType=reptiles', image: '/images/departments/reptiles.png', desc: 'Turtles, Lizards & Snakes' },
    { label: 'Small Pets', path: '/pets?petType=small-pets', image: '/images/departments/small-pets.png', desc: 'Hamsters, Rabbits & Guinea Pigs' }
  ];

  const servicesList = [
    { label: 'Pet Adoption', path: '/adopt', image: '/images/services/adoption.png', desc: 'Find a new loving friend' },
    { label: 'Pet Hostel', path: '/hostel', image: '/images/services/hostel.png', desc: 'Safe boarding & daycare' },
    { label: 'Pet Grooming', path: '/grooming', image: '/images/services/grooming.png', desc: 'Premium spa & styling' },
    { label: 'Pet Walking', path: '/walking', image: '/images/services/walking.png', desc: 'Daily fitness & walking' },
    { label: 'Pet Transport', path: '/transport', image: '/images/services/transport.png', desc: 'AC cabs for local/intercity' },
    { label: 'Pet Training', path: '/training', image: '/images/services/training.png', desc: 'Expert behavioral classes' },
    { label: 'Pet Insurance', path: '/insurance', image: '/images/services/insurance.png', desc: 'Comprehensive health cover' },
    { label: 'Pet Mating/Breeding', path: '/breeding', image: '/images/services/breeding.png', desc: 'Paws matched in heaven • Studs & Mates' },
    { label: 'Consult a Vet', path: '/veterinary', image: '/images/services/veterinary.png', desc: 'Online/Clinic medical care' }
  ];

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 transition-all duration-300">

        {/* Top Announcement Bar */}
        <div className="bg-primary-dark text-white text-[10px] tracking-widest font-semibold py-2 px-4 text-center border-b border-white/5">
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </div>

        {/* Sticky Premium Main Navigation */}
        <nav
          className={`w-full bg-primary text-white transition-all duration-300 ${isScrolled ? 'py-3 shadow-lg' : 'py-4'
            }`}
        >
          <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-8 flex justify-between items-center gap-1.5 sm:gap-4">

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
              className="mr-1 sm:mr-4 flex items-center font-extrabold tracking-tight shrink-0"
            >
              {/* J-Animal Logo (True Transparent Background) */}
              <img 
                src="/logo.png" 
                alt="Josh Pet Hub Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto object-contain mr-1 sm:mr-2 shrink-0" 
              />
              
              {/* JOSH PETS HUB (Uniform White) */}
              <span className="text-white drop-shadow-sm flex items-center font-black tracking-tight text-lg sm:text-2xl md:text-3xl">
                J
                <div className="relative mx-0.5 flex items-center justify-center bg-white rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shadow-sm shrink-0">
                  <PawPrint size={10} className="text-orange-500 fill-orange-500 sm:w-3.5 sm:h-3.5" />
                </div>
                SH 
                <span className="ml-1 sm:ml-1.5 md:ml-2">PETS</span> 
                <span className="ml-1 sm:ml-1.5 md:ml-2">HUB</span>
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
                <button
                  onClick={(e) => handlePetsNavigation(e, '/pets')}
                  className={`text-[11px] uppercase tracking-wider font-semibold transition flex items-center gap-1 py-1 cursor-pointer bg-transparent border-0 ${isActive('/pets')
                    ? 'text-accent-light border-b-2 border-accent-light pb-1'
                    : 'text-white hover:text-accent-light'
                    }`}
                >
                  Pets {isNonSellerProvider && <Lock size={11} className="text-amber-300 ml-0.5" />} <ChevronDown size={10} />
                </button>

                {/* Dropdown Card */}
                {petsMenuOpen && (
                  <div className="absolute top-full -left-12 w-64 bg-white border border-slate-100 shadow-2xl z-50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10 flex items-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pet Categories</span>
                    </div>
                    {isNonSellerProvider ? (
                      <div className="p-5 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                          <Lock size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                          Pet Sellers Only
                        </span>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          This marketplace is reserved exclusively for verified Pet Sellers.
                        </p>
                        <button
                          onClick={(e) => handlePetsNavigation(e, '/pets', true)}
                          className="w-full py-2 mt-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary-light transition cursor-pointer rounded-xl shadow-sm"
                        >
                          My Provider Hub →
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-hidden">
                          {petsList.map((pet) => (
                            <button
                              key={pet.label}
                              onClick={(e) => handlePetsNavigation(e, pet.path)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-l-0 border-r-0 outline-none"
                            >
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100/90 border border-slate-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-md transition-all shrink-0">
                                <img
                                  src={pet.image}
                                  alt={pet.label}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{pet.label}</div>
                                <div className="text-[9px] text-slate-500 font-medium">{pet.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                        {user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller' && (
                          <div className="p-2 border-t border-slate-100 bg-slate-50">
                            <button
                              onClick={(e) => handlePetsNavigation(e, '/pets')}
                              className="w-full py-2 text-[10px] font-bold text-emerald-800 bg-emerald-100/50 hover:bg-emerald-100 rounded-xl border border-emerald-200/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              🌟 Post & Manage Pet Listings
                            </button>
                          </div>
                        )}
                      </>
                    )}
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
                <button
                  onClick={(e) => handleServicesNavigation(e, '/services')}
                  className={`text-[11px] uppercase tracking-wider font-semibold transition flex items-center gap-1 py-1 cursor-pointer bg-transparent border-0 ${isActive('/services') || isActive('/adopt') || isActive('/breeding')
                    ? 'text-accent-light border-b-2 border-accent-light pb-1'
                    : 'text-white hover:text-accent-light'
                    }`}
                >
                  Pet Services {isPetSeller && <Lock size={11} className="text-amber-300 ml-0.5" />} <ChevronDown size={10} />
                </button>

                {/* Dropdown Card with Scroll */}
                {servicesMenuOpen && (
                  <div className="absolute top-full -left-12 w-64 bg-white border border-slate-100 shadow-2xl z-50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10 flex items-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Services</span>
                    </div>
                    {isPetSeller ? (
                      <div className="p-5 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                          <Lock size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                          Service Providers Only
                        </span>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          This section is reserved exclusively for verified Pet Service Professionals.
                        </p>
                        <button
                          onClick={(e) => handleServicesNavigation(e, '/services', true)}
                          className="w-full py-2 mt-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary-light transition cursor-pointer rounded-xl shadow-sm"
                        >
                          My Provider Hub →
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                        {servicesList.map((service) => {
                          const isLocked = isServicePathLockedForUser(user, service.path);
                          return (
                            <button
                              key={service.label}
                              onClick={(e) => handleServicesNavigation(e, service.path)}
                              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 border-b border-slate-50 last:border-0 transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-l-0 border-r-0 outline-none ${
                                isLocked ? 'opacity-70 hover:bg-amber-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100/90 border border-slate-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-md transition-all shrink-0">
                                  <img
                                    src={service.image}
                                    alt={service.label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center gap-1.5">
                                    <span className="truncate">{service.label}</span>
                                    {isLocked && <Lock size={11} className="text-amber-500 shrink-0" />}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-medium truncate">{service.desc}</div>
                                </div>
                              </div>
                              {isLocked && (
                                <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                  Locked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
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
            <div className="flex items-center space-x-2 sm:space-x-3.5 md:space-x-4 shrink-0">

              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-white hover:text-accent-light transition cursor-pointer"
                title="Search Products"
              >
                <Search size={18} />
              </button>

              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(
                      new CustomEvent('open-register-modal', {
                        detail: { tab: 'user', hideProviderTab: true, source: 'wishlist' }
                      })
                    );
                  } else {
                    navigate('/wishlist');
                  }
                }}
                className="p-1 text-white hover:text-accent-light transition relative cursor-pointer"
                title="My Wishlist"
              >
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent text-primary font-bold text-[8px] flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Cart Icon (Hidden on mobile since it's in bottom nav) */}
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.dispatchEvent(
                      new CustomEvent('open-register-modal', {
                        detail: { tab: 'user', hideProviderTab: true, source: 'cart' }
                      })
                    );
                  } else {
                    setIsCartOpen(true);
                  }
                }}
                className="hidden md:block p-1 text-white hover:text-accent-light transition relative cursor-pointer"
                title="Open Cart"
              >
                <ShoppingBag size={18} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-primary font-bold text-[8px] flex items-center justify-center rounded-full">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Desktop Auth Buttons (lg+) */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'SERVICE_PROVIDER' ? '/provider-dashboard' : '/account'}
                      className={`p-1 text-white hover:text-accent-light transition relative flex items-center justify-center cursor-pointer ${
                        isActive('/account') || isActive('/provider-dashboard') ? 'text-accent-light' : ''
                      }`}
                      title={user?.name ? `${user.name}'s Account` : (user?.role === 'SERVICE_PROVIDER' ? 'My Dashboard' : 'My Account')}
                      aria-label={user?.role === 'SERVICE_PROVIDER' ? 'My Dashboard' : 'My Account'}
                    >
                      <User size={18} />
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="bg-accent hover:bg-accent-dark text-white font-bold px-3 py-1.5 text-xs tracking-wider rounded-md uppercase transition cursor-pointer flex items-center gap-1"
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

              {/* Mobile Auth & Logout Controls (< lg) */}
              <div className="flex lg:hidden items-center gap-1.5 ml-0.5">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'SERVICE_PROVIDER' ? '/provider-dashboard' : '/account'}
                      className="p-1 text-white hover:text-accent-light transition flex items-center justify-center"
                      title={user?.name ? `${user.name}'s Account` : 'My Account'}
                      aria-label="My Account"
                    >
                      <User size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-black uppercase tracking-wider bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/40 rounded transition cursor-pointer"
                      title="Logout"
                      aria-label="Logout"
                    >
                      <LogOut size={13} />
                      <span className="hidden xs:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="bg-accent hover:bg-accent-dark text-white font-bold px-2.5 py-1 text-[11px] tracking-wider uppercase rounded transition"
                  >
                    Login
                  </Link>
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

          <div className="relative w-[85%] max-w-sm bg-primary text-white shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
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
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-white cursor-pointer hover:bg-white/10 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              {/* User Profile Card & Quick Actions in Mobile Drawer Header */}
              {isAuthenticated ? (
                <div className="mb-6 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-black text-base uppercase shrink-0 shadow-sm">
                      {user?.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{user?.name || 'Account User'}</p>
                      <p className="text-[11px] text-white/60 truncate">{user?.email}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">
                        {user?.role === 'SERVICE_PROVIDER' ? 'Service Provider' : 'Pet Parent'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <Link
                      to={user?.role === 'SERVICE_PROVIDER' ? '/provider-dashboard' : '/account'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 px-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold text-center uppercase tracking-wider rounded-lg transition"
                    >
                      {user?.role === 'SERVICE_PROVIDER' ? 'Dashboard' : 'My Account'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogoutClick();
                      }}
                      className="py-2 px-2.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/40 text-[11px] font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 bg-accent hover:bg-accent-dark text-white text-[11px] font-bold text-center uppercase tracking-wider rounded-lg transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 border border-white/30 hover:bg-white/10 text-white text-[11px] font-bold text-center uppercase tracking-wider rounded-lg transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile links list */}
              <div className="space-y-1 text-xs font-semibold uppercase tracking-wider">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 hover:text-accent-light border-b border-white/5">Home</Link>

                {/* Pets department accordion on mobile */}
                <div className="border-b border-white/5">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === 'pets' ? '' : 'pets')}
                    className="w-full py-3 flex items-center justify-between hover:text-accent-light cursor-pointer bg-transparent border-0 text-white font-semibold uppercase tracking-wider text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span>Pets Classifieds</span>
                      {isNonSellerProvider && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 normal-case">
                          <Lock size={10} /> Sellers Only
                        </span>
                      )}
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${mobileExpanded === 'pets' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ${mobileExpanded === 'pets' ? 'max-h-96 pb-3' : 'max-h-0'}`}>
                    {!isNonSellerProvider ? (
                      <>
                        <button onClick={(e) => handlePetsNavigation(e, '/pets')} className="w-full text-left flex items-center gap-2.5 py-2 pl-4 hover:text-accent-light text-[11px] normal-case cursor-pointer bg-transparent border-0 text-gray-300">
                          <span className="text-sm">🌟</span> All Pets
                        </button>
                        {petsList.map(pet => (
                          <button
                            key={pet.label}
                            onClick={(e) => handlePetsNavigation(e, pet.path)}
                            className="w-full text-left flex items-center gap-2.5 py-2 pl-4 hover:text-accent-light text-[11px] normal-case cursor-pointer bg-transparent border-0 text-gray-300"
                          >
                            <div className="w-6 h-6 rounded-md overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                              <img src={pet.image} alt={pet.label} className="w-full h-full object-cover" />
                            </div>
                            {pet.label}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="p-3 bg-white/5 rounded-lg mb-2 mx-2 text-[10px] text-gray-300 leading-relaxed normal-case">
                        This section is restricted to registered Pet Sellers. Access your provider dashboard instead.
                      </div>
                    )}
                  </div>
                </div>

                {/* Pet Services accordion on mobile */}
                <div className="border-b border-white/5">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === 'services' ? '' : 'services')}
                    className="w-full py-3 flex items-center justify-between hover:text-accent-light cursor-pointer bg-transparent border-0 text-white font-semibold uppercase tracking-wider text-xs"
                  >
                    <span>Pet Services</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${mobileExpanded === 'services' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ${mobileExpanded === 'services' ? 'max-h-[500px] pb-3' : 'max-h-0'}`}>
                    <button onClick={(e) => handleServicesNavigation(e, '/services')} className="w-full text-left flex items-center gap-2.5 py-2 pl-4 hover:text-accent-light text-[11px] normal-case cursor-pointer bg-transparent border-0 text-gray-300">
                      <div className="text-accent-light"><Briefcase size={14} /></div> All Services
                    </button>
                    {servicesList.map(service => {
                      const isLocked = isServicePathLockedForUser(user, service.path);
                      return (
                        <button
                          key={service.label}
                          onClick={(e) => handleServicesNavigation(e, service.path)}
                          className={`w-full text-left flex items-center justify-between py-2 pl-4 text-[11px] normal-case cursor-pointer bg-transparent border-0 ${isLocked ? 'text-gray-500 hover:text-amber-300' : 'text-gray-300 hover:text-accent-light'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
                              <img src={service.image} alt={service.label} className="w-full h-full object-cover" />
                            </div> 
                            <span>{service.label}</span>
                          </div>
                          {isLocked && (
                            <span className="text-[9px] bg-amber-400/10 text-amber-500 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 mr-2">
                              <Lock size={10} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 hover:text-accent-light border-b border-white/5">Shop</Link>
                <button 
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (!isAuthenticated) {
                      window.dispatchEvent(
                        new CustomEvent('open-register-modal', {
                          detail: { tab: 'user', hideProviderTab: true, source: 'wishlist-mobile' }
                        })
                      );
                    } else {
                      navigate('/wishlist');
                    }
                  }} 
                  className="w-full flex items-center justify-between py-3 hover:text-accent-light border-b border-white/5 text-left text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Heart size={15} /> Wishlist
                  </span>
                  {wishlistItems.length > 0 && (
                    <span className="px-2 py-0.5 bg-accent text-primary font-bold text-[10px] rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
                <Link to="/pet-care" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 hover:text-accent-light border-b border-white/5">Blog</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 hover:text-accent-light border-b border-white/5">Contact Us</Link>
              </div>
            </div>

            {/* Mobile Footer Auth */}
            <div className="pt-6 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-accent-light flex items-center gap-1.5"><User size={14} /> {user?.name}</p>
                  {user?.role === 'SERVICE_PROVIDER' ? (
                    <Link
                      to="/provider-dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xs font-bold text-white hover:text-accent-light"
                    >
                      MY DASHBOARD
                    </Link>
                  ) : (
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xs font-bold text-white hover:text-accent-light"
                    >
                      MY PROFILE
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogoutClick();
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer flex items-center justify-center gap-2 transition"
                  >
                    <LogOut size={14} /> LOGOUT
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

      {/* MOBILE BOTTOM NAVIGATION BAR (App-like feel) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-primary' : 'text-slate-400'}`}>
            <Home size={20} className={isActive('/') ? 'fill-primary/20' : ''} />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          
          <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/shop') ? 'text-primary' : 'text-slate-400'}`}>
            <Store size={20} className={isActive('/shop') ? 'fill-primary/20' : ''} />
            <span className="text-[10px] font-bold">Shop</span>
          </Link>

          {/* Center Floating Cart Button */}
          <button 
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                window.dispatchEvent(
                  new CustomEvent('open-register-modal', {
                    detail: { tab: 'user', hideProviderTab: true, source: 'cart-mobile' }
                  })
                );
              } else {
                setIsCartOpen(true);
              }
            }}
            className="relative flex flex-col items-center justify-center shrink-0 -mt-8 bg-primary text-white w-[60px] h-[60px] rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.15)] border-[5px] border-white active:scale-95 transition-transform z-50 cursor-pointer"
          >
            <ShoppingCart size={22} className="relative z-10" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white z-20">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>

          <Link to="/pets" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/pets') ? 'text-primary' : 'text-slate-400'}`}>
            <PawPrint size={20} className={isActive('/pets') ? 'fill-primary/20' : ''} />
            <span className="text-[10px] font-bold">Pets</span>
          </Link>

          {isAuthenticated ? (
            <Link to={user?.role === 'SERVICE_PROVIDER' ? '/provider-dashboard' : '/account'} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/account') || isActive('/provider-dashboard') ? 'text-primary' : 'text-slate-400'}`}>
              <User size={20} className={isActive('/account') || isActive('/provider-dashboard') ? 'fill-primary/20' : ''} />
              <span className="text-[10px] font-bold">Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400">
              <User size={20} />
              <span className="text-[10px] font-bold">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Global Overlays */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.name}
      />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => { setIsCartOpen(false); dispatch(setCartOpen(false)); }} />
    </>
  );
};

export default Navbar;
