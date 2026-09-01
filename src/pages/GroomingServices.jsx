import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, Search, MapPin, Phone, MessageSquare, Star, ShieldCheck, 
  Calendar, Clock, CircleCheck, ChevronRight, X, SlidersHorizontal, 
  RefreshCw, Check, ArrowRight, Heart, Award, Scissors, Bath, 
  ShieldAlert, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  GROOMING_OFFERINGS, 
  getStoredGroomingProviders
} from '../data/groomingData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';
import { apiRequest } from '../services/api.js';
import ScrollReveal from '../components/ScrollReveal.jsx';

const GroomingServices = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Search & Filter States
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedOffering, setSelectedOffering] = useState('all');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-500' | '500-999' | '1000-1499' | '1500-plus'
  const [selectedServiceMode, setSelectedServiceMode] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Booking Modal States
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM - 11:30 AM');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('1 Year');
  const [ownerPhone, setOwnerPhone] = useState(user?.mobile || '');
  const [specialNotes, setSpecialNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const providers = getStoredGroomingProviders();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update available cities when state changes
  const availableCities = useMemo(() => {
    if (selectedState === 'All States' || !INDIAN_STATES_CITIES[selectedState]) {
      return ['All Cities'];
    }
    return ['All Cities', ...INDIAN_STATES_CITIES[selectedState]];
  }, [selectedState]);

  // Handle State selection change
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity('All Cities');
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

      // 4. Offering Filter
      if (selectedOffering !== 'all') {
        const targetOfferingName = GROOMING_OFFERINGS.find(o => o.id === selectedOffering)?.name;
        if (targetOfferingName && !p.offerings.includes(targetOfferingName)) {
          return false;
        }
      }

      // 5. Price Filter
      const effectivePrice = p.discountPrice || p.price;
      if (priceRange === 'under-500' && effectivePrice >= 500) return false;
      if (priceRange === '500-999' && (effectivePrice < 500 || effectivePrice > 999)) return false;
      if (priceRange === '1000-1499' && (effectivePrice < 1000 || effectivePrice > 1499)) return false;
      if (priceRange === '1500-plus' && effectivePrice < 1500) return false;

      // 6. Service Mode Filter
      if (selectedServiceMode !== 'All' && !p.serviceMode.toLowerCase().includes(selectedServiceMode.toLowerCase())) {
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
          p.groomerName.toLowerCase().includes(query);
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
    providers, selectedPetType, selectedState, selectedCity, 
    selectedOffering, priceRange, selectedServiceMode, sortBy, searchKeyword
  ]);

  // Open Booking Modal for a provider
  const handleOpenBookingModal = (provider, pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to book a grooming appointment.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user' } }));
      return;
    }
    setSelectedProvider(provider);
    setSelectedPackage(pkg || provider.packages[0] || null);
    setShowBookingModal(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please pick a booking date.');
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

    const payload = {
      providerName: selectedProvider.name,
      serviceType: 'Grooming',
      location: selectedProvider.city + ', ' + selectedProvider.state,
      date: bookingDate,
      timeSlot: bookingTime,
      petDetails: {
        name: petName,
        type: selectedPetType === 'All' ? 'Dog/Cat' : selectedPetType,
        breed: petBreed
      },
      fee: selectedPackage?.price || selectedProvider.discountPrice || selectedProvider.price
    };

    try {
      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        setShowBookingModal(false);
        toast.success(`🎉 Grooming appointment booked with ${selectedProvider.name} for ${petName}! The groomer will reach out shortly.`, {
          duration: 6000,
          icon: '✂️'
        });
      }
    } catch (err) {
      toast.error(err.message || 'Booking reservation failed.');
    }
  };

  // Direct WhatsApp Connect
  const handleWhatsApp = (provider) => {
    const text = encodeURIComponent(
      `Hello! I want to book a pet grooming session at "${provider.name}" (${provider.city}) found on India Pet Hub.`
    );
    window.open(`https://wa.me/91${provider.phone}?text=${text}`, '_blank');
  };

  const handleResetFilters = () => {
    setSelectedPetType('All');
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
            <span className="font-bold text-slate-900">Dog Grooming</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="italic font-serif text-lg md:text-xl text-[#6b3ba6] font-semibold tracking-wide block">
                Pet's Purrrrrfect Look!
              </span>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-950 font-sans tracking-tight leading-tight">
                Dog Grooming Services Near You
              </h1>

              <p className="text-xs md:text-sm text-slate-900/90 font-medium max-w-2xl leading-relaxed">
                Expert grooming that keeps your pet clean and healthy, helping them look and feel their best.
              </p>

              {/* Tagline Badges */}
              <div className="text-[11px] md:text-xs text-slate-900/80 font-bold flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                <span>Clean and Hygienic</span>
                <span>|</span>
                <span>Comfortable</span>
                <span>|</span>
                <span>Affordable</span>
                <span>|</span>
                <span>10K+ Happy Customers</span>
                <span>|</span>
                <span>No.1 Pan India</span>
              </div>

              {/* Search Filter Bar */}
              <div className="pt-4 max-w-3xl">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  
                  {/* Pet Type Select */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] uppercase font-extrabold text-slate-400 block px-2">Pet Type</label>
                    <select
                      value={selectedPetType}
                      onChange={(e) => setSelectedPetType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary"
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
                        const el = document.getElementById('providers-catalog');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full bg-primary hover:bg-[#6842c2] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
                  alt="Groomed Happy Dog"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/80 filter drop-shadow-xl"
                />
                <div className="absolute -bottom-3 -left-3 bg-white px-4 py-2 rounded-2xl shadow-lg border border-amber-200 flex items-center gap-2">
                  <span className="text-xl">✂️</span>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Verified Care</p>
                    <p className="text-xs font-extrabold text-slate-800">100% Gentle Grooming</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          2. "WHY IS PET GROOMING IMPORTANT?" (Screenshot 2 Match)
         ========================================================================= */}
      <ScrollReveal variant="fade">
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading, Text & Bath Photo */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-slate-900">
                Why Is Pet Grooming Important?
              </h2>
              <div className="space-y-1 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                <p>Kudos to you for putting your pet first!</p>
                <p>Because grooming isn't just pampering, it's essential care.</p>
                <p className="font-semibold text-primary">And, who doesn't want their pet to look Purrrrrfect?</p>
              </div>
            </div>

            {/* Bath Photo */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-beige bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800"
                alt="Dog Getting Gentle Bath"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right Column: 2x2 Grid of Benefit Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. Better Hygiene (Yellow Card) */}
            <div className="bg-[#fec338] text-slate-900 p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🛁
              </div>
              <h3 className="font-extrabold text-lg">Better Hygiene</h3>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                Clean pet, fewer germs, fresher cuddles.
              </p>
            </div>

            {/* 2. Body Temperature (Cyan/Blue Card) */}
            <div className="bg-[#00b0f0] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                ❄️
              </div>
              <h3 className="font-extrabold text-lg">Body Temperature</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                A trimmed fur helps regulate body heat.
              </p>
            </div>

            {/* 3. Shedding and Tangling (Pink Card) */}
            <div className="bg-[#ff85a1] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🪮
              </div>
              <h3 className="font-extrabold text-lg">Shedding and Tangling</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                Shiny, tangle-free coat with regular grooming.
              </p>
            </div>

            {/* 4. Diseases Detection (Purple Card) */}
            <div className="bg-[#8a68e8] text-white p-6 rounded-3xl shadow-md space-y-3 flex flex-col justify-center transform hover:-translate-y-1 transition duration-200">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center text-2xl shadow-xs">
                🩺
              </div>
              <h3 className="font-extrabold text-lg">Diseases Detection</h3>
              <p className="text-xs font-medium text-white/95 leading-relaxed">
                Spot issues early, ensure timely care.
              </p>
            </div>

          </div>

        </div>
        </section>
      </ScrollReveal>


      {/* =========================================================================
          3. "GROOMING STARTS WITH CARE" (Screenshot 3 Match)
         ========================================================================= */}
      <ScrollReveal variant="slideUp">
        <section className="bg-white border-y border-beige py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
              Grooming Starts With <span className="text-primary">Care At Pawora</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              You choose your preferred time, and we will assign a verified professional groomer for your pet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: Pet-First Approach */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#fec338] text-white flex items-center justify-center text-2xl shadow-md">
                👤
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Pet-First Approach</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                The groomer arrives and makes your pet feel safe and relaxed before beginning.
              </p>
            </div>

            {/* Step 2: Skin & Coat Assessment */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#ff85a1] text-white flex items-center justify-center text-2xl shadow-md">
                🚪
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Skin & Coat Assessment</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                The groomer assesses your pet's skin type and coat condition for a tailored grooming session.
              </p>
            </div>

            {/* Step 3: Quality Commitment */}
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#8a68e8] text-white flex items-center justify-center text-2xl shadow-md">
                🏷️
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Quality Commitment</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                We use only suitable products and commit to delivering top-quality grooming every time.
              </p>
            </div>

          </div>

        </div>
        </section>
      </ScrollReveal>


      {/* =========================================================================
          4. "OUR GROOMING OFFERINGS" (Screenshot 4 Match)
         ========================================================================= */}
      <ScrollReveal variant="fade">
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary bg-sand px-3 py-1 rounded-full border border-beige">
            CHOOSE YOUR SERVICE
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Our Grooming Offerings
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click on any service offering below to filter verified groomers providing that service.
          </p>
        </div>

        {/* Offerings Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {GROOMING_OFFERINGS.map((offering) => {
            const isActive = selectedOffering === offering.id;
            return (
              <button
                key={offering.id}
                onClick={() => setSelectedOffering(isActive ? 'all' : offering.id)}
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg scale-105'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-primary hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  isActive ? 'bg-white/20' : 'bg-sand'
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
      </ScrollReveal>


      {/* =========================================================================
          5. SERVICE PROVIDERS CATALOG & ADVANCED FILTER SECTION (With Price Filter)
         ========================================================================= */}
      <ScrollReveal variant="fade">
        <section id="providers-catalog" className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-16 space-y-8">
        
        {/* Section Title & Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 font-sans">
              Verified Grooming Service Providers
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Showing <span className="font-bold text-primary">{filteredProviders.length}</span> trusted groomers & doorstep vans
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-primary transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =====================================================================
              LEFT FILTER PANEL (Price Filter, Location, Mode, Rating)
             ===================================================================== */}
          <aside className="lg:col-span-3 bg-white p-5 rounded-3xl border border-beige shadow-sm sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
            
            {/* Fixed Filter Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 shrink-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-primary" />
                <span>Filters</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-sand text-primary px-2 py-0.5 rounded-full border border-beige">
                  {filteredProviders.length} Results
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-slate-400 hover:text-primary transition flex items-center gap-0.5 cursor-pointer"
                  title="Reset All Filters"
                >
                  <RefreshCw size={10} /> Reset
                </button>
              </div>
            </div>

            {/* Dedicated Scrollable Filter Container with Separate Scrollbar */}
            <div className="overflow-y-auto pr-1.5 space-y-5 flex-1 custom-scrollbar">
              
              {/* 1. TOP KEYWORD / AREA SEARCH BAR (Placed on Top as Requested) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Search Groomers
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
                    placeholder="Search by name, area, salon..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-beige transition"
                  />
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* 2. PRICE RANGE FILTER */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Price Range
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600">₹ INR</span>
                </div>

                <div className="space-y-1 text-xs">
                  {[
                    { id: 'all', label: 'All Price Ranges' },
                    { id: 'under-500', label: 'Under ₹500 (Budget Essentials)' },
                    { id: '500-999', label: '₹500 - ₹999 (Standard Bath & Spa)' },
                    { id: '1000-1499', label: '₹1,000 - ₹1,499 (Full Grooming)' },
                    { id: '1500-plus', label: '₹1,500+ (Luxury & Show Styling)' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setPriceRange(tier.id)}
                      className={`flex items-center justify-between w-full py-2 px-3 rounded-xl font-semibold text-left transition cursor-pointer ${
                        priceRange === tier.id
                          ? 'bg-primary text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-sand hover:text-primary'
                      }`}
                    >
                      <span>{tier.label}</span>
                      {priceRange === tier.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. SERVICE MODE (Doorstep Van vs Salon Studio vs Home Visit) */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Service Mode
                </h4>
                <div className="space-y-1 text-xs">
                  {['All', 'Doorstep Van', 'Home Visit', 'Salon Studio'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedServiceMode(mode)}
                      className={`flex items-center justify-between w-full py-1.5 px-3 rounded-xl font-semibold text-left transition cursor-pointer ${
                        selectedServiceMode === mode
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{mode}</span>
                      {selectedServiceMode === mode && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. PET TYPE */}
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
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-sand'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. SORT BY */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Sort By
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-primary"
                >
                  <option value="recommended">Recommended (Top Rated)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Star Ratings</option>
                  <option value="reviews">Most Reviews & Bookings</option>
                </select>
              </div>

              {/* 6. LOCATION FILTERS (State & City) */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Location
                </h4>
                <div className="space-y-1.5">
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  >
                    {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-primary"
                  >
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
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
                  const effectivePrice = provider.discountPrice || provider.price;
                  return (
                    <div
                      key={provider.id}
                      className="bg-white rounded-3xl border border-beige shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
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

                          {/* Mode Badge */}
                          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                            {provider.serviceMode}
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
                          
                          {/* Rating, Experience & Pet Types */}
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

                          {/* Services Included Pills */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Offerings Included:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {provider.offerings.slice(0, 4).map((off, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold bg-sand text-primary px-2.5 py-1 rounded-lg border border-beige"
                                >
                                  {off}
                                </span>
                              ))}
                              {provider.offerings.length > 4 && (
                                <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">
                                  +{provider.offerings.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Popular Package Preview */}
                          {provider.packages && provider.packages.length > 0 && (
                            <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-900">
                                  ⭐ Most Booked Package
                                </span>
                                <span className="text-xs font-extrabold text-slate-900">
                                  ₹{provider.packages[0].price}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-800">{provider.packages[0].name}</p>
                              <p className="text-[10px] text-slate-600 leading-tight">{provider.packages[0].desc}</p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Card Footer: Pricing & Booking CTAs */}
                      <div className="p-5 pt-0 space-y-3">
                        <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Starting from</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-extrabold text-slate-950">₹{effectivePrice}</span>
                              {provider.discountPrice && (
                                <span className="text-xs text-slate-400 line-through">₹{provider.price}</span>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                            Instant Confirmation
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleOpenBookingModal(provider)}
                            className="bg-primary hover:bg-[#6842c2] text-white font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Calendar size={13} />
                            <span>Book Session</span>
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
              <div className="text-center py-16 bg-white rounded-3xl border border-beige p-8 space-y-4">
                <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto text-primary">
                  <Scissors size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">No Grooming Providers Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find groomers matching your exact filter combination. Try expanding your price range or selecting All Cities.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-primary text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition hover:bg-[#6842c2]"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>

        </div>

        </section>
      </ScrollReveal>


      {/* =========================================================================
          6. INTERACTIVE APPOINTMENT BOOKING MODAL
         ========================================================================= */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowBookingModal(false)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl border border-beige w-full max-w-lg overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#ffc83b] to-[#f59e0b] p-5 text-slate-950 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Book Grooming Appointment
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">{selectedProvider.name}</h3>
                <p className="text-[11px] text-slate-900/80 font-medium">
                  {selectedProvider.area}, {selectedProvider.city} ({selectedProvider.serviceMode})
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
              
              {/* Package Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">Choose Grooming Package</label>
                <div className="space-y-2">
                  {selectedProvider.packages.map((pkg, idx) => (
                    <label
                      key={idx}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`flex items-start justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        selectedPackage?.name === pkg.name
                          ? 'border-primary bg-sand/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="groomingPackage"
                          checked={selectedPackage?.name === pkg.name}
                          onChange={() => setSelectedPackage(pkg)}
                          className="mt-1 text-primary focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{pkg.name}</p>
                          <p className="text-[10px] text-slate-500">{pkg.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-primary shrink-0">₹{pkg.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Time Slot *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                  >
                    <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                    <option value="10:30 AM - 12:00 PM">10:30 AM - 12:00 PM</option>
                    <option value="01:00 PM - 02:30 PM">01:00 PM - 02:30 PM</option>
                    <option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM</option>
                    <option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shih Tzu / Labrador"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                  />
                </div>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Special Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Sensitive skin, timid with dryers, knotty coat..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              {/* Submit & Confirm */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#6842c2] text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CircleCheck size={15} />
                  <span>Confirm Booking (Pay During Grooming: ₹{selectedPackage?.price || selectedProvider.price})</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default GroomingServices;
