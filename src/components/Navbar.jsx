import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, User, LogOut, MessageSquare, PawPrint, Briefcase, Lock, ShieldAlert, Home, Scissors, Footprints, Truck, GraduationCap, Stethoscope } from 'lucide-react';
import SearchOverlay from './SearchOverlay.jsx';
import CartDrawer from './CartDrawer.jsx';
import { logout } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

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

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate('/');
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

  const handlePetsNavigation = (e, targetPath = '/pets') => {
    if (isNonSellerProvider) {
      if (e) e.preventDefault();
      toast.error(`Access Restricted: The Pet Marketplace is exclusively reserved for registered Pet Sellers. (Your account: ${user?.serviceCategory || 'Service Provider'})`);
      setPetsMenuOpen(false);
      setIsMobileMenuOpen(false);
      navigate('/provider-dashboard');
      return;
    }
    setPetsMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (targetPath) navigate(targetPath);
  };

  const petsList = [
    { label: 'Dogs', path: '/pets?petType=dogs', icon: <span className="text-lg">🐶</span>, desc: 'Puppies & Adult Dogs' },
    { label: 'Cats', path: '/pets?petType=cats', icon: <span className="text-lg">🐱</span>, desc: 'Kittens & Adult Cats' },
    { label: 'Birds', path: '/pets?petType=birds', icon: <span className="text-lg">🦜</span>, desc: 'Parrots, Finches & more' },
    { label: 'Reptiles', path: '/pets?petType=reptiles', icon: <span className="text-lg">🐢</span>, desc: 'Turtles, Lizards & Snakes' },
    { label: 'Small Pets', path: '/pets?petType=small-pets', icon: <span className="text-lg">🐹</span>, desc: 'Hamsters, Rabbits & Guinea Pigs' }
  ];

  const servicesList = [
    { label: 'Pet Adoption', path: '/adopt', icon: <Heart size={16} className="text-pink-500" />, desc: 'Find a new loving friend' },
    { label: 'Pet Hostel', path: '/hostel', icon: <Home size={16} className="text-blue-500" />, desc: 'Safe boarding & daycare' },
    { label: 'Pet Grooming', path: '/grooming', icon: <Scissors size={16} className="text-purple-500" />, desc: 'Premium spa & styling' },
    { label: 'Pet Walking', path: '/walking', icon: <Footprints size={16} className="text-amber-500" />, desc: 'Daily fitness & walking' },
    { label: 'Pet Transport', path: '/transport', icon: <Truck size={16} className="text-emerald-500" />, desc: 'AC cabs for local/intercity' },
    { label: 'Pet Training', path: '/training', icon: <GraduationCap size={16} className="text-indigo-500" />, desc: 'Expert behavioral classes' },
    { label: 'Pet Insurance', path: '/insurance', icon: <ShieldAlert size={16} className="text-red-500" />, desc: 'Comprehensive health cover' },
    { label: 'Pet Mating/Breeding', path: '/breeding', icon: <Heart size={16} className="text-rose-500" />, desc: 'Paws matched in heaven • Studs & Mates' },
    { label: 'Consult a Vet', path: '/veterinary', icon: <Stethoscope size={16} className="text-teal-500" />, desc: 'Online/Clinic medical care' }
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
                    <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pet Categories</span>
                      <button onClick={(e) => handlePetsNavigation(e, '/pets')} className="text-[9px] font-bold text-accent hover:underline cursor-pointer bg-transparent border-0">View All</button>
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
                          onClick={(e) => handlePetsNavigation(e)}
                          className="w-full py-2 mt-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary-light transition cursor-pointer rounded-xl shadow-sm"
                        >
                          My Provider Hub →
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                          {petsList.map((pet) => (
                            <button
                              key={pet.label}
                              onClick={(e) => handlePetsNavigation(e, pet.path)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group cursor-pointer text-left bg-transparent border-t-0 border-l-0 border-r-0 outline-none"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                                {pet.icon}
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
                  type="button"
                  onClick={() => setServicesMenuOpen(prev => !prev)}
                  className={`text-[11px] uppercase tracking-wider font-semibold transition flex items-center gap-1 py-1 cursor-pointer bg-transparent border-0 ${servicesMenuOpen || isServicesActive()
                    ? 'text-accent-light border-b-2 border-accent-light pb-1'
                    : 'text-white hover:text-accent-light'
                    }`}
                >
                  Pet Services <ChevronDown size={10} className={`transition-transform duration-200 ${servicesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card with Scroll */}
                {servicesMenuOpen && (
                  <div className="absolute top-full -left-12 w-64 bg-white border border-slate-100 shadow-2xl z-50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Services</span>
                      <Link to="/services" className="text-[9px] font-bold text-accent hover:underline">View Hub</Link>
                    </div>
                    {/* SCROLL DOWN DESIGN */}
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                      {servicesList.map((service) => (
                        <Link
                          key={service.label}
                          to={service.path}
                          onClick={() => setServicesMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                            {service.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">{service.label}</div>
                            <div className="text-[9px] text-slate-500 font-medium">{service.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
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
              <div className="hidden lg:flex items-center gap-2.5">
                {isAuthenticated ? (
                  <>
                    {user?.role === 'SERVICE_PROVIDER' ? (
                      <Link
                        to="/provider-dashboard"
                        className="border border-white/40 hover:bg-white/10 text-white font-bold px-3.5 py-2 text-xs tracking-wider rounded-none uppercase transition"
                      >
                        My Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/account"
                        className="border border-white/40 hover:bg-white/10 text-white font-bold px-3.5 py-2 text-xs tracking-wider rounded-none uppercase transition"
                      >
                        My Account
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="bg-accent hover:bg-accent-dark text-white font-bold px-3.5 py-2 text-xs tracking-wider rounded-none uppercase transition cursor-pointer flex items-center gap-1"
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
                  <button
                    onClick={(e) => handlePetsNavigation(e, '/pets')}
                    className="w-full text-left text-[11px] hover:text-accent-light tracking-widest font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>Pets Classifieds</span>
                    {isNonSellerProvider && (
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Lock size={10} /> Sellers Only
                      </span>
                    )}
                  </button>
                  {!isNonSellerProvider && (
                    <>
                      {petsList.map(pet => (
                        <button
                          key={pet.label}
                          onClick={(e) => handlePetsNavigation(e, pet.path)}
                          className="w-full text-left block py-1 hover:text-accent-light text-[11px] normal-case pl-2 cursor-pointer"
                        >
                          {pet.label}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Pet Services expanded on mobile */}
                <div className="space-y-2 py-1 pl-2 border-l border-white/10">
                  <span className="block text-[11px] text-accent-light tracking-widest font-bold uppercase">Pet Services</span>
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
