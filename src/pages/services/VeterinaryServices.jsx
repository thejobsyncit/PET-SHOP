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
  Check,
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
} from '../../data/veterinaryData.js';
import { INDIAN_STATES_CITIES } from '../../data/adoptionPetsData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../../components/ui/ServiceAccessLock.jsx';
import { handleServiceAction } from '../../components/widgets/ServicePackageAccessModal.jsx';
import ScrollReveal from '../../components/ui/ScrollReveal.jsx';
import PetBreedDropdown from '../../components/ui/PetBreedDropdown.jsx';
import { apiRequest } from '../../services/api.js';

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
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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

  // Handle WhatsApp Direct Consultation or Visit
  const handleWhatsAppConsult = (doc) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in first to contact veterinarians.', { icon: '🔒' });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'veterinary' }
        })
      );
      return;
    }
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Veterinary',
      provider: { ...doc, phone: doc.whatsapp },
      action: 'whatsapp'
    });
  };

  // Open Details Modal / Visit Doctor
  const handleOpenDetails = (doc) => {
    if (!isAuthenticated) {
      toast.error('Please register or log in first to view veterinarian profiles.', { icon: '🔒' });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'veterinary' }
        })
      );
      return;
    }
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Veterinary',
      provider: { ...doc, phone: doc.whatsapp },
      action: 'view_expert_profile'
    });
  };

  // Open Booking Modal with Auth Verification & Package Access
  const handleOpenBooking = (doc, prefilledMode = 'In-Clinic Visit') => {
    setSelectedDoctorForBooking(doc);
    setBookingMode(prefilledMode);
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Veterinary',
      provider: { ...doc, phone: doc.whatsapp },
      action: 'book',
      onAuthorized: () => {
        setSelectedDoctorForBooking(doc);
        setBookingMode(prefilledMode);
        setShowBookingModal(true);
      }
    });
  };

  // Handle Appointment Booking Submit
  const handleBookingSubmit = async (e) => {
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

    const bookingId = `VET-${Date.now().toString().slice(-6)}`;
    const consultFee =
      bookingMode === '24/7 Video Tele-Consult'
        ? selectedDoctorForBooking.videoConsultFee
        : bookingMode === 'Home Visit Vet'
        ? selectedDoctorForBooking.homeVisitFee
        : selectedDoctorForBooking.inClinicFee;

    const clinicLocation = selectedDoctorForBooking.clinicName 
      ? `${selectedDoctorForBooking.clinicName}${selectedDoctorForBooking.city ? `, ${selectedDoctorForBooking.city}` : ''}`
      : (selectedDoctorForBooking.city ? `${selectedDoctorForBooking.city}, ${selectedDoctorForBooking.state || ''}` : 'In-Clinic Clinic / Online');

    const appointment = {
      id: bookingId,
      _id: bookingId,
      bookingId,
      serviceType: 'Consult a Vet',
      serviceCategory: 'Consult a Vet',
      doctorId: selectedDoctorForBooking.id,
      doctorName: selectedDoctorForBooking.name,
      providerId: selectedDoctorForBooking.id,
      providerName: selectedDoctorForBooking.name,
      clinicName: selectedDoctorForBooking.clinicName || 'Pet Care Clinic',
      location: clinicLocation,
      bookingMode,
      date: bookingDate,
      bookingDate,
      timeSlot: bookingTimeSlot,
      bookingTimeSlot,
      petName: petName.trim(),
      petSpecies,
      petBreed: petBreed.trim() || 'Indie / Mixed',
      petSymptoms: petSymptoms.trim(),
      petDetails: {
        name: petName.trim(),
        type: petSpecies,
        breed: petBreed.trim() || 'Indie / Mixed',
        symptoms: petSymptoms.trim()
      },
      ownerName: ownerName.trim() || user?.name || 'Pet Parent',
      ownerPhone: ownerPhone.trim() || user?.mobile || '',
      ownerEmail: user?.email || '',
      userId: user?.id || user?._id || '',
      userEmail: user?.email || '',
      isUserBooking: true,
      status: 'Confirmed',
      fee: Number(consultFee) || 500,
      paymentStatus: bookingMode === '24/7 Video Tele-Consult' ? 'Paid' : 'Pay at Clinic',
      createdAt: new Date().toISOString()
    };

    // 1. Save locally for guaranteed client persistence
    saveVetAppointment(appointment);

    // 2. Persist to server backend API
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(appointment)
      });
    } catch (err) {
      console.warn('Backend booking sync warning, stored locally:', err);
    }

    // 3. Dispatch reactive events to update all dashboards in real-time
    window.dispatchEvent(new CustomEvent('service-booking-updated', { detail: appointment }));
    window.dispatchEvent(new CustomEvent('vet-data-updated', { detail: { type: 'appointment', action: 'create', appointment } }));

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

  if (isServicePathLockedForUser(user, '/veterinary')) {
    return <ServiceAccessLock serviceName="Consult a Vet (Veterinary Care)" attemptedPath="/veterinary" />;
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">

      {/* ================= 1. HERO SEARCH & MODES SECTION ================= */}
      <ScrollReveal
        variant="fade"
        style={{ background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 50%, #b89228 100%)' }}
        className="relative text-slate-900 pt-8 pb-12 px-4 md:px-8 overflow-hidden shadow-inner border-b border-[#b89228]"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-80 h-80 bg-[#b89228]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-5 text-center">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-800/80 font-medium justify-start mb-2">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-black transition">Pet Services</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-900">Veterinary Care</span>
          </div>

          {/* Top Banner Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-[#b89228]/40 text-[#1D3B2E] text-xs font-bold tracking-wide italic shadow-xs">
            <Sparkles size={14} className="text-[#b89228]" />
            Find Vet In Your City • View Details • Book Doctors
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-950 tracking-tight leading-tight">
            Consult India's Top <span className="text-[#1D3B2E]">Veterinary Surgeons</span> & Clinics
          </h1>
          <p className="text-sm md:text-base text-slate-900 max-w-2xl mx-auto font-medium leading-relaxed">
            Verified licensed veterinarians, digital prescriptions, home visit doctors, and 24/7 video tele-consultations across 70+ Indian cities.
          </p>

          {/* Service Mode Tabs (VETERINARY & VACCINATION) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setHeroServiceMode('VETERINARY')}
              className={`flex items-center justify-center py-2.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md ${
                heroServiceMode === 'VETERINARY'
                  ? 'bg-[#1D3B2E] text-white ring-4 ring-[#1D3B2E]/20 -translate-y-0.5'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-stone-200'
              }`}
            >
              <span>Veterinary</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroServiceMode('VACCINATION')}
              className={`flex items-center justify-center py-2.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md ${
                heroServiceMode === 'VACCINATION'
                  ? 'bg-[#1D3B2E] text-white ring-4 ring-[#1D3B2E]/20 -translate-y-0.5'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-stone-200'
              }`}
            >
              <span>Vaccination</span>
            </button>
          </div>

          {/* Hero Multi-Select Search Bar */}
          <div className="bg-white/95 backdrop-blur-md text-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl border border-[#b89228]/40 max-w-4xl mx-auto">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs items-center">
              
              {/* Select State */}
              <div className="relative">
                <select
                  value={heroState}
                  onChange={handleHeroStateChange}
                  aria-label="Select State"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
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

              {/* Select City */}
              <div className="relative">
                <select
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  aria-label="Select City"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
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

              {/* Select Pet Type */}
              <div className="relative">
                <select
                  value={heroPetType}
                  onChange={(e) => setHeroPetType(e.target.value)}
                  aria-label="Select Pet Type"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
                >
                  <option value="All Pets">-Select Pet Type-</option>
                  <option value="Dogs">Dogs</option>
                  <option value="Cats">Cats</option>
                  <option value="Birds">Birds</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Search Button */}
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 btn-footer-green-gold text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Search size={14} /> Search
                </button>
              </div>

            </form>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 max-w-4xl mx-auto text-xs font-bold text-slate-900">
            <div className="flex items-center justify-center gap-2 bg-white/70 border border-[#b89228]/40 p-2.5 rounded-2xl shadow-xs">
              <span>GET A <strong className="text-[#1D3B2E]">BEST DOCTOR</strong> FOR YOUR PET</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/70 border border-[#b89228]/40 p-2.5 rounded-2xl shadow-xs">
              <span><strong className="text-[#1D3B2E]">VACCINATE</strong> YOUR DOG / PET</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/70 border border-[#b89228]/40 p-2.5 rounded-2xl shadow-xs">
              <span><strong className="text-[#1D3B2E]">70+ TRUSTED VETS</strong> AVAILABLE</span>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* ================= 2. MAIN 2-COLUMN SECTION: FILTERS & DOCTORS DIRECTORY ================= */}
      <ScrollReveal variant="slideUp" delay={0.1} id="vet-directory-results" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Results Section Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope size={22} className="text-[#1D3B2E]" />
              Verified Veterinary Doctors & Clinics in India
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> available veterinary specialists matching your criteria
            </p>
          </div>
          
          {/* Quick Helpline Badge */}
          <div className="bg-white border border-slate-200 shadow-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-700 font-semibold shrink-0">
            <PhoneCall size={14} className="text-[#1D3B2E]" />
            <span>Emergency Vet Helpline: <strong>+91 98765 43210</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================= LEFT SIDEBAR: STANDARDIZED FILTERS ================= */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              
              {/* Header with Title & Reset Button */}
              <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#1D3B2E]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Filter Doctors
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-[#1D3B2E] hover:text-[#0F241C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              </div>

              {/* Filter Body */}
              <div className="p-4 space-y-4 text-xs">

                {/* Keyword Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Search Doctor / Clinic / Area
                  </label>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh, Indiranagar, Surgery..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#1D3B2E]"
                    />
                  </div>
                </div>

                {/* Pet Species / Category - No icons */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Pet Species / Category
                  </label>
                  <div className="space-y-1">
                    {VET_PET_CATEGORIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCategory(item.id)}
                        className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                          selectedCategory === item.id
                            ? 'bg-[#1D3B2E] text-white font-bold'
                            : 'text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {selectedCategory === item.id && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Mode - No icons */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Consultation Mode
                  </label>
                  <div className="space-y-1">
                    {VET_SERVICE_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedConsultMode(mode.id)}
                        className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                          selectedConsultMode === mode.id
                            ? 'bg-[#1D3B2E] text-white font-bold'
                            : 'text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        <span>{mode.label}</span>
                        {selectedConsultMode === mode.id && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Specialization */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Specialization
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                    >
                      {VET_SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sort By - Clean labels without emoji icons */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                    >
                      <option value="recommended">Recommended / Highest Rated</option>
                      <option value="price-low">Video Fee: Low to High</option>
                      <option value="price-high">Clinic Fee: High to Low</option>
                      <option value="exp-high">Experience: High to Low</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Years of Experience
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
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
                            ? 'bg-[#1D3B2E] text-white border-[#1D3B2E]'
                            : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Filter (State & City) */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Doctor Location
                  </label>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <select
                        value={selectedState}
                        onChange={handleSidebarStateChange}
                        className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="All States">All States</option>
                        {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Emergency & Availability - No emoji icons */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                    Emergency & Availability
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emergencyOnly}
                      onChange={(e) => setEmergencyOnly(e.target.checked)}
                      className="rounded text-[#1D3B2E] focus:ring-0 cursor-pointer accent-[#1D3B2E]"
                    />
                    <span>24/7 Emergency & ICU Ready</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={homeVisitOnly}
                      onChange={(e) => setHomeVisitOnly(e.target.checked)}
                      className="rounded text-[#1D3B2E] focus:ring-0 cursor-pointer accent-[#1D3B2E]"
                    />
                    <span>Home Visit Available</span>
                  </label>
                </div>

              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN: DOCTOR & CLINIC CARDS ================= */}
          <main className="lg:col-span-9">
            
            {filteredDoctors.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-4 lg:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#1D3B2E] flex items-center justify-center mx-auto text-2xl">
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
                  className="px-5 py-2.5 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div id="doctors-list" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
                  >
                    <div>
                      
                      {/* Doctor Top Header with Avatar & Badges */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="relative shrink-0">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-200 group-hover:border-emerald-600 transition"
                          />
                          {doc.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1D3B2E] text-white rounded-full flex items-center justify-center shadow-xs" title="VCI Verified Doctor">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-serif font-bold text-base text-slate-900 truncate">
                              {doc.name}
                            </h3>
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
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
                            <span className="text-[11px] text-emerald-800 font-semibold truncate">
                              {doc.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Clinic Name & Address */}
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Building2 size={13} className="text-[#1D3B2E] shrink-0" />
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
                            className="text-[10px] bg-stone-100 text-slate-700 border border-stone-200 px-2 py-0.5 rounded-md font-medium"
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
                        <div className="bg-stone-50 border border-stone-200 p-2 rounded-xl">
                          <span className="block text-[10px] text-slate-600 font-semibold uppercase">
                            In-Clinic Visit
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{doc.inClinicFee}
                          </span>
                        </div>
                      </div>

                      {/* Operating Hours & Emergency Availability */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 pb-3 border-b border-stone-100">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {doc.openTodayTiming}
                        </span>
                        {doc.isEmergencyAvailable && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            24/7 ICU
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
                        className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Profile
                      </button>

                      {/* Book Appointment */}
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(doc)}
                        className="flex-1 py-2 px-2 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center truncate shadow-sm"
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
      </ScrollReveal>

      {/* ================= 5. INTERACTIVE CLINICAL TABS (MATCHING SCREENSHOT 3) ================= */}
      <ScrollReveal variant="fade" className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Comprehensive Clinical Services for Every Pet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From routine wellness to life-saving emergency surgery, our network of veterinarians adheres to international gold standards.
          </p>
        </div>

        {/* 2-Column Tabs Layout matching Screenshot 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-sm">
          
          {/* Left Vertical Tabs List */}
          <div className="md:col-span-4 space-y-2">
            {VET_CLINICAL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveClinicalTab(tab.id)}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                  activeClinicalTab === tab.id
                    ? 'bg-[#1D3B2E] text-white shadow-md font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-slate-700 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <span>🩺</span>
                  <span>{tab.icon}</span>
                </div>
                <ChevronRight size={14} className={activeClinicalTab === tab.id ? 'text-emerald-200' : 'text-slate-400'} />
              </button>
            ))}
          </div>

          {/* Right Active Tab Details Panel */}
          {(() => {
            const currentTab = VET_CLINICAL_TABS.find((t) => t.id === activeClinicalTab) || VET_CLINICAL_TABS[0];
            return (
              <div className="md:col-span-8 bg-stone-50 p-6 sm:p-8 rounded-2xl border border-stone-200/80 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1D3B2E] mb-2">
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
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-stone-200/80">
                        <CheckCircle2 size={14} className="text-[#1D3B2E] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights matching Screenshot 3 */}
                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-4 text-xs font-bold text-[#1D3B2E]">
                  {currentTab.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-700">»</span> {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </ScrollReveal>

      {/* ================= 6. REASSURANCE SECTION (MATCHING SCREENSHOTS 2 & 4) ================= */}
      <ScrollReveal variant="slideUp" delay={0.2} className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-gradient-to-r from-[#1D3B2E] to-[#152e24] text-white rounded-3xl p-6 sm:p-4 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
              We've Got Your Pet's Back
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Best Veterinary Doctors for Dogs, Cats & Exotic Pets in India
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-light">
              Find the best veterinarians, veterinary clinics, and animal hospitals near you. Book instant video consultations or schedule in-clinic visits with licensed BVSc & MVSc certified surgeons.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">💳</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Cashless Payments</h4>
                <p className="text-[11px] text-emerald-200">Zero commission direct payments with digital invoice.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">🛡️</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Josh Pets Hub Vet Guarantee</h4>
                <p className="text-[11px] text-emerald-200">100% verified VCI registration & sterile clinic standards.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <div className="text-xl mb-1">📱</div>
                <h4 className="text-xs font-bold text-white mb-0.5">Instant Tele-Consult</h4>
                <p className="text-[11px] text-emerald-200">24/7 video calls & digital prescriptions in 15 mins.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 text-center">
            <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-[#1D3B2E] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                📞
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">
                Need Emergency Guidance?
              </h3>
              <p className="text-xs text-slate-500">
                Speak directly with an on-call veterinary emergency triage officer.
              </p>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="block w-full py-2.5 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer border-0"
              >
                CONNECT WITH ON-CALL VET
              </button>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* ================= 6.5 EMERGENCY VET TRIAGE & GUIDANCE MODAL ================= */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-lg my-auto shadow-2xl border border-red-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 via-rose-700 to-[#1D3B2E] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <HeartPulse size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      24/7 Emergency Vet Triage
                    </h3>
                    <span className="bg-red-500/80 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                      LIVE ON-CALL
                    </span>
                  </div>
                  <p className="text-xs text-rose-100">
                    Immediate medical escalation & emergency guidance for critical pet cases
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              
              {/* Urgent Call Card */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-red-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <PhoneCall size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-red-800 uppercase tracking-wider">
                      Emergency Vet Hotline (Toll-Free)
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                      +91 98765 43210
                    </span>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      Zero waiting time. Trauma, poisoning, GDV, and oxygen resuscitation.
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+919876543210"
                  className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition text-center shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <PhoneCall size={14} /> Call Now
                </a>
              </div>

              {/* WhatsApp Emergency Chat Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#25D366] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                      Instant WhatsApp Triage
                    </span>
                    <p className="text-xs text-slate-700 font-medium">
                      Chat directly with on-duty veterinary triage officers. Share video & symptoms instantly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const onCallDoc = doctors.find((d) => d.isEmergencyAvailable) || doctors[0];
                    handleWhatsAppConsult({
                      ...onCallDoc,
                      phone: onCallDoc.whatsapp || '919876543210'
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition text-center shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <MessageSquare size={14} /> WhatsApp Triage
                </button>
              </div>

              {/* Featured On-Call Doctor */}
              {(() => {
                const onCallDoc = doctors.find((d) => d.isEmergencyAvailable) || doctors[0];
                if (!onCallDoc) return null;
                return (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Duty Emergency Surgeon
                      </span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                        Ready for Emergency Consult
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src={onCallDoc.avatar}
                        alt={onCallDoc.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {onCallDoc.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {onCallDoc.degrees}
                        </p>
                        <p className="text-[11px] text-[#1D3B2E] font-medium mt-0.5 truncate">
                          {onCallDoc.clinicName} • {onCallDoc.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmergencyModal(false);
                          handleOpenBooking(onCallDoc, '24/7 Video Tele-Consult');
                        }}
                        className="flex-1 py-2.5 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video size={14} /> Video Call Doctor (₹{onCallDoc.videoConsultFee})
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Filter All 24/7 Emergency Doctors in Directory */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setEmergencyOnly(true);
                    setSelectedConsultMode('emergency');
                    setTimeout(() => {
                      const el = document.getElementById('doctors-list') || document.getElementById('vet-directory-results');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                    toast.success('Filtered for 24/7 Emergency & ICU Ready veterinarians.');
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-stone-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertCircle size={14} className="text-[#1D3B2E]" />
                  View All 24/7 Emergency Doctors in Directory
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" /> VCI Verified Emergency Protocols
              </span>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 7. DOCTOR PROFILE DETAILS MODAL ================= */}
      {showDoctorModal && selectedDoctorForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl my-auto shadow-2xl border border-stone-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1D3B2E] to-[#2E5947] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctorForDetails.avatar}
                  alt={selectedDoctorForDetails.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      {selectedDoctorForDetails.name}
                    </h3>
                    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">
                      {selectedDoctorForDetails.experienceDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">
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
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Degree & Credentials</span>
                  <span className="font-semibold text-slate-800">{selectedDoctorForDetails.degrees}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">VCI Registration Number</span>
                  <span className="font-semibold text-emerald-800">{selectedDoctorForDetails.vciRegistration}</span>
                </div>
              </div>

              {/* Clinic Facilities */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                  Hospital & Diagnostic Facilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDoctorForDetails.facilities.map((fac, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50/60 rounded-lg text-emerald-950 font-medium">
                      <CheckCircle2 size={13} className="text-[#1D3B2E] shrink-0" />
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
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Video Call</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.videoConsultFee}</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">In-Clinic</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.inClinicFee}</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Home Visit</span>
                    <span className="font-bold text-slate-900 text-sm">₹{selectedDoctorForDetails.homeVisitFee}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-2 bg-stone-50">
              <button
                type="button"
                onClick={() => {
                  setShowDoctorModal(false);
                  handleOpenBooking(selectedDoctorForDetails);
                }}
                className="px-5 py-2.5 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
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
          <div className="relative bg-white text-slate-900 w-full max-w-lg my-auto shadow-2xl border border-stone-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1D3B2E] text-white px-5 py-4 flex items-center justify-between shrink-0">
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
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="block text-xs">{mode.label}</span>
                      <span className="block text-[11px] font-extrabold text-[#1D3B2E]">₹{mode.fee}</span>
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={bookingTimeSlot}
                    onChange={(e) => setBookingTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. Leo"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pet Species *
                  </label>
                  <select
                    value={petSpecies}
                    onChange={(e) => {
                      setPetSpecies(e.target.value);
                      setPetBreed('');
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  >
                    <option value="Dogs">Dog</option>
                    <option value="Cats">Cat</option>
                    <option value="Birds">Bird</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Breed
                  </label>
                  <PetBreedDropdown
                    petType={petSpecies}
                    value={petBreed}
                    onChange={setPetBreed}
                    placeholder="Select Breed"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E] text-xs font-medium text-slate-800"
                    allowedCategories={['dogs', 'cats', 'birds']}
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
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
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
