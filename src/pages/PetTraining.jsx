import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  GraduationCap,
  Award,
  Star,
  ShieldCheck,
  CircleCheck,
  Calendar,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Phone,
  MessageCircle,
  X,
  Send,
  HelpCircle,
  HeartHandshake,
  Check,
  Flame,
  ArrowRight,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import {
  TRAINING_TYPES,
  TRAINING_BENEFITS,
  TRAINING_MODULE_BADGES,
  THREE_STEP_PROCESS,
  TRAINING_TESTIMONIALS,
  getStoredTrainingProviders,
  saveTrainingBooking,
  saveTrainingEnquiry
} from '../data/trainingData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../components/ServiceAccessLock.jsx';

const PetTraining = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isServicePathLockedForUser(user, '/training')) {
    return <ServiceAccessLock serviceName="Pet Training & Behavior" attemptedPath="/training" />;
  }

  // State Management
  const [providers, setProviders] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedPetType, setSelectedPetType] = useState('All');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [availableCities, setAvailableCities] = useState(['All Cities']);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [forceFreeOnly, setForceFreeOnly] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('Morning (8:00 AM - 11:00 AM)');
  const [bookingPetName, setBookingPetName] = useState('');
  const [bookingPetBreed, setBookingPetBreed] = useState('');
  const [bookingPetAge, setBookingPetAge] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingOwnerPhone, setBookingOwnerPhone] = useState('');
  const [bookingBehaviorNotes, setBookingBehaviorNotes] = useState('');

  // Per-Provider Enquiry Modal
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedProviderForEnquiry, setSelectedProviderForEnquiry] = useState(null);
  const [enqFullName, setEnqFullName] = useState(user?.name || '');
  const [enqPhone, setEnqPhone] = useState(user?.phone || '');
  const [enqEmail, setEnqEmail] = useState(user?.email || '');
  const [enqCity, setEnqCity] = useState('');
  const [enqPetBreed, setEnqPetBreed] = useState('');
  const [enqPetAge, setEnqPetAge] = useState('');
  const [enqTrainingGoal, setEnqTrainingGoal] = useState('Basic Obedience & Manners');
  const [enqNotes, setEnqNotes] = useState('');

  // Global Bottom Enquiry Form
  const [bottomFullName, setBottomFullName] = useState('');
  const [bottomPhone, setBottomPhone] = useState('');
  const [bottomCity, setBottomCity] = useState('');
  const [bottomPetSpecies, setBottomPetSpecies] = useState('Dog');
  const [bottomPetBreed, setBottomPetBreed] = useState('');
  const [bottomTrainingType, setBottomTrainingType] = useState('Puppy Socialization & Potty Basics');
  const [bottomPreferredSlot, setBottomPreferredSlot] = useState('Weekend Morning');
  const [bottomNotes, setBottomNotes] = useState('');

  // Load Providers on Mount
  useEffect(() => {
    setProviders(getStoredTrainingProviders());
  }, []);

  // Sync state & cities
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    if (newState === 'All States' || !INDIAN_STATES_CITIES[newState]) {
      setAvailableCities(['All Cities']);
      setSelectedCity('All Cities');
    } else {
      setAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[newState]]);
      setSelectedCity('All Cities');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedType('All');
    setSelectedMode('All');
    setSelectedPetType('All');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setAvailableCities(['All Cities']);
    setVerifiedOnly(false);
    setForceFreeOnly(false);
    setPriceRange('all');
    setSearchKeyword('');
    setSortBy('recommended');
  };

  // Filtered Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      // 1. Training Type Filter
      if (selectedType !== 'All') {
        const matchesType = p.specialties.some((s) => s.toLowerCase().includes(selectedType.toLowerCase())) ||
          p.tagline.toLowerCase().includes(selectedType.toLowerCase());
        if (!matchesType) return false;
      }

      // 2. Session Mode Filter
      if (selectedMode !== 'All') {
        const matchesMode = p.sessionModes.some((m) => m.toLowerCase().includes(selectedMode.toLowerCase()));
        if (!matchesMode) return false;
      }

      // 3. Pet Type Filter
      if (selectedPetType !== 'All') {
        const matchesPet = p.petTypes.some((t) => t.toLowerCase() === selectedPetType.toLowerCase());
        if (!matchesPet) return false;
      }

      // 4. State Filter
      if (selectedState !== 'All States' && p.state !== selectedState) {
        return false;
      }

      // 5. City Filter
      if (selectedCity !== 'All Cities' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 6. Price Range Filter
      if (priceRange === 'under-800' && p.pricePerSession >= 800) return false;
      if (priceRange === '800-1000' && (p.pricePerSession < 800 || p.pricePerSession > 1000)) return false;
      if (priceRange === '1000-plus' && p.pricePerSession < 1000) return false;

      // 7. Badges
      if (verifiedOnly && !p.verified) return false;
      if (forceFreeOnly && !p.tagline.toLowerCase().includes('force-free') && !p.certifications.some(c => c.toLowerCase().includes('force-free') || c.toLowerCase().includes('fear free'))) return false;

      // 8. Keyword Search
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(query) ||
          p.leadTrainer.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.specialties.some((s) => s.toLowerCase().includes(query));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerSession - b.pricePerSession;
      if (sortBy === 'price-high') return b.pricePerSession - a.pricePerSession;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0; // recommended
    });
  }, [providers, selectedType, selectedMode, selectedPetType, selectedState, selectedCity, priceRange, verifiedOnly, forceFreeOnly, searchKeyword, sortBy]);

  // Open Booking Modal (Auth-Gated)
  const handleOpenBookingModal = (provider, pkg = null) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to book a training session.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'training-booking' } }));
      return;
    }
    setSelectedProviderForBooking(provider);
    setSelectedPackage(pkg || provider.packages[0] || null);
    setBookingAddress(provider.area + ', ' + provider.city);
    setShowBookingModal(true);
  };

  // Submit Booking
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please pick your desired starting date.');
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
      id: 'TRN-BK-' + Date.now().toString().slice(-6),
      providerId: selectedProviderForBooking.id,
      providerName: selectedProviderForBooking.name,
      leadTrainer: selectedProviderForBooking.leadTrainer,
      packageName: selectedPackage?.name || 'Custom Training Sessions',
      packagePrice: selectedPackage?.price || selectedProviderForBooking.packageStarting,
      sessionCount: selectedPackage?.sessions || 'Per Session Course',
      startDate: bookingDate,
      timeSlot: bookingTimeSlot,
      petName: bookingPetName,
      petBreed: bookingPetBreed,
      petAge: bookingPetAge,
      trainingAddress: bookingAddress,
      ownerPhone: bookingOwnerPhone,
      behaviorNotes: bookingBehaviorNotes,
      status: 'Confirmed & Trainer Assigned',
      createdAt: new Date().toISOString()
    };

    saveTrainingBooking(bookingData);
    toast.success(`🎉 Training session booked with ${selectedProviderForBooking.name} for ${bookingPetName}! Trainer will call you to confirm your schedule.`, {
      duration: 5000,
      icon: '🎓'
    });
    setShowBookingModal(false);
    // Reset fields
    setBookingPetName('');
    setBookingPetBreed('');
    setBookingDate('');
    setBookingBehaviorNotes('');
  };

  // Open Enquiry Modal (Auth-Gated)
  const handleOpenEnquiryModal = (provider) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in to send a training enquiry.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'training-enquiry' } }));
      return;
    }
    setSelectedProviderForEnquiry(provider);
    setEnqCity(provider.city);
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
      city: enqCity,
      petBreed: enqPetBreed,
      petAge: enqPetAge,
      trainingGoal: enqTrainingGoal,
      notes: enqNotes
    };

    saveTrainingEnquiry(enquiryData);
    toast.success(`Enquiry sent to ${selectedProviderForEnquiry.name}! The trainer will reach out to you directly.`, {
      duration: 5000,
      icon: '📬'
    });
    setShowEnquiryModal(false);
  };

  // Submit Global Bottom Enquiry
  const handleSubmitBottomEnquiry = (e) => {
    e.preventDefault();
    if (!bottomPhone.trim() || !bottomFullName.trim()) {
      toast.error('Please provide your name and phone number.');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please register or log in to submit a customized training request.', {
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', { detail: { tab: 'user', hideProviderTab: true, source: 'training-bottom-enquiry' } }));
      return;
    }

    const enquiryData = {
      providerId: 'ALL-TRAINERS',
      providerName: 'Pawora Central Dog Training Network',
      userId: user?._id || user?.id || 'usr-custom',
      userName: bottomFullName,
      userPhone: bottomPhone,
      city: bottomCity,
      petSpecies: bottomPetSpecies,
      petBreed: bottomPetBreed,
      trainingGoal: bottomTrainingType,
      preferredSlot: bottomPreferredSlot,
      notes: bottomNotes
    };

    saveTrainingEnquiry(enquiryData);
    toast.success('🎉 Custom training request submitted! Our master behaviorists will review and connect with you shortly.', {
      duration: 5000,
      icon: '🐾'
    });
    setBottomFullName('');
    setBottomPhone('');
    setBottomCity('');
    setBottomPetBreed('');
    setBottomNotes('');
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans pb-24">

      {/* 1. HERO BANNER & QUICK SEARCH */}
      <section className="relative bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] text-slate-900 pt-28 pb-16 px-4 md:px-8 overflow-hidden shadow-inner">
        {/* Decorative Ambient Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-block">
              <span className="text-sm md:text-base font-serif italic text-purple-800 font-bold tracking-wide">
                Pet’s Purrrrrfect Training!
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-black text-slate-950 tracking-tight leading-tight">
              Dog Training Services <br className="hidden sm:inline" />
              <span className="text-slate-900">Near You</span>
            </h1>

            <p className="text-sm md:text-base text-slate-900 font-medium max-w-xl leading-relaxed">
              Unleash their potential. Let your pet express themselves fully with 100% force-free, science-backed positive reinforcement techniques.
            </p>

            {/* Trust Highlights Strip */}
            <div className="pt-1 text-xs md:text-sm font-bold text-slate-950 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>10000+ Happy Customers</span>
              <span className="text-purple-700 font-black">•</span>
              <span>Affordable</span>
              <span className="text-purple-700 font-black">•</span>
              <span>Professional Trainers</span>
              <span className="text-purple-700 font-black">•</span>
              <span>Force Free Training</span>
            </div>

            {/* Quick Horizontal Search Bar */}
            <div className="pt-4">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/40 grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-slate-800">
                
                {/* Training Type */}
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                    Training Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="All">All Training Types</option>
                    <option value="Puppy">Puppy Socialization & Potty</option>
                    <option value="Obedience">Basic & Advanced Obedience</option>
                    <option value="Aggression">Behavioral & Anxiety Therapy</option>
                    <option value="Agility">Agility & Trick Sports</option>
                    <option value="Protection">Guard & Protection Training</option>
                    <option value="Show">KCI Show Ring Prep</option>
                  </select>
                </div>

                {/* State */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="All States">All States</option>
                    {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      const target = document.getElementById('training-catalog');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                  >
                    <Search size={14} />
                    <span>Search</span>
                  </button>
                </div>

              </div>

              {/* Breadcrumb */}
              <div className="pt-3 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                <Link to="/" className="hover:underline">Home</Link>
                <span>&gt;</span>
                <span className="font-bold text-purple-900">Dog Training</span>
              </div>
            </div>

          </div>

          {/* Right Column: High Five Dog Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-md w-full">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 to-amber-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative bg-white/95 rounded-3xl overflow-hidden border border-white/40 shadow-2xl">
                <img
                  src="/dog_training_hero.jpg"
                  alt="Certified female dog trainer giving a high five paw shake to an intelligent well-trained dog"
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHAT HAPPENS WHEN YOUR DOG IS WELL-TRAINED? (BENEFITS 2x2) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-10">
        
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
            What Happens When Your Dog Is Well-Trained?
          </h2>
          <p className="text-xs md:text-sm text-gray-600 max-w-2xl">
            Life becomes smoother, calmer, and a lot more fun, for both of you! Here’s how:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Agility Dog Jumping Photo */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 aspect-[4/3] relative group bg-stone-100">
              <img
                src="/dog_agility_jump.jpg"
                alt="Agile Australian Shepherd dog jumping through yellow agility hoop ring"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow">
                🐾 Agility & Confidence Building Course
              </div>
            </div>
          </div>

          {/* Right: 4 Colorful Cards (Yellow, Sky Blue, Pink, Purple) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRAINING_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className={`${benefit.bgColor} ${benefit.textColor} rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[160px]`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center text-2xl mb-4 shadow-sm">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. 4 TRAINING MODULES BADGES & 3-STEP PROCESS */}
      <section className="bg-white py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-sm md:text-base font-serif font-medium text-gray-700">
              Pawora offers 100% force-free and fully customized to suit you and your dog’s unique requirements.
            </p>

            {/* 4 Circular Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              {TRAINING_MODULE_BADGES.map((b) => (
                <div key={b.num} className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${b.color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                    {b.num}
                  </div>
                  <span className="text-sm font-serif font-bold text-slate-900">
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Step Process Cards */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {THREE_STEP_PROCESS.map((proc) => (
              <div
                key={proc.step}
                className="bg-[#FAF9F5] rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition text-center space-y-3 flex flex-col items-center justify-between"
              >
                <div className={`w-14 h-14 rounded-2xl ${proc.color} flex items-center justify-center text-2xl shadow-md`}>
                  {proc.icon}
                </div>
                <h4 className="text-base font-serif font-bold text-slate-900">
                  {proc.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
                  {proc.desc}
                </p>
                <div className="pt-2 text-[10px] font-extrabold uppercase tracking-widest text-purple-700">
                  Step 0{proc.step}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. WHY DO PET PARENTS CHOOSE PAWORA? (TESTIMONIALS) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900">
            Why Do Pet Parents Choose Pawora?
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            No. 1 Pet Care Provider with 100+ verified positive reinforcement trainers, behaviorists, and academies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRAINING_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-300 shadow-md">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 right-0 bg-purple-600 text-white rounded-full p-1 shadow">
                  <CircleCheck size={14} />
                </div>
              </div>

              <div className="flex text-amber-500 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-xs text-gray-600 italic leading-relaxed">
                "{t.quote}"
              </p>

              <div className="pt-2 border-t border-stone-100 w-full">
                <h4 className="text-sm font-serif font-bold text-slate-900">{t.name}</h4>
                <p className="text-[11px] text-gray-500 font-medium">{t.dog} • {t.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VERIFIED TRAINERS CATALOG WITH LEFT-SIDE SCROLLABLE FILTER */}
      <section id="training-catalog" className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
        
        {/* Catalog Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap size={16} /> Certified Behaviorists & Trainers
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              Find Verified Dog Trainers Near You
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-bold text-purple-800">{filteredProviders.length}</span> verified dog trainers matching your location & requirements
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600 shadow-sm"
            >
              <option value="recommended">Recommended & Verified</option>
              <option value="rating">Highest Rated (★ 5.0)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Catalog Layout: Left Filter + Right Trainer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left-Side Filter Sidebar with Internal Scrollbar */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-sm sticky top-24 overflow-hidden">
            
            {/* Sticky Filter Header */}
            <div className="p-3.5 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-slate-900">
                <SlidersHorizontal size={14} className="text-purple-600" />
                <span>Filter Trainers</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar text-xs">
              
              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Search Keyword</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Trainer name, area, breed..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-gray-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Training Type Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Training Discipline</label>
                <div className="space-y-1">
                  {[
                    { id: 'All', label: 'All Disciplines' },
                    { id: 'Puppy', label: '🐶 Puppy & Potty Basics' },
                    { id: 'Obedience', label: '🎓 Basic & Master Obedience' },
                    { id: 'Aggression', label: '🧠 Behavioral & Anxiety Therapy' },
                    { id: 'Agility', label: '🎪 Agility & Trick Sports' },
                    { id: 'Protection', label: '🛡️ Guard & Defense Training' },
                    { id: 'Show', label: '🏆 KCI Show Ring Stance' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                        selectedType === t.id
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-gray-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedType === t.id && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Mode Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Session Format</label>
                <div className="space-y-1">
                  {['All', 'At-Home 1-on-1', 'Training Center / Camp', 'Online Video Consultation'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={`w-full text-left text-[11px] font-semibold px-2.5 py-1 rounded-md transition cursor-pointer border ${
                        selectedMode === m
                          ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold'
                          : 'bg-stone-50 text-gray-600 border-stone-200 hover:border-gray-400'
                      }`}
                    >
                      {m === 'All' ? 'All Formats' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Type Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Pet Accepted</label>
                <div className="grid grid-cols-3 gap-1">
                  {['All', 'Dogs', 'Puppies', 'Cats'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPetType(p)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md transition cursor-pointer border ${
                        selectedPetType === p
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-stone-50 text-gray-600 border-stone-200 hover:border-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price per session */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Per-Session Fee</label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'Any Budget' },
                    { id: 'under-800', label: 'Under ₹800 / session' },
                    { id: '800-1000', label: '₹800 – ₹1,000 / session' },
                    { id: '1000-plus', label: '₹1,000+ (Master Trainers)' }
                  ].map((pr) => (
                    <label key={pr.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-700">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange === pr.id}
                        onChange={() => setPriceRange(pr.id)}
                        className="accent-purple-600"
                      />
                      <span>{pr.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified & Force-Free Checkboxes */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Trainer Quality</label>
                <div className="space-y-2 text-[11px] text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="accent-purple-600 rounded"
                    />
                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                      <ShieldCheck size={13} className="text-emerald-600" /> Pawora Verified Only
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceFreeOnly}
                      onChange={(e) => setForceFreeOnly(e.target.checked)}
                      className="accent-purple-600 rounded"
                    />
                    <span className="flex items-center gap-1 font-semibold text-purple-900">
                      <Award size={13} className="text-purple-600" /> 100% Force-Free Certified
                    </span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Right-Side Trainer Cards Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            {filteredProviders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-stone-200 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-800">
                  No Dog Trainers Found Matching Your Criteria
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try clearing some filter tags or selecting 'All States' to discover certified canine behaviorists and trainers across India.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition shadow cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Banner with Badges */}
                      <div className="aspect-[16/10] overflow-hidden relative bg-stone-100">
                        <img
                          src={trainer.image}
                          alt={trainer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Top Left Verified Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {trainer.verified && (
                            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                              <ShieldCheck size={12} /> Verified Academy
                            </span>
                          )}
                        </div>

                        {/* Top Right Rating Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-black text-amber-700 shadow">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          <span>{trainer.rating}</span>
                          <span className="text-gray-400 font-normal">({trainer.reviews})</span>
                        </div>

                        {/* Bottom Location & Exp Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1 font-semibold truncate max-w-[65%]">
                            <MapPin size={12} className="text-amber-400 shrink-0" />
                            {trainer.area}, {trainer.city}
                          </span>
                          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {trainer.experience}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Details */}
                      <div className="p-5 space-y-3.5">
                        
                        <div>
                          <h3 className="text-base font-serif font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {trainer.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                            <UserCheck size={12} className="text-purple-600" />
                            <span>{trainer.leadTrainer}</span>
                          </p>
                        </div>

                        {/* Specialties Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {trainer.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="bg-purple-50 text-purple-900 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-md"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Session Formats Available */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                            Available Formats:
                          </div>
                          <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-gray-600">
                            {trainer.sessionModes.map((mode) => (
                              <span key={mode} className="bg-stone-100 px-2 py-0.5 rounded text-[10px]">
                                ✓ {mode}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Certifications Strip */}
                        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5 text-[11px] text-amber-950 flex items-start gap-1.5">
                          <Award size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <span className="font-semibold leading-tight">
                            {trainer.certifications.join(' • ')}
                          </span>
                        </div>

                      </div>
                    </div>

                    {/* Pricing & Booking CTAs */}
                    <div className="p-5 pt-0 space-y-3">
                      
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Per Session</span>
                          <div className="text-base font-serif font-black text-purple-900">
                            ₹{trainer.pricePerSession}
                            <span className="text-xs font-normal text-gray-500"> / hr</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Courses From</span>
                          <div className="text-sm font-serif font-bold text-slate-800">
                            ₹{trainer.packageStarting}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenEnquiryModal(trainer)}
                          className="w-full bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={13} />
                          <span>Enquire</span>
                        </button>

                        <button
                          onClick={() => handleOpenBookingModal(trainer)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                        >
                          <GraduationCap size={14} />
                          <span>Book Session</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 6. GLOBAL BOTTOM ENQUIRY FORM */}
      <section className="max-w-3xl mx-auto px-4 md:px-6 mt-8">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-5 md:p-6 text-center space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Customized Canine Behavioral Support
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold">
              Looking for Specialized Training or Behavioral Rehab?
            </h3>
            <p className="text-xs text-purple-200 max-w-lg mx-auto">
              Share your dog's age, breed, and specific behavioral goals. Our master trainers will design a custom roadmap.
            </p>
          </div>

          <form onSubmit={handleSubmitBottomEnquiry} className="p-5 md:p-6 space-y-3.5 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={bottomFullName}
                  onChange={(e) => setBottomFullName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91..."
                  value={bottomPhone}
                  onChange={(e) => setBottomPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Your City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={bottomCity}
                  onChange={(e) => setBottomCity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Species</label>
                <select
                  value={bottomPetSpecies}
                  onChange={(e) => setBottomPetSpecies(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Dog">Dog</option>
                  <option value="Puppy">Puppy (Under 6 mos)</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Breed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Labrador"
                  value={bottomPetBreed}
                  onChange={(e) => setBottomPetBreed(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Training Goal</label>
                <select
                  value={bottomTrainingType}
                  onChange={(e) => setBottomTrainingType(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Puppy Socialization & Potty Basics">Puppy Socialization & Potty Basics</option>
                  <option value="Basic & Advanced Obedience">Basic & Advanced Obedience</option>
                  <option value="Aggression & Separation Anxiety Rehab">Aggression & Separation Anxiety Rehab</option>
                  <option value="Agility & Trick Sports">Agility & Trick Sports</option>
                  <option value="Guard Dog Protection">Guard Dog Protection</option>
                  <option value="KCI Show Ring Prep">KCI Show Ring Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Preferred Slot</label>
                <select
                  value={bottomPreferredSlot}
                  onChange={(e) => setBottomPreferredSlot(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Weekday Morning">Weekday Morning (7 AM - 10 AM)</option>
                  <option value="Weekday Evening">Weekday Evening (4 PM - 7 PM)</option>
                  <option value="Weekend Morning">Weekend Morning (8 AM - 11 AM)</option>
                  <option value="Weekend Evening">Weekend Evening (4 PM - 7 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Describe Behaviors / Challenges</label>
              <textarea
                rows={2}
                placeholder="e.g. Pulling on leash, barking when door bell rings, chewing furniture, jumping on guests..."
                value={bottomNotes}
                onChange={(e) => setBottomNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Send size={14} />
              <span>Request Customized Training Consultation</span>
            </button>

          </form>

        </div>
      </section>

      {/* 7. AUTH-PROTECTED BOOKING MODAL */}
      {showBookingModal && selectedProviderForBooking && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
            
            {/* Sticky Header */}
            <div className="bg-purple-900 text-white p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-purple-800">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Book Training Course</span>
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
              
              {/* Package Selection */}
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 space-y-1">
                <label className="block text-[10px] font-bold uppercase text-purple-900">Selected Package</label>
                <select
                  value={selectedPackage?.id || ''}
                  onChange={(e) => {
                    const pkg = selectedProviderForBooking.packages.find((p) => p.id === e.target.value);
                    if (pkg) setSelectedPackage(pkg);
                  }}
                  className="w-full bg-white border border-purple-200 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-900"
                >
                  {selectedProviderForBooking.packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ₹{pkg.price} ({pkg.sessions})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-600 pt-0.5">
                  {selectedPackage?.desc || 'Certified trainer 1-on-1 private instruction.'}
                </p>
              </div>

              {/* Start Date & Time Slot */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Starting Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Time Slot Preference</label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Morning (7:00 AM - 10:00 AM)">Morning (7:00 AM - 10:00 AM)</option>
                    <option value="Noon (11:00 AM - 2:00 PM)">Noon (11:00 AM - 2:00 PM)</option>
                    <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Pet Info */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bruno"
                    value={bookingPetName}
                    onChange={(e) => setBookingPetName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beagle"
                    value={bookingPetBreed}
                    onChange={(e) => setBookingPetBreed(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Months"
                    value={bookingPetAge}
                    onChange={(e) => setBookingPetAge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Address & Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Doorstep Address *</label>
                  <input
                    type="text"
                    required
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91..."
                    value={bookingOwnerPhone}
                    onChange={(e) => setBookingOwnerPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Behavioral Challenges / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Biting ankles, toilet training issues, pulling on leash..."
                  value={bookingBehaviorNotes}
                  onChange={(e) => setBookingBehaviorNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                >
                  Confirm Training Reservation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 8. PER-PROVIDER ENQUIRY MODAL */}
      {showEnquiryModal && selectedProviderForEnquiry && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95">
            
            {/* Sticky Header */}
            <div className="bg-purple-900 text-white p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-purple-800">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Direct Training Enquiry</span>
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Your City</label>
                  <input
                    type="text"
                    required
                    value={enqCity}
                    onChange={(e) => setEnqCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Retriever"
                    value={enqPetBreed}
                    onChange={(e) => setEnqPetBreed(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Pet Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Months"
                    value={enqPetAge}
                    onChange={(e) => setEnqPetAge(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Primary Training Goal</label>
                  <select
                    value={enqTrainingGoal}
                    onChange={(e) => setEnqTrainingGoal(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Puppy Potty & Socialization">Puppy Potty & Socialization</option>
                    <option value="Basic Obedience & Manners">Basic Obedience & Manners</option>
                    <option value="Leash Pulling & Reactivity">Leash Pulling & Reactivity</option>
                    <option value="Separation Anxiety Therapy">Separation Anxiety Therapy</option>
                    <option value="Agility & Fun Sports">Agility & Fun Sports</option>
                    <option value="Guard & Protection Training">Guard & Protection Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Specific Questions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Ask about trainer availability, home visit slots, or custom packages..."
                  value={enqNotes}
                  onChange={(e) => setEnqNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
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

export default PetTraining;
