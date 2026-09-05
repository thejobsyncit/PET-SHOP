import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { getStoredMatingPets } from '../data/breedingData.js';

import toast from 'react-hot-toast';


const ListingsModule = ({ user }) => {
  const [studs, setStuds] = useState([]);

  useEffect(() => {
    const allPets = getStoredMatingPets();
    // Filter pets belonging to this user (using name/phone as mock auth check)
    const myPets = allPets.filter(p => p.parentName === user?.name || p.parentPhone === user?.mobile || p.whatsappNumber === user?.mobile);
    setStuds(myPets);
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Active Studs/Mates</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your breeding profiles and stud fees.</p>
        </div>
        <button className="bg-[#0F2E23] hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add Profile
        </button>
      </div>

      {studs.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <PawPrint size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Mating Profiles Found</h3>
          <p className="text-slate-500 mt-1">You haven't listed any pets for mating yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studs.map((stud) => (
            <div key={stud.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">
              <div className="h-40 overflow-hidden relative">
                <img src={stud.image} alt={stud.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-black text-[#0F2E23]">{stud.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{stud.breed}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-600">₹{stud.price.toLocaleString()}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar size={14} className="text-slate-400" /> {stud.age}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500" /> 0 matches
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors">Edit</button>
                  <button className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors">Pause</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MatchesModule = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    try {
      const enquiries = JSON.parse(localStorage.getItem('pawora_mating_enquiries') || '[]');
      const myPets = getStoredMatingPets().filter(p => p.parentName === user?.name || p.parentPhone === user?.mobile || p.whatsappNumber === user?.mobile);
      const myPetIds = myPets.map(p => p.id);
      
      const myRequests = enquiries.filter(enq => myPetIds.includes(enq.petId));
      
      // Enhance requests with target pet details
      const enhancedRequests = myRequests.map(req => {
        const targetPet = myPets.find(p => p.id === req.petId);
        return {
          ...req,
          targetPetName: targetPet ? targetPet.name : 'Unknown Pet'
        };
      });
      
      setRequests(enhancedRequests);
    } catch(e) {
      console.error(e);
    }
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-[#0F2E23]">Match Requests</h2>
        <p className="text-sm text-slate-500 font-medium">Review and accept breeding requests for your studs.</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Heart size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Requests Yet</h3>
          <p className="text-slate-500 mt-1">When users inquire about your pets, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{req.id || 'REQ-NEW'}</span>
                    <span className="text-xs font-bold text-slate-400">•</span>
                    <span className="text-sm font-black text-[#0F2E23]">{req.ownerName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Request for <span className="text-amber-600">{req.targetPetName}</span></h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5"><PawPrint size={14} className="text-slate-400"/> {req.petBreed} ({req.petName})</div>
                    <div className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {req.ownerPhone}</div>
                  </div>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                    "{req.message}"
                  </div>
                  <div className="mt-2 text-xs text-slate-400 font-medium">
                    Received: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                  <button className="flex-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition-colors">Accept Match</button>
                  <button className="flex-1 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl text-xs font-bold transition-colors">Call Owner</button>
                  <button className="flex-1 w-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 py-2 px-4 rounded-xl text-xs font-bold transition-colors">Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MessagesModule = () => {
  const inquiries = [
    { id: 1, name: 'Vikram Singh', pet: 'Golden Retriever (F)', date: 'Today, 10:30 AM', message: 'Hi! I saw Maximus\'s profile and he looks like a perfect match for our Bella. What is your availability next month?', isUnread: true },
    { id: 2, name: 'Sneha Reddy', pet: 'Siberian Husky (F)', date: 'Yesterday, 4:15 PM', message: 'Hello, do you require any specific health clearances before booking a mating session with Shadow?', isUnread: true },
    { id: 3, name: 'Amit Patel', pet: 'Labrador (F)', date: 'Oct 02, 2026', message: 'Thank you for the information. We will get back to you after discussing with our vet.', isUnread: false },
    { id: 4, name: 'Pooja Sharma', pet: 'German Shepherd (F)', date: 'Sep 28, 2026', message: 'Is the stud fee negotiable if we travel to your facility in Yelahanka?', isUnread: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Client Inquiries</h2>
          <p className="text-sm text-slate-500 font-medium">Respond to pet owners interested in your breeding services.</p>
        </div>
        <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          2 Unread
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side: Inbox List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inquiries.map((inq, idx) => (
              <div key={inq.id} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${idx === 0 ? 'bg-white border-l-4 border-l-emerald-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-bold ${inq.isUnread ? 'text-[#0F2E23]' : 'text-slate-600'}`}>{inq.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{inq.date}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 mb-1.5 flex items-center gap-1"><PawPrint size={10}/> {inq.pet}</div>
                <p className={`text-xs line-clamp-2 ${inq.isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{inq.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-black text-[#0F2E23]">Vikram Singh</h3>
              <p className="text-xs font-bold text-emerald-600">Interested in: Maximus</p>
            </div>
            <button className="text-slate-400 hover:text-[#0F2E23] transition-colors"><Settings size={18}/></button>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
            <div className="flex flex-col items-center mb-6">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">VS</div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                <p className="text-sm text-slate-700">{inquiries[0].message}</p>
                <span className="text-[9px] font-bold text-slate-400 mt-2 block">10:30 AM</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-xl"><Plus size={20}/></button>
              <input type="text" placeholder="Type your reply here..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              <button className="p-2.5 bg-[#0F2E23] text-white hover:bg-emerald-800 transition-colors rounded-xl shadow-sm"><Send size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { safeSetItem, safeGetItem } from '../utils/safeStorage.js';

const BreedingProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = safeGetItem('breedingDashboardTab');
  const activeTabParam = searchParams.get('tab') || storedTab || 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [profileName, setProfileName] = useState(user?.name || currentProvider?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || user?.profilePicture || currentProvider?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
      safeSetItem('breedingDashboardTab', activeTabParam);
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

  // Mock Stats for new dashboards
  const stats = {
    totalListings: 12,
    availableStock: 3,
    soldOutCount: 45,
    totalOrders: 60,
    revenue: 12500,
    discounts: 500, 
    inquiries: 12,
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
                <ShieldCheck size={12} className="text-amber-500" /> Verified Breeder
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {[
                { id: 'listings', label: 'Active Studs/Mates', count: 4, icon: PawPrint },
                { id: 'matches', label: 'Match Requests', count: 3, icon: Heart },
                { id: 'messages', label: 'Client Inquiries', count: 6, icon: MessageSquare },
                { id: 'reviews', label: 'Customer Reviews', extra: '4.9 ★', icon: Star },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Breeder Profile', icon: Building }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                        setActiveTab(item.id);
                        setSearchParams({ tab: item.id });
                        safeSetItem('breedingDashboardTab', item.id);
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
              Breeding & Mating Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your mating listings, stud profiles, and match requests.
            </p>
          </div>
        </div>

        {/* KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Listings</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalListings}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">Current</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pending Matches</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <Heart size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">Awaiting approval</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Successful Mates</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Completed matches</div>
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
          <BreedingProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default BreedingProviderDashboard;
