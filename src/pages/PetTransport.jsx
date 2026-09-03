import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, Search, MapPin, Phone, MessageSquare, Star, ShieldCheck, 
  Calendar, Clock, CircleCheck, ChevronRight, X, SlidersHorizontal, 
  RefreshCw, Check, ArrowRight, Heart, Award, Navigation, 
  Compass, ShieldAlert, UserCheck, Truck, Plane, Train, Anchor,
  Scale, FileText, Send, HelpCircle, Info, ChevronDown, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  TRANSPORT_MODES, 
  TRANSPORT_STEPS, 
  getStoredTransportProviders, 
  saveTransportBooking,
  saveTransportEnquiry
} from '../data/transportData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../components/ServiceAccessLock.jsx';

const PetTransport = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isServicePathLockedForUser(user, '/transport')) {
    return <ServiceAccessLock serviceName="Pet Transport & Relocation" attemptedPath="/transport" />;
  }

  // Search & Filter States
  const [selectedMode, setSelectedMode] = useState('All'); // 'All' | 'Road Transport' | 'Rail Transport' | 'Air Transport' | 'Ship Transport'
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under-25' | '25-30' | '30-plus'
  const [sortBy, setSortBy] = useState('recommended');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [iataOnly, setIataOnly] = useState(false);

  // Multi-Provider Comparison State (Dedicated for Pet Transport: Max 3)
  const [comparedProviders, setComparedProviders] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Booking Modal States
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingOriginCity, setBookingOriginCity] = useState('');
  const [bookingDestCity, setBookingDestCity] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingPetName, setBookingPetName] = useState('');
  const [bookingPetBreed, setBookingPetBreed] = useState('');
  const [bookingPetWeight, setBookingPetWeight] = useState('12 kg');
  const [bookingCrateNeeded, setBookingCrateNeeded] = useState('Yes, need sanitized IATA crate');
  const [bookingOwnerPhone, setBookingOwnerPhone] = useState(user?.mobile || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Per-Provider Enquiry Modal States
  const [selectedProviderForEnquiry, setSelectedProviderForEnquiry] = useState(null);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enqFullName, setEnqFullName] = useState(user?.name || '');
  const [enqPhone, setEnqPhone] = useState(user?.mobile || '');
  const [enqEmail, setEnqEmail] = useState(user?.email || '');
  const [enqRelocationType, setEnqRelocationType] = useState('Inter-State Relocation');
  const [enqDepState, setEnqDepState] = useState('Maharashtra');
  const [enqDepCity, setEnqDepCity] = useState('Mumbai');
  const [enqDestState, setEnqDestState] = useState('Delhi');
  const [enqDestCity, setEnqDestCity] = useState('Delhi');
  const [enqExpectedDate, setEnqExpectedDate] = useState('');
  const [enqModes, setEnqModes] = useState(['Air Transport', 'Private Car']);
  const [enqPetSpecies, setEnqPetSpecies] = useState('Dog');
  const [enqPetBreed, setEnqPetBreed] = useState('');
  const [enqPetGender, setEnqPetGender] = useState('Male');
  const [enqPetAge, setEnqPetAge] = useState('2 Years');
  const [enqVaccination, setEnqVaccination] = useState('Fully Vaccinated & Up to Date');
  const [enqTravelFriendly, setEnqTravelFriendly] = useState('Yes, Very Friendly');
  const [enqNote, setEnqNote] = useState('');

  // Global Bottom Enquiry Form State
  const [globalEnqFullName, setGlobalEnqFullName] = useState(user?.name || '');
  const [globalEnqPhone, setGlobalEnqPhone] = useState(user?.mobile || '');
  const [globalEnqEmail, setGlobalEnqEmail] = useState(user?.email || '');
  const [globalEnqType, setGlobalEnqType] = useState('Inter-State Relocation');
  const [globalEnqDepState, setGlobalEnqDepState] = useState('Karnataka');
  const [globalEnqDepCity, setGlobalEnqDepCity] = useState('Bangalore');
  const [globalEnqDestState, setGlobalEnqDestState] = useState('Maharashtra');
  const [globalEnqDestCity, setGlobalEnqDestCity] = useState('Mumbai');
  const [globalEnqDate, setGlobalEnqDate] = useState('');
  const [globalEnqModes, setGlobalEnqModes] = useState(['Air Transport', 'Train / Rail']);
  const [globalEnqPetSpecies, setGlobalEnqPetSpecies] = useState('Dog');
  const [globalEnqPetBreed, setGlobalEnqPetBreed] = useState('');
  const [globalEnqPetGender, setGlobalEnqPetGender] = useState('Male');
  const [globalEnqPetAge, setGlobalEnqPetAge] = useState('3 Years');
  const [globalEnqVaccination, setGlobalEnqVaccination] = useState('Fully Vaccinated');
  const [globalEnqTravelFriendly, setGlobalEnqTravelFriendly] = useState('Yes, Travel Friendly');
  const [globalEnqNote, setGlobalEnqNote] = useState('');

  const providers = getStoredTransportProviders();

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

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity('All Cities');
  };

  // Filter & Sort Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // 1. Mode Filter
      if (selectedMode !== 'All') {
        const matchesMode = p.modes.some((m) => m.toLowerCase().includes(selectedMode.toLowerCase()));
        if (!matchesMode) return false;
      }

      // 2. Pet Type Filter
      if (selectedPetType !== 'All') {
        const matchesPet = p.petTypes.some(
          (t) => t.toLowerCase() === selectedPetType.toLowerCase()
        );
        if (!matchesPet) return false;
      }

      // 3. State Filter
      if (selectedState !== 'All States' && p.state !== selectedState) {
        return false;
      }

      // 4. City Filter
      if (selectedCity !== 'All Cities' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 5. Price Filter (Per Km rate)
      if (priceRange === 'under-25' && p.pricePerKm >= 25) return false;
      if (priceRange === '25-30' && (p.pricePerKm < 25 || p.pricePerKm > 30)) return false;
      if (priceRange === '30-plus' && p.pricePerKm < 30) return false;

      // 6. Verified & IATA badges
      if (verifiedOnly && !p.verified) return false;
      if (iataOnly && !p.iataCertified) return false;

      // 7. Search Keyword
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesKeyword = 
          p.name.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.leadCoordinator.toLowerCase().includes(query) ||
          p.corridors.some(c => c.toLowerCase().includes(query));
        if (!matchesKeyword) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerKm - b.pricePerKm;
      if (sortBy === 'price-high') return b.pricePerKm - a.pricePerKm;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0; // recommended
    });
  }, [providers, selectedMode, selectedPetType, selectedState, selectedCity, priceRange, verifiedOnly, iataOnly, searchKeyword, sortBy]);

  // Handle Comparison Toggle (Strictly max 3 providers)
  const handleToggleCompare = (provider) => {
    const isAlreadySelected = comparedProviders.some((p) => p.id === provider.id);
    if (isAlreadySelected) {
      setComparedProviders(comparedProviders.filter((p) => p.id !== provider.id));
    } else {
      if (comparedProviders.length >= 3) {
        toast.error('You can compare a maximum of 3 pet transport providers at once.', {
          icon: '⚖️'
        });
        return;
      }
      setComparedProviders([...comparedProviders, provider]);
      toast.success(`Added ${provider.name} to comparison (${comparedProviders.length + 1}/3)`, {
        icon: '🚐'
      });
    }
  };

  // Auth Guard for Booking
  const handleOpenBookingModal = (provider, pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to book pet transport.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'transport' } }));
      return;
    }
    setSelectedProviderForBooking(provider);
    setSelectedPackage(pkg || provider.packages[0] || null);
    setBookingOriginCity(provider.city);
    setBookingDestCity('Delhi');
    setShowBookingModal(true);
  };

  // Submit Booking Form
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please select an expected relocation date.');
      return;
    }
    if (!bookingPetName.trim() || !bookingPetBreed.trim()) {
      toast.error('Please enter your pet name and breed.');
      return;
    }
    if (!bookingOwnerPhone.trim()) {
      toast.error('Please provide a contact phone number.');
      return;
    }

    const bookingData = {
      id: 'TRP-' + Date.now().toString().slice(-6),
      providerId: selectedProviderForBooking.id,
      providerName: selectedProviderForBooking.name,
      leadCoordinator: selectedProviderForBooking.leadCoordinator,
      packageName: selectedPackage?.name || 'Standard Relocation',
      packagePrice: selectedPackage?.price || selectedProviderForBooking.basePrice,
      originCity: bookingOriginCity,
      destCity: bookingDestCity,
      bookingDate,
      petName: bookingPetName,
      petBreed: bookingPetBreed,
      petWeight: bookingPetWeight,
      crateRequirement: bookingCrateNeeded,
      ownerPhone: bookingOwnerPhone,
      notes: bookingNotes,
      status: 'Confirmed & Route Assigned',
      paymentStatus: 'Advance Pending / Pay on Handover',
      createdAt: new Date().toISOString()
    };

    saveTransportBooking(bookingData);
    toast.success(`🎉 Relocation booked with ${selectedProviderForBooking.name} for ${bookingPetName}! Coordinator will call you shortly.`, {
      duration: 5000,
      icon: '🚐'
    });
    setShowBookingModal(false);
    // Reset fields
    setBookingPetName('');
    setBookingPetBreed('');
    setBookingDate('');
    setBookingNotes('');
  };

  // Open Enquiry Modal for a specific provider
  const handleOpenEnquiryModal = (provider) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to send a relocation enquiry.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'transport-enquiry' } }));
      return;
    }
    setSelectedProviderForEnquiry(provider);
    setEnqDepCity(provider.city);
    setShowEnquiryModal(true);
  };

  // Submit Provider Enquiry
  const handleSubmitProviderEnquiry = (e) => {
    e.preventDefault();
    if (!enqPhone.trim() || !enqFullName.trim()) {
      toast.error('Please provide your name and contact phone number.');
      return;
    }
    if (!enqPetBreed.trim()) {
      toast.error('Please specify your pet breed.');
      return;
    }

    const enquiryData = {
      providerId: selectedProviderForEnquiry.id,
      providerName: selectedProviderForEnquiry.name,
      userId: user?._id || user?.id || 'usr-custom',
      userName: enqFullName,
      userEmail: enqEmail,
      userPhone: enqPhone,
      relocationType: enqRelocationType,
      departureState: enqDepState,
      departureCity: enqDepCity,
      destinationState: enqDestState,
      destinationCity: enqDestCity,
      expectedDate: enqExpectedDate || 'Flexible / Next 15 Days',
      preferredModes: enqModes,
      petSpecies: enqPetSpecies,
      petBreed: enqPetBreed,
      petGender: enqPetGender,
      petAge: enqPetAge,
      vaccinationStatus: enqVaccination,
      travelFriendly: enqTravelFriendly,
      note: enqNote
    };

    saveTransportEnquiry(enquiryData);
    toast.success(`Enquiry submitted to ${selectedProviderForEnquiry.name}! The provider will respond in your dashboard.`, {
      duration: 5000,
      icon: '📬'
    });
    setShowEnquiryModal(false);
  };

  // Submit Global Bottom Enquiry
  const handleSubmitGlobalEnquiry = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please register or log in to submit a relocation enquiry.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'transport-enquiry' } }));
      return;
    }

    if (!globalEnqFullName.trim() || !globalEnqPhone.trim()) {
      toast.error('Please provide your name and contact phone number.');
      return;
    }
    if (!globalEnqPetBreed.trim()) {
      toast.error('Please specify your pet breed.');
      return;
    }

    const enquiryData = {
      providerId: 'TRP-101', // Assigned to Primary Hub or matching corridor
      providerName: 'Pawora Air & Road Pet Relocators (Central Hub)',
      userId: user?._id || user?.id || 'usr-custom',
      userName: globalEnqFullName,
      userEmail: globalEnqEmail,
      userPhone: globalEnqPhone,
      relocationType: globalEnqType,
      departureState: globalEnqDepState,
      departureCity: globalEnqDepCity,
      destinationState: globalEnqDestState,
      destinationCity: globalEnqDestCity,
      expectedDate: globalEnqDate || 'Flexible / Next 15 Days',
      preferredModes: globalEnqModes,
      petSpecies: globalEnqPetSpecies,
      petBreed: globalEnqPetBreed,
      petGender: globalEnqPetGender,
      petAge: globalEnqPetAge,
      vaccinationStatus: globalEnqVaccination,
      travelFriendly: globalEnqTravelFriendly,
      note: globalEnqNote
    };

    saveTransportEnquiry(enquiryData);
    toast.success('Your relocation requirements have been dispatched to our certified pet transport network!', {
      duration: 5000,
      icon: '🚀'
    });

    // Reset notes
    setGlobalEnqNote('');
  };

  // Helper to toggle mode in multiselect checkboxes
  const toggleEnqMode = (mode, currentList, setter) => {
    if (currentList.includes(mode)) {
      setter(currentList.filter(m => m !== mode));
    } else {
      setter([...currentList, mode]);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans pb-24">

      {/* 1. HERO SECTION & QUICK SEARCH BAR */}
      <section className="relative bg-gradient-to-br from-[#0B1528] via-[#13274F] to-[#0A1931] text-white pt-28 pb-16 px-4 md:px-8 overflow-hidden">
        {/* Subtle Decorative Background Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-amber-300 tracking-wider uppercase shadow-inner">
              <Truck size={14} className="text-amber-400" />
              <span>Certified Pan-India Pet Relocation Network</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              We relocate your <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 italic">
                furries safely
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-200 font-normal max-w-xl leading-relaxed">
              Stress-free road cabs, Indian Railways 1st AC coupés, and IATA-compliant domestic & international air shipping with 24/7 veterinary oversight.
            </p>
          </div>

          {/* Right Column: Dog in Travel Crate Relocation Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-md w-full">
              {/* Glowing decorative halo behind image */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
              
              <div className="relative bg-[#0B1528]/95 rounded-3xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md">
                {/* Real Pet in Travel Crate Photo */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src="/dog_in_travel_crate.jpg"
                    alt="Happy Golden Retriever dog comfortably seated inside a luxury pet travel crate"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-black/20" />
                  
                  {/* Floating Tags over image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0B1528]/85 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 shadow">
                    <ShieldCheck size={12} className="text-amber-400" />
                    <span>IATA-400 Approved Crate</span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>Ready for Transit</span>
                  </div>
                </div>

                {/* Bottom Details Bar */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <ShieldCheck size={14} className="text-amber-400" /> 100% Climate Controlled
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <Navigation size={14} className="text-sky-400" /> Live GPS Tracking
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Comfortable, sanitized crates with padded bedding, hydration bowls, and certified attendants throughout the journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search & Filter Bar (Floating directly below hero) */}
        <div className="max-w-7xl mx-auto mt-10 relative z-20">
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-800">
            {/* Mode / Pet Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Transport Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
              >
                <option value="All">All Modalities (Road, Rail, Air, Ship)</option>
                <option value="Road">Road (Private AC Pet Cabs)</option>
                <option value="Rail">Rail (1st AC Train Coupé)</option>
                <option value="Air">Air (IATA Cargo / Cabin Flights)</option>
                <option value="Ship">Ship (Coastal & Ferry Routes)</option>
              </select>
            </div>

            {/* State Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Departure State
              </label>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
              >
                <option value="All States">All States in India</option>
                {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Departure City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
              >
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Search Trigger Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  const target = document.getElementById('transport-catalog');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
              >
                <Search size={16} />
                <span>Search Transporters</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TYPES OF TRANSPORTATION (ROAD, RAIL, SHIP, AIR) */}
      <section className="bg-white py-16 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#13274F] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Modalities & Fleet
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1528]">
              Types of Transportation
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              We work with trusted transport services on the road, rail, ship, and air for a hassle-free process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRANSPORT_MODES.map((mode) => {
              const isSelected = selectedMode.toLowerCase().includes(mode.id);
              return (
                <div
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.name);
                    const catalog = document.getElementById('transport-catalog');
                    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative p-6 rounded-2xl transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0B1528] text-white border-[#0B1528] shadow-xl scale-[1.02]'
                      : 'bg-stone-50 hover:bg-[#0B1528] text-slate-800 hover:text-white border-stone-200 hover:border-[#0B1528] hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {mode.icon}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950 font-bold' 
                          : 'bg-[#13274F]/10 text-[#13274F] group-hover:bg-amber-400 group-hover:text-slate-950'
                      }`}>
                        {mode.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-bold tracking-tight">
                        {mode.name.toUpperCase()}
                      </h3>
                      <p className={`text-xs mt-1 font-medium ${
                        isSelected ? 'text-sky-200' : 'text-gray-500 group-hover:text-sky-200'
                      }`}>
                        {mode.subtitle}
                      </p>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      isSelected ? 'text-gray-200' : 'text-gray-600 group-hover:text-gray-200'
                    }`}>
                      {mode.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-black/10 group-hover:border-white/20 mt-4 flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-400">Click to Filter Fleet</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. HOW WE MOVE YOUR PET (4 STEPS) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#13274F] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Seamless Workflow
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1528]">
            How We Move Your Pet
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            From initial booking to comfortable doorstep delivery, every step is coordinated with precision and love.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRANSPORT_STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Step Ribbon Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#13274F] to-amber-400 z-10" />

              <div>
                {/* Step Content-Based Image */}
                <div className="aspect-[16/10] overflow-hidden relative bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                  
                  {/* Floating Step Number & Icon Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0B1528]/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 shadow">
                    <span className="text-amber-300">{item.step}</span>
                  </div>

                  <div className="absolute bottom-2.5 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm shadow">
                    {item.icon}
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-serif font-bold text-slate-900 group-hover:text-[#13274F] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Phase Badge */}
              <div className="px-5 pb-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-[#13274F]">
                <span className="text-gray-400 uppercase tracking-wider text-[10px]">Phase 0{idx + 1}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                  <CircleCheck size={13} /> Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PROVIDERS CATALOG & LEFT-SIDE FILTERS */}
      <section id="transport-catalog" className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-8">
        
        {/* Section Header with Comparison Reminder */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-stone-200 pb-6 gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0F2E23] bg-emerald-100/70 px-3 py-1 rounded-full">
              Verified Transporter Directory
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F2E23] mt-2">
              Compare & Book Pet Transporters ({filteredProviders.length})
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select 2 or 3 providers below to see a detailed side-by-side comparison of rates, safety features, and transit modes.
            </p>
          </div>
        </div>

        {/* Main Grid: Left Filter Sidebar (3 cols) & Provider Cards (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FILTER SIDEBAR (Compact & Sleek) */}
          <aside className="lg:col-span-3 xl:col-span-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            
            <div className="sticky -top-4 bg-white pt-0.5 pb-2.5 border-b border-stone-100 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F2E23] uppercase tracking-wider">
                <SlidersHorizontal size={13} />
                <span>Filter Transporters</span>
              </div>
              <button
                onClick={() => {
                  setSelectedMode('All');
                  setSelectedPetType('All');
                  setSelectedState('All States');
                  setSelectedCity('All Cities');
                  setPriceRange('all');
                  setSearchKeyword('');
                  setVerifiedOnly(false);
                  setIataOnly(false);
                }}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Search Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Air, Innova..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-[11px] rounded-lg pl-7 pr-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Transport Modality Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Transport Mode</label>
              <div className="space-y-1">
                {[
                  { id: 'All', label: 'All Modes' },
                  { id: 'Road', label: '🚐 Road (AC Cabs)' },
                  { id: 'Rail', label: '🚆 Rail (1st AC Train)' },
                  { id: 'Air', label: '✈️ Air (Flight Cargo/Cabin)' },
                  { id: 'Ship', label: '🚢 Ship / Ferry' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMode(item.id)}
                    className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                      selectedMode === item.id 
                        ? 'bg-[#0F2E23] text-white font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedMode === item.id && <Check size={12} className="text-[#D4AF37]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pet Type Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Pet Accepted</label>
              <div className="grid grid-cols-2 gap-1">
                {['All', 'Dogs', 'Cats', 'Birds', 'Fish', 'Small Animals'].map((pet) => (
                  <button
                    key={pet}
                    onClick={() => setSelectedPetType(pet)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition cursor-pointer border ${
                      selectedPetType === pet
                        ? 'bg-[#0B1528] text-white border-[#0B1528]'
                        : 'bg-stone-50 text-gray-600 border-stone-200 hover:border-gray-400'
                    }`}
                  >
                    {pet}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Per Km Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Rate per KM</label>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All Price Ranges' },
                  { id: 'under-25', label: 'Under ₹25 / km (Budget)' },
                  { id: '25-30', label: '₹25 - ₹30 / km (Standard AC)' },
                  { id: '30-plus', label: '₹30+ / km (Express & Priority)' }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer hover:text-slate-900">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === item.id}
                      onChange={() => setPriceRange(item.id)}
                      className="accent-[#0F2E23] scale-90"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verified & IATA Badges Checkboxes */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="accent-[#0F2E23] rounded scale-90"
                />
                <span>Verified Transporters Only</span>
              </label>

              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={iataOnly}
                  onChange={(e) => setIataOnly(e.target.checked)}
                  className="accent-[#0F2E23] rounded scale-90"
                />
                <span>IATA Live Animal Certified</span>
              </label>
            </div>

            {/* SORT BY FILTER INSIDE SIDEBAR */}
            <div className="space-y-1.5 pt-2.5 border-t border-stone-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                SORT BY:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-[#0F2E23] text-[11px] font-bold text-slate-900 rounded-full px-3.5 py-2 pr-8 shadow-sm transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F2E23]/20"
                >
                  <option value="recommended">Recommended & Verified</option>
                  <option value="price-low">Price: Low to High (₹/km)</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none stroke-[2.5]" />
              </div>
            </div>

          </aside>

          {/* PROVIDERS LIST / GRID */}
          <div className="lg:col-span-9 xl:col-span-9 space-y-6">
            
            {filteredProviders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-3xl">
                  🚐
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-800">No Pet Transporters Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try adjusting your filters, selecting 'All States', or clearing search keywords.
                </p>
                <button
                  onClick={() => {
                    setSelectedMode('All');
                    setSelectedState('All States');
                    setSelectedCity('All Cities');
                    setSelectedPetType('All');
                    setPriceRange('all');
                    setSearchKeyword('');
                  }}
                  className="bg-[#0F2E23] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredProviders.map((provider) => {
                const isCompared = comparedProviders.some((p) => p.id === provider.id);
                return (
                  <div
                    key={provider.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 p-6 shadow-sm hover:shadow-md flex flex-col md:flex-row gap-6 relative ${
                      isCompared ? 'border-2 border-[#D4AF37] bg-amber-50/20' : 'border-stone-200'
                    }`}
                  >
                    {/* Provider Image & Badges */}
                    <div className="md:w-56 shrink-0 space-y-3">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden relative shadow-sm border border-stone-100">
                        <img
                          src={provider.image}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {provider.verified && (
                            <span className="bg-[#0F2E23] text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                              <ShieldCheck size={11} className="text-[#D4AF37]" /> Verified
                            </span>
                          )}
                          {provider.iataCertified && (
                            <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                              ✈️ IATA Certified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compare Checkbox Trigger */}
                      <button
                        onClick={() => handleToggleCompare(provider)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                          isCompared
                            ? 'bg-[#D4AF37] text-slate-900 border-[#D4AF37]'
                            : 'bg-stone-50 hover:bg-amber-50 text-gray-700 border-stone-200'
                        }`}
                      >
                        {isCompared ? (
                          <>
                            <CheckSquare size={15} className="text-slate-900" />
                            <span>Added to Compare ({comparedProviders.length}/3)</span>
                          </>
                        ) : (
                          <>
                            <Square size={15} className="text-gray-400" />
                            <span>Add to Compare</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Provider Info & Pricing */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-serif font-bold text-[#0F2E23]">
                              {provider.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {provider.tagline}
                            </p>
                          </div>

                          {/* Rating & Reviews */}
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-[#0F2E23] px-2.5 py-1 rounded-xl border border-emerald-100 shrink-0">
                            <Star size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
                            <span className="text-xs font-extrabold">{provider.rating}</span>
                            <span className="text-[10px] text-gray-500">({provider.reviews})</span>
                          </div>
                        </div>

                        {/* Location & Corridors */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <MapPin size={13} className="text-emerald-700" />
                            {provider.city}, {provider.state}
                          </span>
                          <span>•</span>
                          <span className="text-gray-500 font-medium">
                            Coordinator: <strong className="text-slate-700">{provider.leadCoordinator}</strong>
                          </span>
                        </div>

                        {/* Modality Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {provider.modes.map((m) => (
                            <span key={m} className="bg-stone-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">
                              {m}
                            </span>
                          ))}
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-md">
                            🎯 {provider.coverage}
                          </span>
                        </div>

                        {/* Key Corridors */}
                        <div className="text-[11px] text-gray-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                          <strong className="text-slate-800">Popular Corridors:</strong> {provider.corridors.join(' • ')}
                        </div>
                      </div>

                      {/* Pricing & CTA Actions */}
                      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-gray-400">Starting Rates</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-serif font-bold text-[#0F2E23]">₹{provider.pricePerKm}/km</span>
                            <span className="text-xs text-gray-500">(Base ₹{provider.basePrice})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEnquiryModal(provider)}
                            className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Send size={13} />
                            <span>Enquire Now</span>
                          </button>

                          <button
                            onClick={() => handleOpenBookingModal(provider)}
                            className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Book Relocation</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}

          </div>

        </div>
      </section>

      {/* 7. GLOBAL BOTTOM RELOCATION ENQUIRY FORM ("Hey! Still not found what you are looking for?") */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-2xl p-5 md:p-7 border border-stone-200 shadow-md space-y-5">
          
          <div className="space-y-1.5 border-b border-stone-100 pb-3.5">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0F2E23]">
              Hey! Still not found what you are looking for?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              No worries! Let our certified pet logistics experts come to your rescue. Fill in your travel details below and our coordinator will formulate a custom doorstep relocation quote.
            </p>
          </div>

          <form onSubmit={handleSubmitGlobalEnquiry} className="space-y-4">
            
            {/* 1. Pet Parent Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F2E23] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 text-[9px] flex items-center justify-center font-bold">1</span>
                Pet Parent Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    value={globalEnqFullName}
                    onChange={(e) => setGlobalEnqFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Contact Number *"
                    required
                    value={globalEnqPhone}
                    onChange={(e) => setGlobalEnqPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={globalEnqEmail}
                    onChange={(e) => setGlobalEnqEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Relocation Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F2E23] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 text-[9px] flex items-center justify-center font-bold">2</span>
                Relocation Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <select
                    value={globalEnqType}
                    onChange={(e) => setGlobalEnqType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Inter-State Relocation">Inter-State Relocation</option>
                    <option value="Intra-City Pet Taxi">Intra-City Pet Taxi</option>
                    <option value="International Air Relocation">International Air Relocation</option>
                    <option value="Airport Pickup & Transit">Airport Pickup & Transit</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Departure State"
                    value={globalEnqDepState}
                    onChange={(e) => setGlobalEnqDepState(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Departure City"
                    value={globalEnqDepCity}
                    onChange={(e) => setGlobalEnqDepCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Destination State"
                    value={globalEnqDestState}
                    onChange={(e) => setGlobalEnqDestState(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Destination City"
                    value={globalEnqDestCity}
                    onChange={(e) => setGlobalEnqDestCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={globalEnqDate}
                    onChange={(e) => setGlobalEnqDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Relocation Mode Preference */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Mode Preference
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                {['Private Car / AC Cab', 'Train / Rail Coupé', 'Flight / Air Cargo', 'Ship / Ferry'].map((mode) => (
                  <label key={mode} className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={globalEnqModes.includes(mode)}
                      onChange={() => toggleEnqMode(mode, globalEnqModes, setGlobalEnqModes)}
                      className="accent-[#0F2E23] rounded"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Pet Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F2E23] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 text-[9px] flex items-center justify-center font-bold">3</span>
                Pet Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <select
                    value={globalEnqPetSpecies}
                    onChange={(e) => setGlobalEnqPetSpecies(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish / Aquatic</option>
                    <option value="Small Animal">Small Animal</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Pet Breed *"
                    required
                    value={globalEnqPetBreed}
                    onChange={(e) => setGlobalEnqPetBreed(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <select
                    value={globalEnqPetGender}
                    onChange={(e) => setGlobalEnqPetGender(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Age (e.g. 2 Yrs)"
                    value={globalEnqPetAge}
                    onChange={(e) => setGlobalEnqPetAge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <select
                    value={globalEnqVaccination}
                    onChange={(e) => setGlobalEnqVaccination(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Fully Vaccinated">Fully Vaccinated</option>
                    <option value="Partial / Need Guidance">Partial / Need Guidance</option>
                    <option value="Up to Date Anti-Rabies">Up to Date Anti-Rabies</option>
                  </select>
                </div>
                <div>
                  <select
                    value={globalEnqTravelFriendly}
                    onChange={(e) => setGlobalEnqTravelFriendly(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Yes, Travel Friendly">Travel Friendly</option>
                    <option value="Anxious / Needs Crate">Needs Crate Comfort</option>
                    <option value="First Time Relocation">First Time Relocation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Custom Note */}
            <div>
              <textarea
                rows={2}
                placeholder="Additional instructions or notes..."
                value={globalEnqNote}
                onChange={(e) => setGlobalEnqNote(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
              />
            </div>

            {/* Submit CTA */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
              >
                <span>Submit Enquiry</span>
                <Send size={13} />
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* 8. DEDICATED FLOATING COMPARISON BAR (Shows when 1 to 3 providers selected) */}
      {comparedProviders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-[#0F2E23] text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 overflow-hidden">
              {comparedProviders.map((p) => (
                <img
                  key={p.id}
                  src={p.image}
                  alt={p.name}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-[#D4AF37] object-cover"
                />
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Comparing {comparedProviders.length} of 3 Providers
              </div>
              <div className="text-[11px] text-gray-300">
                {comparedProviders.length === 1
                  ? 'Select 1 or 2 more providers to compare side-by-side.'
                  : 'Ready to compare rates, safety & fleet!'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparedProviders([])}
              className="text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 cursor-pointer"
            >
              Clear
            </button>

            <button
              onClick={() => {
                if (comparedProviders.length < 2) {
                  toast('Please select at least 2 providers to compare side-by-side.', { icon: 'ℹ️' });
                }
                setShowCompareModal(true);
              }}
              className="bg-[#D4AF37] hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Scale size={14} />
              <span>Compare Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. SIDE-BY-SIDE DEDICATED COMPARISON MODAL */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col min-h-0 max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0F2E23] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale size={20} className="text-[#D4AF37]" />
                <h3 className="text-lg font-serif font-bold">
                  Side-by-Side Transporter Comparison ({comparedProviders.length} Selected)
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparison Matrix Table */}
            <div className="p-6 overflow-x-auto max-h-[75vh]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="p-3 font-extrabold text-gray-400 uppercase tracking-wider w-1/4">Features / Provider</th>
                    {comparedProviders.map((p) => (
                      <th key={p.id} className="p-3 text-center w-1/3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-2 border border-stone-200">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                        <div className="text-[11px] text-gray-500">{p.city}, {p.state}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star size={11} className="fill-amber-500 text-amber-500" /> {p.rating} ({p.reviews})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Pricing */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Rate per KM</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-extrabold text-[#0F2E23] text-sm">
                        ₹{p.pricePerKm} / km
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Base Minimum Fare</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center text-gray-700 font-semibold">
                        ₹{p.basePrice}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Inter-State Starting</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center text-gray-700 font-semibold">
                        ₹{p.interstateMin}
                      </td>
                    ))}
                  </tr>

                  {/* Modes */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Supported Modes</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {p.modes.map((m) => (
                            <span key={m} className="bg-stone-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Safety & Amenities */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">100% Climate Control (AC)</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-700">
                        <CircleCheck size={16} className="inline mr-1" /> Guaranteed
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Live GPS & WhatsApp Updates</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-bold text-emerald-700">
                        <CircleCheck size={16} className="inline mr-1" /> Real-time Link
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">IATA Air Certification</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center font-semibold">
                        {p.iataCertified ? (
                          <span className="text-emerald-700 font-bold">✓ Certified</span>
                        ) : (
                          <span className="text-gray-400">Road / Rail Focused</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Vet Health Check & Paperwork</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center text-gray-700 font-semibold">
                        Full Assistance Provided
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Hydration & Rest Routine</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center text-gray-700">
                        Every 3 hours + Walk Breaks
                      </td>
                    ))}
                  </tr>

                  {/* Direct Booking Column Action */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-stone-50">Instant Action</td>
                    {comparedProviders.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        <button
                          onClick={() => {
                            setShowCompareModal(false);
                            handleOpenBookingModal(p);
                          }}
                          className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] text-xs font-bold py-2 px-4 rounded-xl shadow cursor-pointer w-full"
                        >
                          Book {p.name.split(' ')[0]}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* 10. AUTH-PROTECTED BOOKING MODAL */}
      {showBookingModal && selectedProviderForBooking && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
            
            {/* Sticky Header */}
            <div className="bg-[#0B1528] text-white p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Book Pet Relocation</span>
                <h3 className="text-base md:text-lg font-serif font-bold">{selectedProviderForBooking.name}</h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitBooking} className="p-4 md:p-5 space-y-3 text-xs overflow-y-auto custom-scrollbar flex-1">
              
              {/* Package Details */}
              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 space-y-1">
                <div className="font-bold text-slate-900">{selectedPackage?.name || 'Standard Relocation Service'}</div>
                <p className="text-[11px] text-gray-600">{selectedPackage?.desc || 'Climate-controlled travel with verified handler.'}</p>
                <div className="text-[#13274F] font-extrabold text-sm pt-0.5">
                  Starting at ₹{selectedPackage?.price || selectedProviderForBooking.basePrice}
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pickup City</label>
                  <input
                    type="text"
                    required
                    value={bookingOriginCity}
                    onChange={(e) => setBookingOriginCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Drop City</label>
                  <input
                    type="text"
                    required
                    value={bookingDestCity}
                    onChange={(e) => setBookingDestCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              {/* Date & Contact */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Relocation Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Owner Contact Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91..."
                    value={bookingOwnerPhone}
                    onChange={(e) => setBookingOwnerPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              {/* Pet Info */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruno"
                    value={bookingPetName}
                    onChange={(e) => setBookingPetName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beagle"
                    value={bookingPetBreed}
                    onChange={(e) => setBookingPetBreed(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 kg"
                    value={bookingPetWeight}
                    onChange={(e) => setBookingPetWeight(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Crate Requirement</label>
                <select
                  value={bookingCrateNeeded}
                  onChange={(e) => setBookingCrateNeeded(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                >
                  <option value="Yes, need sanitized IATA crate">Yes, need sanitized IATA crate (Included)</option>
                  <option value="I will provide my own travel crate">I will provide my own travel crate</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Special Notes</label>
                <textarea
                  rows={2}
                  placeholder="Medication routine, feeding instructions, or specific pickup time..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#13274F]"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-md cursor-pointer hover:shadow-lg"
                >
                  Confirm Relocation Reservation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 11. PER-PROVIDER ENQUIRY MODAL */}
      {showEnquiryModal && selectedProviderForEnquiry && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
            
            {/* Sticky Header */}
            <div className="bg-[#0B1528] text-white p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Direct Relocation Enquiry</span>
                <h3 className="text-base md:text-lg font-serif font-bold">{selectedProviderForEnquiry.name}</h3>
              </div>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitProviderEnquiry} className="p-4 md:p-5 space-y-3 text-xs overflow-y-auto custom-scrollbar flex-1">
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={enqFullName}
                    onChange={(e) => setEnqFullName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Departure City</label>
                  <input
                    type="text"
                    required
                    value={enqDepCity}
                    onChange={(e) => setEnqDepCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={enqDestCity}
                    onChange={(e) => setEnqDestCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Retriever"
                    value={enqPetBreed}
                    onChange={(e) => setEnqPetBreed(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Expected Date</label>
                  <input
                    type="date"
                    value={enqExpectedDate}
                    onChange={(e) => setEnqExpectedDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#13274F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Enquiry Note / Request</label>
                <textarea
                  rows={2}
                  placeholder="Ask for custom quotation, vehicle availability, or multi-pet discounts..."
                  value={enqNote}
                  onChange={(e) => setEnqNote(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-[#13274F]"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={13} />
                  <span>Send Enquiry to {selectedProviderForEnquiry.name.split(' ')[0]}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PetTransport;
