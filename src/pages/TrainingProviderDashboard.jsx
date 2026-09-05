import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building,
  GraduationCap
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';
import TrainingProviderContent from './TrainingProviderContent.jsx';
import { safeSetItem, safeGetItem } from '../utils/safeStorage.js';
import { 
  getProviderTrainingService, 
  getStoredTrainingSessions, 
  getStoredTrainingCourses, 
  getStoredTrainingEnquiries 
} from '../data/trainingData.js';

const TrainingProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = safeGetItem('trainingDashboardTab');
  const activeTabParam = searchParams.get('tab') || storedTab || 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [profileName, setProfileName] = useState(user?.name || currentProvider?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || user?.profilePicture || currentProvider?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Live Service, Sessions, Courses & Enquiries Data
  const [myService, setMyService] = useState(() => getProviderTrainingService(user?._id || user?.id || user?.email));
  const [sessions, setSessions] = useState(() => getStoredTrainingSessions());
  const [courses, setCourses] = useState(() => getStoredTrainingCourses());
  const [enquiries, setEnquiries] = useState(() => getStoredTrainingEnquiries());

  useEffect(() => {
    const refreshData = () => {
      setMyService(getProviderTrainingService(user?._id || user?.id || user?.email));
      setSessions(getStoredTrainingSessions());
      setCourses(getStoredTrainingCourses());
      setEnquiries(getStoredTrainingEnquiries());
    };
    refreshData();
    window.addEventListener('training-providers-updated', refreshData);
    window.addEventListener('training-session-created', refreshData);
    window.addEventListener('training-session-updated', refreshData);
    window.addEventListener('training-enquiry-created', refreshData);
    window.addEventListener('training-enquiry-updated', refreshData);
    window.addEventListener('training-courses-updated', refreshData);
    return () => {
      window.removeEventListener('training-providers-updated', refreshData);
      window.removeEventListener('training-session-created', refreshData);
      window.removeEventListener('training-session-updated', refreshData);
      window.removeEventListener('training-enquiry-created', refreshData);
      window.removeEventListener('training-enquiry-updated', refreshData);
      window.removeEventListener('training-courses-updated', refreshData);
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
      safeSetItem('trainingDashboardTab', activeTabParam);
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

  // Live Stats from Persistent Storage
  const scheduledCount = useMemo(() => sessions.filter(s => s.status === 'Scheduled').length, [sessions]);
  const completedCount = useMemo(() => sessions.filter(s => s.status === 'Completed').length, [sessions]);
  const totalRevenue = useMemo(() => {
    return (completedCount * (myService?.pricePerSession || 850)) + 28500;
  }, [completedCount, myService]);

  const stats = {
    totalSessions: sessions.length,
    scheduledSessions: scheduledCount,
    completedSessions: completedCount,
    coursesCount: courses.length,
    revenue: totalRevenue,
    inquiries: enquiries.length,
    rating: myService?.rating || currentProvider?.rating || 5.0,
    reviews: myService?.reviews || currentProvider?.reviewsCount || 24
  };

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
  const displayName = user?.name || currentProvider?.name || 'Aryan Roy';

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
                <ShieldCheck size={12} className="text-amber-500" /> Elite Trainer
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {[
                { id: 'appointments', label: 'Training Sessions', count: sessions.length, icon: Calendar },
                { id: 'courses', label: 'Courses & Pricing', count: courses.length, icon: Tag },
                { id: 'service', label: 'My Training Service', count: myService ? 1 : 0, extra: myService ? 'Active' : 'Post', icon: GraduationCap },
                { id: 'messages', label: 'Client Inquiries', count: enquiries.length, icon: MessageSquare },
                { id: 'reviews', label: 'Customer Reviews', extra: `${stats.rating} ★`, icon: Heart },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Trainer Profile', icon: PawPrint }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                        setActiveTab(item.id);
                        setSearchParams({ tab: item.id });
                        safeSetItem('trainingDashboardTab', item.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
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
            className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm transition-all"
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
              Pet Training Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your training sessions, behavior courses, and client progress.
            </p>
          </div>
        </div>

        {/* SERVICE POSTING ALERT BANNER */}
        {!myService ? (
          <div className="mb-8 bg-gradient-to-r from-amber-50 via-amber-100/50 to-emerald-50 border-2 border-dashed border-amber-300 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-[#0F2E23] text-[#ffd000] flex items-center justify-center shrink-0 shadow-md">
                <GraduationCap size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#0F2E23]">
                    Your Training Service is Not Posted on the Public Directory Yet
                  </h3>
                  <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse">
                    Action Needed
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 max-w-xl">
                  Post your training academy, dog behavior programs, and pricing so pet parents can find you and book sessions on the public <strong>Pet Training</strong> page (inside Pet Services).
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('service');
                setSearchParams({ tab: 'service' });
                safeSetItem('trainingDashboardTab', 'service');
              }}
              className="bg-[#0F2E23] hover:bg-emerald-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus size={16} className="text-[#ffd000]" />
              <span>Post Training Service Now</span>
            </button>
          </div>
        ) : (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#0F2E23]">{myService.name} is Live</h3>
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Live on Directory
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Your training service is published and visible on the public <strong>Pet Training</strong> page in {myService.city}, {myService.state}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('service');
                  setSearchParams({ tab: 'service' });
                  safeSetItem('trainingDashboardTab', 'service');
                }}
                className="bg-white border border-emerald-300 text-[#0F2E23] hover:bg-emerald-50 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Service</span>
              </button>
              <button
                onClick={() => navigate('/training')}
                className="bg-[#0F2E23] hover:bg-emerald-900 text-[#ffd000] hover:text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>View on Public Directory</span>
              </button>
            </div>
          </div>
        )}

        {/* KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Training Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalSessions}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">All time</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Upcoming Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.scheduledSessions}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">Scheduled</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Completed Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.completedSessions}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Pets trained</div>
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
              {stats.completedSessions} sessions settled
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-sky-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Active Courses</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-sky-100">
                <Tag size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">{stats.coursesCount}</div>
            </div>
            <div className="text-[10px] text-sky-600 font-black uppercase tracking-wider mt-2 relative z-10">Packages listed</div>
          </div>

        </div>

        {/* TAB CONTENT */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <TrainingProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default TrainingProviderDashboard;
