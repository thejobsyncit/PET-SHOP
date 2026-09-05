import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Calendar, MapPin, Phone, ShieldCheck, Star, Clock, 
  DollarSign, CheckCircle, AlertCircle, Plus, Search, ChevronRight, 
  Send, X, Edit3, Trash2, ExternalLink, SlidersHorizontal, 
  Sparkles, FileText, Check, MessageSquare, Info, Shield, 
  Navigation, Eye, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getStoredTransportProviders,
  getProviderTransportService,
  saveOrUpdateTransportService,
  deleteProviderTransportService,
  getStoredTransportBookings,
  saveTransportBooking,
  updateTransportBookingStatus,
  getStoredTransportVehicles,
  saveStoredTransportVehicles,
  getStoredTransportEnquiries,
  updateTransportEnquiryStatus,
  getStoredTransportReviews,
  saveStoredTransportReviews
} from '../data/transportData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

// Preset vehicle images for easy selection when posting transport service
const PRESET_TRANSPORT_IMAGES = [
  { label: 'AC Pet Van & Cruiser', url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800' },
  { label: 'Happy Golden on Journey', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800' },
  { label: 'Express Road Carrier', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800' },
  { label: 'Cozy Seat Pet Cab', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' },
  { label: 'IATA Aviation Crates', url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800' }
];

const TransportProviderContent = ({ activeTab, user }) => {
  const navigate = useNavigate();

  // 1. PROVIDER SERVICE STATE (STRICT 1 SERVICE PER PROVIDER)
  const [myService, setMyService] = useState(() => getProviderTransportService(user?._id || user?.id || user?.email));
  const [isEditingService, setIsEditingService] = useState(false);

  // Form State for Posting/Editing Service
  const [serviceForm, setServiceForm] = useState({
    name: user?.businessName || user?.name || 'SafePet Transit',
    tagline: 'Dedicated AC Pet Transport & Doorstep Relocation Across India',
    leadCoordinator: user?.name || 'Lead Coordinator',
    phone: user?.mobile || '+91 98452 23344',
    whatsapp: user?.mobile || '+91 98452 23344',
    email: user?.email || 'safepet@pawora.com',
    state: user?.location?.split(',')[1]?.trim() || 'Karnataka',
    city: user?.location?.split(',')[0]?.trim() || 'Bangalore',
    area: 'Airport Hub & Greater City Corridors',
    coverage: 'Pan-India & State Corridors',
    basePrice: 1299,
    pricePerKm: 26,
    interstateMin: 7200,
    modes: ['Road Transport', 'Air Transport'],
    petTypes: ['Dogs', 'Cats', 'Birds', 'Small Animals'],
    corridors: 'Bangalore ⇄ Chennai, Bangalore ⇄ Hyderabad, Pan-India Air Cargo',
    vehicleTypes: 'AC Pet Cruiser Van, Innova Crysta AC Pet Cab',
    amenities: '100% Climate Controlled AC, Live GPS Tracking, Sanitized Kennels, Hydration Stops Every 3 Hrs, Vet Onboard Available',
    image: PRESET_TRANSPORT_IMAGES[0].url,
    iataCertified: true
  });

  // Sync service from storage on mount and events
  const refreshService = () => {
    const found = getProviderTransportService(user?._id || user?.id || user?.email);
    setMyService(found);
    if (found) {
      setServiceForm({
        name: found.name || user?.businessName || user?.name || '',
        tagline: found.tagline || '',
        leadCoordinator: found.leadCoordinator || user?.name || '',
        phone: found.phone || user?.mobile || '',
        whatsapp: found.whatsapp || found.phone || '',
        email: found.email || user?.email || '',
        state: found.state || 'Karnataka',
        city: found.city || 'Bangalore',
        area: found.area || '',
        coverage: found.coverage || 'Pan-India & State Corridors',
        basePrice: found.basePrice || 1299,
        pricePerKm: found.pricePerKm || 26,
        interstateMin: found.interstateMin || 7200,
        modes: found.modes || ['Road Transport'],
        petTypes: found.petTypes || ['Dogs', 'Cats'],
        corridors: Array.isArray(found.corridors) ? found.corridors.join(', ') : found.corridors,
        vehicleTypes: Array.isArray(found.vehicleTypes) ? found.vehicleTypes.join(', ') : found.vehicleTypes,
        amenities: Array.isArray(found.amenities) ? found.amenities.join(', ') : found.amenities,
        image: found.image || PRESET_TRANSPORT_IMAGES[0].url,
        iataCertified: !!found.iataCertified
      });
    }
  };

  useEffect(() => {
    refreshService();
    window.addEventListener('transport-providers-updated', refreshService);
    return () => window.removeEventListener('transport-providers-updated', refreshService);
  }, [user]);

  // Handle Publish/Update Service
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      toast.error('Please enter your service/business name');
      return;
    }
    if (!serviceForm.phone.trim()) {
      toast.error('Please enter a coordinator contact number');
      return;
    }

    const payload = {
      ...serviceForm,
      id: myService?.id,
      corridors: serviceForm.corridors.split(',').map(c => c.trim()).filter(Boolean),
      vehicleTypes: serviceForm.vehicleTypes.split(',').map(v => v.trim()).filter(Boolean),
      amenities: serviceForm.amenities.split(',').map(a => a.trim()).filter(Boolean)
    };

    const saved = saveOrUpdateTransportService(payload, user);
    if (saved) {
      setMyService(saved);
      setIsEditingService(false);
      toast.success(
        myService 
          ? 'Transport service updated successfully!' 
          : '🎉 Transport service published! It is now live on the public Pet Transport page.',
        { duration: 4500 }
      );
    } else {
      toast.error('Could not save service listing. Please try again.');
    }
  };

  // 2. BOOKINGS STATE & MODALS
  const [bookings, setBookings] = useState(() => getStoredTransportBookings());
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    petName: '',
    petSpecies: 'Dog',
    petBreed: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    originCity: 'Bangalore',
    destCity: 'Chennai',
    travelDate: new Date().toISOString().split('T')[0],
    mode: 'Road Transport',
    vehicleType: 'Innova Crysta AC Pet Cab',
    distanceKm: 350,
    totalAmount: 9800,
    notes: 'Doorstep pickup in sanitized carrier'
  });

  const refreshBookings = () => setBookings(getStoredTransportBookings());

  useEffect(() => {
    window.addEventListener('transport-booking-created', refreshBookings);
    window.addEventListener('transport-booking-updated', refreshBookings);
    return () => {
      window.removeEventListener('transport-booking-created', refreshBookings);
      window.removeEventListener('transport-booking-updated', refreshBookings);
    };
  }, []);

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const updated = updateTransportBookingStatus(bookingId, newStatus);
    if (updated) {
      toast.success(`Booking ${bookingId} updated to "${newStatus}"`);
      refreshBookings();
    }
  };

  const handleCreateManualBooking = (e) => {
    e.preventDefault();
    if (!newBookingForm.petName.trim() || !newBookingForm.customerName.trim() || !newBookingForm.customerPhone.trim()) {
      toast.error('Please provide pet name, customer name, and contact phone.');
      return;
    }
    const created = saveTransportBooking({
      ...newBookingForm,
      distanceKm: Number(newBookingForm.distanceKm) || 100,
      totalAmount: Number(newBookingForm.totalAmount) || 2500
    });
    if (created) {
      toast.success('Manual booking added to your schedule!');
      setShowNewBookingModal(false);
      refreshBookings();
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = bookingFilter === 'All' || b.status?.toLowerCase() === bookingFilter.toLowerCase();
      const matchSearch = !bookingSearch || 
        b.id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.petName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.originCity?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.destCity?.toLowerCase().includes(bookingSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [bookings, bookingFilter, bookingSearch]);

  // 3. VEHICLES & FLEET STATE
  const [vehicles, setVehicles] = useState(() => getStoredTransportVehicles());
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState({
    name: '',
    regNumber: '',
    type: 'Private AC Cab',
    capacity: '2 Large Dogs or 4 Cats',
    climateControl: '100% Dual AC (18°C - 24°C)',
    baseRate: 1299,
    kmRate: 26,
    status: 'Active'
  });

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicleForm.name.trim() || !newVehicleForm.regNumber.trim()) {
      toast.error('Please enter vehicle name and registration plate.');
      return;
    }
    const updated = [
      ...vehicles,
      {
        ...newVehicleForm,
        id: 'VEH-' + Math.floor(10 + Math.random() * 90),
        lastSanitized: 'Just Now'
      }
    ];
    setVehicles(updated);
    saveStoredTransportVehicles(updated);
    toast.success('Vehicle successfully added to your fleet!');
    setShowAddVehicleModal(false);
  };

  const handleDeleteVehicle = (vehicleId) => {
    const updated = vehicles.filter(v => v.id !== vehicleId);
    setVehicles(updated);
    saveStoredTransportVehicles(updated);
    toast.success('Vehicle removed from fleet.');
  };

  // 4. CLIENT INQUIRIES STATE
  const [inquiries, setInquiries] = useState(() => getStoredTransportEnquiries());
  const [selectedInquiryForQuote, setSelectedInquiryForQuote] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteReplyText, setQuoteReplyText] = useState('');

  const refreshInquiries = () => setInquiries(getStoredTransportEnquiries());

  useEffect(() => {
    window.addEventListener('transport-enquiry-created', refreshInquiries);
    window.addEventListener('transport-enquiry-updated', refreshInquiries);
    return () => {
      window.removeEventListener('transport-enquiry-created', refreshInquiries);
      window.removeEventListener('transport-enquiry-updated', refreshInquiries);
    };
  }, []);

  const handleSendQuote = (e) => {
    e.preventDefault();
    if (!quoteAmount || isNaN(quoteAmount)) {
      toast.error('Please enter a valid quote amount (₹)');
      return;
    }
    const updated = updateTransportEnquiryStatus(
      selectedInquiryForQuote.id, 
      'Quote Sent', 
      quoteReplyText || `Official quote of ₹${Number(quoteAmount).toLocaleString('en-IN')} sent with sanitized AC vehicle.`,
      Number(quoteAmount)
    );
    if (updated) {
      toast.success(`Quote of ₹${Number(quoteAmount).toLocaleString('en-IN')} sent to ${selectedInquiryForQuote.userName}!`);
      setSelectedInquiryForQuote(null);
      setQuoteAmount('');
      setQuoteReplyText('');
      refreshInquiries();
    }
  };

  // 5. REVIEWS STATE
  const [reviews, setReviews] = useState(() => getStoredTransportReviews());
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReviewReply = (reviewId) => {
    if (!replyText.trim()) return;
    const updated = reviews.map(r => r.id === reviewId ? { ...r, reply: replyText.trim() } : r);
    setReviews(updated);
    saveStoredTransportReviews(updated);
    toast.success('Reply posted to customer review!');
    setReplyingReviewId(null);
    setReplyText('');
  };

  // 6. WALLET & PAYOUTS STATE
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    bankName: 'HDFC Bank',
    accountNumber: '9845001239841',
    ifsc: 'HDFC0001234',
    amount: 14250
  });

  const handleRequestPayout = (e) => {
    e.preventDefault();
    toast.success(`Payout request of ₹${Number(payoutForm.amount).toLocaleString('en-IN')} submitted! Funds will reflect in your account within 24 hours.`);
    setShowPayoutModal(false);
  };

  // 7. AGENCY PROFILE STATE
  const [agencyProfile, setAgencyProfile] = useState({
    businessName: user?.businessName || user?.name || 'SafePet Transit Hub',
    coordinator: user?.name || 'Lead Coordinator',
    phone: user?.mobile || '+91 98452 23344',
    whatsapp: user?.mobile || '+91 98452 23344',
    email: user?.email || 'safepet@pawora.com',
    hubCity: 'Bangalore, Karnataka',
    address: 'Near International Airport Terminal Cargo Rd, Devanahalli, Bangalore - 562300',
    iataLicence: 'IATA-LAR-IND-2023-8842',
    operatingHours: '24 Hours (Emergency Transit & Scheduled Doorstep Drops)'
  });

  const handleSaveAgencyProfile = (e) => {
    e.preventDefault();
    toast.success('Agency details updated successfully!');
  };

  // ==========================================
  // RENDER PER ACTIVE TAB
  // ==========================================

  // TAB 1: MY TRANSPORT SERVICE (POST & MANAGE 1 SERVICE)
  if (activeTab === 'service') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-sans font-black text-[#0F2E23]">
                {myService && !isEditingService ? 'My Transport Service Listing' : 'Post Your Transport Service'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                1 Service Max
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Publish and manage your pet relocation listing visible to pet parents on the public Pet Transport directory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {myService && !isEditingService && (
              <>
                <button
                  onClick={() => setIsEditingService(true)}
                  className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Edit3 size={14} /> Edit Service Details
                </button>
                <button
                  onClick={() => navigate('/pet-transport')}
                  className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ExternalLink size={14} /> View Live on Public Page
                </button>
              </>
            )}
          </div>
        </div>

        {/* ACTIVE SERVICE PREVIEW (WHEN 1 SERVICE IS POSTED) */}
        {myService && !isEditingService ? (
          <div className="space-y-6">
            
            {/* Status Alert Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-emerald-950">Active & Published on Pet Transport Directory</h4>
                    <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your transport service is currently active. Pet parents can find, compare rates, and book relocations with you.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-black text-emerald-900 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Listing 1 of 1 (Limit Reached)
                </span>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Public Card Preview
                </span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Eye size={13} /> Visible on /pet-transport
                </span>
              </div>

              <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 shadow-lg hover:shadow-xl transition flex flex-col md:flex-row gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#0F2E23] text-[#D4AF37] text-[10px] font-black px-4 py-1 rounded-bl-xl shadow flex items-center gap-1">
                  <ShieldCheck size={12} /> Your Published Service
                </div>

                <div className="md:w-56 shrink-0 space-y-3">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-md border border-stone-100">
                    <img
                      src={myService.image}
                      alt={myService.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {myService.verified && (
                        <span className="bg-[#0F2E23] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <ShieldCheck size={11} className="text-[#D4AF37]" /> Verified
                        </span>
                      )}
                      {myService.iataCertified && (
                        <span className="bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow">
                          ✈️ IATA Certified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[#0F2E23]">
                          {myService.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {myService.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-emerald-50 text-[#0F2E23] px-2.5 py-1 rounded-xl border border-emerald-100 shrink-0">
                        <Star size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
                        <span className="text-xs font-extrabold">{myService.rating || '5.0'}</span>
                        <span className="text-[10px] text-gray-500">({myService.reviews || 1})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin size={13} className="text-emerald-700" />
                        {myService.city}, {myService.state}
                      </span>
                      <span>•</span>
                      <span className="text-gray-500 font-medium">
                        Coordinator: <strong className="text-slate-700">{myService.leadCoordinator}</strong> ({myService.phone})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(myService.modes || []).map((m) => (
                        <span key={m} className="bg-stone-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">
                          {m}
                        </span>
                      ))}
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-md">
                        🎯 {myService.coverage}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <strong className="text-slate-800">Popular Corridors:</strong> {Array.isArray(myService.corridors) ? myService.corridors.join(' • ') : myService.corridors}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">Starting Rates</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-serif font-bold text-[#0F2E23]">₹{myService.pricePerKm}/km</span>
                        <span className="text-xs text-gray-500">(Base ₹{myService.basePrice})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingService(true)}
                        className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit3 size={13} />
                        <span>Edit Listing</span>
                      </button>
                      <button
                        onClick={() => navigate('/pet-transport')}
                        className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <span>View on Public Directory</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* SERVICE POSTING / EDITING FORM */
          <form onSubmit={handleSaveService} className="space-y-8 bg-slate-50/50 p-6 lg:p-8 rounded-3xl border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-sans font-black text-[#0F2E23]">
                  {myService ? 'Edit Transport Service Details' : 'Post Your Transport Service (1 Allowed)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your business will be instantly listed in the verified transporter directory across India.
                </p>
              </div>

              {myService && (
                <button
                  type="button"
                  onClick={() => setIsEditingService(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Company / Service Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Transport Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. SafePet Transit"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Tagline / Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.tagline}
                  onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })}
                  placeholder="e.g. Safe, Sanitized & Climate-Controlled Pet Transit"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Lead Coordinator */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Lead Coordinator Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.leadCoordinator}
                  onChange={(e) => setServiceForm({ ...serviceForm, leadCoordinator: e.target.value })}
                  placeholder="e.g. Capt. Rajesh Sharma"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Coordinator Phone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.phone}
                  onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value, whatsapp: e.target.value })}
                  placeholder="e.g. +91 98452 23344"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Operating State *
                </label>
                <select
                  value={serviceForm.state}
                  onChange={(e) => setServiceForm({ ...serviceForm, state: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                >
                  {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Operating Hub City *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.city}
                  onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Base Starting Fare (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={serviceForm.basePrice}
                  onChange={(e) => setServiceForm({ ...serviceForm, basePrice: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Price Per Km */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Rate Per Km (₹/km) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={serviceForm.pricePerKm}
                  onChange={(e) => setServiceForm({ ...serviceForm, pricePerKm: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Corridors */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Popular Corridors (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.corridors}
                  onChange={(e) => setServiceForm({ ...serviceForm, corridors: e.target.value })}
                  placeholder="e.g. Bangalore ⇄ Chennai, Bangalore ⇄ Hyderabad, Pan-India Air Cargo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Vehicle Types */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Vehicle Types Operated
                </label>
                <input
                  type="text"
                  value={serviceForm.vehicleTypes}
                  onChange={(e) => setServiceForm({ ...serviceForm, vehicleTypes: e.target.value })}
                  placeholder="e.g. AC Pet Cruiser Van, Innova Crysta, IATA Crate"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Amenities */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Key Amenities & Safety Features
                </label>
                <input
                  type="text"
                  value={serviceForm.amenities}
                  onChange={(e) => setServiceForm({ ...serviceForm, amenities: e.target.value })}
                  placeholder="e.g. 100% Climate Controlled AC, Live GPS Tracking, Vet Onboard"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

            </div>

            {/* Transport Modes Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Select Supported Modalities *
              </label>
              <div className="flex flex-wrap gap-3">
                {['Road Transport', 'Air Transport', 'Rail Transport', 'Ship Transport'].map((m) => {
                  const checked = serviceForm.modes.includes(m);
                  return (
                    <label
                      key={m}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        checked ? 'bg-[#0F2E23] text-white border-[#0F2E23]' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => {
                          const updated = checked
                            ? serviceForm.modes.filter(x => x !== m)
                            : [...serviceForm.modes, m];
                          setServiceForm({ ...serviceForm, modes: updated });
                        }}
                      />
                      <span>{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Image Selection Presets */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Cover Photo (Select Preset or Provide Image URL)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_TRANSPORT_IMAGES.map((img) => (
                  <div
                    key={img.label}
                    onClick={() => setServiceForm({ ...serviceForm, image: img.url })}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer transition relative aspect-video ${
                      serviceForm.image === img.url ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                      <span className="text-[9px] text-white font-bold truncate">{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <input
                type="checkbox"
                id="iataCert"
                checked={serviceForm.iataCertified}
                onChange={(e) => setServiceForm({ ...serviceForm, iataCertified: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="iataCert" className="text-xs font-bold text-slate-800 cursor-pointer">
                ✈️ IATA Certified Transport Provider (Display aviation certified badge)
              </label>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              {myService && (
                <button
                  type="button"
                  onClick={() => setIsEditingService(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-black text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                <span>{myService ? 'Save & Update Service' : 'Publish Transport Service'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    );
  }

  // TAB 2: TRANSPORT BOOKINGS
  if (activeTab === 'appointments') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Transport Bookings & Active Trips</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track scheduled doorstep pickups, inter-city relocations, and trip statuses.</p>
          </div>

          <button
            onClick={() => setShowNewBookingModal(true)}
            className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Add Manual Booking
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {['All', 'Confirmed', 'In Transit', 'Completed'].map((f) => (
              <button
                key={f}
                onClick={() => setBookingFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition ${
                  bookingFilter === f ? 'bg-white text-[#0F2E23] shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search bookings, pet, route..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-100">
              <Truck size={32} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No transport bookings found</h4>
              <p className="text-xs text-slate-400 mt-1">Try switching filters or add a manual booking above.</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black bg-[#0F2E23]/10 text-[#0F2E23] px-2.5 py-1 rounded-lg">
                      {b.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      b.status === 'In Transit' 
                        ? 'bg-amber-100 text-amber-900 animate-pulse' 
                        : b.status === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : 'bg-sky-100 text-sky-900'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Date: {b.travelDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                      className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => setSelectedBookingForDetails(b)}
                      className="text-xs font-bold text-[#0F2E23] hover:underline px-2 cursor-pointer"
                    >
                      Trip Sheet
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pet Traveler</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{b.petName}</div>
                    <div className="text-slate-500">{b.petBreed} ({b.petSpecies})</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Parent Details</span>
                    <div className="font-bold text-slate-900 mt-0.5">{b.customerName}</div>
                    <div className="text-slate-500">{b.customerPhone}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Route</span>
                    <div className="font-bold text-slate-900 mt-0.5">{b.originCity} ➔ {b.destCity}</div>
                    <div className="text-slate-500">{b.mode} ({b.distanceKm} km)</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fare Amount</span>
                    <div className="font-black text-[#0F2E23] text-sm mt-0.5">₹{Number(b.totalAmount).toLocaleString('en-IN')}</div>
                    <div className="text-emerald-700 font-semibold text-[11px]">Paid via Escrow</div>
                  </div>
                </div>

                {b.notes && (
                  <div className="text-xs text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-center gap-2">
                    <Info size={13} className="text-amber-600 shrink-0" />
                    <span>Special Handling: {b.notes}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal: Trip Details */}
        {selectedBookingForDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-sans font-black text-lg text-[#0F2E23]">
                  Trip Sheet: {selectedBookingForDetails.id}
                </h3>
                <button onClick={() => setSelectedBookingForDetails(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pet Name & Breed:</span>
                  <span className="font-bold text-slate-900">{selectedBookingForDetails.petName} ({selectedBookingForDetails.petBreed})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedBookingForDetails.customerName} ({selectedBookingForDetails.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="font-bold text-slate-900">{selectedBookingForDetails.originCity} ➔ {selectedBookingForDetails.destCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Travel Date:</span>
                  <span className="font-bold text-slate-900">{selectedBookingForDetails.travelDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Address:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedBookingForDetails.pickupAddress || 'Customer Doorstep'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination Address:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedBookingForDetails.dropAddress || 'Destination Doorstep'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <span className="font-bold text-slate-900">{selectedBookingForDetails.driverName || 'Ramesh Gowda'}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="w-full bg-[#0F2E23] text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Close Trip Sheet
              </button>
            </div>
          </div>
        )}

        {/* Modal: New Manual Booking */}
        {showNewBookingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-sans font-black text-lg text-[#0F2E23]">Add Manual Transport Booking</h3>
                <button onClick={() => setShowNewBookingModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateManualBooking} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Pet Name</label>
                    <input
                      type="text"
                      required
                      value={newBookingForm.petName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, petName: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Pet Breed</label>
                    <input
                      type="text"
                      value={newBookingForm.petBreed}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, petBreed: e.target.value })}
                      placeholder="e.g. Beagle"
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={newBookingForm.customerName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, customerName: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Customer Phone</label>
                    <input
                      type="text"
                      required
                      value={newBookingForm.customerPhone}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, customerPhone: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Origin City</label>
                    <input
                      type="text"
                      value={newBookingForm.originCity}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, originCity: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Destination City</label>
                    <input
                      type="text"
                      value={newBookingForm.destCity}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, destCity: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Travel Date</label>
                    <input
                      type="date"
                      value={newBookingForm.travelDate}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, travelDate: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Total Fare (₹)</label>
                    <input
                      type="number"
                      value={newBookingForm.totalAmount}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, totalAmount: e.target.value })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer"
                >
                  Save Booking
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // TAB 3: VEHICLES & RATES
  if (activeTab === 'vehicles') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Fleet Vehicles & Pricing Rates</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your air-conditioned vehicles, sanitization schedules, and per-km pricing.</p>
          </div>

          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={14} /> Add New Vehicle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-sans font-black text-[#0F2E23] text-base">{v.name}</h4>
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {v.regNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    {v.status}
                  </span>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                    title="Remove Vehicle"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category / Type:</span>
                  <span className="font-bold text-slate-800">{v.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pet Capacity:</span>
                  <span className="font-bold text-slate-800">{v.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Climate System:</span>
                  <span className="font-bold text-slate-800">{v.climateControl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Sanitized:</span>
                  <span className="font-bold text-emerald-700">{v.lastSanitized || 'Today'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Rate Card</span>
                  <div className="text-sm font-black text-[#0F2E23]">
                    ₹{v.kmRate}/km <span className="text-xs font-normal text-slate-500">(Base ₹{v.baseRate})</span>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  Year {v.year || '2023'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Vehicle */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-sans font-black text-lg text-[#0F2E23]">Add Vehicle to Fleet</h3>
                <button onClick={() => setShowAddVehicleModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Vehicle Model & Name</label>
                  <input
                    type="text"
                    required
                    value={newVehicleForm.name}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, name: e.target.value })}
                    placeholder="e.g. Force Urbania AC Pet Cruiser"
                    className="w-full mt-1 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Registration Plate</label>
                  <input
                    type="text"
                    required
                    value={newVehicleForm.regNumber}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, regNumber: e.target.value })}
                    placeholder="e.g. KA-04-NX-1922"
                    className="w-full mt-1 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Base Fare (₹)</label>
                    <input
                      type="number"
                      required
                      value={newVehicleForm.baseRate}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, baseRate: Number(e.target.value) })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Rate Per Km (₹)</label>
                    <input
                      type="number"
                      required
                      value={newVehicleForm.kmRate}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, kmRate: Number(e.target.value) })}
                      className="w-full mt-1 border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer"
                >
                  Save Vehicle
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // TAB 4: CLIENT INQUIRIES
  if (activeTab === 'messages') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Client Relocation Inquiries</h2>
          <p className="text-xs text-slate-500 mt-0.5">Respond to pet parents requesting custom quotes for inter-state and city relocations.</p>
        </div>

        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-100">
              <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No client inquiries at the moment</h4>
              <p className="text-xs text-slate-400 mt-1">Inquiries submitted on the public page will appear here.</p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                      {inq.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      inq.status === 'Quote Sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inq.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Expected Date: {inq.expectedDate || 'Flexible'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pet Parent</span>
                    <div className="font-bold text-slate-900 mt-0.5">{inq.userName}</div>
                    <div className="text-slate-500">{inq.userPhone}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pet Traveler</span>
                    <div className="font-bold text-slate-900 mt-0.5">{inq.petSpecies} ({inq.petBreed || 'Mixed'})</div>
                    <div className="text-slate-500">Age: {inq.petAge || 'Adult'}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Proposed Route</span>
                    <div className="font-bold text-[#0F2E23] mt-0.5">{inq.departureCity} ➔ {inq.destinationCity}</div>
                    <div className="text-slate-500">{inq.relocationType}</div>
                  </div>
                </div>

                {inq.note && (
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">
                    "{inq.note}"
                  </p>
                )}

                {inq.quoteAmount && (
                  <div className="text-xs bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <strong>Official Quote Sent:</strong> ₹{inq.quoteAmount.toLocaleString('en-IN')}
                      {inq.providerReply && <p className="mt-0.5 italic">{inq.providerReply}</p>}
                    </div>
                    <CheckCircle size={16} className="text-emerald-600" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <a
                    href={`https://wa.me/${inq.userPhone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    WhatsApp Parent
                  </a>
                  <button
                    onClick={() => {
                      setSelectedInquiryForQuote(inq);
                      setQuoteAmount(inq.quoteAmount || '');
                      setQuoteReplyText(inq.providerReply || '');
                    }}
                    className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    {inq.quoteAmount ? 'Update Quote' : 'Send Quote'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Send Quote */}
        {selectedInquiryForQuote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-sans font-black text-lg text-[#0F2E23]">
                  Send Relocation Quote
                </h3>
                <button onClick={() => setSelectedInquiryForQuote(null)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendQuote} className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400">Route:</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedInquiryForQuote.departureCity} ➔ {selectedInquiryForQuote.destinationCity}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Total Quote Fare (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 18500"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className="w-full mt-1 border rounded-lg p-2.5 font-black text-sm text-[#0F2E23]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Message / Inclusions for Parent</label>
                  <textarea
                    rows="3"
                    value={quoteReplyText}
                    onChange={(e) => setQuoteReplyText(e.target.value)}
                    placeholder="e.g. Direct AC pet cab with sanitized crate and doorstep pickup at 8 AM."
                    className="w-full mt-1 border rounded-lg p-2 font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer"
                >
                  Send Official Quote
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // TAB 5: CUSTOMER REVIEWS
  if (activeTab === 'reviews') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Customer Reviews & Ratings</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Star size={12} className="fill-amber-500 text-amber-500" /> 4.9 Rating
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Verified testimonials from pet parents whose fur babies you safely relocated.</p>
        </div>

        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{r.customerName}</div>
                  <div className="text-xs text-slate-500">{r.petName} • <span className="font-medium text-[#0F2E23]">{r.route}</span></div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{r.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl italic">
                "{r.comment}"
              </p>

              {r.reply ? (
                <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-[#0F2E23] flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" /> Your Official Response:
                  </div>
                  <p className="text-slate-600">{r.reply}</p>
                </div>
              ) : replyingReviewId === r.id ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows="2"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a response to thank the pet parent..."
                    className="w-full text-xs p-2 border rounded-xl"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingReviewId(null)}
                      className="text-xs px-3 py-1 text-slate-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendReviewReply(r.id)}
                      className="text-xs bg-[#0F2E23] text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingReviewId(r.id);
                    setReplyText('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-[#0F2E23] flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={12} /> Reply to review
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    );
  }

  // TAB 6: WALLET & PAYOUTS
  if (activeTab === 'wallet') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Wallet & Trip Payouts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage earned relocation fares, escrow releases, and bank settlement transfers.</p>
          </div>

          <button
            onClick={() => setShowPayoutModal(true)}
            className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            Request Bank Payout
          </button>
        </div>

        {/* Finance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#0F2E23] to-[#1a4a39] text-white p-6 rounded-3xl space-y-2 shadow-lg">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Available for Payout</span>
            <div className="text-3xl font-sans font-black text-white">₹14,250</div>
            <p className="text-[11px] text-emerald-200">Cleared from recent completed trips</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gross Revenue YTD</span>
            <div className="text-3xl font-sans font-black text-[#0F2E23]">₹68,450</div>
            <p className="text-[11px] text-slate-500">45 successfully completed relocations</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Escrow in Transit</span>
            <div className="text-3xl font-sans font-black text-amber-600">₹9,800</div>
            <p className="text-[11px] text-slate-500">Released upon doorstep handover</p>
          </div>
        </div>

        {/* Recent Settlements */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-black text-slate-700">Recent Bank Settlements</h4>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
            {[
              { id: 'SET-991', date: 'Yesterday, 4:00 PM', amount: 17459, bank: 'HDFC Bank (..9841)', status: 'Settled' },
              { id: 'SET-990', date: '28 Aug 2026', amount: 24500, bank: 'HDFC Bank (..9841)', status: 'Settled' },
              { id: 'SET-988', date: '15 Aug 2026', amount: 12200, bank: 'HDFC Bank (..9841)', status: 'Settled' }
            ].map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{s.bank}</div>
                  <div className="text-slate-400 text-[11px]">{s.date} • Ref: {s.id}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-[#0F2E23] text-sm">+₹{s.amount.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Request Payout */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-sans font-black text-lg text-[#0F2E23]">Transfer Payout to Bank</h3>
                <button onClick={() => setShowPayoutModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={payoutForm.bankName}
                    onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Bank Account Number</label>
                  <input
                    type="text"
                    required
                    value={payoutForm.accountNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={payoutForm.ifsc}
                    onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Payout Amount (₹)</label>
                  <input
                    type="number"
                    required
                    max="14250"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                    className="w-full mt-1 border rounded-lg p-2 font-black text-sm text-[#0F2E23]"
                  />
                  <span className="text-[10px] text-slate-400">Available: ₹14,250</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer"
                >
                  Confirm Payout Transfer
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // TAB 7: AGENCY PROFILE
  if (activeTab === 'profile') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Transport Agency Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your agency licensing, operating hub addresses, and emergency helplines.</p>
        </div>

        <form onSubmit={handleSaveAgencyProfile} className="space-y-6 bg-slate-50/50 p-6 lg:p-8 rounded-3xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700">Agency Commercial Name</label>
              <input
                type="text"
                value={agencyProfile.businessName}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, businessName: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Director / Lead Coordinator</label>
              <input
                type="text"
                value={agencyProfile.coordinator}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, coordinator: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">24x7 Helpline Phone</label>
              <input
                type="text"
                value={agencyProfile.phone}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, phone: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Official Relocation Email</label>
              <input
                type="email"
                value={agencyProfile.email}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, email: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700">Fleet Yard & Airport Hub Address</label>
              <input
                type="text"
                value={agencyProfile.address}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, address: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">IATA LAR Accreditation Number</label>
              <input
                type="text"
                value={agencyProfile.iataLicence}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, iataLicence: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700">Operating Schedule</label>
              <input
                type="text"
                value={agencyProfile.operatingHours}
                onChange={(e) => setAgencyProfile({ ...agencyProfile, operatingHours: e.target.value })}
                className="w-full mt-1 bg-white border rounded-xl p-2.5 font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              type="submit"
              className="bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] hover:text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              Save Agency Profile
            </button>
          </div>
        </form>

      </div>
    );
  }

  // Fallback
  return null;
};

export default TransportProviderContent;
