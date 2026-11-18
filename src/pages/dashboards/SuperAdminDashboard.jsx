import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, ShoppingBag, Users, Layers, AlertTriangle, Clock,
  Plus, Edit, Trash, Check, X, FileText, CheckCircle, RefreshCw, ChevronRight, MessageSquare, Heart, Lock, Mail, ShieldAlert, Award, ShieldCheck, Menu, Cookie, BookOpen, ExternalLink,
  Landmark, Megaphone, Tag, Briefcase
} from 'lucide-react';
import { apiRequest } from '../../services/api.js';
import { login, logout } from '../../store/slices/authSlice.js';
import { getStoredMatingPets } from '../../data/breedingData.js';
import toast from 'react-hot-toast';
import SuperAdminPlatformWalletView from '../../components/dashboards/SuperAdminPlatformWalletView.jsx';
import AnnouncementsManagerView from '../../components/dashboards/AnnouncementsManagerView.jsx';
import CouponsManagerView from '../../components/dashboards/CouponsManagerView.jsx';
import BlogsManagerView from '../../components/dashboards/BlogsManagerView.jsx';
import CrmAccessManagerView from '../../components/dashboards/CrmAccessManagerView.jsx';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Tab control
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Stats and lists states
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [charts, setCharts] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [studsList, setStudsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [consentsList, setConsentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription verification modal state
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [activePresc, setActivePresc] = useState(null);
  const [prescNotes, setPrescNotes] = useState('');

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'SUPERADMIN') {
      loadStats();
      loadOrders();
      loadPrescriptions();
      loadAdminMarketplaceData();
      loadUsers();
      loadEnquiries();
      loadConsents();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (activeSection === 'enquiries') {
      loadEnquiries();
    }
    if (activeSection === 'consents') {
      loadConsents();
    }
  }, [activeSection]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/dashboard');
      if (data && data.success && data.stats) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setCharts(data.charts || null);
      } else {
        throw new Error('Incomplete stats received');
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiRequest('/orders');
      if (data && data.success) {
        setOrdersList(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const data = await apiRequest('/prescriptions');
      if (data && data.success) {
        setPrescriptionsList(Array.isArray(data.prescriptions) ? data.prescriptions : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminMarketplaceData = async () => {
    try {
      const lData = await apiRequest('/listings');
      if (lData && lData.success) {
        setListingsList(Array.isArray(lData.listings) ? lData.listings : (Array.isArray(lData.data) ? lData.data : []));
      }

      let fetchedStuds = [];
      try {
        const sData = await apiRequest('/breeding');
        if (sData && sData.success) {
          fetchedStuds = Array.isArray(sData.studs) ? sData.studs : (Array.isArray(sData.data) ? sData.data : []);
        }
      } catch (err) {
        console.warn('API /breeding fetch error, using local fallback:', err);
      }

      // If backend has no studs or fails, merge with stored mating pets from breeding data
      if (!fetchedStuds || fetchedStuds.length === 0) {
        try {
          const localPets = getStoredMatingPets() || [];
          fetchedStuds = localPets.map((p) => ({
            _id: p.id,
            id: p.id,
            studName: p.name,
            breed: p.breed,
            age: p.age,
            kciNumber: p.kciNumber || (p.kciRegistered ? 'KCI-VERIFIED' : 'Pending KCI'),
            studFee: p.price || 0,
            user: { name: p.parentName || 'Verified Breeder' },
            contactPhone: p.parentPhone || p.whatsappNumber || '+91 98765 43210',
            isVerified: Boolean(p.isVerified)
          }));
        } catch (e) {
          console.warn('Local mating pets fetch error:', e);
        }
      }

      setStudsList(Array.isArray(fetchedStuds) ? fetchedStuds : []);

      const bData = await apiRequest('/bookings');
      if (bData && bData.success) {
        setBookingsList(Array.isArray(bData.bookings) ? bData.bookings : (Array.isArray(bData.data) ? bData.data : []));
      }
    } catch (err) {
      console.error('Error loading admin marketplace data:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiRequest('/admin/users');
      if (data && data.success) {
        setUsersList(Array.isArray(data.users) ? data.users : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEnquiries = async () => {
    try {
      const data = await apiRequest('/enquiries');
      if (data && data.success) {
        const list = Array.isArray(data.enquiries) ? data.enquiries : [];
        setEnquiriesList(list);
        setStats(prev => prev ? { ...prev, enquiriesCount: list.length } : prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const data = await apiRequest(`/enquiries/${id}`, { method: 'DELETE' });
      if (data && data.success) {
        toast.success('Enquiry message removed');
        setEnquiriesList(prev => prev.filter(e => (e._id || e.id) !== id));
        setStats(prev => prev ? { ...prev, enquiriesCount: Math.max(0, (prev.enquiriesCount || 1) - 1) } : prev);
      } else {
        throw new Error(data?.message || 'Failed to delete');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete enquiry');
    }
  };

  const loadConsents = async () => {
    try {
      const data = await apiRequest('/cookie-consents');
      if (data && data.success) {
        setConsentsList(Array.isArray(data.consents) ? data.consents : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const data = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (data.success) {
        toast.success(`User role updated to ${newRole}`);
        loadUsers();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const data = await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        toast.success('User deleted successfully.');
        loadUsers();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  const handleDeleteConsent = async (consentId) => {
    if (!consentId || consentId === 'undefined') {
      toast.error('Unable to delete: Invalid or missing consent ID.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this cookie consent log?')) return;
    try {
      const data = await apiRequest(`/cookie-consents/${consentId}`, {
        method: 'DELETE'
      });
      if (data && data.success) {
        toast.success('Cookie consent log removed.');
        loadConsents();
      } else {
        throw new Error(data?.message || 'Failed to delete consent');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete consent.');
    }
  };

  // ==========================================
  // ADMIN AUTHENTICATION SUBMIT
  // ==========================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error('Please enter both SUPER ADMIN EMAIL and password.');
      return;
    }
    setLoginLoading(true);
    const result = await dispatch(login({ email: adminEmail, password: adminPassword }));
    setLoginLoading(false);

    if (login.fulfilled.match(result)) {
      const loggedUser = result.payload.user;
      if (loggedUser.role === 'SUPERADMIN') {
        toast.success('Successfully authenticated as Super Administrator!');
      } else {
        toast.error('Access Denied: Standard customer accounts cannot access the admin console.');
        dispatch(logout());
      }
    } else {
      toast.error(result.payload || 'Invalid administrator credentials.');
    }
  };

  // ==========================================
  // ORDER ACTIONS HANDLERS
  // ==========================================

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const data = await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadOrders();
        loadStats();
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  // ==========================================
  // PRESCRIPTION VERIFICATION HANDLERS
  // ==========================================

  const handleOpenVerifyPresc = (p) => {
    setActivePresc(p);
    setPrescNotes(p.reviewNotes || '');
    setShowPrescModal(true);
  };

  const handleVerifyPrescription = async (status) => {
    try {
      const data = await apiRequest(`/prescriptions/${activePresc._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          reviewNotes: prescNotes
        })
      });
      if (data.success) {
        toast.success(`Prescription ${status.toLowerCase()}!`);
        setShowPrescModal(false);
        loadPrescriptions();
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    }
  };

  // ==========================================
  // INDIA PET HUB MODERATION HANDLERS
  // ==========================================

  const handleVerifyListing = async (listingId, isVerified) => {
    try {
      const data = await apiRequest(`/listings/${listingId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (data.success) {
        toast.success(isVerified ? 'Classified listing verified!' : 'Listing verification revoked.');
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error(`Error: ${err.message || 'Listing verification failed.'}`);
      console.error(err);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const data = await apiRequest(`/listings/${listingId}`, {
        method: 'DELETE'
      });
      if (data.success) {
        toast.success('Classified listing removed.');
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Deletion failed.');
    }
  };

  const handleVerifyStud = async (studId, isVerified) => {
    try {
      const data = await apiRequest(`/breeding/${studId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (data && data.success) {
        toast.success(isVerified ? 'Stud KCI certification approved!' : 'KCI status revoked.');
      } else {
        throw new Error(data?.message || 'Verification update failed');
      }
    } catch (err) {
      // Local fallback for offline/client state
      try {
        const localPets = getStoredMatingPets() || [];
        const updatedLocal = localPets.map((p) => {
          if (String(p.id) === String(studId) || String(p._id) === String(studId)) {
            return { ...p, isVerified };
          }
          return p;
        });
        localStorage.setItem('joshpetshub_mating_pets_v4', JSON.stringify(updatedLocal));
        toast.success(isVerified ? 'Stud KCI certification approved!' : 'KCI status revoked.');
      } catch (e) {
        toast.error('Breeding verification failed.');
      }
    } finally {
      loadAdminMarketplaceData();
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const data = await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (data.success) {
        toast.success(`Booking appointment status updated to ${status}`);
        loadAdminMarketplaceData();
      }
    } catch (err) {
      toast.error('Booking status update failed.');
    }
  };

  const COLORS = ['#1D3B2E', '#7CA085', '#C2D3C6', '#A1C0AA', '#DFE5DF'];

  // CONDITIONAL RENDER: IF NOT ADMIN, RENDER THE ADMIN SIGN IN PANEL INSTEAD OF REDIRECTING
  if (!isAuthenticated || (user && user.role !== 'SUPERADMIN')) {
    return (
      <div className="min-h-auto lg:h-screen bg-[#F4F6F4] flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-white border border-[#E3EBE5] p-8 shadow-md space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold">JOSH PETS HUB</span>
            <h2 className="font-serif text-xl font-bold text-primary">Super Admin Gateway</h2>
            <p className="text-xs text-gray-400">Please authenticate with super administrator credentials.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="SUPER ADMIN EMAIL"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full btn-premium py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              {loginLoading ? 'AUTHENTICATING...' : 'ACCESS CONSOLE'}
            </button>
          </form>

          {/* Demo Details box */}
          <div className="bg-[#F1F6F2] p-4 border border-[#E3EBE5] text-[10px] text-gray-500 leading-relaxed space-y-1">
            <p className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#7CA085]" /> Super Admin Credentials Notice
            </p>
            <p><strong>Admin Email:</strong> superadmin@joshpetshub.com</p>
            <p><strong>Password:</strong> SuperAdmin@123</p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-[10px] text-gray-400 hover:text-primary uppercase tracking-widest font-semibold cursor-pointer"
            >
              ← Back to main site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DYNAMIC EXECUTIVE CONSOLE FOR LOGGED-IN ADMINS WITH VERTICAL SIDEBAR
  return (
    <div className="min-h-screen lg:h-screen bg-[#F4F6F4] flex flex-col lg:flex-row overflow-hidden">

      {/* 1. LEFT SIDEBAR PANEL (Width 250px) */}
      <aside className="w-full lg:w-64 bg-gradient-to-b from-[#1D3B2E] to-[#0F2E23] text-white flex flex-col shrink-0 border-r border-white/5 shadow-2xl relative z-40 lg:h-screen lg:overflow-y-auto">
        
        {/* Logo & Mobile Toggle */}
        <div className="p-4 lg:p-6 border-b border-[#2E5947]/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="JOSH PETS HUB" className="h-8 w-auto object-contain" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold block">CONTROL PANEL</span>
              <h1 className="font-serif text-base font-bold tracking-wider text-[#FAFBF9] mt-0.5 whitespace-nowrap">
                JOSH PETS HUB
              </h1>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Expandable Content */}
        <div className={`flex flex-col flex-grow justify-between p-4 lg:p-6 pt-4 lg:pt-8 transition-all duration-300 ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
          <div className="space-y-8">

            {/* Tab Selection Lists */}
            <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Stats Overview', icon: <TrendingUp size={15} /> },
              { id: 'crm_access', label: 'CRM Staff & Roles', icon: <Briefcase size={15} /> },
              { id: 'wallet', label: 'Central Wallet & Payouts', icon: <Landmark size={15} /> },
              { id: 'announcements', label: 'Announcement Bar', icon: <Megaphone size={15} /> },
              { id: 'coupons', label: 'Offer Codes & Discounts', icon: <Tag size={15} /> },
              { id: 'blogs', label: 'Pet Care Blogs', icon: <BookOpen size={15} /> },
              { id: 'orders', label: 'Client Orders', icon: <ShoppingBag size={15} /> },
              { id: 'prescriptions', label: 'Rx Verifications', icon: <FileText size={15} /> },
              { id: 'listings', label: 'Moderate Listings', icon: <Heart size={15} /> },
              { id: 'studs', label: 'Verify Breeders', icon: <Award size={15} /> },
              { id: 'bookings', label: 'Services Bookings', icon: <Clock size={15} /> },
              { id: 'users', label: 'Registered Users', icon: <Users size={15} /> },
              { id: 'enquiries', label: 'Contact Enquiries', icon: <Mail size={15} /> },
              { id: 'consents', label: 'Cookie Consents', icon: <Cookie size={15} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSection(tab.id);
                  setIsMobileMenuOpen(false);
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      const el = document.getElementById('superadmin-main-content');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 50);
                  });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-r-md rounded-l-none transition-all duration-300 cursor-pointer ${activeSection === tab.id
                    ? 'bg-white/10 backdrop-blur-md text-white border-l-4 border-accent shadow-sm'
                    : 'text-[#C2D3C6] hover:bg-white/5 hover:text-[#FAFBF9] border-l-4 border-transparent'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer profile & Logout */}
        <div className="border-t border-[#2E5947] pt-4 mt-8 text-xs space-y-3">
          <div>
            <p className="font-bold text-[#FAFBF9] truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-[#A1C0AA] truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="w-full py-2 border border-[#7CA085]/35 hover:border-red-500 hover:text-red-500 rounded-md text-[10px] tracking-widest uppercase font-bold text-[#7CA085] hover:bg-red-500/10 transition cursor-pointer"
          >
            LOGOUT
          </button>
        </div>
        </div>
      </aside>

      {/* 2. RIGHT VIEW MAIN CONSOLE */}
      <main id="superadmin-main-content" className="flex-grow flex flex-col h-full min-w-0 overflow-hidden">

        {/* Top bar Header */}
        <div className="shrink-0 bg-[#F4F6F4] border-b border-[#E3EBE5] px-4 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xs gap-4 z-20">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7CA085] font-bold block">ADMINISTRATION PORTAL</span>
            <h2 className="font-serif text-3xl text-primary font-bold mt-1">
              {activeSection === 'overview' && 'Executive Metrics Overview'}
              {activeSection === 'crm_access' && 'CRM Access Control & Staff Roles Manager'}
              {activeSection === 'wallet' && 'Central Platform Wallet & Service Provider Payouts'}
              {activeSection === 'announcements' && 'Header Announcement Bar & Offers Ticker'}
              {activeSection === 'coupons' && 'Offer Codes & Promotional Discounts Manager'}
              {activeSection === 'blogs' && 'Pet Care Blogs & Articles Manager'}
              {activeSection === 'orders' && 'Client Transaction Logs'}
              {activeSection === 'prescriptions' && 'Vet Prescriptions Review'}
              {activeSection === 'listings' && 'Classified Listings Moderation'}
              {activeSection === 'studs' && 'Breeder KCI Validations'}
              {activeSection === 'bookings' && 'Care Appointment Bookings'}
              { activeSection === 'users' && 'Registered Users Management' }
              { activeSection === 'enquiries' && 'Contact Form Enquiries' }
              { activeSection === 'consents' && 'Cookie Consent Logs' }
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/?preview=guest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-premium !py-2 !px-4 !text-[10px] gap-2 flex items-center hover:bg-white/10"
              title="Open public home page without login in a new tab"
            >
              <ExternalLink size={14} /> VIEW LIVE SITE
            </a>
            <button
              onClick={() => { 
                loadStats(); 
                loadAdminMarketplaceData(); 
                loadUsers(); 
                loadEnquiries(); 
                loadOrders(); 
                loadPrescriptions(); 
                loadConsents();
              }}
              className="btn-secondary-premium !py-2 !px-4 !text-[10px] gap-2 flex items-center"
            >
              <RefreshCw size={14} /> REFRESH STATS
            </button>
          </div>
        </div>

        {/* Scrollable Main Content Area */}
        <div className="flex-grow p-4 lg:p-8 overflow-y-auto min-h-0">

        {loading ? (
          <div className="text-center py-10 lg:py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#7CA085] mx-auto mb-4"></div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Compiling metrics logs...
            </p>
          </div>
        ) : activeSection === 'overview' && !stats ? (
          <div className="text-center py-10 lg:py-20">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">
              Unable to load statistics data.
            </p>
            <button
              onClick={loadStats}
              className="btn-premium !py-2 !px-4 !text-xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 1: OVERVIEW */}
            {activeSection === 'overview' && stats && (
              <div className="space-y-8 animate-in fade-in duration-200">

                {/* Summary Cards Row with compact tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                  {[
                    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <TrendingUp size={16} />, iconBg: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Total Orders', value: stats.ordersCount, icon: <ShoppingBag size={16} />, iconBg: 'bg-blue-50 text-blue-600' },
                    { label: 'Customers', value: stats.usersCount, icon: <Users size={16} />, iconBg: 'bg-purple-50 text-purple-600' },
                    { label: 'Total SKU Count', value: stats.productsCount, icon: <Layers size={16} />, iconBg: 'bg-amber-50 text-amber-600' },
                    { label: 'Products Sold', value: stats.soldProductsCount || 0, icon: <CheckCircle size={16} />, iconBg: 'bg-teal-50 text-teal-600' },
                    { label: 'Unsold Products', value: stats.unsoldProductsCount || 0, icon: <X size={16} />, iconBg: 'bg-gray-100 text-gray-600' },
                    { label: 'Pending Orders', value: stats.pendingOrdersCount, icon: <Clock size={16} />, iconBg: 'bg-orange-50 text-orange-600' },
                    { label: 'Low Stock Alert', value: stats.lowStockCount, icon: <AlertTriangle size={16} />, iconBg: 'bg-rose-50 text-rose-600' },
                    { label: 'New Enquiries', value: stats.enquiriesCount || 0, icon: <Mail size={16} />, iconBg: 'bg-indigo-50 text-indigo-600' }
                  ].map((c) => (
                    <div key={c.label} className="card-premium p-3.5 sm:p-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="text-[9.5px] uppercase font-bold text-gray-500 tracking-wider w-2/3 leading-tight">{c.label}</span>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${c.iconBg}`}>
                          {c.icon}
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold font-serif text-primary truncate">{c.value}</p>
                    </div>
                  ))}
                </div>

                {/* Analytical Charts */}
                {charts && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Revenue over time */}
                    <div className="lg:col-span-8 card-premium p-6 space-y-4">
                      <h3 className="font-serif text-sm font-bold text-primary border-b border-[#E3EBE5] pb-2">Sales Revenue History</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={charts.salesHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE5" />
                            <XAxis dataKey="month" stroke="#A99B8C" fontSize={10} />
                            <YAxis stroke="#A99B8C" fontSize={10} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Sales (INR)" stroke="#1D3B2E" strokeWidth={2.5} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="orders" name="Order count" stroke="#7CA085" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Category distributions */}
                    <div className="lg:col-span-4 card-premium p-6 space-y-4">
                      <h3 className="font-serif text-sm font-bold text-primary border-b border-[#E3EBE5] pb-2">Department Distributions</h3>
                      <div className="h-72 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={charts.categorySales}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {charts.categorySales.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Orders Overview */}
                <div className="card-premium space-y-0">
                  <div className="p-6 border-b border-[#E3EBE5]">
                    <h3 className="font-serif text-lg font-bold text-primary">Recent Order Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                          <th className="p-4 uppercase tracking-wider text-[10px]">Order ID</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Customer</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Method</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Shipping Status</th>
                          <th className="p-4 uppercase tracking-wider text-[10px] text-right">Total (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE5]">
                        {recentOrders.map((o) => (
                          <tr key={o._id || o.id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                            <td className="p-4 font-semibold text-primary">{o._id || o.id || o.orderNumber}</td>
                            <td className="p-4">
                              <p className="font-bold text-sm">{o.user?.name || o.customer?.name || 'Customer'}</p>
                              <p className="text-[10px] text-gray-500">{o.user?.email || o.customer?.email || 'N/A'}</p>
                            </td>
                            <td className="p-4 text-xs font-medium text-gray-600">{o.paymentMethod || o.payment_method || 'COD'}</td>
                            <td className="p-4 font-bold uppercase text-[10px] tracking-wider text-accent">{o.shippingStatus || o.shipping_status || 'Pending'}</td>
                            <td className="p-4 text-right font-bold text-primary text-sm">₹{o.pricing?.total ?? o.grand_total ?? o.grandTotal ?? o.totalPrice ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* SECTION: CRM ACCESS & STAFF ROLES */}
            {activeSection === 'crm_access' && (
              <CrmAccessManagerView />
            )}

            {/* SECTION: PLATFORM WALLET & PAYOUTS */}
            {activeSection === 'wallet' && (
              <SuperAdminPlatformWalletView />
            )}

            {/* SECTION: ANNOUNCEMENT BAR & OFFERS TICKER */}
            {activeSection === 'announcements' && (
              <AnnouncementsManagerView />
            )}

            {/* SECTION: OFFER CODES & DISCOUNTS */}
            {activeSection === 'coupons' && (
              <CouponsManagerView />
            )}

            {/* SECTION 3: CLIENT ORDERS MANAGER */}
            {activeSection === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Client Order Logs ({ordersList.length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">Order ID</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Date</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Customer info</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-right">Pricing (INR)</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Shipping Status</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5]">
                      {ordersList.map((o) => (
                        <tr key={o._id || o.id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                          <td className="p-4 font-semibold text-primary">{o._id || o.id || o.orderNumber}</td>
                          <td className="p-4">{o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString() : 'Recent'}</td>
                          <td className="p-4">
                            <p className="font-bold">{o.user?.name || o.customer?.name || 'Customer'}</p>
                            <p className="text-[10px] text-gray-400">{o.user?.email || o.customer?.email || 'N/A'}</p>
                          </td>
                          <td className="p-4 text-right font-bold text-primary text-sm">₹{o.pricing?.total ?? o.grand_total ?? o.grandTotal ?? o.totalPrice ?? 0}</td>
                          <td className="p-4">
                            <span className={`font-bold uppercase text-[10px] ${o.shippingStatus === 'Delivered' ? 'text-green-600' :
                                o.shippingStatus === 'Cancelled' ? 'text-red-500' : 'text-accent'
                              }`}>{o.shippingStatus}</span>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={o.shippingStatus}
                              onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="bg-transparent border border-[#E3EBE5] p-1 font-bold text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Refunded">Refunded</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 4: RX VERIFICATIONS MANAGER */}
            {activeSection === 'prescriptions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Prescriptions Queue ({prescriptionsList.length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">Presc ID</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Upload Date</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Customer info</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Patient & Doctor details</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Review Status</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Verify Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {prescriptionsList.map((p) => (
                        <tr key={p._id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                          <td className="p-4 font-semibold text-primary">{p._id}</td>
                          <td className="p-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <p className="font-bold">{p.user?.name || p.patientName || p.doctor_name || 'Customer'}</p>
                            <p className="text-[10px] text-gray-400">{p.user?.email || p.clinicName || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-primary">Pet: {p.patientName}</p>
                            <p className="text-[10px] text-gray-400">Dr. {p.veterinarianName} ({p.clinicName || 'No Clinic'})</p>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold uppercase text-[10px] ${p.status === 'Approved' ? 'text-green-600' :
                                p.status === 'Rejected' ? 'text-red-500' : 'text-accent'
                              }`}>{p.status}</span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleOpenVerifyPresc(p)}
                              className="px-3 py-1.5 border border-[#E3EBE5] hover:border-primary text-[10px] tracking-wider uppercase font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <FileText size={12} /> EVALUATE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 5: CLASSIFIED LISTINGS MODERATION */}
            {activeSection === 'listings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Moderate Classified Listings ({(listingsList || []).length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">Listing Details</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Inventory</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Owner Contact</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Price</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Location</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Verification Stamp</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {listingsList.map((l) => (
                        <tr key={l._id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                          <td className="p-4 space-y-1">
                            <p className="font-bold text-primary">{l.title}</p>
                            <p className="text-[10px] text-gray-400">Breed: {l.breed} • Age: {l.age}</p>
                          </td>
                          <td className="p-4 space-y-1">
                            {l.status === 'Sold Out' || l.quantity === 0 ? (
                              <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider inline-block">
                                SOLD OUT
                              </span>
                            ) : (
                              <>
                                <p className="font-bold text-primary text-[11px]">Available: {l.quantity || 1}</p>
                                <p className="text-[10px] text-gray-400">Sold: {l.soldCount || 0}</p>
                              </>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">{l.user?.name || l.title || 'Pet Owner'}</p>
                            <p className="text-[10px] text-gray-400">{l.contactPhone || 'N/A'}</p>
                          </td>
                          <td className="p-3 font-bold text-primary">
                            {l.price === 0 ? 'Free Rehoming' : `₹${l.price}`}
                          </td>
                          <td className="p-4">{l.location}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleVerifyListing(l._id, !l.isVerified)}
                              className={`px-3 py-1.5 font-bold tracking-widest text-[9px] uppercase transition cursor-pointer ${l.isVerified
                                  ? 'bg-[#FAFBF9] text-green-700 border border-green-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                                }`}
                            >
                              {l.isVerified ? 'VERIFIED' : 'PENDING'}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteListing(l._id)}
                              className="p-2 border border-beige hover:border-red-500 hover:text-red-500 transition cursor-pointer"
                            >
                              <Trash size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 6: BREEDERS & STUDS MODERATION */}
            {activeSection === 'studs' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Verify Breeder KCI Registrations ({(studsList || []).length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">Stud Profile</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">KCI License No.</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Breeder Contact</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Stud Fee</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Breeder Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {(!studsList || studsList.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                            No breeder or stud listings submitted for verification yet.
                          </td>
                        </tr>
                      ) : (
                        studsList.map((s) => (
                          <tr key={s._id || s.id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-primary">{s.studName || s.name || 'Unnamed Stud'}</p>
                              <p className="text-[10px] text-gray-400">Breed: {s.breed || 'Unknown'} • Age: {s.age || 'N/A'}</p>
                            </td>
                            <td className="p-3 font-semibold text-gray-500 uppercase">{s.kciNumber || 'Pending KCI'}</td>
                            <td className="p-4">
                              <p className="font-semibold">{s.user?.name || s.parentName || 'Breeder'}</p>
                              <p className="text-[10px] text-gray-400">{s.contactPhone || s.parentPhone || 'No phone'}</p>
                            </td>
                            <td className="p-3 font-bold text-primary">₹{(s.studFee ?? s.price ?? 0).toLocaleString('en-IN')}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleVerifyStud(s._id || s.id, !s.isVerified)}
                                className={`px-3 py-1.5 font-bold tracking-widest text-[9px] uppercase transition cursor-pointer ${s.isVerified
                                    ? 'bg-[#FAFBF9] text-green-700 border border-green-200'
                                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                                  }`}
                              >
                                {s.isVerified ? 'KCI CERTIFIED' : 'PENDING CHECK'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 7: GLOBAL APPOINTMENTS BOOKINGS */}
            {activeSection === 'bookings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Service Appointments & Bookings ({(bookingsList || []).length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">Appointment ID</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Service & Provider</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Customer & Pet</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Date & Time Slot</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Consultation Fee</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Booking Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {bookingsList.map((b) => (
                        <tr key={b._id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                          <td className="p-4 font-semibold text-primary">{b._id}</td>
                          <td className="p-4 space-y-1">
                            <p className="font-bold text-primary">{b.serviceType}</p>
                            <p className="text-[10px] text-gray-400">Dr./Groomer: {b.providerName}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">{b.user?.name || b.customerName || b.ownerName || 'Client'}</p>
                            <p className="text-[10px] text-[#7CA085] uppercase font-bold">Pet: {b.petDetails?.name || b.petName || 'Pet'} ({b.petDetails?.breed || b.petBreed || 'Breed'})</p>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="font-semibold">{b.date}</p>
                            <p className="text-[10px] text-gray-400">{b.timeSlot}</p>
                          </td>
                          <td className="p-3 font-bold text-primary">₹{b.fee}</td>
                          <td className="p-4 text-center">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                              className="bg-transparent border border-beige p-1 font-bold text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 8: REGISTERED USERS MANAGER */}
            {activeSection === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h2 className="font-serif text-lg font-bold text-primary border-b border-[#E3EBE5] pb-3">Registered Accounts ({(usersList || []).length})</h2>

                <div className="card-premium overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                        <th className="p-4 uppercase tracking-wider text-[10px]">User Name</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Email Address</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Phone</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Location</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Category</th>
                        <th className="p-4 uppercase tracking-wider text-[10px]">Current Role</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Change Role</th>
                        <th className="p-4 uppercase tracking-wider text-[10px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3EBE5] text-xs">
                      {usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                          <td className="p-3 font-semibold text-primary flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#FAFBF9] border border-[#E3EBE5] flex items-center justify-center font-serif text-[10px] text-primary font-bold">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-4 font-semibold text-gray-500">{u.email}</td>
                          <td className="p-4">{u.mobile || 'N/A'}</td>
                          <td className="p-4">{u.location || 'N/A'}</td>
                          <td className="p-4">{u.serviceCategory || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : u.role === 'SERVICE_PROVIDER'
                                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                : 'bg-[#FAFBF9] text-gray-600 border border-[#E3EBE5]'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                              className="bg-transparent border border-beige p-1 font-bold text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="SERVICE_PROVIDER">Service Provider</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 border border-beige hover:border-red-500 hover:text-red-500 transition cursor-pointer text-gray-500"
                              title="Delete user"
                            >
                              <Trash size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PILLAR TAB 9: CONTACT ENQUIRIES MANAGER */}
            {activeSection === 'enquiries' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E3EBE5] pb-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-primary">Contact Form Submissions ({(enquiriesList || []).length})</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time incoming customer questions, prescription support messages, and service enquiries.</p>
                  </div>
                  <button
                    onClick={loadEnquiries}
                    className="btn-secondary-premium !py-1.5 !px-3 !text-[10px] flex items-center gap-1.5 cursor-pointer"
                    title="Reload latest enquiries"
                  >
                    <RefreshCw size={12} /> Refresh Messages
                  </button>
                </div>

                {(!enquiriesList || enquiriesList.length === 0) ? (
                  <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-[#E3EBE5] space-y-2">
                    <Mail size={36} className="mx-auto text-gray-300" />
                    <p className="font-bold text-sm text-primary">No Contact Enquiries Received Yet</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Customer queries submitted via the "Send a Secure Message" form on the Contact page will be instantly logged here.</p>
                  </div>
                ) : (
                  <div className="card-premium overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                          <th className="p-4 uppercase tracking-wider text-[10px]">Sender Name</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Contact Details</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Subject</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Message Body</th>
                          <th className="p-4 uppercase tracking-wider text-[10px]">Date Received</th>
                          <th className="p-4 uppercase tracking-wider text-[10px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3EBE5] text-xs">
                        {enquiriesList.map((e) => (
                          <tr key={e._id || e.id || e.createdAt} className="hover:bg-[#F9FAF9] transition-colors duration-200">
                            <td className="p-4 font-semibold text-primary whitespace-nowrap">
                              <div className="font-bold text-slate-900">{e.name}</div>
                              {e.status && (
                                <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {e.status}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-gray-600">
                              <a href={`mailto:${e.email}`} className="font-semibold text-primary hover:underline block">
                                {e.email}
                              </a>
                              {e.phone && <div className="text-[10px] text-gray-400 mt-0.5">{e.phone}</div>}
                            </td>
                            <td className="p-3 font-bold text-accent">{e.subject}</td>
                            <td className="p-3 text-gray-600 max-w-sm leading-relaxed whitespace-pre-wrap">{e.message}</td>
                            <td className="p-3 text-gray-400 whitespace-nowrap">
                              {e.createdAt || e.created_at ? new Date(e.createdAt || e.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`mailto:${e.email}?subject=Re: ${encodeURIComponent(e.subject || 'Josh Pets Hub Support')}`}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                  title={`Reply to ${e.name} (${e.email})`}
                                >
                                  <Mail size={12} /> Reply
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEnquiry(e._id || e.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                                  title="Delete enquiry"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PILLAR TAB 10: COOKIE CONSENTS MANAGER */}
            {activeSection === 'consents' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-[#E3EBE5] pb-3">
                  <h2 className="font-serif text-lg font-bold text-primary">
                    User Cookie Preferences Logs ({(consentsList || []).length})
                  </h2>
                </div>

                {(!consentsList || consentsList.length === 0) ? (
                  <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-[#E3EBE5] space-y-2">
                    <Cookie size={36} className="mx-auto text-gray-300" />
                    <p className="font-bold text-sm text-primary">No Cookie Consent Logs Found</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">Consent choices captured when visitors interact with the cookie policy banner will appear here.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-beige/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                            <th className="p-4 uppercase tracking-wider text-[10px]">Session / User IP</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Preferences</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Browser / Agent</th>
                            <th className="p-4 uppercase tracking-wider text-[10px] text-right">Date Consented</th>
                            <th className="p-4 uppercase tracking-wider text-[10px] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E3EBE5] text-xs">
                          {(consentsList || []).map((c) => (
                            <tr key={c.id || c._id || c.session_id || c.sessionId} className="hover:bg-[#F9FAF9] transition-colors duration-300">
                              <td className="p-4">
                                <div className="font-bold text-primary truncate max-w-[150px]" title={c.session_id || c.sessionId}>
                                  {c.session_id || c.sessionId || 'Session Log'}
                                </div>
                                <div className="text-[10px] text-gray-500">{c.ip_address || c.ip || 'Local / Unknown IP'}</div>
                              </td>
                              <td className="p-4 space-y-1">
                                <div className="flex gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.preferences?.essential ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>ESSENTIAL</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.preferences?.functional ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>FUNCTIONAL</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.preferences?.analytics ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>ANALYTICS</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.preferences?.marketing ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>MARKETING</span>
                                </div>
                              </td>
                              <td className="p-3 text-gray-600 max-w-[200px] truncate text-[10px]" title={c.user_agent || c.userAgent}>
                                {c.user_agent || c.userAgent || 'Web Client'}
                              </td>
                              <td className="p-3 text-right text-gray-400 font-medium">
                                {(c.created_at || c.createdAt) ? new Date(c.created_at || c.createdAt).toLocaleString() : 'Recent'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteConsent(c.id || c._id || c.session_id || c.sessionId)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Delete Log"
                                >
                                  <Trash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PILLAR TAB 11: PET CARE BLOGS & ARTICLES */}
            {activeSection === 'blogs' && (
              <BlogsManagerView />
            )}

          </>
        )}

        </div>
      </main>

      {/* POPUP MODAL: EVALUATE PRESCRIPTION */}
      {showPrescModal && activePresc && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-primary/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div onClick={() => setShowPrescModal(false)} className="fixed inset-0 bg-transparent"></div>

          <div className="relative bg-white w-full max-w-2xl border border-beige shadow-2xl flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] z-10 my-auto overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 bg-primary text-white flex justify-between items-center border-b border-white/10 shrink-0">
              <h3 className="font-serif text-sm font-bold tracking-wider text-[#7CA085] uppercase flex items-center gap-1.5">
                <FileText size={16} /> Evaluate Prescription Document
              </h3>
              <button onClick={() => setShowPrescModal(false)} className="text-white hover:text-[#7CA085] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs flex flex-col md:flex-row gap-6">
              {/* Document Image view */}
              <div className="w-full md:w-1/2 aspect-square border border-beige bg-gray-50 overflow-hidden shrink-0">
                <a
                  href={activePresc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${activePresc.prescriptionFileUrl}` : activePresc.prescriptionFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Click to view full screen file"
                >
                  <img
                    src={activePresc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${activePresc.prescriptionFileUrl}` : activePresc.prescriptionFileUrl}
                    alt="Prescription Document file scan"
                    className="w-full h-full object-contain cursor-zoom-in"
                  />
                </a>
              </div>

              {/* Review Info */}
              <div className="flex-grow space-y-4">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Customer Details</p>
                  <p className="font-bold text-primary">{activePresc.user?.name} ({activePresc.user?.email})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Patient Pet Name</p>
                  <p className="font-bold text-primary">{activePresc.patientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium">Doctor Name & Clinic</p>
                  <p className="font-bold text-primary">Dr. {activePresc.veterinarianName} ({activePresc.clinicName || 'None'})</p>
                </div>
                {activePresc.customerComments && (
                  <div className="space-y-1 bg-secondary p-2.5 border border-beige">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Customer Comments</p>
                    <p className="text-[11px] leading-relaxed text-gray-600">{activePresc.customerComments}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pharmacist Review Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter stamp checks, validation approvals or rejection reason notes..."
                    value={prescNotes}
                    onChange={(e) => setPrescNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button
                onClick={() => handleVerifyPrescription('Rejected')}
                className="px-4 py-2 border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold tracking-widest text-[10px] uppercase transition cursor-pointer"
              >
                REJECT SLIP
              </button>
              <button
                onClick={() => handleVerifyPrescription('Approved')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold tracking-widest text-[10px] uppercase transition cursor-pointer"
              >
                APPROVE PRESCRIPTION
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
