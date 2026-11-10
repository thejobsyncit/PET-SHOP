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
  Edit2,
  LogOut,
  Menu,
  X,
  Tag
} from 'lucide-react';
import { apiRequest } from '../../../services/api.js';
import toast from 'react-hot-toast';
import ProviderProfileSection from '../../../components/dashboards/ProviderProfileSection.jsx';
import HostelProviderContent from './content/HostelProviderContent.jsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { updateProfile, logout } from '../../../store/slices/authSlice.js';

import { safeSetItem, safeGetItem } from '../../../utils/safeStorage.js';
import { getStoredHostelBookings } from '../../../data/hostelData.js';

const HostelProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline,
  onOpenSubscriptionModal,
  onOpenPlanDetails,
  subscription
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = safeGetItem('hostelDashboardTab');
  const activeTabParam = searchParams.get('tab') || storedTab || 'profile';
  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const computeHostelStats = () => {
    let list = [];
    try {
      const saved = safeGetItem('hostel_provider_bookings_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch (e) {}
    try {
      const customerBookings = getStoredHostelBookings();
      if (Array.isArray(customerBookings) && customerBookings.length > 0) {
        const existingIds = new Set(list.map(b => b.id || b._id));
        for (const cb of customerBookings) {
          const bId = cb.id || cb._id;
          if (!existingIds.has(bId)) {
            list.unshift(cb);
            existingIds.add(bId);
          }
        }
      }
    } catch (e) {}

    const total = list.length > 0 ? list.length : 11;
    const pending = list.length > 0 
      ? list.filter(b => b.status === 'pending_checkin' || b.status === 'Pending').length 
      : 3;
    const completed = list.length > 0 
      ? list.filter(b => b.status === 'checked_out' || b.status === 'Completed' || b.status === 'checked_in').length 
      : 8;
    const rev = list.length > 0 
      ? list.reduce((acc, curr) => acc + (Number(curr.totalPrice || curr.totalAmount || curr.fee || 0)), 0) 
      : 24500;

    return {
      totalBookings: total,
      pendingCheckins: pending,
      completedStays: completed,
      revenue: rev,
      discounts: 1200
    };
  };

  const [stats, setStats] = useState(computeHostelStats);

  useEffect(() => {
    const handleUpdate = () => {
      setStats(computeHostelStats());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('hostel_booking_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('hostel_booking_updated', handleUpdate);
    };
  }, []);

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
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
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
          
          const phoneToKeep = (user?.mobile || user?.phone || '').trim();
          await dispatch(updateProfile({ avatar: compressedBase64, profilePicture: compressedBase64, mobile: phoneToKeep, phone: phoneToKeep })).unwrap();
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

  const navMenuItems = [
    { id: 'profile', label: 'Resort Profile & Plan', icon: Building },
    { id: 'bookings', label: 'Boarding Bookings', icon: Calendar },
    { id: 'rooms', label: 'Kennels & Accommodations', icon: Home },
    { id: 'gallery', label: 'Facility Gallery', icon: Camera },
    { id: 'messages', label: 'Pet Parent Inquiries', icon: MessageSquare },
    { id: 'hours', label: 'Check-in/Out Timings', icon: Clock },
    { id: 'reviews', label: 'Guest Reviews', icon: Star },
    { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col lg:flex-row">
      
      {/* Mobile Top bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-[73px] z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop"} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-black text-slate-800 text-xs truncate max-w-[180px]">{user?.name || 'Happy Paws Resort'}</h2>
            <p className="text-[10px] text-emerald-600 font-bold">Pet Hostel & Boarding</p>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg z-20">
          {navMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === item.id 
                  ? 'bg-[#0F2E23] text-white font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon size={16} className={activeTab === item.id ? 'text-[#ffd000]' : 'text-slate-400'} />
                <span className="text-xs font-bold">{item.label}</span>
              </div>

            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full py-2 flex items-center justify-center gap-2 text-rose-600 text-xs font-black uppercase tracking-wider hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* 
        ========================================================
        LEFT SIDEBAR NAVIGATION (Desktop)
        ========================================================
      */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border-r border-slate-200 relative lg:sticky top-0 lg:top-[73px] h-auto lg:h-[calc(100vh-73px)] hidden lg:flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Profile Summary */}
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <h2 className="font-black text-slate-800 text-lg mb-1">{user?.name || 'Happy Paws Pet Resort'}</h2>
          <p className="text-xs text-slate-500 font-medium">Sarjapur Road, Bangalore</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd000]/10 border border-[#ffd000]/20 text-amber-700 text-[10px] font-black uppercase tracking-widest mt-2">
            <Star size={12} fill="currentColor" /> 5-STAR PET RESORT
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="px-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {navMenuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-200 group cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2E23]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-[#ffd000]' : 'text-slate-400 group-hover:text-[#0F2E23] transition-colors'} />
                      <span className={`text-sm font-bold ${activeTab === item.id ? 'text-white' : ''}`}>{item.label}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 mt-auto">
           <button 
             onClick={handleLogout} 
             className="w-full py-2.5 flex items-center justify-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100 cursor-pointer"
           >
             <LogOut size={16} /> LOGOUT
           </button>
        </div>
      </aside>

      {/* 
        ========================================================
        MAIN CONTENT AREA
        ========================================================
      */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 lg:py-10 overflow-x-hidden">
        
        {/* Header Area */}
        {activeTab !== 'profile' ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
                  Pet Hostel & Resort Dashboard
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Manage your boarding bookings, kennels, guest check-ins, and parent inquiries.
                </p>
              </div>
            </div>

            {/* CUSTOM HOSTEL KPI METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
              
              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Boarding Bookings</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                    <PawPrint size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalBookings}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">All time</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pending Check-ins</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                    <Clock size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.pendingCheckins}</div>
                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">In queue</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Completed Stays</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.completedStays}</div>
                <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Pets boarded</div>
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
                  {stats.completedStays} completed stays
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
          </>
        ) : null}

        {/* 
          ========================================================
          TAB CONTENT AREA
          ========================================================
        */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          {activeTab === 'profile' ? (
            <ProviderProfileSection
              serviceCategory="Pet Hostel / Boarding"
              onOpenSubscriptionModal={onOpenSubscriptionModal}
              onOpenPlanDetails={onOpenPlanDetails}
            />
          ) : (
            <HostelProviderContent activeTab={activeTab} />
          )}
        </div>
      </main>

    </div>
  );
};

export default HostelProviderDashboard;
