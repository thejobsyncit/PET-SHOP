import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, Search, MapPin, Phone, MessageSquare, Star, ShieldCheck, 
  Calendar, Clock, CircleCheck, ChevronRight, X, SlidersHorizontal, 
  RefreshCw, Check, ArrowRight, Heart, Award, Footprints, Navigation, 
  Compass, ShieldAlert, UserCheck, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  WALKING_OFFERINGS, 
  getStoredWalkingProviders, 
  saveWalkingBooking 
} from '../data/walkingData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

const WalkingServices = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Search & Filter States
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedDogSize, setSelectedDogSize] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedOffering, setSelectedOffering] = useState('all');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-300' | '300-499' | '500-999' | '1000-plus'
  const [selectedServiceMode, setSelectedServiceMode] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Booking Modal States
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('07:00 AM - 07:30 AM (Morning Stride)');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('2 Years');
  const [dogSize, setDogSize] = useState('Medium');
  const [ownerPhone, setOwnerPhone] = useState(user?.mobile || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const providers = getStoredWalkingProviders();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update available cities when state changes
  const availableCities = useMemo(() => {
    if (selectedState === 'All States' || !INDIAN_STATES_CITIES[selectedState]) {
      return ['All Cities'];
    }
    const rawCities = INDIAN_STATES_CITIES[selectedState] || [];
    return Array.from(new Set(['All Cities', ...rawCities]));
  }, [selectedState]);

  // Handle State selection change
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity('All Cities');
  };

  // Offering Counts Calculator
  const offeringCounts = useMemo(() => {
    const counts = {};
    WALKING_OFFERINGS.forEach(off => {
      if (off.id === 'all') {
        counts[off.id] = providers.length;
      } else {
        counts[off.id] = providers.filter(p => p.offerings.includes(off.name)).length;
      }
    });
    return counts;
  }, [providers]);

  // Handle Offering Selection with Smooth Feedback
  const handleSelectOffering = (offeringId) => {
    setSelectedOffering((prev) => (prev === offeringId ? 'all' : offeringId));
  };

  // Helper to find the best matching package based on selected offering
  const getFeaturedPackageForOffering = (provider, offeringId) => {
    if (!provider.packages || provider.packages.length === 0) return null;
    if (offeringId === 'all') return provider.packages[0];

    const target = WALKING_OFFERINGS.find(o => o.id === offeringId);
    if (!target) return provider.packages[0];

    const offeringName = target.name.toLowerCase();
    
    // Look for matching package by name or description
    const match = provider.packages.find(pkg => {
      const pName = pkg.name.toLowerCase();
      const pDesc = pkg.desc.toLowerCase();
      
      if (offeringId === 'solo-walk') {
        return pName.includes('solo') || pDesc.includes('solo') || pDesc.includes('1-on-1');
      }
      if (offeringId === 'group-stride') {
        return pName.includes('group') || pName.includes('pack') || pDesc.includes('pack') || pDesc.includes('group');
      }
      if (offeringId === 'puppy-care') {
        return pName.includes('puppy') || pDesc.includes('puppy') || pDesc.includes('potty');
      }
      if (offeringId === 'senior-stroll') {
        return pName.includes('senior') || pDesc.includes('senior') || pDesc.includes('gentle');
      }
      if (offeringId === 'monthly-pass') {
        return pName.includes('monthly') || pName.includes('pass') || pDesc.includes('30 days');
      }
      if (offeringId === 'adventure-trail') {
        return pName.includes('trail') || pName.includes('adventure') || pName.includes('trek') || pDesc.includes('adventure');
      }
      if (offeringId === 'gps-tracked') {
        return pName.includes('gps') || pName.includes('power') || pDesc.includes('gps') || pDesc.includes('tracking');
      }

      return pName.includes(offeringName) || pDesc.includes(offeringName);
    });

    return match || provider.packages[0];
  };

  // Filter & Sort Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // 1. Pet Type Filter
      if (selectedPetType !== 'All') {
        const matchesPet = p.petTypes.some(
          (t) => t.toLowerCase() === selectedPetType.toLowerCase()
        );
        if (!matchesPet) return false;
      }

      // 2. Dog Size Filter
      if (selectedDogSize !== 'All') {
        const matchesSize = p.dogSizes && p.dogSizes.some(
          (s) => s.toLowerCase() === selectedDogSize.toLowerCase()
        );
        if (!matchesSize) return false;
      }

      // 3. State Filter
      if (selectedState !== 'All States' && p.state !== selectedState) {
        return false;
      }

      // 4. City Filter
      if (selectedCity !== 'All Cities' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 5. Offering Filter
      if (selectedOffering !== 'all') {
        const targetOfferingName = WALKING_OFFERINGS.find(o => o.id === selectedOffering)?.name;
        if (targetOfferingName && !p.offerings.includes(targetOfferingName)) {
          return false;
        }
      }

      // 6. Price Filter
      const effectivePrice = p.discountPrice || p.price;
      if (priceRange === 'under-300' && effectivePrice >= 300) return false;
      if (priceRange === '300-499' && (effectivePrice < 300 || effectivePrice > 499)) return false;
      if (priceRange === '500-999' && (effectivePrice < 500 || effectivePrice > 999)) return false;
      if (priceRange === '1000-plus' && effectivePrice < 1000) return false;

      // 7. Service Mode Filter
      if (selectedServiceMode !== 'All' && !p.serviceMode.toLowerCase().includes(selectedServiceMode.toLowerCase())) {
        return false;
      }

      // 8. Search Keyword
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesKeyword = 
          p.name.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.walkerName.toLowerCase().includes(query);
        if (!matchesKeyword) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0; // recommended
    });
  }, [
    providers, selectedPetType, selectedDogSize, selectedState, selectedCity, 
    selectedOffering, priceRange, selectedServiceMode, sortBy, searchKeyword
  ]);

  // Open Booking Modal for a provider - Triggers registration popup if not logged in
  const handleOpenBookingModal = (provider, pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to book a verified dog walker.', {
        icon: '🔒'
      });
      // Fire global custom event to trigger registration/lead modal
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'walking' } }));
      return;
    }
    setSelectedProvider(provider);
    const preselectedPkg = pkg || getFeaturedPackageForOffering(provider, selectedOffering) || provider.packages[0] || null;
    setSelectedPackage(preselectedPkg);
    setShowBookingModal(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please pick a walk start date.');
      return;
    }
    if (!petName.trim() || !petBreed.trim()) {
      toast.error('Please provide your dog name and breed.');
      return;
    }
    if (!ownerPhone.trim()) {
      toast.error('Please provide your contact phone number.');
      return;
    }

    const bookingData = {
      id: 'WALK-' + Date.now().toString().slice(-6),
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      walkerName: selectedProvider.walkerName,
      packageName: selectedPackage?.name || 'Standard 30-Min Walk',
      packagePrice: selectedPackage?.price || selectedProvider.discountPrice || selectedProvider.price,
      bookingDate,
      bookingTime,
      petName,
      petBreed,
      petAge,
      dogSize,
      ownerName: user?.name || 'Pet Parent',
      ownerPhone,
      pickupAddress: pickupAddress || `${selectedProvider.area}, ${selectedProvider.city}`,
      specialNotes,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    saveWalkingBooking(bookingData);
    setShowBookingModal(false);
    toast.success(`🎉 Dog walking slot booked with ${selectedProvider.name} for ${petName}! The walker will coordinate with you.`, {
      duration: 6000,
      icon: '🦮'
    });
  };

  // Direct WhatsApp Connect
  const handleWhatsApp = (provider) => {
    const text = encodeURIComponent(
      `Hello! I want to book daily dog walking sessions at "${provider.name}" (${provider.city}) found on JOSH PETS HUB.`
    );
    window.open(`https://wa.me/91${provider.phone}?text=${text}`, '_blank');
  };

  const handleResetFilters = () => {
    setSelectedPetType('All');
    setSelectedDogSize('All');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setSelectedOffering('all');
    setPriceRange('all');
    setSelectedServiceMode('All');
    setSortBy('recommended');
    setSearchKeyword('');
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">

      {/* =========================================================================
          1. HERO BANNER WITH SEARCH BAR (Exact Visual Match to Screenshot 1)
         ========================================================================= */}
      <section className="relative bg-gradient-to-r from-[#ffc83b] via-[#febc2e] to-[#ffb11b] text-slate-900 pt-8 pb-12 px-4 md:px-8 shadow-sm border-b border-amber-300">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-800/80 mb-6 font-medium">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-black transition">Pet Services</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-900">Dog Walking</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="italic font-serif text-lg md:text-xl text-[#6b3ba6] font-semibold tracking-wide block">
                Pet's Purrrrrfect Walker!
              </span>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-950 font-sans tracking-tight leading-tight">
                Dog Walking Services Near You
              </h1>

              <p className="text-xs md:text-sm text-slate-900/90 font-medium max-w-2xl leading-relaxed">
                Daily walks that boost your dog's health, behavior, and happiness.
              </p>

              {/* Tagline Badges */}
              <div className="text-[11px] md:text-xs text-slate-900/80 font-bold flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                <span>No.1 Pan India Presence</span>
                <span>|</span>
                <span>10K+ Happy Customers</span>
                <span>|</span>
                <span>Safe & Verified</span>
                <span>|</span>
                <span>Affordable</span>
              </div>

              {/* Search Filter Bar */}
              <div className="pt-4 max-w-3xl">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  
                  {/* Pet Type Select */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block px-2">Pet</label>
                    <select
                      value={selectedPetType}
                      onChange={(e) => setSelectedPetType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                    >
                      <option value="All">All Dogs</option>
                      <option value="Dogs">Adult Dogs</option>
                      <option value="Puppies">Puppies</option>
                      <option value="Senior Dogs">Senior Dogs</option>
                    </select>
                  </div>

                  {/* State Select */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block px-2">State</label>
                    <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                    >
                      {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Select */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block px-2">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                    >
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="sm:col-span-3 flex items-end">
                    <button
                      onClick={() => {
                        const el = document.getElementById('walkers-catalog');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full bg-[#7c56dc] hover:bg-[#6842c2] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Search size={14} />
                      <span>Search</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Illustration Column */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800"
                  alt="Dog On Leash In Sunny Park"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/80 filter drop-shadow-xl"
                />
                <div className="absolute -bottom-3 -left-3 bg-white px-4 py-2 rounded-2xl shadow-lg border border-amber-200 flex items-center gap-2">
                  <span className="text-xl">🦮</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Safety First</span>
                    <span className="text-xs font-extrabold text-slate-900">GPS Live Tracked</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          2. "OUR WALKING OFFERINGS" (Interactive Bar)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7c56dc] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            CHOOSE YOUR WALK TYPE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Our Dog Walking Offerings
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click on any walking format below to filter verified dog walkers specializing in that routine.
          </p>
        </div>

        {/* Offerings Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {WALKING_OFFERINGS.map((offering) => {
            const isActive = selectedOffering === offering.id;
            const count = offeringCounts[offering.id] ?? 0;
            return (
              <button
                key={offering.id}
                onClick={() => handleSelectOffering(offering.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2.5 relative group ${
                  isActive
                    ? 'bg-[#7c56dc] text-white border-[#7c56dc] shadow-lg shadow-purple-900/20 scale-105 ring-2 ring-purple-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-[#7c56dc] hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Result count bubble */}
                <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-purple-50 text-[#7c56dc]'
                }`}>
                  {count}
                </span>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition ${
                  isActive ? 'bg-white/20' : 'bg-purple-50 group-hover:bg-purple-100/70'
                }`}>
                  {offering.icon}
                </div>
                <span className="text-xs font-extrabold leading-tight">
                  {offering.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>


      {/* =========================================================================
          3. SERVICE PROVIDERS CATALOG & ADVANCED FILTER SECTION (Screenshot 2 Match)
         ========================================================================= */}
      <section id="walkers-catalog" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-16 space-y-8 scroll-mt-20">
        
        {/* Section Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-sans">
                Verified Dog Walking Service Providers
              </h2>
              {selectedOffering !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#7c56dc] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs animate-in zoom-in-95 duration-150">
                  <span>{WALKING_OFFERINGS.find(o => o.id === selectedOffering)?.icon}</span>
                  <span>{WALKING_OFFERINGS.find(o => o.id === selectedOffering)?.name}</span>
                  <button
                    onClick={() => setSelectedOffering('all')}
                    className="hover:bg-white/20 rounded-full p-0.5 ml-0.5 cursor-pointer"
                    title="Clear walk filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Showing <span className="font-bold text-[#7c56dc]">{filteredProviders.length}</span> {
                selectedOffering !== 'all'
                  ? `verified dog walkers specializing in "${WALKING_OFFERINGS.find(o => o.id === selectedOffering)?.name}"`
                  : 'background-checked dog walkers & canine fitness squads'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-[#7c56dc] transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =====================================================================
              LEFT FILTER PANEL (Screenshot 2 Match)
             ===================================================================== */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-3xl border border-purple-100 shadow-sm sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
            
            {/* Fixed Filter Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 shrink-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-[#7c56dc]" />
                <span>Filters</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-purple-50 text-[#7c56dc] px-2 py-0.5 rounded-full border border-purple-100">
                  {filteredProviders.length} Walkers
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-slate-400 hover:text-[#7c56dc] transition flex items-center gap-0.5 cursor-pointer"
                  title="Reset All Filters"
                >
                  <RefreshCw size={10} /> Reset
                </button>
              </div>
            </div>

            {/* Dedicated Scrollable Filter Container */}
            <div className="overflow-y-auto pr-1.5 space-y-5 flex-1 custom-scrollbar">
              
              {/* 1. TOP SEARCH BAR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Search Walkers
                  </h4>
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by walker, area, agency..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc] focus:ring-1 focus:ring-purple-200 transition"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* 2. BUDGET / PRICE RANGE */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Budget / Rates
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600">₹ INR</span>
                </div>

                <div className="space-y-1 text-xs">
                  {[
                    { id: 'all', label: 'All Walk Rates' },
                    { id: 'under-300', label: 'Under ₹300 (Budget Walks)' },
                    { id: '300-499', label: '₹300 - ₹499 (Standard 45-Min)' },
                    { id: '500-999', label: '₹500 - ₹999 (Cardio Jog/Trails)' },
                    { id: '1000-plus', label: '₹1,000+ (VIP Passes)' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setPriceRange(tier.id)}
                      className={`flex items-center justify-between w-full py-2 px-3 rounded-xl font-semibold text-left transition cursor-pointer ${
                        priceRange === tier.id
                          ? 'bg-[#7c56dc] text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-purple-50 hover:text-[#7c56dc]'
                      }`}
                    >
                      <span>{tier.label}</span>
                      {priceRange === tier.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. DOG SIZE */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Dog Size
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {['All', 'Small', 'Medium', 'Large', 'Giant'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedDogSize(sz)}
                      className={`py-1.5 px-2 rounded-xl font-bold text-center transition cursor-pointer ${
                        selectedDogSize === sz
                          ? 'bg-[#7c56dc] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. SORT BY */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                  SORT BY:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-[#7c56dc] text-xs font-bold text-slate-900 rounded-full px-4 py-2.5 pr-10 shadow-sm transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7c56dc]/20"
                  >
                    <option value="recommended">Recommended & Verified</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Star Ratings</option>
                    <option value="reviews">Most Walks Completed</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none stroke-[2.5]" />
                </div>
              </div>

            </div>

          </aside>

          {/* =====================================================================
              RIGHT SERVICE PROVIDERS LIST
             ===================================================================== */}
          <div className="lg:col-span-9 space-y-6">
            
            {filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map((provider) => {
                  const targetOfferingName = WALKING_OFFERINGS.find(o => o.id === selectedOffering)?.name;
                  const featuredPkg = getFeaturedPackageForOffering(provider, selectedOffering);
                  const effectivePrice = featuredPkg ? featuredPkg.price : (provider.discountPrice || provider.price);
                  
                  return (
                    <div
                      key={provider.id}
                      className="bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Provider Header Image & Badges */}
                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                          <img
                            src={provider.image}
                            alt={provider.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                          {/* Service Mode Badge */}
                          <div className="absolute top-3 left-3 bg-[#7c56dc] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                            {provider.serviceMode}
                          </div>

                          {/* Verified Badge */}
                          <div className="absolute top-3 right-3 bg-white/95 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Verified Walker</span>
                          </div>

                          {/* Name on image bottom */}
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h3 className="font-extrabold text-base leading-tight drop-shadow-sm">
                              {provider.name}
                            </h3>
                            <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-amber-300 shrink-0" />
                              <span>{provider.area}, {provider.city}</span>
                            </p>
                          </div>
                        </div>

                        {/* Provider Body Details */}
                        <div className="p-5 space-y-4">
                          
                          {/* Rating, Groomer & Experience */}
                          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                              <span className="text-slate-900">{provider.rating}</span>
                              <span className="text-slate-400 font-normal">({provider.reviews} walks)</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                              {provider.experience}
                            </span>
                          </div>

                          {/* Tagline */}
                          <p className="text-xs text-slate-600 font-medium italic">
                            "{provider.tagline}"
                          </p>

                          {/* Lead Walker */}
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">Lead Handler:</span> {provider.walkerName}
                          </p>

                          {/* Offerings Included Pills with Matched Highlighting */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Walks Offered:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {provider.offerings.map((offering, idx) => {
                                const isMatched = selectedOffering !== 'all' && targetOfferingName === offering;
                                return (
                                  <span
                                    key={idx}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                                      isMatched
                                        ? 'bg-[#7c56dc] text-white border-[#7c56dc] shadow-xs scale-105 ring-2 ring-purple-200'
                                        : 'bg-purple-50 text-[#7c56dc] border-purple-100'
                                    }`}
                                  >
                                    <span>{isMatched ? '✓' : '🦮'}</span>
                                    <span>{offering}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Features Badges */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {provider.features.map((feat, idx) => (
                              <div key={idx} className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                                <CircleCheck size={11} className="text-emerald-500 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                          </div>

                          {/* Dynamic Package Preview tailored to selected walk type */}
                          {featuredPkg && (
                            <div className={`p-3 rounded-2xl space-y-1 transition ${
                              selectedOffering !== 'all'
                                ? 'bg-purple-50/90 border border-purple-200/90'
                                : 'bg-amber-50/70 border border-amber-200/60'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                  selectedOffering !== 'all' ? 'text-[#7c56dc]' : 'text-amber-900'
                                }`}>
                                  <span>⭐</span>
                                  <span>{selectedOffering !== 'all' ? `Matched ${targetOfferingName} Plan` : 'Featured Walk Plan'}</span>
                                </span>
                                <span className={`text-xs font-extrabold ${
                                  selectedOffering !== 'all' ? 'text-[#7c56dc]' : 'text-slate-900'
                                }`}>
                                  ₹{featuredPkg.price}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800">{featuredPkg.name}</p>
                              <p className="text-[10px] text-slate-600 leading-tight">{featuredPkg.desc}</p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Card Footer: Pricing & Booking CTAs */}
                      <div className="p-5 pt-0 space-y-3">
                        <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">
                              {selectedOffering !== 'all' ? `${targetOfferingName} Rate` : 'Starting from'}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-slate-950">₹{effectivePrice}</span>
                              {selectedOffering === 'all' && provider.discountPrice && (
                                <span className="text-xs text-slate-400 line-through">₹{provider.price}</span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            100% Tracked & Safe
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenBookingModal(provider, featuredPkg)}
                            className="bg-[#7c56dc] hover:bg-[#6842c2] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Calendar size={13} />
                            <span>Book {selectedOffering !== 'all' ? targetOfferingName : 'Walk'}</span>
                          </button>

                          <button
                            onClick={() => handleWhatsApp(provider)}
                            className="bg-[#25d366] hover:bg-[#20ba59] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-purple-100 p-8 space-y-4">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-[#7c56dc]">
                  <Footprints size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">No Dog Walkers Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find walkers matching your exact filter combination. Try selecting All Walk Rates or All Cities.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#7c56dc] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition hover:bg-[#6842c2]"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </section>

      {/* =========================================================================
          4. "WHY DAILY WALKS ARE ESSENTIAL" (Educational Cards)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading, Text & Active Dog Photo */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-slate-900">
                Why Daily Dog Walking Is Essential?
              </h2>
              <div className="space-y-1 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                <p>Kudos to you for prioritizing your pet's physical and mental wellness!</p>
                <p>Because regular exercise prevents obesity, destructive anxiety, and behavioral issues.</p>
                <p className="font-semibold text-[#7c56dc]">And, who doesn't love a happy, tail-wagging pup after a great outdoor walk?</p>
              </div>
            </div>

            {/* Photo */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-purple-100 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800"
                alt="Two Happy Dogs Walking in Park"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Benefit Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. Joint Health & Weight Control (Yellow Card) */}
            <div className="bg-[#fec338] text-slate-900 p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🏃
              </div>
              <h3 className="font-extrabold text-lg">Joint & Weight Health</h3>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                Maintains optimal muscle tone, joint flexibility, and prevents obesity.
              </p>
            </div>

            {/* 2. Mental Sniffari (Cyan/Blue Card) */}
            <div className="bg-[#00b0f0] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🌳
              </div>
              <h3 className="font-extrabold text-lg">Mental Stimulation</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                Sniffing new scents satisfies innate canine instincts and reduces stress.
              </p>
            </div>

            {/* 3. Behavioral Calming (Pink Card) */}
            <div className="bg-[#ff85a1] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🎾
              </div>
              <h3 className="font-extrabold text-lg">Prevents Boredom</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                Releases pent-up energy, eliminating excessive barking & furniture chewing.
              </p>
            </div>

            {/* 4. Social Confidence (Purple Card) */}
            <div className="bg-[#8a68e8] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🐾
              </div>
              <h3 className="font-extrabold text-lg">Social Confidence</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                Encourages friendly socialization with humans, other pets, and outdoor stimuli.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. "PAWORA SAFEWALK 3-STEP GUARANTEE"
         ========================================================================= */}
      <section className="bg-white border-y border-purple-100 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
              Safe & Tracked Walks <span className="text-[#7c56dc]">At Pawora</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              You choose your preferred walk schedule, and we assign a certified, background-checked walker for your pet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: Background-Checked Handler */}
            <div className="flex items-start text-left gap-4 p-2">
              <div className="w-14 h-14 rounded-full bg-[#fec338] text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                👤
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">Verified K9 Handlers</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Every walker undergoes strict background verification and dog-handling assessments.
                </p>
              </div>
            </div>

            {/* Step 2: Live GPS Route Tracking */}
            <div className="flex items-start text-left gap-4 p-2">
              <div className="w-14 h-14 rounded-full bg-[#ff85a1] text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                📍
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">Live GPS & Potty Checks</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Track the exact walk path, distance, potty updates, and post-walk photos in real time.
                </p>
              </div>
            </div>

            {/* Step 3: Double Leash Protocol */}
            <div className="flex items-start text-left gap-4 p-2">
              <div className="w-14 h-14 rounded-full bg-[#8a68e8] text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                🛡️
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">Double-Leash Safety</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  We enforce secure double-clip leashes, sanitized paw wipes, and fresh hydration after each walk.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          6. INTERACTIVE APPOINTMENT BOOKING MODAL
         ========================================================================= */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-150">
          <div 
            className="fixed inset-0 bg-transparent"
            onClick={() => setShowBookingModal(false)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden z-10 my-auto max-h-[85vh] sm:max-h-[88vh] flex flex-col min-h-0">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ffc83b] to-[#f59e0b] p-5 text-slate-950 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Book Dog Walking Routine
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">{selectedProvider.name}</h3>
                <p className="text-[11px] text-slate-900/80 font-medium">
                  {selectedProvider.area}, {selectedProvider.city} ({selectedProvider.serviceMode})
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 text-slate-800 hover:text-black bg-white/40 hover:bg-white/70 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmitBooking} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Package Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">Choose Walking Package / Plan</label>
                <div className="space-y-2">
                  {selectedProvider.packages.map((pkg, idx) => (
                    <label
                      key={idx}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`flex items-start justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        selectedPackage?.name === pkg.name
                          ? 'border-[#7c56dc] bg-purple-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="walkingPackage"
                          checked={selectedPackage?.name === pkg.name}
                          onChange={() => setSelectedPackage(pkg)}
                          className="mt-1 text-[#7c56dc] focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{pkg.name}</p>
                          <p className="text-[10px] text-slate-500">{pkg.desc}</p>
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1 inline-block">
                            ⏱️ {pkg.duration}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#7c56dc] shrink-0">₹{pkg.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Preferred Slot *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  >
                    <option value="06:30 AM - 07:00 AM (Early Sunrise)">06:30 AM - 07:00 AM (Early Sunrise)</option>
                    <option value="07:30 AM - 08:15 AM (Morning Fresh)">07:30 AM - 08:15 AM (Morning Fresh)</option>
                    <option value="12:30 PM - 01:00 PM (Midday Potty)">12:30 PM - 01:00 PM (Midday Potty)</option>
                    <option value="05:30 PM - 06:15 PM (Evening Sunset)">05:30 PM - 06:15 PM (Evening Sunset)</option>
                    <option value="07:30 PM - 08:15 PM (Night Stride)">07:30 PM - 08:15 PM (Night Stride)</option>
                  </select>
                </div>
              </div>

              {/* Dog Details */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Dog Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dollar / Cooper"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden / Indie"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Size</label>
                  <select
                    value={dogSize}
                    onChange={(e) => setDogSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  >
                    <option value="Small">Small (under 10kg)</option>
                    <option value="Medium">Medium (10-25kg)</option>
                    <option value="Large">Large (25-40kg)</option>
                    <option value="Giant">Giant (40kg+)</option>
                  </select>
                </div>
              </div>

              {/* Contact Phone & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Your Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pickup Area / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 302, Green Avenue"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Special Instructions / Leash Habits</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Friendly with other dogs, pulls slightly, needs water break halfway..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#7c56dc] hover:bg-[#6842c2] text-white font-extrabold py-3 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CircleCheck size={16} />
                  <span>Confirm Walk Booking (₹{selectedPackage?.price || selectedProvider.price})</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WalkingServices;
