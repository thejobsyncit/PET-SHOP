import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building, 
  Calendar, 
  Clock, 
  FileText, 
  MessageSquare, 
  Star, 
  DollarSign, 
  Heart,
  PawPrint,
  Home,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit2
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';
import HostelProviderContent from './HostelProviderContent.jsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { updateProfile } from '../store/slices/authSlice.js';

import { safeSetItem, safeGetItem } from '../utils/safeStorage.js';

const HostelProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = safeGetItem('hostelDashboardTab');
  const activeTabParam = searchParams.get('tab') || storedTab || 'bookings';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [stats, setStats] = useState({
    totalListings: 0,
    availableStock: 0,
    soldOutCount: 0,
    revenue: 0,
    totalOrders: 0
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
      safeSetItem('hostelDashboardTab', activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
    safeSetItem('hostelDashboardTab', tabName);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Updating profile picture...');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400;

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          await dispatch(updateProfile({ avatar: compressedBase64 })).unwrap();
          toast.success('Profile picture updated!', { id: toastId });
          setIsUploading(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to update profile picture', { id: toastId });
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 
        ========================================================
        SIDEBAR NAVIGATION
        ========================================================
      */}
      <aside className="fixed top-[73px] left-0 w-64 h-[calc(100vh-73px)] bg-white border-r border-slate-200 shadow-sm hidden lg:flex flex-col z-10">
        
        {/* Profile Summary */}
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="relative group cursor-pointer mb-4">
            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden ${isUploading ? 'opacity-50' : ''}`}>
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=400"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              <Camera size={20} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <h2 className="font-black text-slate-800 text-lg mb-1">{user?.name || 'Pet Resort'}</h2>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd000]/10 border border-[#ffd000]/20 text-amber-700 text-[10px] font-black uppercase tracking-widest mt-2">
            <Star size={12} fill="currentColor" /> ELITE RESORT
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="px-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {[
                { id: 'bookings', label: 'Boarding Bookings', count: 8, icon: Calendar },
                { id: 'rooms', label: 'Kennels & Accommodations', count: 4, icon: Home },
                { id: 'gallery', label: 'Facility Gallery', count: 15, icon: Camera },
                { id: 'messages', label: 'Pet Parent Inquiries', count: 3, icon: MessageSquare },
                { id: 'hours', label: 'Check-in/Out Timings', icon: Clock },
                { id: 'reviews', label: 'Guest Reviews', extra: '4.9 ★', icon: Heart },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Resort Registration', icon: Building }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2E23]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-[#ffd000]' : 'text-slate-400 group-hover:text-[#0F2E23] transition-colors'} />
                      <span className={`text-sm font-bold ${activeTab === item.id ? 'text-white' : ''}`}>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.extra && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-[#ffd000] text-[#0F2E23]' : 'bg-amber-100 text-amber-700'
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

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
           <button onClick={() => toast.success('Logged out successfully')} className="w-full py-2.5 flex items-center justify-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100">
             LOGOUT
           </button>
        </div>
      </aside>

      {/* 
        ========================================================
        MAIN CONTENT AREA
        ========================================================
      */}
      <main className="lg:ml-64 pt-[73px] p-4 sm:p-6 lg:p-8">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Pet Hostel & Resort Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your boarding bookings, kennels, and guest reviews.
            </p>
          </div>
        </div>

        {/* 
          ========================================================
          CUSTOM HOSTEL KPI METRICS
          ========================================================
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Active Bookings</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <Calendar size={14} className="text-slate-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-[#0F2E23]">8</h3>
              <span className="text-xs font-bold text-slate-400">PETS BOARDING NOW</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Available Kennels</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Home size={14} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-emerald-700">12</h3>
              <span className="text-xs font-bold text-emerald-600/70">SPOTS OPEN TODAY</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-rose-600">Upcoming Check-ins</span>
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                <Clock size={14} className="text-rose-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-rose-700">3</h3>
              <span className="text-xs font-bold text-rose-600/70">ARRIVING TOMORROW</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#ffd000]/10 to-amber-50 border border-[#ffd000]/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={48} className="text-amber-600" /></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-amber-700">Total Earnings</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-amber-200">
                <DollarSign size={14} className="text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <h3 className="text-3xl font-black text-amber-600">₹24,500</h3>
              <span className="text-xs font-bold text-amber-600/70">THIS MONTH</span>
            </div>
          </div>

        </div>

        {/* 
          ========================================================
          TAB CONTENT AREA
          ========================================================
        */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <HostelProviderContent activeTab={activeTab} />
        </div>
      </main>

    </div>
  );
};

export default HostelProviderDashboard;
