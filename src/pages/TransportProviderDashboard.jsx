import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice.js';
import {
  Calendar, Star, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, ShieldCheck, Heart,
  Tag, LogOut, CheckCircle, X, Edit3, Check, Building, Truck, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

import TransportProviderContent from './TransportProviderContent.jsx';
import { safeSetItem, safeGetItem } from '../utils/safeStorage.js';
import { 
  getProviderTransportService, 
  getStoredTransportBookings, 
  getStoredTransportVehicles, 
  getStoredTransportEnquiries 
} from '../data/transportData.js';

const TransportProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const validTabs = ['appointments', 'vehicles', 'service', 'messages', 'reviews', 'wallet', 'profile'];
  const storedTab = safeGetItem('transportDashboardTab');
  const rawTab = searchParams.get('tab') || storedTab || 'appointments';
  const activeTabParam = validTabs.includes(rawTab) ? rawTab : 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profileName, setProfileName] = useState(user?.name || currentProvider?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || user?.profilePicture || currentProvider?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Live Provider Data
  const [myService, setMyService] = useState(() => getProviderTransportService(user?._id || user?.id || user?.email));
  const [bookings, setBookings] = useState(() => getStoredTransportBookings());
  const [vehicles, setVehicles] = useState(() => getStoredTransportVehicles());
  const [inquiries, setInquiries] = useState(() => getStoredTransportEnquiries());

  const refreshTransportData = () => {
    setMyService(getProviderTransportService(user?._id || user?.id || user?.email));
    setBookings(getStoredTransportBookings());
    setVehicles(getStoredTransportVehicles());
    setInquiries(getStoredTransportEnquiries());
  };

  useEffect(() => {
    refreshTransportData();
    window.addEventListener('transport-providers-updated', refreshTransportData);
    window.addEventListener('transport-booking-created', refreshTransportData);
    window.addEventListener('transport-booking-updated', refreshTransportData);
    window.addEventListener('transport-vehicles-updated', refreshTransportData);
    window.addEventListener('transport-enquiry-created', refreshTransportData);
    window.addEventListener('transport-enquiry-updated', refreshTransportData);
    return () => {
      window.removeEventListener('transport-providers-updated', refreshTransportData);
      window.removeEventListener('transport-booking-created', refreshTransportData);
      window.removeEventListener('transport-booking-updated', refreshTransportData);
      window.removeEventListener('transport-vehicles-updated', refreshTransportData);
      window.removeEventListener('transport-enquiry-created', refreshTransportData);
      window.removeEventListener('transport-enquiry-updated', refreshTransportData);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || currentProvider?.name || '');
      setProfileAvatar(user.avatar || user.profilePicture || currentProvider?.avatar || '');
    }
  }, [user, currentProvider]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name: profileName, avatar: profileAvatar, profilePicture: profileAvatar }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
      safeSetItem('transportDashboardTab', activeTabParam);
    }
  }, [activeTabParam]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
    safeSetItem('transportDashboardTab', tabId);
    setIsMobileMenuOpen(false);
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Stats for Transport Dashboard
  const stats = {
    totalBookings: bookings.length || 12,
    pendingTrips: bookings.filter(b => b.status === 'In Transit' || b.status === 'Confirmed').length || 2,
    completedTrips: bookings.filter(b => b.status === 'Completed').length || 45,
    totalOrders: 60,
    revenue: 68450,
    discounts: 500, 
    inquiries: inquiries.length || 1,
    rating: currentProvider?.rating || 4.9,
    reviews: currentProvider?.reviewsCount || 100
  };

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
  const displayName = user?.name || currentProvider?.name || 'Provider';

  const menuItems = [
    { id: 'appointments', label: 'Bookings', fullLabel: 'Transport Bookings', count: bookings.length, icon: Calendar },
    { id: 'vehicles', label: 'Vehicles', fullLabel: 'Vehicles & Rates', count: vehicles.length, icon: Tag },
    { id: 'service', label: 'My Service', fullLabel: 'My Transport Service', count: myService ? 1 : 0, extra: myService ? 'Active' : 'Post', icon: Truck },
    { id: 'messages', label: 'Inquiries', fullLabel: 'Client Inquiries', count: inquiries.length, icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', fullLabel: 'Customer Reviews', extra: '4.8 ★', icon: Heart },
    { id: 'wallet', label: 'Wallet', fullLabel: 'Wallet & Payouts', icon: DollarSign },
    { id: 'profile', label: 'Profile', fullLabel: 'Agency Profile', icon: Building }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col lg:flex-row">
      
      {/* MOBILE TOP BAR (Visible on screens < lg) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={displayAvatar} 
              alt={displayName} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#0F2E23]"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${currentProvider?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F2E23] leading-tight line-clamp-1">{profileName || displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded uppercase">
                Transporter
              </span>
              <span className="text-[10px] text-slate-400 font-medium">★ {stats.rating}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE HORIZONTAL TAB SCROLLER (Visible on screens < lg) */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 sticky top-[57px] z-20 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive 
                    ? 'bg-[#0F2E23] text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <item.icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.extra && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY & SIDEBAR */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10">
            <div className="p-5 space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Transport Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="relative group cursor-pointer">
                  <label htmlFor="mobile-avatar-upload" className="block relative cursor-pointer">
                    <img 
                      src={displayAvatar} 
                      alt={displayName} 
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <Edit3 size={16} className="text-white" />
                    </div>
                  </label>
                  <input 
                    type="file" 
                    id="mobile-avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange(e, async (dataUrl) => {
                        setProfileAvatar(dataUrl);
                        const result = await dispatch(updateProfile({ name: profileName, avatar: dataUrl, profilePicture: dataUrl }));
                        if (updateProfile.fulfilled.match(result)) {
                          toast.success('Profile picture updated successfully!');
                        }
                      });
                    }} 
                  />
                </div>

                <div className="w-full">
                  <h3 className="text-base font-black text-[#0F2E23]">{profileName || displayName}</h3>
                  <span className="inline-flex mt-1 bg-[#ffd000]/10 text-[#0F2E23] border border-[#ffd000]/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider items-center gap-1">
                    <ShieldCheck size={11} className="text-amber-500" /> Elite Transporter
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={activeTab === item.id ? 'text-amber-400' : 'text-slate-400'} />
                      <span>{item.fullLabel}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.extra !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.extra}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Logout at bottom of drawer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => {
                  dispatch(logout());
                  toast.success('Logged out successfully');
                  navigate('/');
                }}
                className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black uppercase tracking-wider rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-sm transition"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LEFT SIDEBAR (Hidden on mobile, visible on lg screens) */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-white border-r border-slate-200 sticky top-[104px] h-[calc(100vh-104px)] flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-12 space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group cursor-pointer">
              <label htmlFor="sidebar-avatar-upload" className="block relative cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd000] to-amber-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                  <div className="bg-[#0F2E23]/80 p-2 rounded-full text-white">
                    <Edit3 size={16} />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm z-20">
                  <span className={`w-3 h-3 rounded-full ${currentProvider?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                </div>
              </label>
              <input 
                type="file" 
                id="sidebar-avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  handleFileChange(e, async (dataUrl) => {
                    setProfileAvatar(dataUrl);
                    const result = await dispatch(updateProfile({ name: profileName, avatar: dataUrl, profilePicture: dataUrl }));
                    if (updateProfile.fulfilled.match(result)) {
                      toast.success('Profile picture updated successfully!');
                    }
                  });
                }} 
              />
            </div>
            <div className="w-full px-4">
              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 justify-center mt-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-center text-sm font-black text-[#0F2E23] border-b-2 border-[#ffd000] focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button type="submit" className="text-emerald-600 hover:text-emerald-700 p-1">
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="text-rose-600 hover:text-rose-700 p-1">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-2 group/edit cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                  <h2 className="text-xl font-sans font-black text-[#0F2E23] tracking-tight leading-tight">
                    {profileName || displayName}
                  </h2>
                  <Edit3 size={14} className="text-slate-300 group-hover/edit:text-[#ffd000] transition" />
                </div>
              )}
              <span className="inline-flex mt-2 bg-[#ffd000]/10 text-[#0F2E23] border border-[#ffd000]/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest items-center justify-center gap-1 shadow-sm mx-auto">
                <ShieldCheck size={12} className="text-amber-500" /> Elite Transporter
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-emerald-600'} />
                      <span className="font-bold text-sm tracking-wide">{item.fullLabel}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.extra !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.extra}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <button
            onClick={() => {
              dispatch(logout());
              toast.success('Logged out successfully');
              navigate('/');
            }}
            className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 min-w-0 px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10 overflow-x-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Pet Transport Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Manage your pet transport bookings, vehicles, and active trips.
            </p>
          </div>
        </div>

        {/* KPI METRICS (Mobile Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-10">
          
          <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm group">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest line-clamp-1">Total Bookings</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 shrink-0">
                <MapPin size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] mb-0.5">{stats.totalBookings}</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider">All time trips</div>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 sm:mb-4 relative z-10">
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest line-clamp-1">Pending Trips</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0">
                <Clock size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] mb-0.5 relative z-10">{stats.pendingTrips}</div>
            <div className="text-[9px] sm:text-[10px] text-emerald-600 font-black uppercase tracking-wider relative z-10">In transit & confirmed</div>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 sm:mb-4 relative z-10">
              <span className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest line-clamp-1">Completed</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shrink-0">
                <CheckCircle size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] mb-0.5 relative z-10">{stats.completedTrips}</div>
            <div className="text-[9px] sm:text-[10px] text-rose-600 font-black uppercase tracking-wider relative z-10">Relocated safely</div>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl hover:border-[#ffd000]/80 transition duration-300 shadow-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd000]/10 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 sm:mb-4 relative z-10">
              <span className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest line-clamp-1">Earnings</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0">
                <DollarSign size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-sans font-black text-[#0F2E23] mb-0.5 relative z-10">₹{stats.revenue.toLocaleString('en-IN')}</div>
            <div className="text-[9px] sm:text-[10px] text-amber-600 font-black uppercase tracking-wider relative z-10">
              {stats.totalOrders} total trips
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl hover:border-sky-500/50 transition duration-300 shadow-sm group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 sm:mb-4 relative z-10">
              <span className="text-[9px] sm:text-[10px] font-black text-sky-600 uppercase tracking-widest line-clamp-1">Inquiries</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100 shrink-0">
                <MessageSquare size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] mb-0.5 relative z-10">{stats.inquiries}</div>
            <div className="text-[9px] sm:text-[10px] text-sky-600 font-black uppercase tracking-wider relative z-10">Quotes & requests</div>
          </div>

        </div>

        {/* TAB CONTENT WRAPPER */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 min-h-[500px] shadow-sm">
          <TransportProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default TransportProviderDashboard;
