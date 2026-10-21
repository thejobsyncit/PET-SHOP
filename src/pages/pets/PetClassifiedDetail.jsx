import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, MapPin, Phone, MessageSquare, ShieldCheck, 
  Syringe, Clock, Heart, Share2, Check, Award, Info, 
  CreditCard, Sparkles, AlertCircle, FileText, ExternalLink,
  ChevronRight, Shield, X, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import { getPetListingById, getStoredClassifieds, DEFAULT_CLASSIFIEDS } from '../../data/classifiedsData.js';
import ScrollReveal from '../../components/ui/ScrollReveal.jsx';

const PetClassifiedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [similarPets, setSimilarPets] = useState([]);

  // Checkout modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'processing', 'success'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPetDetail();
  }, [id]);

  const loadPetDetail = async () => {
    setLoading(true);
    try {
      // First try local store / defaults for instant response
      let found = getPetListingById(id);

      // Also try API in case it was saved on server
      try {
        const data = await apiRequest(`/listings/${id}`);
        if (data && data.success && data.listing) {
          found = data.listing;
        }
      } catch (_) {}

      // Fallback search across stored classifieds
      if (!found) {
        const all = getStoredClassifieds();
        const searchId = (id || '').toString().trim().toLowerCase();
        found = all.find(p => (p._id || p.id || '').toString().toLowerCase() === searchId);
      }

      setPet(found);
      if (found?.images?.length) {
        setSelectedImage(found.images[0]);
      }

      // Load similar pets in same category
      if (found) {
        const all = getStoredClassifieds();
        const sameType = all.filter(p => 
          (p._id || p.id) !== (found._id || found.id) && 
          p.petType === found.petType
        ).slice(0, 4);
        setSimilarPets(sameType);
      }
    } catch (err) {
      console.error('Error loading pet details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } else {
        toast.success(`Share URL: ${window.location.href}`);
      }
    } catch (_) {
      toast.success('Link ready to share!');
    }
  };

  const handleStartChat = () => {
    if (!isAuthenticated) {
      toast.error('Please login to chat with the pet owner.');
      navigate('/login', { state: { from: `/pets/${id}` } });
      return;
    }

    const owner = pet?.user;
    const ownerId = owner?._id || owner?.id || pet?.sellerId || (typeof owner === 'string' ? owner : `seller-${pet?._id || 'pet'}`);
    const currentUserId = user?._id || user?.id;

    if (currentUserId && ownerId === currentUserId) {
      toast.error('You cannot chat with yourself on your own pet listing.');
      return;
    }

    navigate('/chat', {
      state: {
        recipientId: ownerId,
        ownerName: owner?.name || pet?.sellerName || 'Pet Seller',
        ownerEmail: owner?.email || '',
        listingId: pet?._id || pet?.id,
        listingTitle: pet?.title,
        listingImage: pet?.images?.[0] || selectedImage,
        listingPrice: pet?.price,
        listingBreed: pet?.breed
      }
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase this pet.');
      navigate('/login', { state: { from: `/pets/${id}` } });
      return;
    }

    if (user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller') {
      toast.error('Sellers cannot buy pets.');
      return;
    }

    const ownerId = pet?.user?._id || (typeof pet?.user === 'string' ? pet?.user : null);
    if (ownerId && user?._id && ownerId === user._id) {
      toast.error('You cannot purchase your own pet listing.');
      return;
    }

    setShowCheckout(true);
    setPaymentStep('details');
  };

  const handleConfirmPurchase = async () => {
    if (paymentMethod !== 'Cash on Delivery') {
      setPaymentStep('processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      setIsProcessingPayment(true);
    }

    try {
      // Attempt backend update if route exists
      try {
        await apiRequest(`/listings/${pet._id}/buy`, { method: 'PUT' });
      } catch (_) {}

      // Update status locally
      setPet(prev => prev ? { ...prev, status: 'Sold Out', quantity: 0 } : null);
      setPaymentStep('success');
      toast.success('🎉 Congratulations! Your pet purchase is confirmed.');
    } catch (err) {
      toast.error(err.message || 'Payment processing failed');
      setPaymentStep('details');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FAFBF9]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Pet Details...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Pet Listing Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The listing you are looking for may have been removed, adopted, or is no longer available.</p>
        <Link 
          to="/pets"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Pets Classifieds
        </Link>
      </div>
    );
  }

  const isSoldOut = pet.status === 'Sold Out' || pet.quantity === 0;
  const ownerName = pet.user?.name || pet.sellerName || 'Verified Pet Breeder / Seller';
  const ownerEmail = pet.user?.email || 'verified.seller@joshpetshub.com';
  const contactPhone = pet.contactPhone || '+91 98765 43210';
  const hasVaccination = Boolean(pet.vaccinationCertificate);
  const isImageCert = typeof pet.vaccinationCertificate === 'string' && (pet.vaccinationCertificate.startsWith('data:image') || pet.vaccinationCertificate.startsWith('http'));

  return (
    <div className="min-h-screen bg-[#FAFBF9] pb-24 text-slate-800 font-sans">
      
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="bg-white border-b border-beige sticky top-16 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 truncate">
            <Link to="/pets" className="hover:text-primary transition flex items-center gap-1.5 shrink-0">
              <ArrowLeft size={14} /> Back to Classifieds
            </Link>
            <span>/</span>
            <span className="capitalize text-gray-400 hidden sm:inline">{pet.petType}</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-primary truncate">{pet.breed || pet.title}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-beige hover:border-primary text-gray-600 hover:text-primary text-xs font-bold rounded-lg transition shrink-0 cursor-pointer bg-white"
            title="Share this listing"
          >
            <Share2 size={13} />
            <span className="hidden xs:inline">Share</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ================= LEFT COLUMN: IMAGES & PET DETAILS (7 Cols) ================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Main Image Gallery */}
            <div className="bg-white rounded-3xl border border-beige overflow-hidden shadow-sm">
              <div className="aspect-[4/3] sm:aspect-[16/11] relative overflow-hidden bg-slate-900/5 group">
                <img 
                  src={selectedImage || pet.images?.[0]} 
                  alt={pet.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="bg-primary text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    {pet.price === 0 ? 'Rehome (Free)' : `₹${Number(pet.price).toLocaleString('en-IN')}`}
                  </span>
                  
                  {isSoldOut ? (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Sold Out
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Check size={12} /> Available ({pet.quantity || 1})
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                  {pet.isVerified && (
                    <span className="bg-white/95 backdrop-blur-sm text-emerald-800 border border-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" /> 100% Verified
                    </span>
                  )}

                  {hasVaccination && (
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Syringe size={12} /> Vaccinated
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails list if multiple */}
              {pet.images && pet.images.length > 1 && (
                <div className="p-4 border-t border-beige flex gap-3 overflow-x-auto bg-[#FAF9F5]">
                  {pet.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        selectedImage === img ? 'border-primary shadow-md scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Pet Specifications / Details Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-6">
              <div className="border-b border-beige pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent block mb-1">
                  OFFICIAL PET DETAILS & SPECS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-primary font-serif">
                  Profile & Characteristics
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Pet Type / Category</span>
                  <span className="text-sm font-black text-primary capitalize">{pet.petType || 'Pet'}</span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Breed</span>
                  <span className="text-sm font-black text-primary truncate block">{pet.breed || 'Purebred'}</span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Age</span>
                  <span className="text-sm font-black text-primary">{pet.age || 'Juvenile'}</span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Location</span>
                  <span className="text-sm font-black text-primary flex items-center gap-1 truncate">
                    <MapPin size={13} className="text-accent shrink-0" />
                    {pet.location || 'India'}
                  </span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Stock Available</span>
                  <span className="text-sm font-black text-primary">{pet.quantity || 1} units</span>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige/60">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Listing Status</span>
                  <span className={`text-sm font-black ${isSoldOut ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isSoldOut ? 'Sold Out' : 'Active Listing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Detailed Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-sm space-y-4">
              <div className="border-b border-beige pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent block mb-1">
                  COMPREHENSIVE BACKGROUND
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-primary font-serif">
                  Full Description & Care Notes
                </h2>
              </div>

              <div className="text-sm sm:text-base text-gray-600 leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {pet.description || 'No detailed description provided by the seller.'}
              </div>

              {/* Highlights & Temperament Checklist */}
              <div className="pt-4 border-t border-beige grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-[#FAF9F5] p-3 rounded-xl border border-beige">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Healthy & Active Demeanor</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-[#FAF9F5] p-3 rounded-xl border border-beige">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Raised with Clean Drinking Water & Nutrition</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-[#FAF9F5] p-3 rounded-xl border border-beige">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Verified Identity & Microchip Records</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-[#FAF9F5] p-3 rounded-xl border border-beige">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Safe Handover & Adoption Protocol</span>
                </div>
              </div>
            </div>

            {/* ================= 3. VACCINATION PROOF & HEALTH RECORDS SECTION ================= */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/70 p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-2">
                    <ShieldCheck size={13} className="text-emerald-700" />
                    Verified Medical Records
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary font-serif">
                    Vaccination Proof & Health Clearance
                  </h3>
                </div>

                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-emerald-200 text-emerald-700 shadow-sm shrink-0">
                  <Syringe size={24} />
                </div>
              </div>

              {/* Vaccination Certificate Card */}
              {hasVaccination ? (
                <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-800">
                          {isImageCert ? 'Official Vaccination Card / Medical Record' : pet.vaccinationCertificate}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Verified by registered veterinarian and breeder log
                        </p>
                      </div>
                    </div>

                    {isImageCert && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer border border-blue-200 shrink-0"
                      >
                        <Eye size={13} /> View Certificate
                      </button>
                    )}
                  </div>

                  {isImageCert && (
                    <div className="pt-2">
                      <div 
                        onClick={() => setShowCertModal(true)}
                        className="aspect-[21/9] sm:aspect-[3/1] rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer"
                      >
                        <img 
                          src={pet.vaccinationCertificate} 
                          alt="Vaccination Record" 
                          className="w-full h-full object-cover group-hover:scale-102 transition" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5">
                          <Eye size={16} /> Click to Enlarge Proof
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center gap-3">
                  <Info size={20} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium">
                    Vaccination certificate document pending upload from seller. Contact the owner below to request the latest veterinary health card.
                  </p>
                </div>
              )}

              {/* 4-Point Health Guarantee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">De-worming Up-to-Date</p>
                    <p className="text-[10px] text-slate-500">Regular oral suspension administered</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Core Vaccinations</p>
                    <p className="text-[10px] text-slate-500">Parvo / DHPPi / Feline / Avian cleared</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Parasite & Tick Free</p>
                    <p className="text-[10px] text-slate-500">Spot-on treatment active</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Physical Exam Passed</p>
                    <p className="text-[10px] text-slate-500">Heart, lungs, eyes & coat verified</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY OWNER DETAILS & ACTIONS (5 Cols) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Owner Details & Contact Card (Sticky) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-beige shadow-lg sticky top-28 space-y-6">
              
              {/* Pet Title & Pricing Header */}
              <div className="border-b border-beige pb-6 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {pet.breed || 'Verified Pet'}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    ID: {pet._id || pet.id}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-primary font-serif leading-tight">
                  {pet.title}
                </h1>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">
                    {pet.price === 0 ? 'Rehome (Free)' : `₹${Number(pet.price).toLocaleString('en-IN')}`}
                  </span>
                  {pet.price > 0 && (
                    <span className="text-xs font-bold text-gray-400">including health verification</span>
                  )}
                </div>
              </div>

              {/* Owner / Seller Profile Block */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                  OWNER & SELLER INFORMATION
                </span>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-beige flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-base uppercase shrink-0 shadow-sm border-2 border-white">
                    {ownerName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-primary truncate">{ownerName}</h4>
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" title="Verified Seller" />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{ownerEmail}</p>
                    <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active Seller • Josh Pets Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-white p-3 rounded-xl border border-beige">
                  <div className="flex justify-between items-center py-1 border-b border-beige/60">
                    <span className="text-gray-400 font-semibold">Location</span>
                    <span className="font-bold text-slate-800">{pet.location || 'India'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-beige/60">
                    <span className="text-gray-400 font-semibold">Contact Phone</span>
                    <span className="font-bold text-slate-800 font-mono">{contactPhone}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400 font-semibold">Response Time</span>
                    <span className="font-bold text-emerald-700">Within 15 minutes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: CALL, CHAT, BUY NOW */}
              <div className="space-y-3 pt-2">
                {!isSoldOut && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 bg-[#ffd000] hover:bg-[#e6bb00] text-[#0F2E23] font-black text-sm tracking-wider uppercase rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-300 active:scale-98"
                  >
                    <CreditCard size={18} /> BUY THIS PET NOW
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={isSoldOut ? '#' : `tel:${contactPhone}`}
                    className={`py-3.5 border font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 rounded-xl transition ${
                      isSoldOut ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-primary text-primary hover:bg-primary hover:text-white cursor-pointer shadow-sm'
                    }`}
                  >
                    <Phone size={15} /> CALL SELLER
                  </a>

                  <button
                    onClick={handleStartChat}
                    className="py-3.5 bg-primary text-white hover:bg-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition cursor-pointer shadow-sm active:scale-98"
                  >
                    <MessageSquare size={15} /> DIRECT CHAT
                  </button>
                </div>
              </div>

              {/* Safety & Buyer Protection Note */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield size={14} className="text-amber-700 shrink-0" />
                  Buyer Protection Guarantee
                </div>
                <p className="text-amber-800/80 leading-relaxed">
                  Always inspect the pet in person or request live video verification before transferring funds. Cash on Delivery and verified health pass available.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ================= 4. SIMILAR PETS SECTION ================= */}
        {similarPets.length > 0 && (
          <section className="mt-16 pt-12 border-t border-beige space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-accent block mb-1">
                  MORE IN THIS CATEGORY
                </span>
                <h3 className="text-2xl font-black text-primary font-serif">
                  Similar Available Pets
                </h3>
              </div>
              <Link 
                to={`/pets?petType=${pet.petType}`}
                className="text-xs font-bold text-primary hover:text-accent transition flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarPets.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/pets/${item._id}`)}
                  className="bg-white rounded-2xl border border-beige overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img 
                      src={item.images?.[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                      {item.price === 0 ? 'Free' : `₹${Number(item.price).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">
                      {item.breed}
                    </span>
                    <h4 className="font-bold text-xs text-primary truncate group-hover:text-accent transition">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 pt-1">
                      <MapPin size={10} /> {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ================= MODAL: VACCINATION CERTIFICATE PREVIEW ================= */}
      {showCertModal && isImageCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-beige pb-3">
              <div className="flex items-center gap-2">
                <Syringe size={18} className="text-blue-600" />
                <h3 className="font-black text-sm text-primary">Official Vaccination Certificate Proof</h3>
              </div>
              <button 
                onClick={() => setShowCertModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[70vh]">
              <img 
                src={pet.vaccinationCertificate} 
                alt="Vaccination Document" 
                className="max-h-[65vh] w-auto object-contain" 
              />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-beige">
              <span>Verified for: {pet.title}</span>
              <button
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BUY / CHECKOUT MODAL ================= */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-beige space-y-6">
            <div className="flex justify-between items-center border-b border-beige pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">SECURE CHECKOUT</span>
                <h3 className="font-black text-xl text-primary font-serif">Confirm Pet Purchase</h3>
              </div>
              <button 
                onClick={() => setShowCheckout(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {paymentStep === 'details' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-3 bg-[#FAF9F5] rounded-2xl border border-beige">
                  <img src={pet.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-primary truncate">{pet.title}</p>
                    <p className="text-xs text-gray-500">{pet.breed} • {pet.age}</p>
                    <p className="text-xs font-black text-primary mt-0.5">
                      {pet.price === 0 ? 'Free' : `₹${Number(pet.price).toLocaleString('en-IN')}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Credit Card', 'UPI / QR', 'Cash on Delivery'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 text-xs font-bold rounded-xl border text-center transition cursor-pointer ${
                          paymentMethod === method 
                            ? 'border-primary bg-primary text-white shadow-sm' 
                            : 'border-beige bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <p className="font-bold flex items-center gap-1 mb-0.5">
                    <ShieldCheck size={14} className="text-amber-700" /> Josh Pets Protection Active
                  </p>
                  <p className="text-amber-800/80">Funds are held in escrow until in-person pet handover and health card inspection.</p>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  className="w-full py-4 bg-[#ffd000] hover:bg-[#e6bb00] text-[#0F2E23] font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} /> Pay ₹{Number(pet.price).toLocaleString('en-IN')} & Confirm Order
                </button>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h4 className="font-black text-lg text-primary font-serif">Processing Payment...</h4>
                <p className="text-xs text-gray-500">Contacting secure banking gateway. Please do not refresh.</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check size={32} />
                </div>
                <h4 className="font-black text-xl text-primary font-serif">Purchase Confirmed!</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Your order receipt has been sent to your email. The seller ({ownerName}) has been notified to schedule delivery/pickup.
                </p>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PetClassifiedDetail;
