import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building, Truck
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
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

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
  const displayName = user?.name || currentProvider?.name || 'Provider';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 sticky top-[104px] h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
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
              {[
                { id: 'appointments', label: 'Transport Bookings', count: bookings.length, icon: Calendar },
                { id: 'vehicles', label: 'Vehicles & Rates', count: vehicles.length, icon: Tag },
                { id: 'service', label: 'My Transport Service', count: myService ? 1 : 0, extra: myService ? 'Active' : 'Post', icon: Truck },
                { id: 'messages', label: 'Client Inquiries', count: inquiries.length, icon: MessageSquare },
                { id: 'reviews', label: 'Customer Reviews', extra: '4.8 ★', icon: Heart },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Agency Profile', icon: Building }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                        setActiveTab(item.id);
                        setSearchParams({ tab: item.id });
                        safeSetItem('transportDashboardTab', item.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-emerald-600'} />
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
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
      <main className="flex-1 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Pet Transport Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your pet transport bookings, vehicles, and active trips.
            </p>
          </div>
        </div>

        {/* KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Transport Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <MapPin size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalListings}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">All time</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pending Trips</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">In queue</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Completed Trips</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Pets transported</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#ffd000]/80 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#ffd000]/10 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Total Earnings</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-amber-100">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹{stats.revenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-2 relative z-10">
              {stats.totalOrders} total sessions
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-sky-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Discounts Given</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-sky-100">
                <Tag size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹{stats.discounts.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-[10px] text-sky-600 font-black uppercase tracking-wider mt-2 relative z-10">Total savings offered</div>
          </div>

        </div>

        {/* TAB CONTENT */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <TransportProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default TransportProviderDashboard;
