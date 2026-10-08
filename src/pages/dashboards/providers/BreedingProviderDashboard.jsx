import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../../../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building,
  Paperclip, Trash2, Upload, Download, VolumeX, Volume2
} from 'lucide-react';
import { apiRequest } from '../../../services/api.js';
import { getStoredMatingPets, saveMatingPet } from '../../../data/breedingData.js';
import { safeSetItem, safeGetItem } from '../../../utils/safeStorage.js';

import toast from 'react-hot-toast';


const ListingsModule = ({ user }) => {
  const [studs, setStuds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const initialNewProfile = {
    name: '',
    breed: 'Golden Retriever',
    petCategory: 'Dogs',
    gender: 'Male',
    age: '2 Years',
    price: '',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800'
  };
  const [newProfile, setNewProfile] = useState(initialNewProfile);

  const refreshStuds = () => {
    const allPets = getStoredMatingPets() || [];
    const myPets = Array.isArray(allPets) ? allPets.filter(p => p && (p.parentName === user?.name || p.parentPhone === user?.mobile || p.whatsappNumber === user?.mobile)) : [];
    setStuds(myPets);
  };

  useEffect(() => {
    refreshStuds();
  }, [user]);

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newProfile.name.trim() || !newProfile.breed.trim()) {
      toast.error('Please enter pet name and breed.');
      return;
    }
    const petObj = {
      id: 'mate-' + Date.now(),
      name: newProfile.name.trim(),
      breed: newProfile.breed.trim(),
      petCategory: newProfile.petCategory,
      gender: newProfile.gender,
      age: newProfile.age,
      price: Number(newProfile.price) || 8000,
      priceDisplay: `₹${(Number(newProfile.price) || 8000).toLocaleString('en-IN')} Stud Fee`,
      image: newProfile.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
      parentName: user?.name || 'Verified Breeder',
      parentPhone: user?.mobile || '+91 9876543210',
      whatsappNumber: user?.mobile || '+91 9876543210',
      city: 'Bangalore',
      state: 'Karnataka',
      verified: true
    };

    saveMatingPet(petObj);
    setStuds(prev => [petObj, ...prev]);
    toast.success(`🎉 ${petObj.name} added to your active stud listings!`);
    setNewProfile(initialNewProfile);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Active Studs/Mates</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your breeding profiles and stud fees.</p>
        </div>
        <button 
          type="button"
          onClick={() => {
            setNewProfile(initialNewProfile);
            setShowAddModal(true);
          }}
          className="bg-[#0F2E23] hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
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
                    <div className="text-lg font-black text-amber-600">₹{(stud.price || 8000).toLocaleString('en-IN')}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar size={14} className="text-slate-400" /> {stud.age}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500" /> {stud.gender || 'Male'}
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

      {/* MODAL: ADD PROFILE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <h3 className="text-base sm:text-lg font-black text-[#0F2E23] flex items-center gap-2">
                <PawPrint size={18} className="text-emerald-700" /> Add New Stud / Mate Profile
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex-1 custom-scrollbar">
              <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pet Name *</label>
                  <input
                    type="text"
                    required
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    placeholder="e.g. Maximus"
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={newProfile.petCategory}
                      onChange={(e) => setNewProfile({ ...newProfile, petCategory: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                    >
                      <option value="Dogs">Dogs</option>
                      <option value="Cats">Cats</option>
                      <option value="Birds">Birds</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gender *</label>
                    <select
                      value={newProfile.gender}
                      onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                    >
                      <option value="Male">Male (Stud)</option>
                      <option value="Female">Female (Dam)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Breed *</label>
                    <input
                      type="text"
                      required
                      value={newProfile.breed}
                      onChange={(e) => setNewProfile({ ...newProfile, breed: e.target.value })}
                      placeholder="e.g. Golden Retriever"
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Age *</label>
                    <input
                      type="text"
                      required
                      value={newProfile.age}
                      onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                      placeholder="e.g. 2.5 Years"
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mating / Stud Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProfile.price}
                    onChange={(e) => setNewProfile({ ...newProfile, price: e.target.value })}
                    placeholder="e.g. 8000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    value={newProfile.image}
                    onChange={(e) => setNewProfile({ ...newProfile, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider hover:bg-emerald-900 transition shadow-md cursor-pointer"
                  >
                    Save Mating Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MatchesModule = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    try {
      const enquiries = JSON.parse(localStorage.getItem('joshpetshub_mating_enquiries') || '[]');
      const rawPets = getStoredMatingPets() || [];
      const myPets = Array.isArray(rawPets) ? rawPets.filter(p => p && (p.parentName === user?.name || p.parentPhone === user?.mobile || p.whatsappNumber === user?.mobile)) : [];
      const myPetIds = myPets.map(p => p.id);
      
      const myRequests = Array.isArray(enquiries) ? enquiries.filter(enq => enq && myPetIds.includes(enq.petId)) : [];
      
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
  const initialInquiries = [
    { id: 1, name: 'Vikram Singh', pet: 'Golden Retriever (F)', date: 'Today, 10:30 AM', message: 'Hi! I saw Maximus\'s profile and he looks like a perfect match for our Bella. What is your availability next month?', isUnread: true },
    { id: 2, name: 'Sneha Reddy', pet: 'Siberian Husky (F)', date: 'Yesterday, 4:15 PM', message: 'Hello, do you require any specific health clearances before booking a mating session with Shadow?', isUnread: true },
    { id: 3, name: 'Amit Patel', pet: 'Labrador (F)', date: 'Oct 02, 2026', message: 'Thank you for the information. We will get back to you after discussing with our vet.', isUnread: false },
    { id: 4, name: 'Pooja Sharma', pet: 'German Shepherd (F)', date: 'Sep 28, 2026', message: 'Is the stud fee negotiable if we travel to your facility in Yelahanka?', isUnread: false },
  ];

  const [inquiries, setInquiries] = useState(() => {
    const saved = safeGetItem('breeder_client_inquiries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialInquiries;
  });

  const [selectedInquiryId, setSelectedInquiryId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [mutedInquiries, setMutedInquiries] = useState({});
  const fileInputRef = useRef(null);

  const [threads, setThreads] = useState(() => {
    const saved = safeGetItem('breeder_chat_threads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      1: [
        { id: 101, sender: 'client', text: 'Hi! I saw Maximus\'s profile and he looks like a perfect match for our Bella. What is your availability next month?', time: '10:30 AM' }
      ],
      2: [
        { id: 201, sender: 'client', text: 'Hello, do you require any specific health clearances before booking a mating session with Shadow?', time: 'Yesterday, 4:15 PM' }
      ],
      3: [
        { id: 301, sender: 'client', text: 'Thank you for the information. We will get back to you after discussing with our vet.', time: 'Oct 02, 2026' }
      ],
      4: [
        { id: 401, sender: 'client', text: 'Is the stud fee negotiable if we travel to your facility in Yelahanka?', time: 'Sep 28, 2026' }
      ]
    };
  });

  const currentInquiry = inquiries.find(i => i.id === selectedInquiryId) || inquiries[0];
  const currentMessages = threads[selectedInquiryId] || [];

  const handleSelectInquiry = (id) => {
    setSelectedInquiryId(id);
    setShowAttachMenu(false);
    setShowSettingsMenu(false);
    setInquiries(prev => {
      const updated = prev.map(inq => inq.id === id ? { ...inq, isUnread: false } : inq);
      safeSetItem('breeder_client_inquiries', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const textToSend = replyText.trim();
    if (!textToSend) {
      toast.error('Please enter a message before sending.');
      return;
    }

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: textToSend,
      time: 'Just now'
    };

    const updatedCurrentThread = [...(threads[selectedInquiryId] || []), newMsg];
    const newThreads = {
      ...threads,
      [selectedInquiryId]: updatedCurrentThread
    };

    setThreads(newThreads);
    safeSetItem('breeder_chat_threads', JSON.stringify(newThreads));
    setReplyText('');
    toast.success(`Message sent to ${currentInquiry.name}!`);
  };

  const handleAttachItem = (type, label) => {
    setShowAttachMenu(false);
    let attachedContent = '';
    if (type === 'kci') {
      attachedContent = '📎 Attached: Verified KCI Stud Certificate & Lineage Pedigree Report (PDF)';
    } else if (type === 'location') {
      attachedContent = '📍 Shared Location: Elite Breeds Hub Facility, Gate 3, Yelahanka, Bangalore (Directions: https://maps.google.com)';
    } else if (type === 'health') {
      attachedContent = '🩺 Attached: Complete Genetic Screening & Brucellosis Clearances (PDF)';
    }

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: attachedContent,
      time: 'Just now',
      isAttachment: true
    };

    const updatedCurrentThread = [...(threads[selectedInquiryId] || []), newMsg];
    const newThreads = {
      ...threads,
      [selectedInquiryId]: updatedCurrentThread
    };
    setThreads(newThreads);
    safeSetItem('breeder_chat_threads', JSON.stringify(newThreads));
    toast.success(`${label} attached and sent!`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: `📎 Attached Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      time: 'Just now',
      isAttachment: true
    };

    const updatedCurrentThread = [...(threads[selectedInquiryId] || []), newMsg];
    const newThreads = {
      ...threads,
      [selectedInquiryId]: updatedCurrentThread
    };
    setThreads(newThreads);
    safeSetItem('breeder_chat_threads', JSON.stringify(newThreads));
    toast.success(`Uploaded and shared ${file.name}`);
    e.target.value = '';
  };

  const handleToggleUnread = () => {
    setShowSettingsMenu(false);
    setInquiries(prev => {
      const updated = prev.map(inq => inq.id === selectedInquiryId ? { ...inq, isUnread: !inq.isUnread } : inq);
      safeSetItem('breeder_client_inquiries', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Toggled unread status for ${currentInquiry.name}`);
  };

  const handleToggleMute = () => {
    setShowSettingsMenu(false);
    setMutedInquiries(prev => {
      const isMutedNow = !prev[selectedInquiryId];
      toast.success(isMutedNow ? `Muted notifications from ${currentInquiry.name}` : `Unmuted notifications from ${currentInquiry.name}`);
      return { ...prev, [selectedInquiryId]: isMutedNow };
    });
  };

  const handleExportChat = () => {
    setShowSettingsMenu(false);
    const transcript = (threads[selectedInquiryId] || [])
      .map(m => `[${m.time}] ${m.sender === 'me' ? 'You' : currentInquiry.name}: ${m.text}`)
      .join('\n');
    navigator.clipboard?.writeText(transcript);
    toast.success('Chat transcript copied to clipboard!');
  };

  const handleBlockClient = () => {
    setShowSettingsMenu(false);
    toast.error(`Client ${currentInquiry.name} has been blocked.`);
  };

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = inquiries.filter(i => i.isUnread).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Client Inquiries</h2>
          <p className="text-sm text-slate-500 font-medium">Respond to pet owners interested in your breeding services.</p>
        </div>
        <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          {unreadCount} Unread
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[520px]">
        {/* Left Side: Inbox List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredInquiries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-bold">No inquiries found</div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = inq.id === selectedInquiryId;
                const isMuted = mutedInquiries[inq.id];
                return (
                  <div 
                    key={inq.id} 
                    onClick={() => handleSelectInquiry(inq.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-white border-l-4 border-l-emerald-500 shadow-xs' 
                        : 'hover:bg-white/80 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-sm font-bold ${isSelected ? 'text-[#0F2E23]' : inq.isUnread ? 'text-[#0F2E23] font-black' : 'text-slate-600'}`}>
                          {inq.name}
                        </h4>
                        {isMuted && <VolumeX size={12} className="text-slate-400" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{inq.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 mb-1.5 flex items-center gap-1">
                      <PawPrint size={10}/> {inq.pet}
                    </div>
                    <p className={`text-xs line-clamp-2 ${inq.isUnread ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      {threads[inq.id]?.[threads[inq.id].length - 1]?.text || inq.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 relative">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0F2E23]">{currentInquiry.name}</h3>
                {mutedInquiries[currentInquiry.id] && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Muted</span>
                )}
              </div>
              <p className="text-xs font-bold text-emerald-600">Interested in: {currentInquiry.pet}</p>
            </div>
            
            {/* Settings button & menu */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-slate-400 hover:text-[#0F2E23] hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                title="Conversation Settings"
              >
                <Settings size={18}/>
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 text-xs font-bold divide-y divide-slate-100">
                  <button 
                    type="button"
                    onClick={handleToggleUnread}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                  >
                    <Mail size={14} /> Mark as Unread
                  </button>
                  <button 
                    type="button"
                    onClick={handleToggleMute}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                  >
                    {mutedInquiries[currentInquiry.id] ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    {mutedInquiries[currentInquiry.id] ? 'Unmute Client' : 'Mute Notifications'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportChat}
                    className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                  >
                    <Download size={14} /> Copy / Export Chat
                  </button>
                  <button 
                    type="button"
                    onClick={handleBlockClient}
                    className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2"
                  >
                    <AlertCircle size={14} /> Block Pet Parent
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            <div className="flex flex-col items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Conversation History
              </span>
            </div>
            
            {currentMessages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                      {currentInquiry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl shadow-sm max-w-[80%] text-sm ${
                    isMe 
                      ? 'bg-[#0F2E23] text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  } ${msg.isAttachment ? 'border-2 border-emerald-400/50' : ''}`}>
                    <p className="font-medium whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[9px] font-bold mt-2 block ${isMe ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#0F2E23] flex items-center justify-center text-[#ffd000] font-black text-xs shrink-0">
                      You
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Message Input with Attachment and Send */}
          <div className="p-4 border-t border-slate-200 bg-white relative">
            {/* Hidden File Picker */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden" 
              accept=".pdf,.doc,.docx,image/*"
            />

            {/* Quick Attachment Dropdown Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 text-xs font-bold divide-y divide-slate-100">
                <div className="p-2.5 bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider">
                  Quick Attachments
                </div>
                <button
                  type="button"
                  onClick={() => handleAttachItem('kci', 'KCI Certificate')}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>KCI Stud Certificate (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAttachItem('health', 'Health Screening')}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText size={14} className="text-blue-600" />
                  <span>Genetic / Brucellosis Clearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAttachItem('location', 'Kennel GPS Pin')}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <MapPin size={14} className="text-rose-500" />
                  <span>Share Kennel GPS Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <Paperclip size={14} className="text-purple-600" />
                  <span>Upload Custom File / Photo</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                  showAttachMenu ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 border-slate-200'
                }`}
                title="Add attachment / certificate"
              >
                <Plus size={20}/>
              </button>
              <input 
                type="text" 
                placeholder={`Type reply to ${currentInquiry.name}...`} 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800" 
              />
              <button 
                type="submit" 
                className="p-2.5 bg-[#0F2E23] text-white hover:bg-emerald-800 transition-colors rounded-xl shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                title="Send Message"
              >
                <Send size={18}/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsModule = ({ user }) => {
  const reviews = [
    { id: 1, client: 'Karthik S.', pet: 'Rocky (Bulldog)', rating: 5, date: 'Sep 01, 2026', comment: 'Excellent breeder! Maximus was healthy and well-behaved. The mating process was smooth and successful.' },
    { id: 2, client: 'Deepa M.', pet: 'Coco (Retriever)', rating: 5, date: 'Aug 28, 2026', comment: 'Highly reliable and professional. They have great facilities and take excellent care of their studs.' },
    { id: 3, client: 'Rohan K.', pet: 'Simba (Spitz)', rating: 4, date: 'Aug 15, 2026', comment: 'Good service, very knowledgeable about genetics and breed standards. Would recommend.' },
    { id: 4, client: 'Nisha R.', pet: 'Bella (Lab)', rating: 5, date: 'Jul 22, 2026', comment: 'Best breeding service in Bangalore! Our Bella had a wonderful litter.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Customer Reviews</h2>
          <p className="text-sm text-slate-500 font-medium">See what pet owners are saying about your breeding services.</p>
        </div>
        <div className="flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <div className="text-center border-r border-amber-200 pr-4">
            <div className="text-2xl font-black text-amber-600">4.9</div>
            <div className="flex text-amber-500">
              <Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Overall Rating</div>
            <div className="text-[10px] font-bold text-amber-600">Based on 45 reviews</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                  {rev.client.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0F2E23]">{rev.client}</h4>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">{rev.date}</div>
                </div>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-slate-200"} />
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                Mated with: <span className="text-[#0F2E23]">{rev.pet}</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const WalletModule = () => {
  const [balance, setBalance] = useState(() => {
    const saved = safeGetItem('breeder_wallet_balance');
    return saved !== null ? Number(saved) : 12500;
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const initialForm = { bankName: '', accountNumber: '', ifsc: '', amount: '' };
  const [form, setForm] = useState(initialForm);

  const initialTxns = [
    { id: 'BR-098', pet: 'Buddy (Golden Retriever)', date: 'Sep 04, 2026', status: 'Cleared', amount: 8000, isCredit: true },
    { id: 'BR-097', pet: 'Luna (Husky)', date: 'Sep 03, 2026', status: 'Cleared', amount: 10000, isCredit: true },
    { id: 'WD-012', pet: 'Bank Transfer (HDFC Bank)', date: 'Sep 01, 2026', status: 'Processed', amount: 15000, isCredit: false }
  ];

  const [transactions, setTransactions] = useState(() => {
    const saved = safeGetItem('breeder_wallet_txns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialTxns;
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    const withdrawAmt = Number(form.amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (withdrawAmt > balance) {
      toast.error(`Withdrawal amount cannot exceed available balance of ₹${balance.toLocaleString('en-IN')}`);
      return;
    }

    const newBal = balance - withdrawAmt;
    const newTxn = {
      id: 'WD-' + Math.floor(100 + Math.random() * 900),
      pet: `Bank Transfer (${form.bankName || 'HDFC Bank'})`,
      date: 'Today',
      status: 'Processed',
      amount: withdrawAmt,
      isCredit: false
    };
    const updatedTxns = [newTxn, ...transactions];

    setBalance(newBal);
    setTransactions(updatedTxns);
    safeSetItem('breeder_wallet_balance', String(newBal));
    safeSetItem('breeder_wallet_txns', JSON.stringify(updatedTxns));

    toast.success(`Withdrawal of ₹${withdrawAmt.toLocaleString('en-IN')} initiated successfully! Funds will credit within 24 hours.`);
    setForm(initialForm);
    setShowWithdrawModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
        <p className="text-sm text-slate-500 font-medium">Track your breeding earnings and payouts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#0F2E23] to-[#1a4a3b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <DollarSign size={14} /> Available Balance
          </div>
          <div className="text-4xl font-black mb-4">₹{balance.toLocaleString('en-IN')}</div>
          <button 
            type="button"
            onClick={() => {
              setForm(initialForm);
              setShowWithdrawModal(true);
            }}
            className="w-full bg-white text-[#0F2E23] hover:bg-emerald-50 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            Withdraw Funds
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} /> Pending Clearance
          </div>
          <div className="text-3xl font-black text-slate-700 mb-1">₹8,000</div>
          <p className="text-xs text-slate-500 font-medium">Funds from recent successful matches will clear on Friday.</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Recent Mating Earnings & Withdrawals</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{t.pet}</td>
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'Cleared' || t.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${t.isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.isCredit ? `+₹${t.amount.toLocaleString('en-IN')}` : `-₹${t.amount.toLocaleString('en-IN')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b border-slate-100 shrink-0 bg-white z-10">
              <h3 className="font-sans font-black text-base sm:text-lg text-[#0F2E23]">Withdraw Funds to Bank</h3>
              <button 
                type="button"
                onClick={() => setShowWithdrawModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 sm:px-8 py-6 flex-1 custom-scrollbar">
              <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="e.g. 9845001239841"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={form.ifsc}
                    onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900 uppercase bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Withdrawal Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={balance}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="e.g. 5000"
                    className="w-full mt-1 border rounded-lg p-2.5 font-black text-sm text-[#0F2E23] bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Available Balance: ₹{balance.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer hover:bg-[#164E3D] transition shadow-sm"
                >
                  Confirm Withdrawal
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileModule = ({ user }) => {
  const [profileData, setProfileData] = useState(() => {
    const saved = safeGetItem('breeder_profile_info');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      facilityName: 'Elite Breeds Hub',
      experience: '5+ Years',
      about: 'Premium breeding facility with certified health clearances and genetic testing. We ensure the highest standard of care.',
      phone: user?.mobile || '+91 9845556677',
      email: user?.email || 'elitebreed@joshpetshub.com',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop'
    };
  });

  const photoInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileData(prev => ({ ...prev, avatar: event.target?.result }));
      toast.success('Profile photo updated! Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setProfileData(prev => ({ ...prev, avatar: '' }));
    toast.success('Photo removed. Click "Save Changes" to apply.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileData.facilityName.trim()) {
      toast.error('Facility Name is required.');
      return;
    }
    safeSetItem('breeder_profile_info', JSON.stringify(profileData));
    toast.success('Breeder profile updated successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-[#0F2E23]">Breeder Profile</h2>
        <p className="text-sm text-slate-500 font-medium">Manage your public breeding provider information.</p>
      </div>
      
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <PawPrint size={32} className="text-slate-400" />
              )}
            </div>
            <input 
              type="file" 
              ref={photoInputRef}
              onChange={handlePhotoUpload}
              className="hidden" 
              accept="image/*"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                {profileData.avatar ? 'Change' : 'Upload'}
              </button>
              {profileData.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <h3 className="text-lg font-black text-[#0F2E23] mb-1">{user?.name || 'Verified Breeder'}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{profileData.email} • {profileData.phone}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Facility Name *</label>
                <input 
                  type="text" 
                  value={profileData.facilityName}
                  onChange={(e) => setProfileData({ ...profileData, facilityName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Experience</label>
                <input 
                  type="text" 
                  value={profileData.experience}
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">About Facility</label>
                <textarea 
                  rows="3" 
                  value={profileData.about}
                  onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                type="submit"
                className="bg-[#0F2E23] hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const BreedingProviderContent = ({ activeTab, user }) => {
  switch (activeTab) {
    case 'listings': return <ListingsModule user={user} />;
    case 'matches': return <MatchesModule user={user} />;
    case 'messages': return <MessagesModule user={user} />;
    case 'reviews': return <ReviewsModule user={user} />;
    case 'wallet': return <WalletModule />;
    case 'profile': return <ProfileModule user={user} />;
    default: return <ListingsModule user={user} />;
  }
};

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

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop';
  const displayName = user?.name || currentProvider?.name || 'Provider';

  return (
    <div className="min-h-auto lg:h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col lg:flex-row">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border-r border-slate-200 relative lg:sticky top-0 lg:top-[104px] h-auto lg:h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-6 lg:pt-12 space-y-8">
          
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
      <main className="flex-1 min-w-0 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        
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
        <div className="bg-white rounded-3xl p-8 lg:p-4 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <BreedingProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default BreedingProviderDashboard;
