import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Stethoscope,
  Syringe,
  ShieldCheck,
  Award,
  PhoneCall,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Building2,
  HeartPulse,
  UserCheck,
  Video,
  Home,
  AlertTriangle,
  X,
  Send,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  VET_SERVICE_MODES,
  VET_PET_CATEGORIES,
  VET_SPECIALIZATIONS,
  VET_CLINICAL_TABS,
  INITIAL_VET_DOCTORS,
  getStoredVetDoctors,
  saveVetAppointment
} from '../data/veterinaryData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

export default function VeterinaryServices() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Doctors data from safe localStorage
  const [doctors, setDoctors] = useState(() => getStoredVetDoctors());

  // Hero Search & Service Mode state
  const [heroServiceMode, setHeroServiceMode] = useState('VETERINARY'); // 'VETERINARY' or 'VACCINATION'
  const [heroState, setHeroState] = useState('All States');
  const [heroCity, setHeroCity] = useState('All Cities');
  const [heroPetType, setHeroPetType] = useState('All Pets');
  const [heroAvailableCities, setHeroAvailableCities] = useState(['All Cities']);

  // Dedicated Filter Sidebar state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedConsultMode, setSelectedConsultMode] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [availableCities, setAvailableCities] = useState(['All Cities']);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [homeVisitOnly, setHomeVisitOnly] = useState(false);

  // Interactive Clinical Tab state (Screenshot 3)
  const [activeClinicalTab, setActiveClinicalTab] = useState('wellness');

  // Modals state
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMode, setBookingMode] = useState('In-Clinic Visit');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:30 AM - 11:00 AM');
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('Dogs');
  const [petBreed, setPetBreed] = useState('');
  const [petSymptoms, setPetSymptoms] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  // Update Hero Cities when Hero State changes
  const handleHeroStateChange = (e) => {
    const st = e.target.value;
    setHeroState(st);
    if (st === 'All States' || !INDIAN_STATES_CITIES[st]) {
      setHeroAvailableCities(['All Cities']);
      setHeroCity('All Cities');
    } else {
      setHeroAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[st]]);
      setHeroCity('All Cities');
    }
  };

  // Update Sidebar Cities when Sidebar State changes
  const handleSidebarStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    if (st === 'All States' || !INDIAN_STATES_CITIES[st]) {
      setAvailableCities(['All Cities']);
      setSelectedCity('All Cities');
    } else {
      setAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[st]]);
      setSelectedCity('All Cities');
    }
  };

  // Sync Hero Search into Filter Sidebar
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroState !== 'All States') {
      setSelectedState(heroState);
      setAvailableCities(['All Cities', ...(INDIAN_STATES_CITIES[heroState] || [])]);
    }
    if (heroCity !== 'All Cities') {
      setSelectedCity(heroCity);
    }
    if (heroPetType !== 'All Pets') {
      setSelectedCategory(heroPetType);
    }
    if (heroServiceMode === 'VACCINATION') {
      setSelectedSpecialization('General Physician & Vaccines');
    }

    const resultsEl = document.getElementById('vet-directory-results');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
    toast.success('Filters updated based on your search criteria.');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('All');
    setSelectedConsultMode('all');
    setSelectedSpecialization('All Specializations');
    setSelectedExperience('all');
    setSortBy('recommended');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setAvailableCities(['All Cities']);
    setEmergencyOnly(false);
    setHomeVisitOnly(false);
    setHeroState('All States');
    setHeroCity('All Cities');
    setHeroPetType('All Pets');
    toast.success('All filters have been reset.');
  };

  // Filtered & Sorted Doctors List
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // 1. Keyword search (Name, clinic, specializations, address, city)
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchClinic = doc.clinicName.toLowerCase().includes(q);
        const matchCity = doc.city.toLowerCase().includes(q);
        const matchArea = (doc.area || '').toLowerCase().includes(q);
        const matchBio = (doc.bio || '').toLowerCase().includes(q);
        const matchSpecs = doc.specializations.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchClinic && !matchCity && !matchArea && !matchBio && !matchSpecs) {
          return false;
        }
      }

      // 2. Pet Category / Species
      if (selectedCategory !== 'All') {
        const matchesPet = doc.petCategories.includes(selectedCategory) || doc.petCategories.includes('All');
        if (!matchesPet) return false;
      }

      // 3. Consultation Mode
      if (selectedConsultMode !== 'all') {
        if (selectedConsultMode === 'clinic' && !doc.consultationModes.includes('In-Clinic Visit')) return false;
        if (selectedConsultMode === 'teleconsult' && !doc.consultationModes.includes('24/7 Video Tele-Consult')) return false;
        if (selectedConsultMode === 'home_visit' && !doc.isHomeVisitAvailable) return false;
        if (selectedConsultMode === 'emergency' && !doc.isEmergencyAvailable) return false;
      }

      // 4. Specialization
      if (selectedSpecialization !== 'All Specializations') {
        if (!doc.specializations.includes(selectedSpecialization)) return false;
      }

      // 5. Experience
      if (selectedExperience !== 'all') {
        if (selectedExperience === '5plus' && doc.experienceYears < 5) return false;
        if (selectedExperience === '10plus' && doc.experienceYears < 10) return false;
        if (selectedExperience === '15plus' && doc.experienceYears < 15) return false;
      }

      // 6. State & City
      if (selectedState !== 'All States' && doc.state !== selectedState) return false;
      if (selectedCity !== 'All Cities' && doc.city !== selectedCity) return false;

      // 7. Quick Toggles
      if (emergencyOnly && !doc.isEmergencyAvailable) return false;
      if (homeVisitOnly && !doc.isHomeVisitAvailable) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.videoConsultFee - b.videoConsultFee;
      }
      if (sortBy === 'price-high') {
        return b.inClinicFee - a.inClinicFee;
      }
      if (sortBy === 'exp-high') {
        return b.experienceYears - a.experienceYears;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // default: recommended (high rating & reviews)
      return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
    });
  }, [
    doctors,
    searchKeyword,
    selectedCategory,
    selectedConsultMode,
    selectedSpecialization,
    selectedExperience,
    selectedState,
    selectedCity,
    emergencyOnly,
    homeVisitOnly,
    sortBy
  ]);

  // Handle WhatsApp Direct Consultation
  const handleWhatsAppConsult = (doc) => {
    const text = encodeURIComponent(
      `Hello ${doc.name}, I found your clinic (${doc.clinicName}) on Pawora. I would like to enquire about veterinary consultation for my pet.`
    );
    window.open(`https://wa.me/${doc.whatsapp}?text=${text}`, '_blank');
  };

  // Open Details Modal
  const handleOpenDetails = (doc) => {
    setSelectedDoctorForDetails(doc);
    setShowDoctorModal(true);
  };

  // Open Booking Modal with Auth Verification
  const handleOpenBooking = (doc, prefilledMode = 'In-Clinic Visit') => {
    if (!isAuthenticated) {
      toast.error('Please log in or register to book a veterinary appointment.');
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'veterinary' }
        })
      );
      return;
    }
    setSelectedDoctorForBooking(doc);
    setBookingMode(prefilledMode);
    setShowBookingModal(true);
  };

  // Handle Appointment Booking Submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in or register to book a veterinary appointment.');
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'veterinary' }
        })
      );
      return;
    }
    if (!petName.trim() || !ownerName.trim() || !ownerPhone.trim() || !bookingDate) {
      toast.error('Please fill in all required appointment fields.');
      return;
    }

    const appointment = {
      id: `app-${Date.now()}`,
      doctorId: selectedDoctorForBooking.id,
      doctorName: selectedDoctorForBooking.name,
      clinicName: selectedDoctorForBooking.clinicName,
      bookingMode,
      bookingDate,
      bookingTimeSlot,
      petName,
      petSpecies,
      petBreed,
      petSymptoms,
      ownerName,
      ownerPhone,
      status: 'Confirmed',
      fee:
        bookingMode === '24/7 Video Tele-Consult'
          ? selectedDoctorForBooking.videoConsultFee
          : bookingMode === 'Home Visit Vet'
          ? selectedDoctorForBooking.homeVisitFee
          : selectedDoctorForBooking.inClinicFee,
      createdAt: new Date().toISOString()
    };

    saveVetAppointment(appointment);
    setShowBookingModal(false);
    toast.success(
      `Appointment confirmed with ${selectedDoctorForBooking.name} for ${bookingDate} (${bookingTimeSlot})!`,
      { duration: 5000 }
    );

    // Reset fields
    setPetName('');
    setPetBreed('');
    setPetSymptoms('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">

      {/* ================= 1. HERO SEARCH & MODES SECTION (MATCHING SCREENSHOT 1) ================= */}
      <section className="relative bg-gradient-to-b from-[#0b3b32] via-[#0f4d42] to-[#0b3b32] text-white pt-10 pb-16 px-4 md:px-8 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-6 text-center">

          {/* Top Banner Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/60 border border-teal-400/30 text-teal-200 text-xs font-semibold tracking-wide italic shadow-sm">
            <Sparkles size={14} className="text-teal-300 animate-pulse" />
            Find Vet In Your City • View Details • Book Doctors
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Consult India's Top <span className="text-teal-300">Veterinary Surgeons</span> & Clinics
          </h1>
          <p className="text-sm md:text-base text-teal-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            Verified licensed veterinarians, digital prescriptions, home visit doctors, and 24/7 video tele-consultations across 70+ Indian cities.
          </p>

          {/* Service Mode Tabs (VETERINARY & VACCINATION matching Screenshot 1) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setHeroServiceMode('VETERINARY')}
              className={`flex flex-col items-center justify-center w-28 sm:w-32 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md ${
                heroServiceMode === 'VETERINARY'
                  ? 'bg-amber-200 text-amber-950 ring-4 ring-amber-300/40 -translate-y-1'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              <span className="text-2xl mb-1">👩‍⚕️</span>
              <span>Veterinary</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroServiceMode('VACCINATION')}
              className={`flex flex-col items-center justify-center w-28 sm:w-32 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md ${
                heroServiceMode === 'VACCINATION'
                  ? 'bg-amber-200 text-amber-950 ring-4 ring-amber-300/40 -translate-y-1'
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
              }`}
            >
              <span className="text-2xl mb-1">💉</span>
              <span>Vaccination</span>
            </button>
          </div>

          {/* Hero Multi-Select Search Bar (Matching Screenshot 1) */}
          <div className="bg-white/95 backdrop-blur-md text-slate-800 p-4 sm:p-5 rounded-2xl shadow-2xl border border-teal-100 max-w-4xl mx-auto">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
              
              {/* Select State */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  📍 State
                </label>
                <div className="relative">
                  <select
                    value={heroState}
                    onChange={handleHeroStateChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#0f766e] cursor-pointer appearance-none"
                  >
                    <option value="All States">-Select State-</option>
                    {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Select City */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  🏙️ City
                </label>
                <div className="relative">
                  <select
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#0f766e] cursor-pointer appearance-none"
                  >
                    <option value="All Cities">-Select City-</option>
                    {heroAvailableCities.filter((c) => c !== 'All Cities').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Select Pet Type */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  🐾 Pet Type
                </label>
                <div className="relative">
                  <select
                    value={heroPetType}
                    onChange={(e) => setHeroPetType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#0f766e] cursor-pointer appearance-none"
                  >
                    <option value="All Pets">-Select Pet Type-</option>
                    <option value="Dogs">Dogs</option>
                    <option value="Cats">Cats</option>
                    <option value="Birds">Birds</option>
                    <option value="Fish">Fish</option>
                    <option value="Reptiles">Reptiles</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 md:col-span-1 pt-4 sm:pt-0">
                <label className="hidden md:block text-[10px] font-bold text-transparent mb-1 select-none">
                  Search
                </label>
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Search size={14} /> Search
                </button>
              </div>

            </form>
          </div>

          {/* Trust Highlights (Matching Screenshot 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-xs font-semibold">
            <div className="flex items-center justify-center gap-2.5 bg-teal-900/40 border border-teal-500/30 p-3 rounded-2xl text-teal-100 shadow-sm">
              <span className="text-xl">👨‍⚕️</span>
              <span>GET A <strong className="text-teal-300">BEST DOCTOR</strong> FOR YOUR PET.</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 bg-teal-900/40 border border-teal-500/30 p-3 rounded-2xl text-teal-100 shadow-sm">
              <span className="text-xl">🐕</span>
              <span><strong className="text-teal-300">VACCINATE</strong> YOUR DOG / PET.</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 bg-teal-900/40 border border-teal-500/30 p-3 rounded-2xl text-teal-100 shadow-sm">
              <span className="text-xl">🛡️</span>
              <span><strong className="text-teal-300">70+ TRUSTED VETS</strong> AVAILABLE</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 2. MAIN 2-COLUMN SECTION: FILTERS & DOCTORS DIRECTORY ================= */}
      <section id="vet-directory-results" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Results Section Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope size={22} className="text-[#00838f]" />
              Verified Veterinary Doctors & Clinics in India
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> available veterinary specialists matching your criteria
            </p>
          </div>
          
          {/* Quick Helpline Badge */}
          <div className="bg-white border border-slate-200 shadow-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-700 font-semibold shrink-0">
            <PhoneCall size={14} className="text-[#00838f]" />
            <span>Emergency Vet Helpline: <strong>+91 8306-944-422</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================= LEFT SIDEBAR: DEDICATED SCROLLABLE FILTERS ================= */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-5 lg:sticky lg:top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar">
            
            {/* Header & Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#00838f]" />
                <h3 className="font-serif font-bold text-base text-slate-900 uppercase tracking-wider">
                  Filter Doctors
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            {/* 1. Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-1.5">
                Search Doctor / Clinic / Area
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh, Indiranagar, Surgery..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* 2. Pet Category (Dogs, Cats, Birds, Fish, Reptiles, All Pets) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-2">
                Pet Species / Category
              </label>
              <div className="space-y-1.5 text-xs">
                {VET_PET_CATEGORIES.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition select-none ${
                      selectedCategory === item.id
                        ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="petCategory"
                        value={item.id}
                        checked={selectedCategory === item.id}
                        onChange={() => setSelectedCategory(item.id)}
                        className="text-[#00838f] focus:ring-0 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Consultation Mode */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-2">
                Consultation Mode
              </label>
              <div className="space-y-1.5 text-xs">
                {VET_SERVICE_MODES.map((mode) => (
                  <label
                    key={mode.id}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition select-none ${
                      selectedConsultMode === mode.id
                        ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="consultMode"
                        value={mode.id}
                        checked={selectedConsultMode === mode.id}
                        onChange={() => setSelectedConsultMode(mode.id)}
                        className="text-[#00838f] focus:ring-0 cursor-pointer"
                      />
                      <span>{mode.icon} {mode.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Specialization */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-2">
                Doctor Specialization
              </label>
              <div className="relative">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#00838f] cursor-pointer appearance-none"
                >
                  {VET_SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 5. Sort By */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'recommended', label: '⭐ Recommended / Highest Rated' },
                  { id: 'price-low', label: '💰 Video Fee: Low to High' },
                  { id: 'price-high', label: '🏥 Clinic Fee: High to Low' },
                  { id: 'exp-high', label: '🎓 Experience: High to Low' }
                ].map((sortItem) => (
                  <label
                    key={sortItem.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition select-none text-xs ${
                      sortBy === sortItem.id
                        ? 'bg-teal-50 text-teal-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sortBy"
                      value={sortItem.id}
                      checked={sortBy === sortItem.id}
                      onChange={() => setSortBy(sortItem.id)}
                      className="text-[#00838f] focus:ring-0 cursor-pointer"
                    />
                    <span>{sortItem.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Experience Filter */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider mb-2">
                Years of Clinical Experience
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Exp.' },
                  { id: '5plus', label: '5+ Years' },
                  { id: '10plus', label: '10+ Years' },
                  { id: '15plus', label: '15+ Years' }
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExperience(exp.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${
                      selectedExperience === exp.id
                        ? 'bg-[#00838f] text-white border-[#00838f]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Location Filter (State & City) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider">
                Doctor Location
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={handleSidebarStateChange}
                  className="w-full p-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#00838f] cursor-pointer appearance-none"
                >
                  <option value="All States">All States</option>
                  {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#00838f] cursor-pointer appearance-none"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 8. Quick Feature Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-[#00838f] uppercase tracking-wider">
                Emergency & Availability
              </label>
              
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="rounded text-[#00838f] focus:ring-0 cursor-pointer"
                />
                <span>🚨 24/7 Emergency & ICU Ready</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={homeVisitOnly}
                  onChange={(e) => setHomeVisitOnly(e.target.checked)}
                  className="rounded text-[#00838f] focus:ring-0 cursor-pointer"
                />
                <span>🏠 Home Visit Available</span>
              </label>
            </div>

          </aside>

          {/* ================= RIGHT MAIN: DOCTOR & CLINIC CARDS ================= */}
          <main className="lg:col-span-8">
            
            {filteredDoctors.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-[#00838f] flex items-center justify-center mx-auto text-2xl">
                  🩺
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  No Veterinary Doctors Found Matching Your Criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your location, specialization, or pet species filter, or reset all filters to view our full nationwide directory.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
                  >
                    <div>
                      
                      {/* Doctor Top Header with Avatar & Badges */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="relative shrink-0">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-100 group-hover:border-teal-400 transition"
                          />
                          {doc.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-xs" title="VCI Verified Doctor">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-serif font-bold text-base text-slate-900 truncate">
                              {doc.name}
                            </h3>
                            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-bold">
                              {doc.experienceDisplay}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {doc.degrees}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {doc.rating}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({doc.reviewsCount} reviews)
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-teal-700 font-semibold truncate">
                              {doc.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Clinic Name & Address */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Building2 size={13} className="text-[#00838f] shrink-0" />
                          <span className="truncate">{doc.clinicName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{doc.area}, {doc.city}</span>
                        </div>
                      </div>

                      {/* Specialization Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {doc.specializations.map((spec, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-teal-50/70 text-teal-900 border border-teal-200/60 px-2 py-0.5 rounded-md font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Consultation Fee Cards */}
                      <div className="grid grid-cols-2 gap-2 mb-3.5 text-center text-xs">
                        <div className="bg-emerald-50/70 border border-emerald-200/70 p-2 rounded-xl">
                          <span className="block text-[10px] text-emerald-800 font-semibold uppercase">
                            Video Consult
                          </span>
                          <span className="font-bold text-emerald-950 text-sm">
                            ₹{doc.videoConsultFee}
                          </span>
                        </div>
                        <div className="bg-teal-50/70 border border-teal-200/70 p-2 rounded-xl">
                          <span className="block text-[10px] text-teal-800 font-semibold uppercase">
                            In-Clinic Visit
                          </span>
                          <span className="font-bold text-teal-950 text-sm">
                            ₹{doc.inClinicFee}
                          </span>
                        </div>
                      </div>

                      {/* Operating Hours & Emergency Availability */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pb-3 border-b border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {doc.openTodayTiming}
                        </span>
                        {doc.isEmergencyAvailable && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            🚨 24/7 ICU
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      
                      {/* WhatsApp Chat */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppConsult(doc)}
                        className="w-10 h-9 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl flex items-center justify-center transition cursor-pointer shadow-xs shrink-0"
                        title={`Chat on WhatsApp with ${doc.name}`}
                      >
                        <MessageSquare size={16} />
                      </button>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(doc)}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Profile
                      </button>

                      {/* Book Appointment */}
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(doc)}
                        className="flex-1 py-2 px-2 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center truncate shadow-sm"
                      >
                        Book Appointment
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </main>

        </div>
      </section>

      {/* ================= 5. INTERACTIVE CLINICAL TABS (MATCHING SCREENSHOT 3) ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Comprehensive Clinical Services for Every Pet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From routine wellness to life-saving emergency surgery, our network of veterinarians adheres to international gold standards.
          </p>
        </div>

        {/* 2-Column Tabs Layout matching Screenshot 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
          
          {/* Left Vertical Tabs List */}
          <div className="md:col-span-4 space-y-2">
            {VET_CLINICAL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveClinicalTab(tab.id)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                  activeClinicalTab === tab.id
                    ? 'bg-[#00838f] text-white shadow-md font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <span>🩺</span>
                  <span>{tab.icon}</span>
                </div>
                <ChevronRight size={14} className={activeClinicalTab === tab.id ? 'text-teal-200' : 'text-slate-400'} />
              </button>
            ))}
          </div>

          {/* Right Active Tab Details Panel */}
          {(() => {
            const currentTab = VET_CLINICAL_TABS.find((t) => t.id === activeClinicalTab) || VET_CLINICAL_TABS[0];
            return (
              <div className="md:col-span-8 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#0f4d42] mb-2">
                    {currentTab.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {currentTab.description}
                  </p>

                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Key Clinical Capabilities:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentTab.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <CheckCircle2 size={14} className="text-teal-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights matching Screenshot 3 */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-bold text-[#00838f]">
                  {currentTab.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="text-teal-600">»</span> {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ================= 6. REASSURANCE SECTION (MATCHING SCREENSHOTS 2 & 4) ================= */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-gradient-to-r from-[#0b3b32] to-[#00838f] text-white rounded-3xl p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full border border-teal-400/30 inline-block">
              We've Got Your Pet's Back
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Best Veterinary Doctors for Dogs, Cats & Exotic Pets in India
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed font-light">
              Find the best veterinarians, veterinary clinics, and animal hospitals near you. Book instant video consultations or schedule in-clinic visits with licensed BVSc & MVSc certified surgeons.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">💳</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Cashless Payments</h4>
                <p className="text-[11px] text-teal-200">Zero commission direct payments with digital invoice.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">🛡️</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Pawora Vet Guarantee</h4>
                <p className="text-[11px] text-teal-200">100% verified VCI registration & sterile clinic standards.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">📱</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Instant Tele-Consult</h4>
                <p className="text-[11px] text-teal-200">24/7 video calls & digital prescriptions in 15 mins.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 text-center">
            <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-12 h-12 bg-teal-50 text-[#00838f] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                📞
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Need Emergency Guidance?
              </h3>
              <p className="text-xs text-slate-500">
                Speak directly with an on-call veterinary emergency triage officer.
              </p>
              <a
                href="tel:+918306944422"
                className="block w-full py-2.5 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
              >
                +91 - 8306-944-422
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 7. DOCTOR PROFILE DETAILS MODAL ================= */}
      {showDoctorModal && selectedDoctorForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b3b32] to-[#00838f] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctorForDetails.avatar}
                  alt={selectedDoctorForDetails.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-teal-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      {selectedDoctorForDetails.name}
                    </h3>
                    <span className="text-[10px] bg-teal-900 text-teal-200 px-1.5 py-0.5 rounded font-bold">
                      {selectedDoctorForDetails.experienceDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-teal-200">
                    {selectedDoctorForDetails.title} • {selectedDoctorForDetails.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              {/* Doctor Bio */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  About the Doctor
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedDoctorForDetails.bio}
                </p>
              </div>

              {/* Qualifications & Registration */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Degree & Credentials</span>
                  <span className="font-semibold text-slate-800">{selectedDoctorForDetails.degrees}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">VCI Registration Number</span>
                  <span className="font-semibold text-teal-800">{selectedDoctorForDetails.vciRegistration}</span>
                </div>
              </div>

              {/* Clinic Facilities */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Hospital & Diagnostic Facilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDoctorForDetails.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-teal-50/60 rounded-lg text-teal-950 font-medium">
                      <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rates Breakdown */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Consultation Rates
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Video Call</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.videoConsultFee}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">In-Clinic</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.inClinicFee}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Home Visit</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.homeVisitFee}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setShowDoctorModal(false);
                  handleOpenBooking(selectedDoctorForDetails);
                }}
                className="px-5 py-2.5 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                Book Appointment Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 8. BOOK APPOINTMENT MODAL ================= */}
      {showBookingModal && selectedDoctorForBooking && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-lg my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#00838f] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <h3 className="font-serif font-bold text-base text-white">
                  Book Appointment with {selectedDoctorForBooking.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              
              {/* Consultation Mode Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Consultation Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'In-Clinic Visit', label: 'In-Clinic', fee: selectedDoctorForBooking.inClinicFee },
                    { id: '24/7 Video Tele-Consult', label: 'Video Call', fee: selectedDoctorForBooking.videoConsultFee },
                    { id: 'Home Visit Vet', label: 'Home Visit', fee: selectedDoctorForBooking.homeVisitFee }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setBookingMode(mode.id)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        bookingMode === mode.id
                          ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs">{mode.label}</span>
                      <span className="block text-[11px] font-extrabold text-[#00838f]">₹{mode.fee}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                  >
                    <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                    <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                    <option value="07:00 PM - 07:30 PM">07:00 PM - 07:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pet's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                    placeholder="e.g. Leo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pet Species *
                  </label>
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                  >
                    <option value="Dogs">Dog</option>
                    <option value="Cats">Cat</option>
                    <option value="Birds">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Reptiles">Reptile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                    placeholder="e.g. Golden Retriever"
                  />
                </div>
              </div>

              {/* Symptoms / Reason */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Symptoms / Reason for Consultation
                </label>
                <textarea
                  rows={2}
                  value={petSymptoms}
                  onChange={(e) => setPetSymptoms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                  placeholder="e.g. Routine vaccination, vomiting, limp in hind leg..."
                />
              </div>

              {/* Owner Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00838f]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00838f] hover:bg-[#006064] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send size={14} /> Confirm & Reserve Appointment
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
