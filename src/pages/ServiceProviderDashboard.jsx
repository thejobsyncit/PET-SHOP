import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Calendar, Clock, MapPin, Star, ShieldCheck, CircleCheck,
  X, Plus, Search, Phone, MessageSquare, AlertCircle,
  TrendingUp, DollarSign, Briefcase, Eye, EyeOff, Edit3,
  Trash2, Check, FileText, Download, Send, Zap, CheckCircle,
  Truck, Navigation
} from 'lucide-react';
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  PET_SPECIES_OPTIONS,
  getAllStoredServices,
  saveAllStoredServices,
  getAllStoredBookings,
  saveAllStoredBookings,
  getAllStoredReviews,
  saveAllStoredReviews,
  getAllStoredPayouts,
  saveAllStoredPayouts,
  getStoredProviderProfiles,
  saveStoredProviderProfiles
} from '../data/providerServicesData.js';
import {
  getStoredTransportEnquiries,
  updateTransportEnquiryStatus,
  saveStoredTransportEnquiries
} from '../data/transportData.js';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';
import PetSellerDashboard from './PetSellerDashboard.jsx';

const ServiceProviderDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Main Tab
  const activeTabParam = searchParams.get('tab') || 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Active Provider Profile (Driven by actual logged in user)
  const { user } = useSelector(state => state.auth);
  const [profiles, setProfiles] = useState(() => getStoredProviderProfiles());

  const currentProvider = useMemo(() => {
    if (user && user.role === 'SERVICE_PROVIDER') {
      const matchProfile = profiles.find(p => p.serviceCategory.toLowerCase() === (user.serviceCategory || '').toLowerCase()) || profiles[0];
      return {
        ...matchProfile,
        id: user._id || user.id,
        name: user.name,
        serviceCategory: user.serviceCategory || 'Veterinary',
        avatar: user.avatar || user.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
        isOnline: true
      };
    }
    return profiles[0];
  }, [profiles, user]);

  const isSeller = currentProvider?.serviceCategory?.toLowerCase() === 'pet seller';

  // Main Datasets State
  const [services, setServices] = useState(() => getAllStoredServices());
  const [bookings, setBookings] = useState(() => getAllStoredBookings());
  const [reviews, setReviews] = useState(() => getAllStoredReviews());
  const [payouts, setPayouts] = useState(() => getAllStoredPayouts());
  const [transportEnquiries, setTransportEnquiries] = useState(() => getStoredTransportEnquiries());
  const [replyingEnquiryId, setReplyingEnquiryId] = useState(null);
  const [enquiryQuoteAmount, setEnquiryQuoteAmount] = useState('');
  const [enquiryReplyMessage, setEnquiryReplyMessage] = useState('');

  // Filter States for Appointments / Bookings Tracking
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter States for Service Catalog
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('All');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Modal States
  const [showPostServiceModal, setShowPostServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedBookingForSlip, setSelectedBookingForSlip] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('5000');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutUpi, setPayoutUpi] = useState('dr.ramesh@okaxis');
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Sync active tab with URL parameter
  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveAllStoredServices(services);
  }, [services]);

  useEffect(() => {
    saveAllStoredBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveAllStoredReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    saveAllStoredPayouts(payouts);
  }, [payouts]);

  useEffect(() => {
    saveStoredProviderProfiles(profiles);
  }, [profiles]);

  // Load from backend API if available, fallback gracefully
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const srvRes = await apiRequest('/services/provider');
        if (srvRes.success && srvRes.services?.length > 0) {
          setServices(srvRes.services);
        }
      } catch (_err) {}

      try {
        const bkRes = await apiRequest('/bookings/provider');
        if (bkRes.success && bkRes.bookings?.length > 0) {
          setBookings(bkRes.bookings);
        }
      } catch (_err) {}
    };

    fetchBackendData();
  }, []);

  // Provider-specific filtered bookings
  const providerBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.providerId && b.providerId === currentProvider.id) return true;
      if (b.providerName && currentProvider.name && b.providerName.toLowerCase().includes(currentProvider.name.toLowerCase().split(' ')[0])) return true;
      return false;
    });
  }, [bookings, currentProvider]);

  // Filtered Bookings for the Tracking Table
  const filteredBookings = useMemo(() => {
    return providerBookings.filter(b => {
      // Status Filter
      if (statusFilter !== 'All' && b.status !== statusFilter) {
        return false;
      }
      // Category Filter
      if (categoryFilter !== 'All' && b.serviceType !== categoryFilter) {
        return false;
      }
      // Date Filter
      if (dateFilter === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        if (!b.date.includes(today)) return false;
      } else if (dateFilter === 'Tomorrow') {
        const tmrw = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        if (!b.date.includes(tmrw)) return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPet = b.petDetails?.name?.toLowerCase().includes(q) || b.petDetails?.breed?.toLowerCase().includes(q);
        const matchesCustomer = b.customerName?.toLowerCase().includes(q) || b.customerPhone?.includes(q);
        const matchesBookingNum = b.bookingNumber?.toLowerCase().includes(q) || b.id?.toLowerCase().includes(q);
        const matchesService = b.serviceTitle?.toLowerCase().includes(q);
        if (!matchesPet && !matchesCustomer && !matchesBookingNum && !matchesService) {
          return false;
        }
      }
      return true;
    });
  }, [providerBookings, statusFilter, categoryFilter, dateFilter, searchQuery]);

  // Provider-specific filtered services
  const providerServices = useMemo(() => {
    return services.filter(s => {
      if (s.providerId && s.providerId === currentProvider.id) return true;
      if (s.providerName && currentProvider.name && s.providerName.toLowerCase().includes(currentProvider.name.toLowerCase().split(' ')[0])) return true;
      return false;
    });
  }, [services, currentProvider]);

  // Filtered Services for the Catalog View
  const filteredServices = useMemo(() => {
    return providerServices.filter(s => {
      if (catalogCategoryFilter !== 'All' && s.category !== catalogCategoryFilter) {
        return false;
      }
      if (catalogStatusFilter !== 'All' && s.status !== catalogStatusFilter) {
        return false;
      }
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const matchesTitle = s.title?.toLowerCase().includes(q);
        const matchesDesc = s.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [providerServices, catalogCategoryFilter, catalogStatusFilter, catalogSearch]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalBookings = providerBookings.length;
    const pendingBookings = providerBookings.filter(b => b.status === 'Pending').length;
    const confirmedBookings = providerBookings.filter(b => b.status === 'Confirmed').length;
    const completedBookings = providerBookings.filter(b => b.status === 'Completed').length;
    const activeServicesCount = providerServices.filter(s => s.status === 'Active').length;
    const totalRevenue = providerBookings
      .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + (Number(b.fee) || 0), 0);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      activeServicesCount,
      totalRevenue,
      rating: currentProvider.rating || 4.9,
      reviewsCount: currentProvider.reviewsCount || 120
    };
  }, [providerBookings, providerServices, currentProvider]);

  // ==========================================
  // ACTION HANDLERS: BOOKINGS TRACKING
  // ==========================================

  const handleUpdateBookingStatus = async (bookingId, newStatus, extraNotes = '') => {
    try {
      const updated = bookings.map(b => {
        if (b.id === bookingId) {
          const updatedBooking = { ...b, status: newStatus };
          if (newStatus === 'Completed') {
            updatedBooking.paymentStatus = 'Paid';
          }
          if (extraNotes) {
            updatedBooking.petDetails = { ...updatedBooking.petDetails, notes: extraNotes };
          }
          return updatedBooking;
        }
        return b;
      });
      setBookings(updated);

      // Attempt backend update
      try {
        await apiRequest(`/bookings/${bookingId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus, notes: extraNotes })
        });
      } catch (e) {}

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleTogglePaymentStatus = (bookingId) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const nextPay = b.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid';
        toast.success(`Payment marked as ${nextPay}`);
        return { ...b, paymentStatus: nextPay };
      }
      return b;
    }));
  };

  // ==========================================
  // ACTION HANDLERS: SERVICES CATALOG
  // ==========================================

  const handleToggleServiceStatus = (serviceId) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const nextStatus = s.status === 'Active' ? 'Paused' : 'Active';
        toast.success(`Service "${s.title}" is now ${nextStatus}`);
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service listing?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Service listing removed successfully');
    }
  };

  // ==========================================
  // ACTION HANDLERS: REVIEWS
  // ==========================================

  const handleSubmitReply = (reviewId) => {
    if (!replyText.trim()) return;
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return { ...r, reply: replyText.trim() };
      }
      return r;
    }));
    toast.success('Response posted publicly for client review');
    setReplyingReviewId(null);
    setReplyText('');
  };

  // ==========================================
  // ACTION HANDLERS: PET TRANSPORT ENQUIRIES
  // ==========================================

  const handleUpdateTransportEnquiryStatus = (enquiryId, newStatus) => {
    const updated = updateTransportEnquiryStatus(enquiryId, newStatus);
    if (updated) {
      setTransportEnquiries(getStoredTransportEnquiries());
      toast.success(`Enquiry status updated to "${newStatus}"! Customer dashboard updated in real-time.`, {
        icon: '🚐'
      });
    }
  };

  const handleSendTransportQuote = (enquiryId) => {
    if (!enquiryReplyMessage.trim()) {
      toast.error('Please write a message or details for the customer.');
      return;
    }
    const amountNum = enquiryQuoteAmount ? parseFloat(enquiryQuoteAmount) : null;
    const updated = updateTransportEnquiryStatus(enquiryId, 'Quote Sent', enquiryReplyMessage.trim(), amountNum);
    if (updated) {
      setTransportEnquiries(getStoredTransportEnquiries());
      toast.success(`Quotation of ₹${amountNum || 'Custom'} dispatched to client dashboard!`, {
        icon: '📬'
      });
      setReplyingEnquiryId(null);
      setEnquiryQuoteAmount('');
      setEnquiryReplyMessage('');
    }
  };

  // ==========================================
  // ACTION HANDLERS: PAYOUTS
  // ==========================================

  const handleRequestPayout = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }
    const newPayout = {
      id: `PO-${Date.now()}`,
      payoutId: `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountNum,
      feeDeducted: 0,
      netAmount: amountNum,
      status: 'Processing',
      bankAccount: payoutMethod === 'UPI' ? `UPI: ${payoutUpi}` : 'HDFC Bank - •••• 4892',
      period: 'Instant Settlement'
    };
    setPayouts([newPayout, ...payouts]);
    toast.success(`Payout of ₹${amountNum.toLocaleString('en-IN')} initiated to ${payoutUpi}`);
    setShowPayoutModal(false);
  };

  // ==========================================
  // ACTION HANDLERS: PROFILE & AVAILABILITY
  // ==========================================

  const handleToggleOnline = () => {
    setProfiles(prev => prev.map(p => {
      if (p.id === currentProvider.id) {
        const nextState = !p.isOnline;
        toast.success(`Business status set to ${nextState ? 'Accepting Appointments (Live)' : 'Taking a Break (Offline)'}`);
        return { ...p, isOnline: nextState };
      }
      return p;
    }));
  };

  const handleToggleEmergency = () => {
    setProfiles(prev => prev.map(p => {
      if (p.id === currentProvider.id) {
        const nextState = !p.acceptingEmergency;
        toast.success(`Emergency Care badge ${nextState ? 'Enabled' : 'Disabled'}`);
        return { ...p, acceptingEmergency: nextState };
      }
      return p;
    }));
  };

  if (isSeller) {
    return (
      <PetSellerDashboard 
        currentProvider={currentProvider} 
        profiles={profiles} 
        handleToggleOnline={handleToggleOnline} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =========================================================================
            HEADER & HERO BANNER: BRAND STYLING & DEMO PERSONA SWITCHER
           ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0F2E23] via-[#163e30] to-[#1D3B2E] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#ffd000]/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left: Provider Details & Badges */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <img
                  src={currentProvider.avatar}
                  alt={currentProvider.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#ffd000]/60 shadow-lg"
                />
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0F2E23] flex items-center justify-center text-[10px] ${
                  currentProvider.isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`} title={currentProvider.isOnline ? 'Online' : 'Offline'}>
                  {currentProvider.isOnline ? '●' : '⏸'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {currentProvider.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffd000]/20 border border-[#ffd000]/40 text-[#ffd000] text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={13} className="text-[#ffd000]" /> Verified Partner
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold">
                    {currentProvider.serviceCategory} Specialist
                  </span>
                </div>

                <p className="text-sm text-white/80 font-medium max-w-xl">
                  {currentProvider.title} • {currentProvider.clinicName}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 pt-1">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star size={13} className="fill-amber-300 text-amber-300" /> {currentProvider.rating} ({currentProvider.reviewsCount} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#A1C0AA]" /> {currentProvider.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#A1C0AA]" /> {currentProvider.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Controls & Demo Switcher */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              
              {/* Status Toggles & Post Service Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleOnline}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                    currentProvider.isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                  title="Toggle accepting appointments"
                >
                  <span className={`w-2 h-2 rounded-full ${currentProvider.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {currentProvider.isOnline ? 'Accepting Bookings' : 'Paused / Offline'}
                </button>

                {currentProvider.serviceCategory === 'Pet Seller' && (
                  <Link
                    to="/pets"
                    className="px-3.5 py-1.5 rounded-xl bg-white text-[#0F2E23] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-100 transition"
                  >
                    🐾 Open Pet Classifieds
                  </Link>
                )}

                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowPostServiceModal(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#ffd000] hover:bg-[#ffd000]/90 text-[#0F2E23] font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                >
                  <Plus size={15} /> {isSeller ? 'Post New Pet' : 'Post New Service'}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* =========================================================================
            KPI STAT CARDS (4 TILES)
           ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Tile 1: Active Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isSeller ? 'Buyer Inquiries' : 'Bookings Queue'}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-slate-900">{stats.totalBookings}</span>
              {stats.pendingBookings > 0 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                  {stats.pendingBookings} {isSeller ? 'Inquiries' : 'Needs Action'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {stats.confirmedBookings} confirmed upcoming
            </p>
          </div>

          {/* Tile 2: Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Earnings</span>
              <div className="w-10 h-10 rounded-xl bg-[#0F2E23]/10 text-[#0F2E23] flex items-center justify-center">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-slate-900">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <TrendingUp size={12} className="mr-0.5" /> +18%
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-slate-500 font-medium">0% platform commission</p>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="text-[11px] text-[#0F2E23] font-bold hover:underline cursor-pointer"
              >
                Withdraw →
              </button>
            </div>
          </div>

          {/* Tile 3: Active Services */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{isSeller ? 'Active Listings' : 'Active Services'}</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-slate-900">{stats.activeServicesCount}</span>
              <span className="text-xs text-slate-400 font-medium">of {providerServices.length} total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Live in {currentProvider.city} catalog
            </p>
          </div>

          {/* Tile 4: Client Rating */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Rating</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star size={20} className="fill-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-slate-900">{stats.rating}</span>
              <span className="text-xs font-bold text-amber-600">★ Top Rated</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Based on {stats.reviewsCount} verified clients
            </p>
          </div>

        </div>

        {/* =========================================================================
            NAVIGATION TABS (STICKY BAR)
           ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
          {[
            { id: 'appointments', label: isSeller ? 'Track Enquiries & Sales' : 'Track Appointments & Bookings', icon: Calendar, count: stats.totalBookings, badge: stats.pendingBookings },
            { id: 'relocation-enquiries', label: 'Relocation Enquiries', icon: Truck, count: transportEnquiries.length, badge: transportEnquiries.filter(e => e.status.includes('Pending') || e.status === 'Under Review').length },
            { id: 'services', label: isSeller ? 'My Pet Catalog' : 'My Service Catalog', icon: Briefcase, count: providerServices.length },
            { id: 'post-service', label: isSeller ? 'Post New Pet' : 'Post New Service', icon: Plus, isAction: true },
            { id: 'schedule', label: isSeller ? 'Seller Profile & Details' : 'Operating Schedule & Profile', icon: Clock },
            { id: 'payouts', label: 'Earnings & Payouts', icon: DollarSign },
            { id: 'reviews', label: 'Client Reviews', icon: Star, count: reviews.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'post-service') {
                    setEditingService(null);
                    setShowPostServiceModal(true);
                  } else {
                    handleTabChange(tab.id);
                  }
                }}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#0F2E23] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#ffd000]' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB 1: TRACK APPOINTMENTS & BOOKINGS (WITH MULTI-DIMENSIONAL FILTERS)
           ========================================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter & Search Toolbar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              
              {/* Top Row: Search Input & Category Dropdown */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by pet name, pet parent, phone, or booking number..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-[#0F2E23] focus:outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Service Category Filter Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    Category:
                  </span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0F2E23] cursor-pointer"
                  >
                    <option value="All">All Categories ({providerBookings.length})</option>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Quick Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    Date:
                  </span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#0F2E23] cursor-pointer"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today's Appointments</option>
                    <option value="Tomorrow">Tomorrow</option>
                  </select>
                </div>

              </div>

              {/* Bottom Row: Status Filter Badges (Chips) */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                  Status:
                </span>
                {[
                  { id: 'All', label: 'All', count: providerBookings.length },
                  { id: 'Pending', label: 'Pending Approval', count: providerBookings.filter(b => b.status === 'Pending').length, alert: true },
                  { id: 'Confirmed', label: 'Confirmed / Upcoming', count: providerBookings.filter(b => b.status === 'Confirmed').length },
                  { id: 'In-Progress', label: 'In-Progress', count: providerBookings.filter(b => b.status === 'In-Progress').length },
                  { id: 'Completed', label: 'Completed', count: providerBookings.filter(b => b.status === 'Completed').length },
                  { id: 'Cancelled', label: 'Cancelled', count: providerBookings.filter(b => b.status === 'Cancelled').length }
                ].map((st) => {
                  const isSelected = statusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F2E23] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                      }`}>
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bookings List Cards */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No bookings match your current filter selection. Try changing status or searching with another term.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setCategoryFilter('All');
                    setDateFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const isPending = b.status === 'Pending';
                  const isConfirmed = b.status === 'Confirmed';
                  const isInProgress = b.status === 'In-Progress';
                  const isCompleted = b.status === 'Completed';
                  const isCancelled = b.status === 'Cancelled';

                  // Pre-fill WhatsApp message text
                  const waText = encodeURIComponent(
                    `Hi ${b.customerName}, this is ${currentProvider.name} from Pawora regarding your appointment #${b.bookingNumber || b.id} for ${b.petDetails?.name} on ${b.date} at ${b.timeSlot}.`
                  );
                  const cleanPhone = (b.customerPhone || '').replace(/\D/g, '');

                  return (
                    <div
                      key={b.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md p-5 sm:p-6 ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/20'
                          : isInProgress
                          ? 'border-sky-300 bg-sky-50/20'
                          : 'border-slate-200/80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        
                        {/* Left Column: Booking Info & Pet Details */}
                        <div className="space-y-3 flex-1">
                          
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {b.bookingNumber || b.id}
                            </span>
                            <span className="text-xs font-bold text-[#0F2E23] bg-[#0F2E23]/10 px-2.5 py-0.5 rounded-md">
                              {b.serviceType}
                            </span>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {b.serviceMode || 'Clinic / Facility'}
                            </span>

                            {/* Status Badge */}
                            <span className={`text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1 ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isInProgress
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : isCompleted
                                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {isPending && <Clock size={12} className="text-amber-700 animate-spin" />}
                              {isConfirmed && <CircleCheck size={12} className="text-emerald-700" />}
                              {isInProgress && <Zap size={12} className="text-sky-700 animate-pulse" />}
                              {isCompleted && <Check size={12} className="text-slate-700" />}
                              {isCancelled && <X size={12} className="text-rose-700" />}
                              {b.status}
                            </span>

                            {/* Payment Status Pill */}
                            <button
                              onClick={() => handleTogglePaymentStatus(b.id)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer border ${
                                b.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Click to toggle payment status"
                            >
                              {b.paymentStatus === 'Paid' ? '✓ Paid' : '⚠ Unpaid (Click to mark paid)'}
                            </button>
                          </div>

                          {/* Service Title */}
                          <h4 className="text-base sm:text-lg font-bold text-slate-900">
                            {b.serviceTitle || `${b.serviceType} Consultation`}
                            {b.packageSelected && (
                              <span className="text-xs font-normal text-slate-500 ml-2">
                                ({b.packageSelected})
                              </span>
                            )}
                          </h4>

                          {/* Pet Info & Parent details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-lg">🐾</span>
                              <div>
                                <span className="font-bold text-slate-900">{b.petDetails?.name || 'Pet'}</span>
                                <span className="text-slate-500"> • {b.petDetails?.breed || b.petDetails?.type || 'Pet'}</span>
                                {b.petDetails?.age && <span className="text-slate-400"> ({b.petDetails.age})</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-lg">👤</span>
                              <div className="truncate">
                                <span className="font-bold text-slate-900">{b.customerName || 'Pet Parent'}</span>
                                <span className="text-slate-500"> ({b.customerPhone || 'Phone hidden'})</span>
                              </div>
                            </div>
                          </div>

                          {/* Health Notes from Parent */}
                          {b.petDetails?.notes && (
                            <div className="text-xs bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl text-amber-900 flex items-start gap-2">
                              <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Parent Health Note: </span>
                                {b.petDetails.notes}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Right Column: Time Slot, Fee & Interactive Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-center gap-4 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                          
                          {/* Date, Time & Fee */}
                          <div className="text-left lg:text-right space-y-1">
                            <div className="flex items-center lg:justify-end gap-1.5 text-xs font-bold text-slate-900">
                              <Calendar size={14} className="text-[#0F2E23]" /> {b.date}
                            </div>
                            <div className="flex items-center lg:justify-end gap-1.5 text-xs font-semibold text-slate-600">
                              <Clock size={14} className="text-slate-400" /> {b.timeSlot}
                            </div>
                            <div className="text-base font-serif font-bold text-[#0F2E23]">
                              ₹{Number(b.fee).toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Interactive Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            
                            {/* WhatsApp Direct Action */}
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${waText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                                title="Chat on WhatsApp with pet parent"
                              >
                                <MessageSquare size={14} />
                              </a>
                            )}

                            {/* Phone Call Direct Action */}
                            {cleanPhone && (
                              <a
                                href={`tel:${cleanPhone}`}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                                title="Call pet parent directly"
                              >
                                <Phone size={14} />
                              </a>
                            )}

                            {/* Print / View Appointment Slip */}
                            <button
                              onClick={() => setSelectedBookingForSlip(b)}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              title="View & Print Appointment Slip"
                            >
                              <FileText size={14} /> Slip
                            </button>

                            {/* Status State Transitions */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                >
                                  <Check size={14} /> Accept Booking
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'In-Progress')}
                                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                >
                                  <Zap size={14} /> Start Session
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                                >
                                  Mark Completed
                                </button>
                              </>
                            )}

                            {isInProgress && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                              >
                                <CheckCircle size={14} /> Complete & Bill
                              </button>
                            )}

                            {isCompleted && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-200">
                                <Check size={13} /> Completed
                              </span>
                            )}

                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: MY SERVICE CATALOG (WITH CATEGORY, STATUS & SEARCH FILTERS)
           ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header & Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    My Published Services ({providerServices.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage service pricing, description highlights, multi-tier packages and availability.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowPostServiceModal(true);
                  }}
                  className="px-4 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Plus size={16} /> Post New Service
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search by service title..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={catalogStatusFilter}
                  onChange={(e) => setCatalogStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Paused">Paused Only</option>
                </select>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No services listed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the button below to post your first service offering on Pawora.
                </p>
                <button
                  onClick={() => setShowPostServiceModal(true)}
                  className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Post New Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((srv) => {
                  const isActive = srv.status === 'Active';
                  return (
                    <div
                      key={srv.id}
                      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                        isActive ? 'border-slate-200/90' : 'border-amber-200 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div>
                        {/* Cover Image & Category Pill */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={srv.images?.[0] || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800'}
                            alt={srv.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-[#0F2E23]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                              {srv.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold">
                              {srv.serviceMode}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {srv.status}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {srv.duration}
                            </span>
                            <span className="flex items-center gap-1 text-amber-300">
                              <Star size={12} className="fill-amber-300" /> {srv.rating || 5.0} ({srv.reviewsCount || 0})
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <h4 className="text-base font-bold text-slate-900 line-clamp-2">
                            {srv.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2">
                            {srv.description}
                          </p>

                          {/* Highlights Chips */}
                          {srv.highlights && srv.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {srv.highlights.slice(0, 3).map((hl, idx) => (
                                <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                  ✓ {hl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Packages Count */}
                          {srv.packages && srv.packages.length > 0 && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                              <span className="font-semibold">{srv.packages.length} Tiered Packages</span>
                              <span className="text-[#0F2E23] font-bold">
                                From ₹{srv.packages[0].price}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Pricing & Action Controls */}
                      <div className="p-5 pt-0 border-t border-slate-100 mt-4">
                        <div className="flex items-baseline justify-between py-3">
                          <div>
                            <span className="text-lg font-serif font-bold text-[#0F2E23]">
                              ₹{srv.discountPrice || srv.price}
                            </span>
                            {srv.discountPrice && srv.discountPrice < srv.price && (
                              <span className="text-xs text-slate-400 line-through ml-1.5">
                                ₹{srv.price}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {srv.priceUnit || 'per session'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Toggle Active / Pause */}
                            <button
                              onClick={() => handleToggleServiceStatus(srv.id)}
                              className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                isActive
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title={isActive ? 'Pause service' : 'Activate service'}
                            >
                              {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            {/* Edit Service */}
                            <button
                              onClick={() => {
                                setEditingService(srv);
                                setShowPostServiceModal(true);
                              }}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                              title="Edit service details"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Service */}
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                              title="Delete service"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 4: OPERATING SCHEDULE & CLINIC PROFILE
           ========================================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Weekly Operating Hours */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      Weekly Appointment Schedule & Hours
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your clinic or mobile visit operating slots per day.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Auto-Slot Booking Enabled
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(currentProvider.operatingHours || {}).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={hours.active}
                          onChange={() => {
                            setProfiles(prev => prev.map(p => {
                              if (p.id === currentProvider.id) {
                                const updatedHours = {
                                  ...p.operatingHours,
                                  [day]: { ...p.operatingHours[day], active: !p.operatingHours[day].active }
                                };
                                return { ...p, operatingHours: updatedHours };
                              }
                              return p;
                            }));
                            toast.success(`${day} schedule toggled`);
                          }}
                          className="w-4 h-4 text-[#0F2E23] rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900 w-24">
                          {day}
                        </span>
                      </div>

                      {hours.active ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {hours.open}
                          </span>
                          <span className="text-slate-400">to</span>
                          <span className="font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {hours.close}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">
                          Closed / Off
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-900 space-y-1">
                  <span className="font-bold">Pro Tip: </span>
                  Pet parents can only book time slots during your active schedule windows.
                </div>
              </div>

              {/* Right Column: Amenities & Facility Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Facility Amenities & Features
                  </h3>
                  <p className="text-xs text-slate-500">
                    Key features shown on your public service listing.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(currentProvider.amenities || []).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-200"
                    >
                      <Check size={12} className="text-emerald-600" /> {amenity}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Emergency Care Setting
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-amber-900">24/7 Emergency Care</span>
                      <p className="text-[10px] text-amber-700">Display "Emergency Vet on Call" banner</p>
                    </div>
                    <button
                      onClick={handleToggleEmergency}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                        currentProvider.acceptingEmergency
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentProvider.acceptingEmergency ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-900">Contact & Address</h4>
                  <p>📍 {currentProvider.location}</p>
                  <p>📞 {currentProvider.phone}</p>
                  <p>💬 WhatsApp: {currentProvider.whatsapp}</p>
                  <p>✉️ {currentProvider.email}</p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: EARNINGS & PAYOUTS HUB
           ========================================================================= */}
        {activeTab === 'payouts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Revenue Summary Card */}
            <div className="bg-gradient-to-br from-[#0F2E23] to-[#1D3B2E] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ffd000]">
                  Available Balance
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-white/70">
                  Instant bank settlement with 0% platform deductions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="px-6 py-3 bg-[#ffd000] hover:bg-[#ffd000]/90 text-[#0F2E23] font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} /> Request Withdrawal / Payout
                </button>
              </div>
            </div>

            {/* Payouts History Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Payout & Transfer History
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  {payouts.length} Transactions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-2">Transaction ID</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Account / Method</th>
                      <th className="py-3 px-2">Settlement Period</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {payouts.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-800">
                          {po.payoutId}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600">
                          {po.date}
                        </td>
                        <td className="py-3.5 px-2 text-slate-700 font-semibold">
                          {po.bankAccount}
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          {po.period}
                        </td>
                        <td className="py-3.5 px-2 font-bold text-[#0F2E23] text-sm">
                          ₹{po.netAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            po.status === 'Transferred'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            ✓ {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 6: CLIENT REVIEWS & FEEDBACK
           ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    Client Ratings & Verified Reviews
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct feedback from verified pet parents who completed appointments.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <Star size={20} className="fill-amber-400 text-amber-400" />
                  <div>
                    <span className="text-base font-bold text-slate-900">{currentProvider.rating} / 5.0</span>
                    <span className="text-[10px] text-slate-500 block">Overall Trust Score</span>
                  </div>
                </div>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            🐾 {rev.petName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Reviewed for: {rev.serviceName} • {rev.date}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Provider Reply Display */}
                    {rev.reply ? (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F2E23]">
                          <ShieldCheck size={13} className="text-emerald-600" />
                          <span>Response from {currentProvider.name}</span>
                        </div>
                        <p className="text-slate-600 pl-4">{rev.reply}</p>
                      </div>
                    ) : (
                      <div>
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2 pt-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a warm, professional reply to the pet parent..."
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0F2E23]"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitReply(rev.id)}
                                className="px-3.5 py-1.5 bg-[#0F2E23] text-white text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Post Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-xs text-[#0F2E23] font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Send size={12} /> Reply to this review
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: RELOCATION & PET TRANSPORT ENQUIRIES (SYNCED WITH USER DASHBOARD)
           ========================================================================= */}
        {activeTab === 'relocation-enquiries' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="text-[#0F2E23]" size={22} />
                    Incoming Pet Relocation Enquiries ({transportEnquiries.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review route requests from pet parents, update real-time progress, and dispatch official quotations.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CircleCheck size={14} />
                  <span>Auto-Synced with Customer Portal</span>
                </div>
              </div>

              {/* Enquiries List */}
              {transportEnquiries.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                    🚐
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Relocation Enquiries Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When customers submit an enquiry on the Pet Transport page or specific provider card, it will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {transportEnquiries.map((enq) => {
                    const isPending = enq.status.includes('Pending') || enq.status === 'Under Review';
                    return (
                      <div
                        key={enq.id}
                        className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4 hover:border-[#0F2E23]/30 transition"
                      >
                        {/* Top Header & Badges */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{enq.userName}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                                Ref: {enq.id}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                enq.status === 'Quote Sent' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {enq.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                              <span>📞 <strong>{enq.userPhone}</strong></span>
                              {enq.userEmail && <span>• ✉️ <strong>{enq.userEmail}</strong></span>}
                              <span>• Assigned to: <strong className="text-[#0F2E23]">{enq.providerName}</strong></span>
                            </div>
                          </div>

                          {/* Quick Status Dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Update Status:</span>
                            <select
                              value={enq.status}
                              onChange={(e) => handleUpdateTransportEnquiryStatus(enq.id, e.target.value)}
                              className="bg-white border border-slate-300 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                            >
                              <option value="Submitted / Pending Review">Submitted / Pending Review</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Quote Sent">Quote Sent</option>
                              <option value="Confirmed & Route Assigned">Confirmed & Route Assigned</option>
                              <option value="In Transit / GPS Live">In Transit / GPS Live</option>
                              <option value="Delivered & Completed">Delivered & Completed</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </div>
                        </div>

                        {/* Route & Pet Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Relocation Route</span>
                            <strong className="text-slate-900">{enq.departureCity} ➔ {enq.destinationCity}</strong>
                            <span className="text-[10px] text-slate-500 block">({enq.relocationType})</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Information</span>
                            <strong className="text-slate-900">{enq.petBreed} ({enq.petSpecies || 'Dog'})</strong>
                            <span className="text-[10px] text-slate-500 block">{enq.petGender}, {enq.petAge}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Date & Travel Mode</span>
                            <strong className="text-slate-900">{enq.expectedDate || 'Flexible'}</strong>
                            <span className="text-[10px] text-slate-500 block">{enq.preferredModes?.join(', ') || 'Any Mode'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Vaccination & Travel Style</span>
                            <strong className="text-slate-900">{enq.vaccinationStatus}</strong>
                            <span className="text-[10px] text-slate-500 block">{enq.travelFriendly}</span>
                          </div>
                        </div>

                        {/* Customer Note */}
                        {enq.note && (
                          <div className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                            <strong>Client Instructions:</strong> "{enq.note}"
                          </div>
                        )}

                        {/* Active Quote / Provider Response */}
                        {enq.providerReply && (
                          <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-[#0F2E23]">
                                <ShieldCheck size={14} className="text-emerald-700" />
                                <span>Dispatched Quotation & Instructions</span>
                              </div>
                              {enq.quoteAmount && (
                                <span className="text-sm font-serif font-extrabold text-[#0F2E23]">
                                  Quote: ₹{enq.quoteAmount.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700">{enq.providerReply}</p>
                          </div>
                        )}

                        {/* Reply / Send Quote Button */}
                        <div>
                          {replyingEnquiryId === enq.id ? (
                            <div className="bg-white p-4 rounded-xl border border-slate-300 space-y-3">
                              <h4 className="text-xs font-bold text-[#0F2E23]">Send Official Quote & Message to {enq.userName}</h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quote Amount (₹)</label>
                                  <input
                                    type="number"
                                    placeholder="e.g. 14500"
                                    value={enquiryQuoteAmount}
                                    onChange={(e) => setEnquiryQuoteAmount(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Travel Plan Details & Instructions</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. AC Private Van with IATA crate, pickup at 7:30 AM, live GPS link will be shared."
                                    value={enquiryReplyMessage}
                                    onChange={(e) => setEnquiryReplyMessage(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setReplyingEnquiryId(null)}
                                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSendTransportQuote(enq.id)}
                                  className="px-4 py-1.5 bg-[#0F2E23] hover:bg-[#163e30] text-[#D4AF37] hover:text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send size={13} /> Dispatch Quote
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setReplyingEnquiryId(enq.id);
                                  setEnquiryQuoteAmount(enq.quoteAmount ? enq.quoteAmount.toString() : '');
                                  setEnquiryReplyMessage(enq.providerReply || '');
                                }}
                                className="bg-[#0F2E23] hover:bg-[#163e30] text-[#D4AF37] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Send size={13} /> {enq.providerReply ? 'Update Quote / Message' : 'Send Quotation & Travel Plan'}
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: POST / EDIT SERVICE STUDIO
         ========================================================================= */}
      {showPostServiceModal && (
        <PostServiceModal
          isOpen={showPostServiceModal}
          onClose={() => {
            setShowPostServiceModal(false);
            setEditingService(null);
          }}
          currentProvider={currentProvider}
          editingService={editingService}
          onSave={(savedService) => {
            if (editingService) {
              setServices(prev => prev.map(s => s.id === savedService.id ? savedService : s));
              toast.success('Service updated successfully!');
            } else {
              setServices(prev => [savedService, ...prev]);
              toast.success('New service published live!');
            }
            setShowPostServiceModal(false);
            setEditingService(null);
          }}
        />
      )}

      {/* =========================================================================
          MODAL 2: APPOINTMENT SLIP / PET CARE SHEET MODAL
         ========================================================================= */}
      {selectedBookingForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setSelectedBookingForSlip(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Slip Header */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-100">
              <span className="font-serif text-lg font-bold text-[#0F2E23] tracking-wider">
                PAWORA SERVICE APPOINTMENT SLIP
              </span>
              <p className="text-xs text-slate-500 font-mono">
                Slip ID: #{selectedBookingForSlip.bookingNumber || selectedBookingForSlip.id}
              </p>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Provider</span>
                  <span className="font-bold text-slate-900">{selectedBookingForSlip.providerName || currentProvider.name}</span>
                  <span className="text-slate-500 block text-[10px]">{currentProvider.clinicName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold text-[#0F2E23]">{selectedBookingForSlip.serviceType}</span>
                  <span className="text-slate-500 block text-[10px]">{selectedBookingForSlip.serviceMode}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pet Name & Breed</span>
                  <span className="font-bold text-slate-900">{selectedBookingForSlip.petDetails?.name}</span>
                  <span className="text-slate-500 block text-[10px]">{selectedBookingForSlip.petDetails?.breed || selectedBookingForSlip.petDetails?.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pet Parent</span>
                  <span className="font-bold text-slate-900">{selectedBookingForSlip.customerName}</span>
                  <span className="text-slate-500 block text-[10px]">{selectedBookingForSlip.customerPhone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Time</span>
                  <span className="font-bold text-slate-900">{selectedBookingForSlip.date}</span>
                  <span className="text-slate-500 block text-[10px]">{selectedBookingForSlip.timeSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee & Payment</span>
                  <span className="font-bold text-[#0F2E23] text-sm">₹{selectedBookingForSlip.fee}</span>
                  <span className="text-emerald-700 block text-[10px] font-bold">✓ {selectedBookingForSlip.paymentStatus}</span>
                </div>
              </div>

              {selectedBookingForSlip.petDetails?.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block">Parent Clinical Note:</span>
                  <p>{selectedBookingForSlip.petDetails.notes}</p>
                </div>
              )}
            </div>

            {/* Print Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
              >
                <Download size={15} /> Print / Save Slip as PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: PAYOUT WITHDRAWAL REQUEST
         ========================================================================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setShowPayoutModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Request Payout / Withdrawal
              </h3>
              <p className="text-xs text-slate-500">
                Available balance: <strong className="text-[#0F2E23]">₹{stats.totalRevenue.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  max={stats.totalRevenue || 50000}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Settlement Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Bank Account'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayoutMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        payoutMethod === method
                          ? 'bg-[#0F2E23] text-white border-[#0F2E23]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {payoutMethod === 'UPI' ? (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={payoutUpi}
                    onChange={(e) => setPayoutUpi(e.target.value)}
                    placeholder="e.g. yourname@okaxis"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                  <p><strong>Bank:</strong> HDFC Bank Ltd.</p>
                  <p><strong>Account:</strong> •••• •••• 4892</p>
                  <p><strong>IFSC:</strong> HDFC0001234</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Instant Transfer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: POST / EDIT SERVICE STUDIO MODAL
// =========================================================================

const PostServiceModal = ({ isOpen, onClose, currentProvider, editingService, onSave }) => {
  const [title, setTitle] = useState(editingService?.title || '');
  const [category, setCategory] = useState(editingService?.category || currentProvider?.serviceCategory || 'Veterinary');
  const [price, setPrice] = useState(editingService?.price || 600);
  const [discountPrice, setDiscountPrice] = useState(editingService?.discountPrice || 499);
  const [priceUnit, setPriceUnit] = useState(editingService?.priceUnit || 'per session');
  const [duration, setDuration] = useState(editingService?.duration || '45 mins');
  const [serviceMode, setServiceMode] = useState(editingService?.serviceMode || 'Clinic / Facility');
  const [selectedPetTypes, setSelectedPetTypes] = useState(editingService?.petTypes || ['Dogs', 'Cats']);
  const [description, setDescription] = useState(editingService?.description || '');
  const [highlights, setHighlights] = useState(editingService?.highlights || ['Certified Master Care', 'Sanitized Tools', 'Post Care Tips']);
  const [newHighlight, setNewHighlight] = useState('');
  const [coverImage, setCoverImage] = useState(editingService?.images?.[0] || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800');
  
  // Multi-tier packages
  const [packages, setPackages] = useState(editingService?.packages || [
    { name: 'Standard Package', price: 499, duration: '30 mins', desc: 'Standard service session with certified expert' },
    { name: 'Deluxe Pamper / Comprehensive', price: 999, duration: '60 mins', desc: 'Extended thorough session with complimentary care add-ons' }
  ]);

  if (!isOpen) return null;

  const togglePetType = (pet) => {
    if (selectedPetTypes.includes(pet)) {
      if (selectedPetTypes.length > 1) {
        setSelectedPetTypes(selectedPetTypes.filter(p => p !== pet));
      }
    } else {
      setSelectedPetTypes([...selectedPetTypes, pet]);
    }
  };

  const handleAddHighlight = (e) => {
    e.preventDefault();
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (item) => {
    setHighlights(highlights.filter(h => h !== item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter service title and description');
      return;
    }

    const payload = {
      id: editingService?.id || `SRV-${Date.now()}`,
      providerId: currentProvider.id,
      providerName: currentProvider.name,
      title: title.trim(),
      category,
      price: Number(price),
      discountPrice: Number(discountPrice),
      priceUnit,
      duration,
      serviceMode,
      petTypes: selectedPetTypes,
      location: currentProvider.location,
      state: currentProvider.state || 'Karnataka',
      city: currentProvider.city || 'Bangalore',
      area: currentProvider.area || '',
      contactPhone: currentProvider.phone,
      contactWhatsapp: currentProvider.whatsapp,
      description: description.trim(),
      highlights,
      packages,
      images: [coverImage],
      rating: editingService?.rating || 5.0,
      reviewsCount: editingService?.reviewsCount || 0,
      status: 'Active',
      createdAt: editingService?.createdAt || new Date().toISOString()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Top */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              {editingService ? 'Edit Service Offering' : 'Post New Service Offering'}
            </h3>
            <p className="text-xs text-slate-500">
              Publish your professional care offerings to hundreds of pet parents in {currentProvider.city}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Service Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Signature Spa Bath & De-Shedding"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0F2E23]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Service Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23] cursor-pointer"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Pricing, Discount & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Original Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Offer Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Unit / Billing</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="per session">per session</option>
                <option value="per consult">per consult</option>
                <option value="per night">per night</option>
                <option value="per hour">per hour</option>
                <option value="per month">per month</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45 mins"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Row 3: Service Mode & Target Pets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Service Mode</label>
              <select
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                {SERVICE_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Supported Pet Species</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PET_SPECIES_OPTIONS.map((pet) => {
                  const isChecked = selectedPetTypes.includes(pet);
                  return (
                    <button
                      key={pet}
                      type="button"
                      onClick={() => togglePetType(pet)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        isChecked
                          ? 'bg-[#0F2E23] text-white border-[#0F2E23]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{pet}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Detailed Description *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is included in this service, preparation tips for the pet parent, and key health benefits..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0F2E23]"
              required
            />
          </div>

          {/* Row 5: Highlights Builder */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Key Inclusions & Highlights</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="e.g. Organic Herbal Shampoo, Nail Filing..."
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Add Highlight
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {highlights.map((hl, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                >
                  ✓ {hl}
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(hl)}
                    className="text-emerald-500 hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Row 6: Cover Image Selector */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Cover Image URL</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-bold cursor-pointer transition shadow-md"
            >
              {editingService ? 'Save Changes' : 'Publish Service Live'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
