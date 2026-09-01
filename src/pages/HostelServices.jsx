import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, Search, MapPin, Phone, MessageSquare, Star, ShieldCheck, 
  Calendar, Clock, CircleCheck, ChevronRight, X, SlidersHorizontal, 
  RefreshCw, Check, ArrowRight, Heart, Award, Home, 
  ShieldAlert, UserCheck, Video, Moon, Sun, Trees, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  HOSTEL_OFFERINGS,
  HOSTEL_AMENITIES, 
  getStoredHostelProviders, 
  saveHostelBooking 
} from '../data/hostelData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

const HostelServices = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Search & Filter States
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedAmenity, setSelectedAmenity] = useState('all');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-500' | '500-899' | '900-1499' | '1500-plus'
  const [selectedStayType, setSelectedStayType] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Booking Modal States
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('1 Year');
  const [ownerPhone, setOwnerPhone] = useState(user?.mobile || '');
  const [specialDiet, setSpecialDiet] = useState('Standard (Chicken & Rice)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const providers = getStoredHostelProviders();

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
    HOSTEL_OFFERINGS.forEach(off => {
      if (off.id === 'all') {
        counts[off.id] = providers.length;
      } else {
        counts[off.id] = providers.filter(p => p.amenities.includes(off.name)).length;
      }
    });
    return counts;
  }, [providers]);

  // Handle Offering Selection with Smooth Feedback
  const handleSelectOffering = (offeringId) => {
    setSelectedAmenity((prev) => (prev === offeringId ? 'all' : offeringId));
  };

  // Helper to find the best matching package based on selected offering
  const getFeaturedPackageForOffering = (provider, offeringId) => {
    if (!provider.packages || provider.packages.length === 0) return null;
    if (offeringId === 'all') return provider.packages[0];

    const target = HOSTEL_OFFERINGS.find(o => o.id === offeringId);
    if (!target) return provider.packages[0];

    const offeringName = target.name.toLowerCase();
    const match = provider.packages.find(pkg => {
      const pName = pkg.name.toLowerCase();
      const pDesc = pkg.desc.toLowerCase();
      if (offeringId === 'ac-rooms') return pName.includes('ac') || pDesc.includes('climate') || pDesc.includes('ac');
      if (offeringId === 'cctv') return pName.includes('cctv') || pDesc.includes('cctv') || pDesc.includes('video');
      if (offeringId === 'swimming-pool') return pName.includes('pool') || pDesc.includes('pool') || pDesc.includes('splash');
      if (offeringId === 'vet-on-call') return pName.includes('vet') || pName.includes('medical') || pDesc.includes('vet');
      if (offeringId === 'home-cooked-meals') return pName.includes('meal') || pDesc.includes('meals') || pDesc.includes('chicken');
      if (offeringId === 'lawn') return pName.includes('play') || pName.includes('lawn') || pDesc.includes('lawn') || pDesc.includes('garden');
      if (offeringId === 'video-updates') return pName.includes('video') || pDesc.includes('video') || pDesc.includes('whatsapp');
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

      // 2. State Filter
      if (selectedState !== 'All States' && p.state !== selectedState) {
        return false;
      }

      // 3. City Filter
      if (selectedCity !== 'All Cities' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 4. Amenity Filter
      if (selectedAmenity !== 'all') {
        const targetAmenityName = HOSTEL_AMENITIES.find(a => a.id === selectedAmenity)?.name;
        if (targetAmenityName && !p.amenities.includes(targetAmenityName)) {
          return false;
        }
      }

      // 5. Price Filter (per night)
      const effectivePrice = p.discountPrice || p.pricePerNight;
      if (priceRange === 'under-500' && effectivePrice >= 500) return false;
      if (priceRange === '500-899' && (effectivePrice < 500 || effectivePrice > 899)) return false;
      if (priceRange === '900-1499' && (effectivePrice < 900 || effectivePrice > 1499)) return false;
      if (priceRange === '1500-plus' && effectivePrice < 1500) return false;

      // 6. Stay Type Filter
      if (selectedStayType !== 'All' && !p.stayType.toLowerCase().includes(selectedStayType.toLowerCase())) {
        return false;
      }

      // 7. Search Keyword
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesKeyword = 
          p.name.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.hostName.toLowerCase().includes(query);
        if (!matchesKeyword) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.pricePerNight;
      const priceB = b.discountPrice || b.pricePerNight;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0; // recommended
    });
  }, [
    providers, selectedPetType, selectedState, selectedCity, 
    selectedAmenity, priceRange, selectedStayType, sortBy, searchKeyword
  ]);

  // Open Booking Modal for a hostel
  const handleOpenBookingModal = (provider, pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to book a pet hostel stay.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'hostel' } }));
      return;
    }
    setSelectedProvider(provider);
    setSelectedPackage(pkg || provider.packages[0] || null);
    setShowBookingModal(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      toast.error('Please pick check-in and check-out dates.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error('Check-out date must be after check-in date.');
      return;
    }
    if (!petName.trim() || !petBreed.trim()) {
      toast.error('Please provide your pet name and breed.');
      return;
    }
    if (!ownerPhone.trim()) {
      toast.error('Please provide your contact phone number.');
      return;
    }

    // Calculate nights
    const diffTime = Math.abs(new Date(checkOutDate) - new Date(checkInDate));
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyRate = selectedPackage?.price || selectedProvider.discountPrice || selectedProvider.pricePerNight;
    const totalAmount = nights * dailyRate;

    const bookingData = {
      id: 'HSTBK-' + Date.now().toString().slice(-6),
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      hostName: selectedProvider.hostName,
      packageName: selectedPackage?.name || 'Standard Stay',
      dailyRate,
      nights,
      totalAmount,
      checkInDate,
      checkOutDate,
      petName,
      petBreed,
      petAge,
      specialDiet,
      ownerName: user?.name || 'Pet Parent',
      ownerPhone,
      specialNotes,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    saveHostelBooking(bookingData);
    setShowBookingModal(false);
    toast.success(`🎉 Pet Hostel booking confirmed with ${selectedProvider.name} for ${nights} night(s)! The host will connect with you on WhatsApp.`, {
      duration: 6000,
      icon: '🏨'
    });
  };

  // Direct WhatsApp Connect
  const handleWhatsApp = (provider) => {
    const text = encodeURIComponent(
      `Hello! I am inquiring about boarding my pet at "${provider.name}" (${provider.city}) listed on India Pet Hub.`
    );
    window.open(`https://wa.me/91${provider.phone}?text=${text}`, '_blank');
  };

  const handleResetFilters = () => {
    setSelectedPetType('All');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setSelectedAmenity('all');
    setPriceRange('all');
    setSelectedStayType('All');
    setSortBy('recommended');
    setSearchKeyword('');
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">

      {/* =========================================================================
          1. RADIANT HERO BANNER WITH SEARCH FILTER BAR (Screenshot 1 Match)
         ========================================================================= */}
      <section className="relative bg-gradient-to-r from-[#ffc83b] via-[#febc2e] to-[#ffb11b] text-slate-900 pt-8 pb-12 px-4 md:px-8 shadow-sm border-b border-amber-300">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-800/80 mb-6 font-medium">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-black transition">Pet Services</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-900">Dog Hostel</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="italic font-serif text-lg md:text-xl text-[#6b3ba6] font-semibold tracking-wide block">
                Pet's Purrrrrfect Staycation!
              </span>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-950 font-sans tracking-tight leading-tight">
                Dog Hostel Services Near You
              </h1>

              <p className="text-xs md:text-sm text-slate-900/90 font-medium max-w-2xl leading-relaxed">
                Safe & Verified | 10000+ Trusted | Affordable | Comfortable | No.1 Pan India Presence
              </p>

              {/* Search Filter Bar */}
              <div className="pt-4 max-w-3xl">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  
                  {/* Pet Type Select */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block px-2">Pet Type</label>
                    <select
                      value={selectedPetType}
                      onChange={(e) => setSelectedPetType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                    >
                      <option value="All">All Pets</option>
                      <option value="Dogs">Dogs</option>
                      <option value="Cats">Cats</option>
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
                        const el = document.getElementById('hostels-catalog');
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
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800"
                  alt="Cozy Pet in Wicker Chair"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/80 filter drop-shadow-xl"
                />
                <div className="absolute -bottom-3 -left-3 bg-white px-4 py-2 rounded-2xl shadow-lg border border-amber-200 flex items-center gap-2">
                  <span className="text-xl">🏨</span>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Verified Hostels</p>
                    <p className="text-xs font-extrabold text-slate-800">100% Cage-Free Stay</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          2. "OUR HOSTEL & BOARDING OFFERINGS" (Interactive Service Bar)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#7c56dc] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            CHOOSE YOUR STAY TYPE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Our Hostel & Boarding Offerings
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click on any service offering below to filter verified pet hostels providing that facility.
          </p>
        </div>

        {/* Offerings Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {HOSTEL_OFFERINGS.map((offering) => {
            const isActive = selectedAmenity === offering.id;
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
          3. SERVICE PROVIDERS CATALOG & ADVANCED FILTER SECTION (Brought to Top)
         ========================================================================= */}
      <section id="hostels-catalog" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-16 space-y-8 scroll-mt-20">
        
        {/* Section Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-sans">
                Verified Pet Hostels & Boarding Homes
              </h2>
              {selectedAmenity !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-[#7c56dc] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs animate-in zoom-in-95 duration-150">
                  <span>{HOSTEL_OFFERINGS.find(o => o.id === selectedAmenity)?.icon}</span>
                  <span>{HOSTEL_OFFERINGS.find(o => o.id === selectedAmenity)?.name}</span>
                  <button
                    onClick={() => setSelectedAmenity('all')}
                    className="hover:bg-white/20 rounded-full p-0.5 ml-0.5 cursor-pointer"
                    title="Clear facility filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Showing <span className="font-bold text-[#7c56dc]">{filteredProviders.length}</span> {
                selectedAmenity !== 'all'
                  ? `verified boarding hostels providing "${HOSTEL_OFFERINGS.find(o => o.id === selectedAmenity)?.name}"`
                  : 'verified boarding resorts & home sitters'
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
              LEFT FILTER PANEL (With Top Search & Separate Scrollbar)
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
                  {filteredProviders.length} Results
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

            {/* Dedicated Scrollable Filter Container with Separate Scrollbar */}
            <div className="overflow-y-auto pr-1.5 space-y-5 flex-1 custom-scrollbar">
              
              {/* 1. TOP SEARCH BAR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Search Hostels
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
                    placeholder="Search by name, area, resort..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc] focus:ring-1 focus:ring-purple-200 transition"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* 2. STAY FEATURES & AMENITIES FILTER */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Facilities
                  </h4>
                  {selectedAmenity !== 'all' && (
                    <button
                      onClick={() => setSelectedAmenity('all')}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  {HOSTEL_OFFERINGS.map((off) => {
                    const isSel = selectedAmenity === off.id;
                    const count = offeringCounts[off.id] ?? 0;
                    return (
                      <button
                        key={off.id}
                        onClick={() => setSelectedAmenity(isSel ? 'all' : off.id)}
                        className={`flex items-center justify-between w-full py-1.5 px-2.5 rounded-xl font-semibold text-left transition cursor-pointer ${
                          isSel
                            ? 'bg-[#7c56dc] text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-[#7c56dc]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{off.icon}</span>
                          <span className="truncate">{off.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. PRICE RANGE FILTER (Per Night) */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Daily Rate / Night
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600">₹ INR</span>
                </div>

                <div className="space-y-1 text-xs">
                  {[
                    { id: 'all', label: 'All Price Ranges' },
                    { id: 'under-500', label: 'Under ₹500 (Budget Boarding)' },
                    { id: '500-899', label: '₹500 - ₹899 (Standard AC Suite)' },
                    { id: '900-1499', label: '₹900 - ₹1,499 (Luxury Resort)' },
                    { id: '1500-plus', label: '₹1,500+ (VIP Suite & Pool Pass)' }
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

              {/* 4. STAY / ROOM TYPE */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Stay Type
                </h4>
                <div className="space-y-1 text-xs">
                  {['All', 'AC Suite', 'Home Boarding', 'Farmhouse Resort', 'Vet-Supervised'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedStayType(type)}
                      className={`flex items-center justify-between w-full py-1.5 px-3 rounded-xl font-semibold text-left transition cursor-pointer ${
                        selectedStayType === type
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{type}</span>
                      {selectedStayType === type && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. PET TYPE */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Pet Type
                </h4>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {['All', 'Dogs', 'Cats'].map((pt) => (
                    <button
                      key={pt}
                      onClick={() => setSelectedPetType(pt)}
                      className={`py-1.5 px-2 rounded-xl font-bold text-center transition cursor-pointer ${
                        selectedPetType === pt
                          ? 'bg-[#7c56dc] text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. SORT BY */}
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
                    <option value="reviews">Most Reviews & Stays</option>
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
                  const targetAmenityName = HOSTEL_OFFERINGS.find(o => o.id === selectedAmenity)?.name;
                  const featuredPkg = getFeaturedPackageForOffering(provider, selectedAmenity);
                  const effectivePrice = featuredPkg ? featuredPkg.price : (provider.discountPrice || provider.pricePerNight);
                  
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

                          {/* Stay Type Badge */}
                          <div className="absolute top-3 left-3 bg-[#7c56dc] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                            {provider.stayType}
                          </div>

                          {/* Verified Badge */}
                          <div className="absolute top-3 right-3 bg-white/95 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Verified</span>
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
                          
                          {/* Rating, Host & Experience */}
                          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                              <span className="text-slate-900">{provider.rating}</span>
                              <span className="text-slate-400 font-normal">({provider.reviews} reviews)</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                              {provider.experience}
                            </span>
                          </div>

                          {/* Tagline */}
                          <p className="text-xs text-slate-600 font-medium italic">
                            "{provider.tagline}"
                          </p>

                          {/* Host info */}
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">Host:</span> {provider.hostName}
                          </p>

                          {/* Amenities Included Pills with Matched Highlighting */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Hostel Amenities:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {provider.amenities.map((amenity, idx) => {
                                const isMatched = selectedAmenity !== 'all' && targetAmenityName === amenity;
                                return (
                                  <span
                                    key={idx}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                                      isMatched
                                        ? 'bg-[#7c56dc] text-white border-[#7c56dc] shadow-xs scale-105 ring-2 ring-purple-200'
                                        : 'bg-purple-50 text-[#7c56dc] border-purple-100'
                                    }`}
                                  >
                                    <span>{isMatched ? '✓' : '✨'}</span>
                                    <span>{amenity}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic Stay Package Preview tailored to selected feature */}
                          {featuredPkg && (
                            <div className={`p-3 rounded-2xl space-y-1 transition ${
                              selectedAmenity !== 'all'
                                ? 'bg-purple-50/90 border border-purple-200/90'
                                : 'bg-amber-50/70 border border-amber-200/60'
                            }`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                  selectedAmenity !== 'all' ? 'text-[#7c56dc]' : 'text-amber-900'
                                }`}>
                                  <span>⭐</span>
                                  <span>{selectedAmenity !== 'all' ? `Matched ${targetAmenityName} Package` : 'Featured Stay Package'}</span>
                                </span>
                                <span className={`text-xs font-extrabold ${
                                  selectedAmenity !== 'all' ? 'text-[#7c56dc]' : 'text-slate-900'
                                }`}>
                                  ₹{featuredPkg.price}/night
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
                              {selectedAmenity !== 'all' ? `${targetAmenityName} Rate` : 'Starting from'}
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-slate-950">₹{effectivePrice}</span>
                              <span className="text-[11px] text-slate-500">/ night</span>
                              {selectedAmenity === 'all' && provider.discountPrice && (
                                <span className="text-xs text-slate-400 line-through ml-1">₹{provider.pricePerNight}</span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            24/7 CCTV & Meals Included
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenBookingModal(provider, featuredPkg)}
                            className="bg-[#7c56dc] hover:bg-[#6842c2] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Calendar size={13} />
                            <span>Book {selectedAmenity !== 'all' ? targetAmenityName : 'Stay'}</span>
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
                  <Home size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">No Pet Hostels Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find hostels matching your exact filter combination. Try expanding your price range or selecting All Cities.
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
          3. "RESULTS BRIGHT AS YOUR PET'S EYES" STATS COUNTERS (Moved Below Catalog)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Results Bright As Your <span className="text-[#7c56dc]">Pet's Eyes</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Every wag, purr, and paw-print is a testament to the trust 10000+ pet parents have placed in us.
          </p>
        </div>

        {/* 4 Colorful Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Purple */}
          <div className="bg-[#8a68e8] text-white p-8 rounded-3xl shadow-md text-center space-y-2 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">250+</span>
            <p className="text-xs font-semibold text-white/90">Hostels all over India</p>
          </div>

          {/* Card 2: Pink */}
          <div className="bg-[#ff85a1] text-white p-8 rounded-3xl shadow-md text-center space-y-2 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">10000+</span>
            <p className="text-xs font-semibold text-white/90">Happy customers</p>
          </div>

          {/* Card 3: Cyan Blue */}
          <div className="bg-[#00b0f0] text-white p-8 rounded-3xl shadow-md text-center space-y-2 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">8+</span>
            <p className="text-xs font-semibold text-white/90">Years in hostel service</p>
          </div>

          {/* Card 4: Yellow/Gold */}
          <div className="bg-[#fec338] text-slate-900 p-8 rounded-3xl shadow-md text-center space-y-2 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">7000+</span>
            <p className="text-xs font-bold text-slate-800">Pets boarded with us</p>
          </div>

        </div>
      </section>


      {/* =========================================================================
          4. "YOUR PET FEELS SAFEST" (Photo Cards Moved Below)
         ========================================================================= */}
      <section className="bg-white border-y border-purple-100 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
              Your Pet Feels Safest
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              In our secure, home-based pet hostels and boardings. Your pet's dream place!
            </p>
          </div>

          {/* 3 Real Life Hostel Photo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Photo 1 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600"
                alt="Social Communal Play Zone"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Photo 2 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=600"
                alt="Puppy Sleeping in Blue Bed"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Photo 3 */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-purple-100 bg-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=600"
                alt="Loving Caretaker Outdoors"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          5. "WHY DO PET PARENTS CHOOSE PAWORA?" (Testimonials)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Why Do Pet Parents Choose <span className="text-[#7c56dc]">Pawora?</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Nationwide presence in 50+ cities including Delhi, Bangalore, Jaipur, and Chennai.
          </p>
        </div>

        {/* 3 Host Partner Testimonial Blob Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Host 1 */}
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition text-center space-y-4 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 bg-[#fec338]/30 rounded-full transform -rotate-6"></div>
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400"
                alt="Safe & Secure Team"
                className="relative w-full h-full object-cover rounded-full border-2 border-white shadow-md"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              "Our team ensures that your pet is in safe and secure hands with 24/7 round-the-clock loving supervision."
            </p>
            <span className="text-[11px] font-bold text-[#7c56dc] hover:underline cursor-pointer">
              Read more →
            </span>
          </div>

          {/* Host 2 */}
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition text-center space-y-4 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 bg-[#ff85a1]/30 rounded-full transform rotate-6"></div>
              <img
                src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=400"
                alt="Background Checked Partners"
                className="relative w-full h-full object-cover rounded-full border-2 border-white shadow-md"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              "Our host partners are fully background-checked, certified pet lovers with verified hygienic homes."
            </p>
            <span className="text-[11px] font-bold text-[#7c56dc] hover:underline cursor-pointer">
              Read more →
            </span>
          </div>

          {/* Host 3 */}
          <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition text-center space-y-4 flex flex-col items-center">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 bg-[#8a68e8]/30 rounded-full transform -rotate-6"></div>
              <img
                src="https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=400"
                alt="Real Time Video Updates"
                className="relative w-full h-full object-cover rounded-full border-2 border-white shadow-md"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              "You'll receive real-time photo and video updates on WhatsApp twice a day so you never miss a moment."
            </p>
            <span className="text-[11px] font-bold text-[#7c56dc] hover:underline cursor-pointer">
              Read more →
            </span>
          </div>

        </div>
      </section>


      {/* =========================================================================
          6. "OUR QUICK EASY PROCESS" (Process Steps)
         ========================================================================= */}
      <section className="bg-white border-y border-purple-100 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
              Our Quick Easy <span className="text-[#7c56dc]">Process</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Get Safe, Secure and Welcoming environment for your furry companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: Get in Touch */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#fec338] text-white flex items-center justify-center text-2xl shadow-md">
                👤
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Get in Touch</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Call us or fill out the form, our pet care expert will reach out to you shortly.
              </p>
            </div>

            {/* Step 2: Share the Details */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#ff85a1] text-white flex items-center justify-center text-2xl shadow-md">
                🚪
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Share the Details</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Tell your pet's needs, hostel, boarding, or sitter, and get all the info you need.
              </p>
            </div>

            {/* Step 3: Pay & Relax */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#8a68e8] text-white flex items-center justify-center text-2xl shadow-md">
                🏷️
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Pay & Relax</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Confirm your booking and relax, we'll pamper your fur baby with love and care.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          7. INTERACTIVE HOSTEL STAY BOOKING MODAL
         ========================================================================= */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowBookingModal(false)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ffc83b] to-[#f59e0b] p-5 text-slate-950 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Reserve Hostel Staycation
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">{selectedProvider.name}</h3>
                <p className="text-[11px] text-slate-900/80 font-medium">
                  {selectedProvider.area}, {selectedProvider.city} ({selectedProvider.stayType})
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 text-slate-800 hover:text-black bg-white/40 hover:bg-white/70 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmitBooking} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Room & Package Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">Choose Room Type / Package</label>
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
                          name="hostelPackage"
                          checked={selectedPackage?.name === pkg.name}
                          onChange={() => setSelectedPackage(pkg)}
                          className="mt-1 text-[#7c56dc] focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{pkg.name}</p>
                          <p className="text-[10px] text-slate-500">{pkg.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#7c56dc] shrink-0">₹{pkg.price}/night</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Check-in & Check-out Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruno"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Retriever"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
              </div>

              {/* Food & Diet Preference */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Diet & Food Preference</label>
                <select
                  value={specialDiet}
                  onChange={(e) => setSpecialDiet(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                >
                  <option value="Standard (Chicken & Rice)">Standard Fresh Chicken & Rice / Broth</option>
                  <option value="Dry Food / Kibble (Royal Canin / Drools)">Commercial Dry Kibble Diet</option>
                  <option value="Vegetarian (Paneer, Curd & Rice)">Vegetarian (Curd, Rice, Boiled Eggs & Veggies)</option>
                  <option value="I will provide my pet's food">I will bring my own pet food</option>
                </select>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Your Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Special Medical / Behavioral Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Needs daily ear drops, shy around loud noises, loves fetch..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                ></textarea>
              </div>

              {/* Submit & Confirm */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#7c56dc] hover:bg-[#6842c2] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CircleCheck size={15} />
                  <span>Confirm Stay Reservation (Pay During Check-In)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default HostelServices;
