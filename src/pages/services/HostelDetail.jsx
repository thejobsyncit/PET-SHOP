import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPin, Phone, MessageSquare, Star, ShieldCheck,
  Calendar, Clock, CircleCheck, ChevronRight, X,
  Check, ArrowRight, ArrowLeft, Heart, Hotel,
  Trees, Stethoscope, Video, UtensilsCrossed, Waves,
  Cctv, PawPrint, Sparkles, Share2, Info, Home,
  Award, AlertCircle
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
import ScrollReveal from '../../components/ui/ScrollReveal.jsx';
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

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
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
    const cleanPhone = ownerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    const diffTime = Math.abs(new Date(checkOutDate) - new Date(checkInDate));
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyRate = selectedPackage?.price || provider.discountPrice || provider.pricePerNight;
    const totalAmount = nights * dailyRate;

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
      dailyRate,
      nights,
      totalAmount,
      totalPrice: totalAmount,
      fee: totalAmount,
      checkInDate,
      checkOutDate,
      date: checkInDate,
      timeSlot: `${nights} Night(s) Stay`,
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
      price: bookingData.totalAmount || bookingData.totalPrice || 2500,
      date: checkInDate,
      timeSlot: `${nights} Night(s) Stay`,
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

  const effectivePrice = provider.discountPrice || provider.pricePerNight;

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">

      {/* =========================================================================
          1. TOP BREADCRUMB & BACK HEADER
         ========================================================================= */}
      <div className="bg-white border-b border-purple-100 shadow-2xs py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-primary transition">Pet Services</Link>
            <ChevronRight size={12} />
            <Link to="/hostel" className="hover:text-primary transition">Dog Hostel</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-900 truncate max-w-[160px] sm:max-w-none">
              {provider.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
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
          2. MAIN DETAIL GRID CONTAINER
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================= LEFT MAIN COLUMN (8 Columns) ================= */}
          <div className="lg:col-span-8 space-y-6">

            {/* A. Hero Image Card with Overlay Details */}
            <div className="bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-md">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/9] overflow-hidden bg-slate-950">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="bg-white/95 text-emerald-800 text-xs font-black px-3 py-1 rounded-full shadow-md">
                    {provider.stayType}
                  </span>
                  <span className="bg-[#1D3B2E]/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-300/40 shadow-md flex items-center gap-1">
                    <PawPrint size={13} />
                    <span>{provider.petTypes?.join(' & ') || 'Dogs & Cats'}</span>
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-white/95 text-emerald-800 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
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
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/50 via-white to-amber-50/50 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
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
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#f8efcd] text-[#0F2E23] flex items-center justify-center font-black text-base border border-[#e6c968] shadow-xs">
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
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50/60 border border-purple-100 text-slate-800 text-xs sm:text-sm font-medium italic leading-relaxed">
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
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>Comprehensive Amenities & Stay Facilities ({provider.amenities?.length || 0})</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Included in Boarding
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(provider.amenities || []).map((amenity, idx) => {
                  const matchedOffering = HOSTEL_OFFERINGS.find((o) => o.name === amenity);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50/80 hover:bg-purple-50/50 rounded-2xl border border-slate-200/70 transition flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                        {matchedOffering ? renderOfferingIcon(matchedOffering.id, { size: 16 }) : <Check size={14} className="text-emerald-600" />}
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
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(provider.packages || []).map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/30 to-white shadow-xs space-y-3 flex flex-col justify-between hover:border-amber-400 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                        <span className="font-black text-slate-950 text-sm whitespace-nowrap bg-amber-100/80 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200">
                          ₹{pkg.price}/night
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pkg.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <Check size={12} /> Meals & Updates Included
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(pkg)}
                        className="px-3.5 py-1.5 bg-[#0F2E23] hover:bg-[#163f30] text-[#D4AF37] hover:text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Reserve Suite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E. Safety Charters & Boarding Rules */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Hostel Safety Charter & Guest Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Vaccination Mandatory</strong>
                  <p className="text-slate-500">DHPPiL, Rabies and Anti-Tick / Flea protection must be up-to-date before check-in.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Check-In & Check-Out</strong>
                  <p className="text-slate-500">Check-in from 10:00 AM onwards. Check-out up to 12:00 PM (noon) next day.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Personalized Diet</strong>
                  <p className="text-slate-500">Special prescription or therapeutic food can be brought along or prepared fresh on-site.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <strong className="text-slate-900 block font-bold">Daily WhatsApp Updates</strong>
                  <p className="text-slate-500">Receive 2 HD videos and 4+ photos every day detailing meals, walks, and nap times.</p>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT STICKY ACTION COLUMN (4 Columns) ================= */}
          <div className="lg:col-span-4 space-y-6">

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-xl space-y-5 relative lg:sticky lg:top-24">

              {/* Pricing Header */}
              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase font-extrabold text-slate-400">Nightly Boarding Fee</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-950 font-sans">
                      ₹{effectivePrice}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold"> / night</span>
                  </div>
                </div>
                {provider.discountPrice && provider.pricePerNight > provider.discountPrice && (
                  <p className="text-[11px] text-emerald-600 font-bold text-right">
                    Save ₹{provider.pricePerNight - provider.discountPrice} with online reservation!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenBookingModal()}
                  className="w-full btn-footer-green-gold font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Calendar size={16} />
                  <span>Book Staycation Now</span>
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

              {/* Verified Checklist */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Josh Pets Hub Verified Assurances:
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium">100% Cage-Free & Round-the-Clock Supervision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium">2x Daily HD WhatsApp Photo & Video Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium">Wholesome Home-Cooked or Tailored Meals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium">Emergency On-Call Veterinary Standby</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-medium">Aadhaar KYC & Verified Escape-Proof Premise</span>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Hostel Address</span>
                <p className="font-bold text-slate-800">{provider.name}</p>
                <p className="text-slate-500">{provider.area}, {provider.city}, {provider.state}</p>
                <p className="text-[11px] text-emerald-700 font-semibold pt-1">
                  📞 Verified Phone: +91 {provider.phone}
                </p>
              </div>

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
                        <h4 className="font-bold text-sm leading-tight text-white drop-shadow">
                          {other.name}
                        </h4>
                        <p className="text-[11px] text-amber-200 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-amber-300" />
                          <span>{other.area}, {other.city}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{other.rating}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900">₹{other.discountPrice || other.pricePerNight}</span>
                          <span className="text-[10px] text-slate-400">/night</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic line-clamp-1">
                        "{other.tagline}"
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hostel/${other.id}`);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-[#0F2E23] text-slate-800 hover:text-[#D4AF37] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
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
          4. STAY BOOKING MODAL
         ========================================================================= */}
      {showBookingModal && provider && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-transparent"
            onClick={() => setShowBookingModal(false)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-lg overflow-hidden z-10 my-auto max-h-[85vh] sm:max-h-[88vh] flex flex-col min-h-0">

            {/* Modal Header */}
            <div className="bg-[#FAC52E] p-5 text-slate-950 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/10 px-2 py-0.5 rounded">
                  Reserve Hostel Staycation
                </span>
                <h3 className="font-extrabold text-lg mt-0.5">{provider.name}</h3>
                <p className="text-[11px] text-slate-900/80 font-medium">
                  {provider.area}, {provider.city} ({provider.stayType})
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

              {/* Room & Package Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">Choose Room Type / Package</label>
                <div className="space-y-2">
                  {(provider?.packages || []).map((pkg, idx) => (
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
                          name="hostel-package"
                          checked={selectedPackage?.name === pkg.name}
                          onChange={() => setSelectedPackage(pkg)}
                          className="mt-1 text-[#7c56dc] focus:ring-[#7c56dc]"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{pkg.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{pkg.desc}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 whitespace-nowrap pl-2">
                        ₹{pkg.price}/night
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dates: Check-In & Check-Out */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Check-In Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Check-Out Date *</label>
                  <input
                    type="date"
                    required
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
              </div>

              {/* Pet Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7c56dc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Pet Breed *</label>
                  <PetBreedDropdown
                    petType="Dogs"
                    value={petBreed}
                    onChange={setPetBreed}
                    required
                    placeholder="Select Pet Breed *"
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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">Your Contact Phone *</label>
                  <span className="text-[10px] text-gray-400 font-medium">{ownerPhone.length}/10 digits</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={ownerPhone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setOwnerPhone(clean);
                  }}
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
                  className="w-full btn-footer-green-gold font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CircleCheck size={15} />
                  <span>Confirm Stay Reservation</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* RAZORPAY CENTRAL PLATFORM PAYMENT MODAL */}
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
          toast.success('Hostel reservation confirmed! View in My Bookings.', { icon: '🎉' });
        }}
      />

    </div>
  );
};

export default HostelDetail;
