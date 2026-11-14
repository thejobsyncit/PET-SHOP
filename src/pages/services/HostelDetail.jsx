import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPin, Phone, MessageSquare, Star, ShieldCheck,
  Calendar, Clock, CircleCheck, ChevronRight, X,
  Check, ArrowRight, ArrowLeft, Heart, Hotel,
  Trees, Stethoscope, Video, UtensilsCrossed, Waves,
  Cctv, PawPrint, Sparkles, Share2, Info, Home,
  Award, AlertCircle, Compass, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resolveProviderWhatsApp } from '../../utils/whatsappHelper.js';
import RazorpayBookingPaymentModal from '../../components/widgets/RazorpayBookingPaymentModal.jsx';
import {
  getHostelProviderById,
  getStoredHostelProviders,
  saveHostelBooking,
  HOSTEL_OFFERINGS
} from '../../data/hostelData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../../components/ui/ServiceAccessLock.jsx';
import PetBreedDropdown from '../../components/ui/PetBreedDropdown.jsx';
import { handleServiceAction } from '../../components/widgets/ServicePackageAccessModal.jsx';

// Professional Vector Icon Renderer for Hostel Facilities
const renderOfferingIcon = (offeringId, { size = 20, className = '' } = {}) => {
  const stroke = 2.2;
  switch (offeringId) {
    case 'all':
      return <PawPrint size={size} strokeWidth={stroke} className={`text-amber-700 ${className}`} />;
    case 'ac-rooms':
      return <Hotel size={size} strokeWidth={stroke} className={`text-amber-800 ${className}`} />;
    case 'cctv':
      return <Cctv size={size} strokeWidth={stroke} className={`text-indigo-600 ${className}`} />;
    case 'lawn':
      return <Trees size={size} strokeWidth={stroke} className={`text-emerald-600 ${className}`} />;
    case 'vet-on-call':
      return <Stethoscope size={size} strokeWidth={stroke} className={`text-rose-600 ${className}`} />;
    case 'video-updates':
      return <Video size={size} strokeWidth={stroke} className={`text-purple-600 ${className}`} />;
    case 'home-cooked-meals':
      return <UtensilsCrossed size={size} strokeWidth={stroke} className={`text-amber-800 ${className}`} />;
    case 'swimming-pool':
      return <Waves size={size} strokeWidth={stroke} className={`text-teal-600 ${className}`} />;
    default:
      return <PawPrint size={size} strokeWidth={stroke} className={`text-amber-700 ${className}`} />;
  }
};

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isServicePathLockedForUser(user, '/hostel')) {
    return <ServiceAccessLock serviceName="Pet Hostel & Daycare" attemptedPath={`/hostel/${id}`} />;
  }

  // Load target provider
  const [provider, setProvider] = useState(() => getHostelProviderById(id));
  const [allProviders, setAllProviders] = useState(() => getStoredHostelProviders());

  useEffect(() => {
    window.scrollTo(0, 0);
    const p = getHostelProviderById(id);
    setProvider(p);
    setAllProviders(getStoredHostelProviders());
  }, [id]);

  // Dynamic check-in/out initial dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  // Booking & Reservation State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkInDate, setCheckInDate] = useState(tomorrowStr);
  const [checkOutDate, setCheckOutDate] = useState(dayAfterTomorrowStr);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('Adult (1-7 Years)');
  const [specialDiet, setSpecialDiet] = useState('Standard (Chicken & Rice)');
  const [ownerPhone, setOwnerPhone] = useState(user?.mobile || user?.phone || '');
  const [specialNotes, setSpecialNotes] = useState('');
  const [pendingPaymentBooking, setPendingPaymentBooking] = useState(null);

  // Set default package when provider loads
  useEffect(() => {
    if (provider?.packages && provider.packages.length > 0) {
      setSelectedPackage(provider.packages[0]);
    }
  }, [provider]);

  // Sync phone when user logs in
  useEffect(() => {
    if (user?.mobile || user?.phone) {
      setOwnerPhone(user.mobile || user.phone);
    }
  }, [user]);

  // Calculate nights
  const calculatedNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Fallback if not found
  if (!provider) {
    return (
      <div className="min-h-screen bg-[#faf8fc] text-slate-800 py-16 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-[#7c56dc] rounded-full flex items-center justify-center mx-auto">
            <Home size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">Hostel Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            We couldn't locate this pet hostel listing. It may have been archived or updated.
          </p>
          <div className="pt-2">
            <Link
              to="/hostel"
              className="btn-footer-green-gold font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Verified Hostels</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active pricing calculations
  const effectiveDailyRate = selectedPackage?.price || provider.discountPrice || provider.pricePerNight || 799;
  const originalDailyRate = provider.pricePerNight || effectiveDailyRate;
  const calculatedTotal = calculatedNights * effectiveDailyRate;
  const totalSavings = Math.max(0, (originalDailyRate - effectiveDailyRate) * calculatedNights);

  // Calculate other hostels for recommendations
  const otherProviders = (allProviders || [])
    .filter((p) => p.id !== provider.id)
    .slice(0, 3);

  // Open booking modal
  const handleOpenBookingModal = (pkg = null) => {
    if (pkg) setSelectedPackage(pkg);
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Hostel',
      provider,
      action: 'book',
      onAuthorized: () => {
        if (pkg) setSelectedPackage(pkg);
        setShowBookingModal(true);
      }
    });
  };

  // WhatsApp Connect
  const handleWhatsApp = () => {
    if (!isAuthenticated) {
      toast.error('Please register or log in first to contact verified hostels.', {
        icon: '🔒'
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'hostel' }
        })
      );
      return;
    }
    const provWhatsapp = resolveProviderWhatsApp(provider) || provider.phone;
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Pet Hostel & Boarding',
      provider: {
        ...provider,
        phone: provWhatsapp,
        whatsapp: provWhatsapp
      },
      action: 'whatsapp'
    });
  };

  // Share listing
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Hostel link copied to clipboard!', { icon: '📋' });
    } else {
      toast.success('URL ready to share: ' + window.location.href);
    }
  };

  // Direct Reservation Flow
  const handleDirectReservation = (e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in or sign up to reserve a staycation.', { icon: '🔒' });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true, source: 'hostel' }
        })
      );
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('Please select both check-in and check-out dates.');
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

    const cleanPhone = (ownerPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    const bookingId = 'HSTBK-' + Date.now().toString().slice(-6);
    const bookingData = {
      id: bookingId,
      _id: bookingId,
      serviceType: 'Pet Hostel / Boarding',
      serviceCategory: 'Pet Hostel / Boarding',
      providerId: provider.id,
      providerName: provider.name,
      hostName: provider.hostName,
      packageName: selectedPackage?.name || 'Standard Stay Room',
      kennelType: selectedPackage?.name || 'Standard Stay Room',
      dailyRate: effectiveDailyRate,
      nights: calculatedNights,
      totalAmount: calculatedTotal,
      totalPrice: calculatedTotal,
      fee: calculatedTotal,
      checkInDate,
      checkOutDate,
      date: checkInDate,
      timeSlot: `${calculatedNights} Night(s) Stay (${checkInDate} to ${checkOutDate})`,
      petName,
      petBreed,
      petAge,
      specialDiet,
      dietaryNotes: specialDiet || 'Standard wholesome meals',
      ownerName: user?.name || 'Pet Parent',
      ownerPhone: cleanPhone,
      ownerEmail: user?.email || '',
      userId: user?._id || user?.id || '',
      userEmail: user?.email || '',
      location: `${provider.area || ''}, ${provider.city || ''}`,
      specialNotes,
      status: 'pending_checkin',
      eta: 'Check-in ' + checkInDate,
      paymentStatus: 'Paid / Advance Guaranteed',
      avatarColor: 'bg-emerald-100 text-emerald-800',
      avatarLetter: (petName || 'P').charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    setShowBookingModal(false);
    setPendingPaymentBooking({
      ...bookingData,
      serviceName: `Pet Hostel (${selectedPackage?.name || 'Boarding Suite'})`,
      serviceCategory: 'Pet Hostel / Boarding',
      providerName: provider.name,
      price: calculatedTotal,
      date: checkInDate,
      timeSlot: `${calculatedNights} Night(s) Stay`,
      ownerName: user?.name || 'Pet Parent',
      ownerPhone: cleanPhone,
      ownerEmail: user?.email || '',
      petDetails: {
        name: petName,
        breed: petBreed,
        age: petAge
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-20">

      {/* =========================================================================
          1. TOP BREADCRUMB & BACK HEADER
         ========================================================================= */}
      <div className="bg-white border-b border-purple-100 shadow-2xs py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-primary transition">Pet Services</Link>
            <ChevronRight size={12} />
            <Link to="/hostel" className="hover:text-primary transition">Dog Hostel</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {provider.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Share Hostel Listing"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/hostel')}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Hostels</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN DETAIL GRID CONTAINER (7 Columns Left, 5 Columns Right)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ================= LEFT MAIN COLUMN (7 Columns) ================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* A. Hero Image Card with Overlay Details */}
            <div className="bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="bg-white/95 text-emerald-800 text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md">
                    {provider.stayType}
                  </span>
                  <span className="bg-[#1D3B2E]/90 text-amber-300 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border border-amber-300/40 shadow-md flex items-center gap-1">
                    <PawPrint size={13} />
                    <span>{provider.petTypes?.join(' & ') || 'Dogs & Cats'}</span>
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-white/95 text-emerald-800 text-[11px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified Safe Partner</span>
                </div>

                {/* Bottom Overlay Title & Location */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 space-y-1.5 text-white">
                  <h1 className="text-2xl sm:text-3xl font-black font-sans leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {provider.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-200 font-semibold flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    <MapPin size={14} className="text-amber-300 shrink-0" />
                    <span>{provider.area}, {provider.city}, {provider.state}</span>
                  </p>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="p-4 bg-gradient-to-r from-purple-50/50 via-white to-amber-50/50 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span>{provider.rating}</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    ({provider.reviews} verified guest reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-extrabold text-[11px] flex items-center gap-1">
                    <CircleCheck size={12} className="text-emerald-600" />
                    <span>100% Cage-Free Guaranteed</span>
                  </span>
                  <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 font-extrabold text-[11px]">
                    {provider.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* B. Host Caregiver Factsheet & Tagline */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#f8efcd] text-[#0F2E23] flex items-center justify-center font-black text-base border border-[#e6c968] shadow-xs">
                    {provider.hostName?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Host Partner: {provider.hostName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {provider.experience} of Loving Pet Hospitality & Boarding
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Aadhaar & Police KYC Verified</span>
                </span>
              </div>

              {/* Tagline Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50/60 border border-purple-100 text-slate-800 text-xs sm:text-sm font-medium italic leading-relaxed">
                "{provider.tagline}"
              </div>

              {/* Narrative description */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Welcome to <strong className="text-slate-900">{provider.name}</strong>, a premier pet sanctuary designed to deliver the ultimate staycation experience for your fur family. Located in {provider.area}, {provider.city}, our premises feature round-the-clock loving supervision, hygienic climate-controlled indoor suites, sanitized double-gated outdoor play grounds, and wholesome tailored meals.
                </p>
                <p>
                  Whether you are traveling for work, family holidays, or emergency commitments, rest assured that your pet enjoys gentle socialization, interactive agility workouts, regular potty breaks, and comforting personal cuddle sessions with certified pet lovers.
                </p>
              </div>
            </div>

            {/* C. All Facilities & Stay Amenities */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Comprehensive Amenities & Stay Facilities ({provider.amenities?.length || 0})</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Included in Boarding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(provider.amenities || []).map((amenity, idx) => {
                  const matchedOffering = HOSTEL_OFFERINGS.find((o) => o.name === amenity);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/80 hover:bg-purple-50/50 rounded-2xl border border-slate-200/70 transition flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                        {matchedOffering ? renderOfferingIcon(matchedOffering.id, { size: 15 }) : <Check size={13} className="text-emerald-600" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* D. Available Boarding Packages */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Available Stay Packages
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose the ideal suite tailored to your pet's energy and comfort requirements.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(provider.packages || []).map((pkg, idx) => {
                  const isCurrentSelected = selectedPackage?.name === pkg.name;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                        isCurrentSelected
                          ? 'border-[#7c56dc] bg-purple-50/40 ring-2 ring-purple-200/70 shadow-sm'
                          : 'border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white shadow-2xs hover:border-amber-400'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                          <span className="font-black text-slate-950 text-sm whitespace-nowrap bg-amber-100/90 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200">
                            ₹{pkg.price}/night
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {pkg.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <Check size={12} /> Meals & Updates Included
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPackage(pkg);
                            toast.success(`Selected ${pkg.name}!`, { icon: '🐾' });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 ${
                            isCurrentSelected
                              ? 'bg-purple-700 text-white'
                              : 'bg-[#0F2E23] hover:bg-[#163f30] text-[#D4AF37] hover:text-white'
                          }`}
                        >
                          {isCurrentSelected ? 'Selected Suite ✓' : 'Select Suite'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* E. Safety Charters & Boarding Rules */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Hostel Safety Charter & Guest Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                  <strong className="text-slate-900 block font-bold">Vaccination Mandatory</strong>
                  <p className="text-slate-500 leading-relaxed">DHPPiL, Rabies and Anti-Tick / Flea protection must be up-to-date before check-in.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                  <strong className="text-slate-900 block font-bold">Check-In & Check-Out</strong>
                  <p className="text-slate-500 leading-relaxed">Check-in from 10:00 AM onwards. Check-out up to 12:00 PM (noon) next day.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                  <strong className="text-slate-900 block font-bold">Personalized Diet</strong>
                  <p className="text-slate-500 leading-relaxed">Special prescription or therapeutic food can be brought along or prepared fresh on-site.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
                  <strong className="text-slate-900 block font-bold">Daily WhatsApp Updates</strong>
                  <p className="text-slate-500 leading-relaxed">Receive 2 HD videos and 4+ photos every day detailing meals, walks, and nap times.</p>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT ACTION & RESERVATION COLUMN (5 Columns) ================= */}
          <div className="lg:col-span-5 space-y-5">

            {/* 1. Main Interactive Reservation Card */}
            <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-lg space-y-5">

              {/* Pricing Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-extrabold text-slate-400 block">Nightly Boarding Fee</span>
                    <span className="text-xs text-slate-500 font-medium">Selected: <strong className="text-slate-800">{selectedPackage?.name || 'Standard Suite'}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-950 font-sans">
                      ₹{effectiveDailyRate}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold"> / night</span>
                  </div>
                </div>
                {totalSavings > 0 && (
                  <p className="text-[11px] text-emerald-600 font-bold text-right flex items-center justify-end gap-1">
                    <Sparkles size={12} />
                    <span>Save ₹{totalSavings} with direct reservation!</span>
                  </p>
                )}
              </div>

              {/* Quick Suite Package Selector */}
              {provider.packages && provider.packages.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Choose Suite Package:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {provider.packages.map((pkg, idx) => {
                      const isSel = selectedPackage?.name === pkg.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPackage(pkg)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#7c56dc] bg-purple-50 text-slate-900 ring-2 ring-purple-200'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="truncate">{pkg.name.split('(')[0]}</span>
                            <span className="text-purple-700 font-black">₹{pkg.price}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date Pickers (Check-In & Check-Out) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Calendar size={12} className="text-purple-600" />
                    <span>Check-In Date</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Calendar size={12} className="text-purple-600" />
                    <span>Check-Out Date</span>
                  </label>
                  <input
                    type="date"
                    min={checkInDate || tomorrowStr}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Pet Details Inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Pet Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bruno / Bella"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Breed</label>
                  <PetBreedDropdown
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="Select Breed"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              {/* Owner Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Owner Contact Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Cost Breakdown */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Stay Duration:</span>
                  <span className="font-bold text-slate-800">{calculatedNights} Night{calculatedNights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Rate:</span>
                  <span>₹{effectiveDailyRate} × {calculatedNights} night{calculatedNights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Playground & Meals:</span>
                  <span className="text-emerald-700 font-bold">Included (Free)</span>
                </div>
                <div className="pt-2 border-t border-purple-200/70 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Total Estimated Stay Fee:</span>
                  <span className="text-purple-900 text-base">₹{calculatedTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDirectReservation}
                  className="w-full btn-footer-green-gold font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Calendar size={16} />
                  <span>Book Staycation Now (₹{calculatedTotal})</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25d366] hover:bg-[#20ba59] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare size={16} />
                  <span>Connect on WhatsApp</span>
                </button>
              </div>

            </div>

            {/* 2. Verified Assurances Card */}
            <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-3 text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-600" />
                <span>Josh Pets Hub Verified Assurances</span>
              </span>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-start gap-2">
                  <CircleCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">100% Cage-Free & Round-the-Clock Supervision</span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">2x Daily HD WhatsApp Photo & Video Updates</span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">Wholesome Home-Cooked or Tailored Meals</span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">Emergency On-Call Veterinary Standby</span>
                </div>
                <div className="flex items-start gap-2">
                  <CircleCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">Aadhaar KYC & Verified Escape-Proof Premise</span>
                </div>
              </div>
            </div>

            {/* 3. Location & Timings Card */}
            <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-3 text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MapPin size={15} className="text-amber-600" />
                <span>Hostel Location & Operating Hours</span>
              </span>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{provider.name}</p>
                  <p className="text-slate-500 mt-0.5">{provider.area}, {provider.city}, {provider.state}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Check-In</span>
                    <strong className="text-slate-800">10:00 AM onwards</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Check-Out</span>
                    <strong className="text-slate-800">12:00 PM next day</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Phone size={12} />
                    <span>+91 {provider.phone}</span>
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name + ' ' + provider.area + ' ' + provider.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <Compass size={12} />
                    <span>View Map</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 4. Peace of Mind Guarantee Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-150 space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-black text-emerald-900">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Free Cancellation & Flexible Rescheduling</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Plans change? Enjoy hassle-free cancellation up to 24 hours prior to check-in with 100% refund.
              </p>
            </div>

          </div>

        </div>

        {/* =========================================================================
            3. OTHER VERIFIED HOSTELS & BOARDING HOMES
           ========================================================================= */}
        {otherProviders.length > 0 && (
          <div className="pt-8 border-t border-purple-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                  Other Verified Hostels & Boarding Resorts
                </h3>
                <p className="text-xs text-slate-500">
                  Explore top-rated boarding facilities and pet homestays in your region.
                </p>
              </div>
              <Link
                to="/hostel"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>View All Hostels</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherProviders.map((other) => (
                <div
                  key={other.id}
                  onClick={() => navigate(`/hostel/${other.id}`)}
                  className="bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                      <img
                        src={other.image}
                        alt={other.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      <div className="absolute top-3 left-3 bg-white/95 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {other.stayType}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="font-bold text-sm drop-shadow-sm">{other.name}</h4>
                        <p className="text-[11px] text-amber-200 drop-shadow-xs flex items-center gap-1">
                          <MapPin size={11} className="text-amber-300" />
                          <span>{other.area}, {other.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{other.rating}</span>
                        </div>
                        <span className="font-black text-slate-900">
                          ₹{other.discountPrice || other.pricePerNight} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">"{other.tagline}"</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <span>View Full Details</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          4. RAZORPAY CENTRAL PLATFORM PAYMENT MODAL
         ========================================================================= */}
      <RazorpayBookingPaymentModal
        isOpen={Boolean(pendingPaymentBooking)}
        onClose={() => setPendingPaymentBooking(null)}
        bookingData={pendingPaymentBooking}
        onSuccess={(confirmed) => {
          saveHostelBooking(confirmed);
          setPendingPaymentBooking(null);
          setPetName('');
          setPetBreed('');
          setSpecialNotes('');
          toast.success('Hostel reservation confirmed! View details in Service Bookings.', {
            icon: '🎉',
            duration: 4000
          });
          navigate('/account?tab=bookings');
        }}
      />

    </div>
  );
};

export default HostelDetail;
