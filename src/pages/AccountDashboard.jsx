import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, MapPin, ClipboardList, ShoppingBag, Plus, Trash2, CircleCheck,
  ShieldAlert, Clock, LogOut, Heart, ShieldCheck, MessageSquare, Phone,
  ExternalLink, Check, AlertCircle, ArrowRight, Sparkles, Filter, ChevronRight,
  Truck
} from 'lucide-react';
import { 
  fetchProfile, 
  updateProfile, 
  addUserAddress, 
  removeUserAddress, 
  logout 
} from '../store/slices/authSlice.js';
import { 
  getUserAdoptionApplications, 
  getGuardianListedPets, 
  getGuardianAdoptionApplications, 
  updateAdoptionApplicationStatus 
} from '../data/adoptionPetsData.js';
import { 
  getUserTransportEnquiries, 
  getStoredTransportEnquiries 
} from '../data/transportData.js';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  // Navigation Tabs state
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'orders');

  // Form Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Form Address State
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // History logs states
  const [orders, setOrders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Adoption applications & listed pets states
  const [userAdoptionApps, setUserAdoptionApps] = useState([]);
  const [guardianPets, setGuardianPets] = useState([]);
  const [guardianApps, setGuardianApps] = useState([]);

  // Transport relocation enquiries states
  const [userTransportEnquiries, setUserTransportEnquiries] = useState([]);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'SERVICE_PROVIDER') {
      navigate('/provider-dashboard', { replace: true });
    } else {
      dispatch(fetchProfile());
      loadUserHistory();
      loadAdoptionData();
      loadTransportData();
    }
  }, [isAuthenticated, user?.role, dispatch, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      loadAdoptionData();
      loadTransportData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleEnquiryUpdated = () => {
      loadTransportData();
    };
    window.addEventListener('transport-enquiry-updated', handleEnquiryUpdated);
    window.addEventListener('transport-enquiry-created', handleEnquiryUpdated);
    return () => {
      window.removeEventListener('transport-enquiry-updated', handleEnquiryUpdated);
      window.removeEventListener('transport-enquiry-created', handleEnquiryUpdated);
    };
  }, [user]);

  const loadTransportData = () => {
    if (user) {
      const enquiries = getUserTransportEnquiries(user);
      setUserTransportEnquiries(enquiries);
    }
  };

  const loadUserHistory = async () => {
    setHistoryLoading(true);
    try {
      const ordersData = await apiRequest('/orders/myorders');
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }
      const prescData = await apiRequest('/prescriptions/my');
      if (prescData.success) {
        setPrescriptions(prescData.prescriptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAdoptionData = () => {
    if (user) {
      const myApps = getUserAdoptionApplications(user);
      setUserAdoptionApps(myApps);

      const myPets = getGuardianListedPets(user);
      setGuardianPets(myPets);

      const receivedApps = getGuardianAdoptionApplications(user);
      setGuardianApps(receivedApps);
    }
  };

  const handleUpdateApplicantStatus = (appId, newStatus) => {
    updateAdoptionApplicationStatus(appId, newStatus);
    loadAdoptionData();
    toast.success(`Application status updated to "${newStatus}"!`, {
      icon: '🐾'
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name, email, password }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile details updated successfully!');
      setPassword('');
    } else {
      toast.error(result.payload || 'Profile update failed.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) {
      toast.error('Please enter all address parameters.');
      return;
    }

    const payload = {
      name: addrName,
      phone: addrPhone,
      streetAddress: addrStreet,
      city: addrCity,
      state: addrState,
      postalCode: addrZip,
      isDefault: user.addresses.length === 0
    };

    const result = await dispatch(addUserAddress(payload));
    if (addUserAddress.fulfilled.match(result)) {
      toast.success('Address added to your book!');
      setShowAddressForm(false);
      // Clear address inputs
      setAddrName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } else {
      toast.error('Could not save address.');
    }
  };

  const handleRemoveAddress = (addressId) => {
    dispatch(removeUserAddress(addressId));
    toast.success('Address removed.');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully.');
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CircleCheck size={12} className="text-emerald-700" /> Approved & Ready
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            <Phone size={12} className="text-purple-700" /> Guardian Contacted
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} className="text-amber-700" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert size={12} className="text-rose-700" /> Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            <Clock size={12} className="text-blue-700" /> Application Submitted
          </span>
        );
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent"></div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      
      {/* Overview Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-beige pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
              {user.role === 'SERVICE_PROVIDER' ? 'SERVICE PROVIDER PORTAL' : 'CUSTOMER AREA'}
            </span>
            {user.role === 'SERVICE_PROVIDER' && (
              <span className="text-[10px] font-bold bg-blue-100 text-[#15559c] px-2 py-0.5 rounded-md uppercase tracking-wider">
                {user.serviceCategory || 'Service Partner'}
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium">
            Welcome Back, {user.name}
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Logged in as <strong className="text-gray-600">{user.email}</strong>
            {user.mobile && <span> • Mobile: <strong className="text-gray-600">{user.mobileCountryCode || '+91'} {user.mobile}</strong></span>}
            {user.whatsapp && <span> • WhatsApp: <strong className="text-emerald-700">{user.whatsappCountryCode || '+91'} {user.whatsapp}</strong></span>}
            {user.purpose && <span> • Purpose: <strong className="text-primary font-bold">✨ {user.purpose}</strong></span>}
            {user.location && <span> • Location: <strong className="text-gray-600">{user.location}</strong></span>}
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-beige hover:border-red-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut size={14} /> LOGOUT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (Left 3 Columns) */}
        <aside className="lg:col-span-3 bg-white border border-beige p-6 space-y-2 shadow-sm rounded-xl">
          {[
            { id: 'orders', label: 'Order History', icon: <ShoppingBag size={16} /> },
            { 
              id: 'transport-enquiries', 
              label: `Pet Relocation (${userTransportEnquiries.length})`, 
              icon: <Truck size={16} className={userTransportEnquiries.length > 0 ? 'text-emerald-700' : ''} /> 
            },
            { 
              id: 'my-applications', 
              label: `My Adoption Enquiries (${userAdoptionApps.length})`, 
              icon: <Heart size={16} className={userAdoptionApps.length > 0 ? 'text-rose-500' : ''} /> 
            },
            { 
              id: 'adoption-listings', 
              label: `My Listed Pets (${guardianPets.length})`, 
              icon: <ShieldCheck size={16} className={guardianPets.length > 0 ? 'text-[#7c56dc]' : ''} /> 
            },
            { id: 'prescriptions', label: 'Prescriptions', icon: <ClipboardList size={16} /> },
            { id: 'addresses', label: 'Address Book', icon: <MapPin size={16} /> },
            { id: 'profile', label: 'Profile Details', icon: <User size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition rounded-lg text-left cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-primary text-white font-bold shadow-sm' 
                  : 'text-gray-500 hover:bg-secondary hover:text-primary'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Dynamic Display Panel (Right 9 Columns) */}
        <div className="lg:col-span-9 bg-white border border-beige p-6 md:p-8 shadow-sm rounded-xl">
          
          {/* =========================================================================
              TAB 1: ORDER HISTORY
             ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Order History
              </h2>
              
              {historyLoading ? (
                <p className="text-xs text-gray-400">Loading orders...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-beige p-5 text-xs space-y-4 rounded-xl">
                      {/* Top metadata */}
                      <div className="flex flex-wrap justify-between items-center bg-secondary p-3 border-b border-beige gap-2 rounded-lg">
                        <div>
                          <p className="text-gray-400 font-medium">ORDER ID</p>
                          <p className="font-bold text-primary">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">DATE PLACED</p>
                          <p className="font-semibold text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">SHIPPING STATUS</p>
                          <span className={`font-bold uppercase ${
                            order.shippingStatus === 'Delivered' ? 'text-green-600' :
                            order.shippingStatus === 'Cancelled' ? 'text-red-500' : 'text-accent'
                          }`}>{order.shippingStatus}</span>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">TOTAL AMOUNT</p>
                          <p className="font-bold text-primary">₹{order.pricing?.total || order.total || 0}</p>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3">
                        {(order.orderItems || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'} alt={item.name} className="w-10 h-10 object-cover bg-gray-100 border border-beige rounded-md" />
                              <div>
                                <p className="font-semibold text-primary truncate max-w-xs">{item.name}</p>
                                <p className="text-[10px] text-gray-400">Qty: {item.quantity} • Price: ₹{item.price}</p>
                              </div>
                            </div>
                            <span className="font-bold text-primary">₹{(item.price || 0) * (item.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking detail */}
                      <div className="flex justify-between items-center border-t border-beige pt-3 text-[11px]">
                        <span className="text-gray-400 font-semibold">Tracking Code: <strong>{order.trackingNumber}</strong></span>
                        {order.prescriptionId && (
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 font-semibold uppercase text-[9px] rounded">
                            Prescription order under review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">You have not placed any orders yet.</p>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: MY ADOPTION ENQUIRIES & APPLICATION STATUS
             ========================================================================= */}
          {activeTab === 'my-applications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-3 gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <Heart size={18} className="text-rose-500" />
                    <span>My Adoption Enquiries ({userAdoptionApps.length})</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track the real-time application and screening status of pets you've applied to adopt.
                  </p>
                </div>
                <Link
                  to="/adopt"
                  className="px-3.5 py-2 bg-[#7c56dc] hover:bg-[#6842c8] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={13} />
                  <span>Browse More Pets</span>
                </Link>
              </div>

              {userAdoptionApps.length > 0 ? (
                <div className="space-y-5">
                  {userAdoptionApps.map((app) => (
                    <div
                      key={app.id}
                      className="border border-purple-100 rounded-2xl p-5 bg-gradient-to-b from-purple-50/20 to-white shadow-xs space-y-4 hover:border-purple-300 transition"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {app.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Applied on: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div>
                          {renderStatusBadge(app.status)}
                        </div>
                      </div>

                      {/* Main Application Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Pet Thumbnail & Basic Info */}
                        <div className="md:col-span-4 flex items-start gap-3">
                          <img
                            src={app.petImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'}
                            alt={app.petName}
                            className="w-16 h-16 rounded-xl object-cover border border-purple-100 shrink-0 bg-purple-50"
                          />
                          <div className="min-w-0">
                            <h3 className="font-serif font-bold text-slate-900 text-sm truncate">
                              {app.petName}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">{app.petBreed}</p>
                            <p className="text-[11px] text-[#7c56dc] font-semibold mt-0.5">{app.petCity}</p>
                            <Link
                              to={`/adopt/${app.petId}`}
                              className="text-[11px] text-[#7c56dc] font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
                            >
                              <span>View Pet Listing</span>
                              <ArrowRight size={11} />
                            </Link>
                          </div>
                        </div>

                        {/* Guardian Contact Info */}
                        <div className="md:col-span-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Guardian</span>
                          <p className="font-bold text-slate-800">{app.guardianName || 'Verified Guardian'}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone size={11} className="text-slate-400" />
                            <span>{app.guardianPhone || '+91 8306-688-827'}</span>
                          </p>

                          <div className="pt-2 flex items-center gap-2">
                            <a
                              href={`https://wa.me/${(app.guardianPhone || '8306688827').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${app.guardianName || 'Guardian'}, I am following up on my adoption application for "${app.petName}" (Ref: ${app.id}) on JOSH PETS HUB.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition shadow-xs"
                            >
                              <MessageSquare size={11} />
                              <span>WhatsApp</span>
                            </a>
                            <a
                              href={`tel:${app.guardianPhone || '8306688827'}`}
                              className="py-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition shadow-xs"
                            >
                              <Phone size={11} />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>

                        {/* Your Application Summary */}
                        <div className="md:col-span-4 bg-purple-50/40 p-3 rounded-xl border border-purple-100 text-xs space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-purple-700 block">Your Submission</span>
                          <p className="text-slate-600">
                            <strong className="text-slate-800">Home:</strong> {app.homeType || 'Apartment'} • <strong className="text-slate-800">Exp:</strong> {app.hasPetExperience || 'Yes'}
                          </p>
                          <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-purple-50 line-clamp-3">
                            "{app.adoptionReason}"
                          </p>
                        </div>
                      </div>

                      {/* Status Advice Box */}
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span className="text-[11px]">
                          {app.status === 'Approved'
                            ? '🎉 Great news! Your application is approved. Coordinate with the guardian to bring your new pet home!'
                            : app.status === 'Contacted'
                            ? '📞 The guardian has initiated contact. Check your WhatsApp/phone calls for updates.'
                            : app.status === 'Under Review'
                            ? '⏳ The guardian is reviewing applications. You will be notified once shortlisted.'
                            : '🐾 Your application is in the queue. The guardian will reach out within 24–48 hours.'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 border border-dashed border-purple-200 rounded-2xl text-center space-y-3 bg-purple-50/20">
                  <div className="w-14 h-14 bg-purple-100 text-[#7c56dc] rounded-full flex items-center justify-center mx-auto">
                    <Heart size={28} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-800">No Adoption Applications Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not applied for any pet adoptions yet. Find your perfect companion from our loving rescue pets!
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/adopt"
                      className="px-5 py-2.5 bg-[#7c56dc] hover:bg-[#6842c8] text-white rounded-xl text-xs font-bold shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Explore Free Adoption Pets</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: MY LISTED PETS & RECEIVED APPLICANTS TRACKING
             ========================================================================= */}
          {activeTab === 'adoption-listings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-3 gap-2">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#7c56dc]" />
                    <span>My Listed Pets & Received Applications ({guardianPets.length})</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track all adoption listings you created, manage applicant profiles, and update status in real-time.
                  </p>
                </div>
                <Link
                  to="/adopt"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>List Pet For Free Adoption</span>
                </Link>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Pets Listed</span>
                  <span className="text-xl font-extrabold text-slate-900">{guardianPets.length}</span>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Applicants</span>
                  <span className="text-xl font-extrabold text-[#15559c]">{guardianApps.length}</span>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Under Review</span>
                  <span className="text-xl font-extrabold text-amber-700">
                    {guardianApps.filter((a) => a.status === 'Under Review' || a.status === 'Submitted').length}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Approved Adoptions</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {guardianApps.filter((a) => a.status === 'Approved').length}
                  </span>
                </div>
              </div>

              {guardianPets.length > 0 ? (
                <div className="space-y-6">
                  {guardianPets.map((pet) => {
                    const petApplicants = guardianApps.filter((a) => String(a.petId) === String(pet.id));

                    return (
                      <div
                        key={pet.id}
                        className="border border-purple-200 rounded-2xl p-5 bg-white shadow-sm space-y-5"
                      >
                        {/* Pet Info Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={pet.image}
                              alt={pet.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-purple-100 shrink-0 bg-purple-50 shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-slate-900 text-base">
                                  {pet.name}
                                </h3>
                                <span className="text-[10px] font-bold bg-purple-100 text-[#7c56dc] px-2 py-0.5 rounded-full">
                                  {pet.gender} • {pet.age}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{pet.breed} • {pet.city}</p>
                              <Link
                                to={`/adopt/${pet.id}`}
                                className="text-[11px] text-[#7c56dc] font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>View Public Pet Profile</span>
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                          </div>

                          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Total Inquiries</span>
                            <span className="px-3 py-1 bg-purple-50 text-[#7c56dc] font-extrabold text-xs rounded-full border border-purple-200">
                              👥 {petApplicants.length} Applicant{petApplicants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Applicants Section */}
                        <div className="space-y-3">
                          <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span>Applicants for {pet.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">({petApplicants.length})</span>
                          </h4>

                          {petApplicants.length > 0 ? (
                            <div className="space-y-3">
                              {petApplicants.map((app) => (
                                <div
                                  key={app.id}
                                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3 hover:bg-white hover:border-purple-300 transition"
                                >
                                  {/* Applicant Header */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-purple-200/80 text-[#7c56dc] font-bold text-xs flex items-center justify-center">
                                        {app.applicantName ? app.applicantName.charAt(0) : 'U'}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900 text-xs">{app.applicantName}</p>
                                        <p className="text-[10px] text-slate-400">Ref: {app.id} • {new Date(app.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>

                                    {/* Action Status Selector */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">Status:</span>
                                      <select
                                        value={app.status || 'Submitted'}
                                        onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                                        className="text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#7c56dc] cursor-pointer shadow-2xs"
                                      >
                                        <option value="Submitted">Submitted (New)</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Profile Details Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-slate-100">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone & WhatsApp</span>
                                      <p className="font-bold text-slate-800">{app.applicantPhone}</p>
                                    </div>

                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                                      <p className="font-semibold text-slate-700 truncate">{app.applicantEmail || 'Not provided'}</p>
                                    </div>

                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Living Environment</span>
                                      <p className="text-slate-700">
                                        <strong className="text-slate-900">{app.homeType || 'Apartment'}</strong> • Exp: {app.hasPetExperience || 'Yes'}
                                      </p>
                                    </div>

                                    <div className="sm:col-span-3 pt-1 border-t border-slate-100">
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant's Note / Adoption Reason:</span>
                                      <p className="text-slate-700 italic mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                        "{app.adoptionReason}"
                                      </p>
                                    </div>
                                  </div>

                                  {/* Contact Buttons */}
                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <a
                                      href={`https://wa.me/${(app.applicantPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${app.applicantName}! Regarding your adoption application for "${pet.name}" on JOSH PETS HUB, I would like to connect with you.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                    >
                                      <MessageSquare size={13} />
                                      <span>WhatsApp Chat</span>
                                    </a>

                                    <a
                                      href={`tel:${app.applicantPhone}`}
                                      className="py-1.5 px-3 bg-[#7c56dc] hover:bg-[#6842c8] text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                                    >
                                      <Phone size={13} />
                                      <span>Call Applicant</span>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-medium">
                              No one has applied for {pet.name} yet. Share your listing to find loving pet parents!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 border border-dashed border-purple-200 rounded-2xl text-center space-y-3 bg-purple-50/20">
                  <div className="w-14 h-14 bg-purple-100 text-[#7c56dc] rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-800">You Haven't Listed Any Pets For Adoption Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Are you fostering or rehoming a pet? List them for free adoption on JOSH PETS HUB to connect with verified adopters.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/adopt"
                      className="px-5 py-2.5 bg-[#7c56dc] hover:bg-[#6842c8] text-white rounded-xl text-xs font-bold shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Post Pet For Free Adoption</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 4: PRESCRIPTION HISTORY
             ========================================================================= */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Prescription Uploads
              </h2>

              {historyLoading ? (
                <p className="text-xs text-gray-400">Loading prescriptions...</p>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((presc) => (
                    <div key={presc._id} className="border border-beige p-5 text-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center rounded-xl">
                      <div className="md:col-span-2 space-y-1">
                        <p className="font-bold text-primary text-sm font-serif">Pet: {presc.patientName}</p>
                        <p className="text-gray-500">Doctor: {presc.veterinarianName} ({presc.clinicName || 'No Clinic'})</p>
                        <p className="text-[10px] text-gray-400">Date: {new Date(presc.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        {presc.status === 'Approved' ? (
                          <span className="text-green-600 font-bold uppercase flex items-center gap-1">
                            <CircleCheck size={16} /> Approved
                          </span>
                        ) : presc.status === 'Rejected' ? (
                          <span className="text-red-500 font-bold uppercase flex items-center gap-1">
                            <ShieldAlert size={16} /> Rejected
                          </span>
                        ) : (
                          <span className="text-accent font-bold uppercase flex items-center gap-1">
                            <Clock size={16} /> Under Review
                          </span>
                        )}
                      </div>

                      {/* File Link */}
                      <div className="text-right">
                        <a 
                          href={presc.prescriptionFileUrl.startsWith('/uploads') ? `http://localhost:5000${presc.prescriptionFileUrl}` : presc.prescriptionFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-primary text-white font-bold tracking-widest text-[10px] hover:bg-accent hover:text-primary transition uppercase inline-block text-center cursor-pointer rounded"
                        >
                          VIEW DOCUMENT
                        </a>
                      </div>
                      
                      {presc.reviewNotes && (
                        <div className="col-span-full bg-secondary p-3 border border-beige text-[11px] text-gray-600 rounded">
                          <strong>Pharmacist Notes:</strong> {presc.reviewNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No prescriptions uploaded yet.</p>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 5: ADDRESS BOOK
             ========================================================================= */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-beige pb-2">
                <h2 className="font-serif text-lg font-bold text-primary">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 bg-primary text-white font-bold tracking-widest text-[10px] hover:bg-accent hover:text-primary transition uppercase flex items-center gap-1 cursor-pointer rounded"
                >
                  <Plus size={12} /> {showAddressForm ? 'CLOSE FORM' : 'ADD NEW'}
                </button>
              </div>

              {/* Address Addition Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-beige p-5 space-y-4 bg-secondary rounded-xl">
                  <h3 className="font-serif text-sm font-semibold text-primary">New Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary rounded"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-premium py-2 text-xs">
                    SAVE ADDRESS
                  </button>
                </form>
              )}

              {/* Address list */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((a) => (
                    <div key={a._id} className="border border-beige p-5 text-xs flex justify-between items-start rounded-xl">
                      <div className="space-y-1">
                        <p className="font-bold text-primary">
                          {a.name} 
                          {a.isDefault && <span className="ml-2 bg-accent/20 text-primary border border-accent/30 text-[9px] px-1.5 py-0.5 uppercase font-bold rounded">Default</span>}
                        </p>
                        <p className="text-gray-500">{a.streetAddress}</p>
                        <p className="text-gray-500">{a.city}, {a.state} - {a.postalCode}</p>
                        <p className="text-gray-400">Phone: {a.phone}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAddress(a._id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No addresses saved. Add a default shipping address above.</p>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 6: PROFILE DETAILS
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-beige pb-2">
                Profile Details
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary rounded"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary rounded"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary rounded"
                  />
                </div>

                <button type="submit" className="btn-premium py-2 text-xs">
                  UPDATE DETAILS
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB: PET RELOCATION & TRANSPORT ENQUIRIES
             ========================================================================= */}
          {activeTab === 'transport-enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-beige pb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                    <Truck size={20} className="text-emerald-700" />
                    My Pet Relocation Enquiries & Quotations ({userTransportEnquiries.length})
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track real-time status of your relocation requests, received transporter quotes, and journey schedules.
                  </p>
                </div>

                <Link
                  to="/transport"
                  className="px-3.5 py-1.5 bg-[#0F2E23] text-[#D4AF37] hover:text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <Plus size={14} /> New Relocation Request
                </Link>
              </div>

              {userTransportEnquiries.length === 0 ? (
                <div className="text-center py-12 space-y-4 border border-beige p-8 rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#0F2E23] flex items-center justify-center mx-auto text-2xl">
                    🚐
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No Relocation Enquiries Submitted Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Planning to move your dog, cat, or bird across cities? Submit a quick enquiry to get customized quotes.
                  </p>
                  <Link
                    to="/transport"
                    className="inline-block bg-[#0F2E23] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition hover:bg-[#163e30]"
                  >
                    Explore Pet Transport Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTransportEnquiries.map((enq) => {
                    const hasQuote = enq.status === 'Quote Sent' || enq.quoteAmount;
                    return (
                      <div
                        key={enq.id}
                        className="border border-beige p-5 rounded-2xl bg-white shadow-sm space-y-4 hover:border-primary/40 transition"
                      >
                        {/* Header & Status */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-beige/60 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary font-serif">{enq.providerName}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                ID: {enq.id}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Submitted on: {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                              hasQuote
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : enq.status.includes('Pending') || enq.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {enq.status}
                            </span>
                          </div>
                        </div>

                        {/* Route & Pet Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-sand/30 p-3.5 rounded-xl border border-beige/70 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Route</span>
                            <strong className="text-gray-800">{enq.departureCity} ➔ {enq.destinationCity}</strong>
                            <span className="text-[10px] text-gray-500 block">({enq.relocationType})</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Pet</span>
                            <strong className="text-gray-800">{enq.petBreed} ({enq.petSpecies || 'Dog'})</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.petGender}, {enq.petAge}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Date</span>
                            <strong className="text-gray-800">{enq.expectedDate || 'Flexible'}</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.preferredModes?.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-gray-400 block">Vaccination</span>
                            <strong className="text-gray-800">{enq.vaccinationStatus}</strong>
                            <span className="text-[10px] text-gray-500 block">{enq.travelFriendly}</span>
                          </div>
                        </div>

                        {/* Customer Note */}
                        {enq.note && (
                          <div className="text-xs text-gray-600 italic bg-white p-2.5 rounded-lg border border-beige/60">
                            <strong>My Note:</strong> "{enq.note}"
                          </div>
                        )}

                        {/* Transporter Response / Official Quote */}
                        {enq.providerReply ? (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                <ShieldCheck size={15} className="text-emerald-700" />
                                <span>Official Quotation & Travel Plan from Transporter</span>
                              </div>
                              {enq.quoteAmount && (
                                <span className="text-base font-serif font-extrabold text-[#0F2E23]">
                                  ₹{enq.quoteAmount.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700">{enq.providerReply}</p>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                ✓ Sanitized Crate & GPS Updates Included
                              </span>
                              <a
                                href={`https://wa.me/918306944422?text=Hello%2C%20I%20received%20quote%20for%20enquiry%20${enq.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                              >
                                <MessageSquare size={13} /> Confirm with Coordinator
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <Clock size={14} className="animate-spin text-amber-600" />
                              Transporter is reviewing vehicle availability & formulating your quote.
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">Expected in 1-2 hours</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AccountDashboard;
