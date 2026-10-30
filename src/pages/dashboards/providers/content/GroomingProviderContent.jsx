import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, Search, Send,
  Calendar, Star, MessageSquare, Clock, CreditCard, Building, Check, Video, 
  Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, 
  Download, Edit3, HeartPulse, StarHalf, Home, Image as ImageIcon, Scissors, 
  Sparkles, Upload, Store, Wallet, Landmark, X, ShieldCheck, Trash2, Eye, 
  CheckCircle, ArrowRight, Filter, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../../../services/api.js';
import { updateProfile } from '../../../../store/slices/authSlice.js';
import { safeSetItem, safeGetItem } from '../../../../utils/safeStorage.js';
import { getStoredGroomingBookings } from '../../../../data/groomingData.js';

// Default Velvet Fur Spa Before & After Grooming Transformations
const DEFAULT_GROOMING_GALLERY = [
  {
    id: 'groom-gal-1',
    title: 'Shih Tzu Full Summer Teddy Cut',
    petName: 'Bella (Shih Tzu, 2 yrs)',
    category: 'Full Grooming & Styling',
    beforeUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=800&auto=format&fit=crop',
    description: 'De-matting coat bath, round face teddy styling, sanitary trim and blueberry facial.',
    uploadedAt: 'Today'
  },
  {
    id: 'groom-gal-2',
    title: 'Golden Retriever De-shedding & Conditioning Spa',
    petName: 'Max (Golden Retriever, 3 yrs)',
    category: 'De-shedding & Spa Bath',
    beforeUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop',
    description: 'Undercoat blowout, oatmeal anti-itch bath, paw pad butter and ear cleansing.',
    uploadedAt: 'Yesterday'
  },
  {
    id: 'groom-gal-3',
    title: 'Poodle Royal Show Clip & Ear Fluffing',
    petName: 'Coco (Toy Poodle, 1.5 yrs)',
    category: 'Creative Breed Styling',
    beforeUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
    description: 'Scissored lamb clip, topknot fluffing, tear stain removal, teeth hygiene gel.',
    uploadedAt: '3 days ago'
  },
  {
    id: 'groom-gal-4',
    title: 'Persian Cat Medicated De-matting & Bath',
    petName: 'Luna (Persian Cat, 4 yrs)',
    category: 'Feline Spa & Hygiene',
    beforeUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop',
    description: 'Gentle waterless foam bath, knot removal, lion trim on tail and nail capping.',
    uploadedAt: '4 days ago'
  },
  {
    id: 'groom-gal-5',
    title: 'Cocker Spaniel Silky Feather Trim',
    petName: 'Charlie (English Cocker, 2.5 yrs)',
    category: 'Full Grooming & Styling',
    beforeUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
    description: 'Ear canal cleaning, silky coat conditioning, sanitary clipping and fragrance spritz.',
    uploadedAt: 'Last week'
  },
  {
    id: 'groom-gal-6',
    title: 'Husky Deep High-Velocity Blowout',
    petName: 'Ghost (Siberian Husky, 3 yrs)',
    category: 'De-shedding & Spa Bath',
    beforeUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?q=80&w=800&auto=format&fit=crop',
    afterUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=800&auto=format&fit=crop',
    description: 'Removed 1.2kg loose undercoat with velocity dryer and deep keratin coat therapy.',
    uploadedAt: '2 weeks ago'
  }
];

const GALLERY_CATEGORIES = [
  'All',
  'Full Grooming & Styling',
  'De-shedding & Spa Bath',
  'Creative Breed Styling',
  'Feline Spa & Hygiene'
];

const GroomingProviderContent = ({ activeTab }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [serviceId, setServiceId] = useState(null);

  const [profile, setProfile] = useState({
    id: user?._id || 'my-grooming-profile',
    avatar: user?.avatar || user?.profilePicture || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
    name: user?.name || 'Velvet Fur Grooming Studio',
    registration: user?.govtProofNumber || 'GROOM-2023-KA-99',
    certifications: 'Certified Master Groomer (NDGAA)',
    studioName: user?.businessName || user?.name || 'Velvet Fur Premium Spa',
    address: user?.location || 'Indiranagar, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    experienceDisplay: '5+ Years Exp.',
    experienceYears: 5,
    rating: 4.8,
    reviewsCount: 156,
    phone: user?.mobile || '+91 98765 43210',
    isVerified: true,
    openTodayTiming: '10:00 AM - 08:00 PM',
    bio: user?.bio || 'Premium pet spa offering stress-free grooming and medicated baths.',
    facilities: ['Air Conditioned', 'CCTV Monitored', 'Medicated Baths'],
  });

  const [schedule, setSchedule] = useState({
    acceptingWalkIns: true,
    days: {
      Monday: { isOpen: true, start: '10:00', end: '20:00' },
      Tuesday: { isOpen: true, start: '10:00', end: '20:00' },
      Wednesday: { isOpen: true, start: '10:00', end: '20:00' },
      Thursday: { isOpen: true, start: '10:00', end: '20:00' },
      Friday: { isOpen: true, start: '10:00', end: '20:00' },
      Saturday: { isOpen: true, start: '09:00', end: '21:00' },
      Sunday: { isOpen: false, start: '10:00', end: '18:00' },
    }
  });

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...prev.days[day], isOpen: !prev.days[day].isOpen }
      }
    }));
  };

  const updateTime = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...prev.days[day], [field]: value }
      }
    }));
  };

  const initialGroomingInquiries = [
    {
      id: 1,
      name: 'Priya Sharma',
      pet: 'Shih Tzu (Leo)',
      service: 'Bath & Brush',
      date: '10:42 AM',
      initials: 'P',
      color: 'bg-emerald-100 text-emerald-700',
      isUnread: true
    },
    {
      id: 2,
      name: 'Rajesh Verma',
      pet: 'Golden Retriever (Buddy)',
      service: 'Full Grooming & Styling',
      date: 'Yesterday',
      initials: 'R',
      color: 'bg-amber-100 text-amber-700',
      isUnread: false
    },
    {
      id: 3,
      name: 'Ananya Roy',
      pet: 'Persian Cat (Snowy)',
      service: 'De-shedding & Hygiene',
      date: 'Oct 25',
      initials: 'A',
      color: 'bg-blue-100 text-blue-700',
      isUnread: false
    }
  ];

  const [groomingInquiries, setGroomingInquiries] = useState(() => {
    const saved = safeGetItem('grooming_client_inquiries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialGroomingInquiries;
  });

  const [selectedGroomId, setSelectedGroomId] = useState(1);
  const [groomingSearchQuery, setGroomingSearchQuery] = useState('');
  const [showGroomSettingsMenu, setShowGroomSettingsMenu] = useState(false);
  const [groomingBlockedClients, setGroomingBlockedClients] = useState(() => {
    const saved = safeGetItem('grooming_blocked_clients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const [groomingThreads, setGroomingThreads] = useState(() => {
    const saved = safeGetItem('grooming_chat_threads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      1: [
        { id: 101, sender: 'client', text: "Hi, I'd like to book a bath for my Shih Tzu. Do you use hypoallergenic shampoo? He has sensitive skin.", time: '10:42 AM' }
      ],
      2: [
        { id: 201, sender: 'client', text: "Hello! Does the Full Grooming package include nail grinding and blueberry facial?", time: 'Yesterday, 3:15 PM' }
      ],
      3: [
        { id: 301, sender: 'client', text: "Can you groom a slightly anxious Persian cat without sedation? She gets nervous around blow dryers.", time: 'Oct 25, 11:20 AM' }
      ]
    };
  });

  const [messageInput, setMessageInput] = useState('');

  const activeGroomInquiry = groomingInquiries.find(inq => inq.id === selectedGroomId) || groomingInquiries[0];
  const isCurrentGroomBlocked = Boolean(groomingBlockedClients[activeGroomInquiry?.id] || activeGroomInquiry?.isBlocked);
  const activeGroomMessages = groomingThreads[selectedGroomId] || [];

  const handleSelectGroomInquiry = (id) => {
    setSelectedGroomId(id);
    setShowGroomSettingsMenu(false);
    setGroomingInquiries(prev => {
      const updated = prev.map(inq => inq.id === id ? { ...inq, isUnread: false } : inq);
      safeSetItem('grooming_client_inquiries', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleBlockGroomClient = () => {
    setShowGroomSettingsMenu(false);
    if (!activeGroomInquiry) return;

    const currentlyBlocked = Boolean(groomingBlockedClients[selectedGroomId] || activeGroomInquiry.isBlocked);
    const nextBlocked = !currentlyBlocked;

    const updatedBlockedMap = {
      ...groomingBlockedClients,
      [selectedGroomId]: nextBlocked
    };
    setGroomingBlockedClients(updatedBlockedMap);
    safeSetItem('grooming_blocked_clients', JSON.stringify(updatedBlockedMap));

    setGroomingInquiries(prev => {
      const updated = prev.map(inq => inq.id === selectedGroomId ? { ...inq, isBlocked: nextBlocked } : inq);
      safeSetItem('grooming_client_inquiries', JSON.stringify(updated));
      return updated;
    });

    if (nextBlocked) {
      toast.error(`Client ${activeGroomInquiry.name} has been blocked.`);
    } else {
      toast.success(`Client ${activeGroomInquiry.name} has been unblocked.`);
    }
  };

  const handleSendGroomReply = (e) => {
    if (e) e.preventDefault();
    if (!activeGroomInquiry) return;
    if (isCurrentGroomBlocked) {
      toast.error(`Cannot send message: Client ${activeGroomInquiry.name} is currently blocked. Unblock to send messages.`);
      return;
    }
    const trimmed = messageInput.trim();
    if (!trimmed) {
      toast.error('Please enter a message before sending.');
      return;
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'provider',
      text: trimmed,
      time: timeNow
    };

    const updatedThread = [...(groomingThreads[selectedGroomId] || []), newMsg];
    const newThreads = {
      ...groomingThreads,
      [selectedGroomId]: updatedThread
    };

    setGroomingThreads(newThreads);
    safeSetItem('grooming_chat_threads', JSON.stringify(newThreads));
    setMessageInput('');
    toast.success(`Reply sent to ${activeGroomInquiry.name}!`);
  };

  const handleExportGroomChat = () => {
    setShowGroomSettingsMenu(false);
    if (!activeGroomInquiry) return;
    const transcript = (groomingThreads[selectedGroomId] || [])
      .map(m => `[${m.time}] ${m.sender === 'provider' ? 'You' : activeGroomInquiry.name}: ${m.text}`)
      .join('\n');
    navigator.clipboard?.writeText(transcript);
    toast.success('Chat transcript copied to clipboard!');
  };

  const handleToggleGroomUnread = () => {
    setShowGroomSettingsMenu(false);
    if (!activeGroomInquiry) return;
    setGroomingInquiries(prev => {
      const updated = prev.map(inq => inq.id === selectedGroomId ? { ...inq, isUnread: !inq.isUnread } : inq);
      safeSetItem('grooming_client_inquiries', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Toggled unread status for ${activeGroomInquiry.name}`);
  };
  
  const [packagesState, setPackagesState] = useState({
    fullGroom: { active: true, fee: 1500 },
    bathBrush: { active: true, fee: 800 },
    nailClip: { active: true, fee: 300 },
  });

  const togglePackage = (key) => setPackagesState(p => ({ ...p, [key]: { ...p[key], active: !p[key].active }}));
  const updatePackageFee = (key, val) => setPackagesState(p => ({ ...p, [key]: { ...p[key], fee: val }}));

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Before & After Gallery State (Velvet Fur Spa)
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = safeGetItem('velvet_grooming_gallery_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GROOMING_GALLERY;
  });

  const [galleryFilter, setGalleryFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState(null);
  const [activePhotoTabs, setActivePhotoTabs] = useState({}); // { [photoId]: 'after' | 'before' }

  // New Photo Form State
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoPet, setNewPhotoPet] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Full Grooming & Styling');
  const [newPhotoBeforeUrl, setNewPhotoBeforeUrl] = useState('');
  const [newPhotoAfterUrl, setNewPhotoAfterUrl] = useState('');
  const [newPhotoDescription, setNewPhotoDescription] = useState('');

  const saveGalleryState = (updated) => {
    setGalleryPhotos(updated);
    safeSetItem('velvet_grooming_gallery_v1', JSON.stringify(updated));
  };

  const handleFileUpload = (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (targetField === 'before') {
        setNewPhotoBeforeUrl(reader.result);
      } else {
        setNewPhotoAfterUrl(reader.result);
      }
      toast.success(`${targetField === 'before' ? 'Before' : 'After'} photo selected!`);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhotoSubmit = (e) => {
    e.preventDefault();
    if (!newPhotoAfterUrl.trim()) {
      toast.error('Please provide at least the "After Grooming" transformation photo URL or file.');
      return;
    }
    if (!newPhotoTitle.trim()) {
      toast.error('Please enter a title for this grooming transformation.');
      return;
    }

    const newPhoto = {
      id: `groom-gal-${Date.now()}`,
      title: newPhotoTitle.trim(),
      petName: newPhotoPet.trim() || 'Grooming Client',
      category: newPhotoCategory,
      beforeUrl: newPhotoBeforeUrl.trim() || newPhotoAfterUrl.trim(),
      afterUrl: newPhotoAfterUrl.trim(),
      description: newPhotoDescription.trim() || 'Professional pet grooming & spa treatment.',
      uploadedAt: 'Just now'
    };

    const updated = [newPhoto, ...galleryPhotos];
    saveGalleryState(updated);
    setShowUploadModal(false);

    // Reset Form
    setNewPhotoTitle('');
    setNewPhotoPet('');
    setNewPhotoCategory('Full Grooming & Styling');
    setNewPhotoBeforeUrl('');
    setNewPhotoAfterUrl('');
    setNewPhotoDescription('');
    toast.success('🎉 Grooming transformation photo published to gallery!');
  };

  const handleDeletePhoto = (photoId, e) => {
    if (e) e.stopPropagation();
    const updated = galleryPhotos.filter(p => p.id !== photoId);
    saveGalleryState(updated);
    toast.success('Photo removed from gallery');
    if (selectedPhotoForPreview?.id === photoId) {
      setSelectedPhotoForPreview(null);
    }
  };

  const toggleCardPhotoView = (photoId, tab, e) => {
    if (e) e.stopPropagation();
    setActivePhotoTabs(prev => ({
      ...prev,
      [photoId]: tab
    }));
  };

  const [walletBalance, setWalletBalance] = useState(8450);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('8450');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    if (!num || num <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (num > walletBalance) {
      toast.error('Amount exceeds available balance');
      return;
    }
    setIsSubmittingWithdraw(true);
    setTimeout(() => {
      setWalletBalance(prev => prev - num);
      setIsSubmittingWithdraw(false);
      setShowWithdrawModal(false);
      toast.success(`Withdrawal of ₹${num.toLocaleString('en-IN')} requested successfully!`);
    }, 500);
  };

  const [appointments, setAppointments] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookRes = await apiRequest('/bookings/provider');
      let providerBookings = [];
      if (bookRes && bookRes.success && Array.isArray(bookRes.bookings)) {
        providerBookings = [...bookRes.bookings];
      }
      try {
        const local = getStoredGroomingBookings();
        const ids = new Set(providerBookings.map(b => b.id || b._id));
        for (const b of local) {
          if (!ids.has(b.id || b._id)) {
            providerBookings.push(b);
            ids.add(b.id || b._id);
          }
        }
      } catch (e) {
        console.warn('Error merging local grooming bookings:', e);
      }
      setAppointments(providerBookings);

      // Fetch provider service
      const servRes = await apiRequest('/services/provider');
      if (servRes.success && servRes.services && servRes.services.length > 0) {
        // Find a grooming service, or just take the first one
        const srv = servRes.services.find(s => s.category === 'Grooming') || servRes.services[0];
        setServiceId(srv._id);
        
        if (srv.schedule) {
           setSchedule({
             acceptingWalkIns: srv.acceptingWalkIns !== false,
             days: srv.schedule
           });
        }
        
        if (srv.packages && srv.packages.length > 0) {
           const newPkgState = { 
             fullGroom: { active: false, fee: 1500 },
             bathBrush: { active: false, fee: 800 },
             nailClip: { active: false, fee: 300 }
           };
           srv.packages.forEach(p => {
              if (p.name === 'Full Grooming') newPkgState.fullGroom = { active: true, fee: p.price };
              if (p.name === 'Bath & Brush') newPkgState.bathBrush = { active: true, fee: p.price };
              if (p.name === 'Nail Clipping') newPkgState.nailClip = { active: true, fee: p.price };
           });
           setPackagesState(newPkgState);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    const result = await dispatch(updateProfile({
      name: profile.name,
      businessName: profile.studioName,
      location: profile.address,
      mobile: profile.phone,
      bio: profile.bio,
      govtProofNumber: profile.registration
    }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  const savePackages = async () => {
     try {
       const pkgs = [];
       if (packagesState.fullGroom.active) pkgs.push({ name: 'Full Grooming', price: packagesState.fullGroom.fee });
       if (packagesState.bathBrush.active) pkgs.push({ name: 'Bath & Brush', price: packagesState.bathBrush.fee });
       if (packagesState.nailClip.active) pkgs.push({ name: 'Nail Clipping', price: packagesState.nailClip.fee });

       if (serviceId) {
         await apiRequest(`/services/${serviceId}`, {
           method: 'PUT',
           body: JSON.stringify({ packages: pkgs })
         });
         toast.success('Packages & Pricing updated successfully!');
       } else {
         toast.error('No service profile found. Please contact support.');
       }
     } catch (err) {
       toast.error('Failed to save packages');
     }
  };

  const saveSchedule = async () => {
     try {
       if (serviceId) {
         await apiRequest(`/services/${serviceId}`, {
           method: 'PUT',
           body: JSON.stringify({ 
             schedule: schedule.days,
             acceptingWalkIns: schedule.acceptingWalkIns 
           })
         });
         toast.success('Schedule saved successfully!');
       } else {
         toast.error('No service profile found. Please contact support.');
       }
     } catch (err) {
       toast.error('Failed to save schedule');
     }
  };

  return (
    <div className="w-full">
      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Studio Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional details and studio amenities.</p>
            </div>
            <button 
              onClick={saveProfile}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save & Publish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-6">
                <div className="relative group cursor-pointer w-24 h-24 shrink-0">
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Upload size={20} className="text-white" />
                  </div>
                  <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio / Profile Image</label>
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registration / Trade License</label>
                <input type="text" name="registration" value={profile.registration} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certifications (e.g. NDGAA)</label>
                <input type="text" name="certifications" value={profile.certifications} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City</label>
                  <input type="text" name="city" value={profile.city} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">State</label>
                  <input type="text" name="state" value={profile.state} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Studio Address</label>
                <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none" placeholder="Tell pet parents about your grooming approach..."></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Spa Appointments & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage today's schedule and upcoming grooming sessions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100">
                No appointments found for today.
              </div>
            ) : (
              appointments.map((apt, idx) => {
                const isPending = apt.status === 'Pending' || apt.status === 'Confirmed';
                const dateObj = new Date(apt.date || apt.createdAt);
                
                return (
                  <div key={apt._id || idx} className={`bg-white border-l-4 ${isPending ? 'border-l-amber-500' : 'border-l-emerald-500 opacity-70'} border-y border-r border-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center font-bold`}>
                          {apt.petDetails?.name ? apt.petDetails.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{apt.petDetails?.name || 'Pet'} ({apt.petDetails?.breed || 'Unknown'})</h3>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{dateObj.toLocaleDateString()} • {apt.serviceType || 'Grooming'}</p>
                        </div>
                      </div>
                      {isPending ? (
                        <span className="bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">{apt.timeSlot || 'Scheduled'}</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> {apt.status}</span>
                      )}
                    </div>
                    {isPending && (
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => toast.success('Session started')} className="flex-1 bg-[#0F2E23] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-[#163e30] transition">Start Session</button>
                        <button onClick={() => toast.success('Reschedule request sent')} className="flex-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-slate-200 transition">Reschedule</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Grooming Packages & Pricing</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your offered services and base pricing.</p>
            </div>
            <button 
              onClick={savePackages}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Sparkles size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Full Grooming</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Bath, haircut, nail clipping, ear cleaning, and styling.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('fullGroom')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.fullGroom.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.fullGroom.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Starts at)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.fullGroom.fee} onChange={e => updatePackageFee('fullGroom', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Building size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Bath & Brush</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Medicated or soothing bath, blow dry, and thorough brushing.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('bathBrush')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.bathBrush.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.bathBrush.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Starts at)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.bathBrush.fee} onChange={e => updatePackageFee('bathBrush', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Scissors size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Nail Clipping</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Quick and safe nail trimming and filing service.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('nailClip')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.nailClip.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.nailClip.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Fixed)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.nailClip.fee} onChange={e => updatePackageFee('nailClip', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Add-On Services</h3>
              <button onClick={() => toast.success('Add-on modal opened')} className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest hover:text-emerald-700 transition"><Plus size={14}/> Add New</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Teeth Cleaning', 'De-shedding Treatment', 'Flea & Tick Bath', 'Ear Cleaning'].map((spec, i) => (
                <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                  {spec} <span onClick={() => toast.success(`Removed ${spec}`)} className="text-slate-300 hover:text-red-500 cursor-pointer transition">×</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-[#0F2E23]">Before & After Gallery</h2>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                  {galleryPhotos.length} Transformations
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Showcase your grooming artistry and pet transformations to prospective pet parents.
              </p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer hover:shadow-lg"
            >
              <Plus size={16} /> Upload Photo
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  galleryFilter === cat
                    ? 'bg-[#0F2E23] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {galleryPhotos.filter(p => galleryFilter === 'All' || p.category === galleryFilter).length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No transformations in this category</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload Before & After photos of your styled pets to showcase your grooming skills.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-5 py-2.5 bg-[#0F2E23] text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} /> Upload Transformation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos
                .filter(p => galleryFilter === 'All' || p.category === galleryFilter)
                .map((photo) => {
                  const currentView = activePhotoTabs[photo.id] || 'after';
                  const activeImg = currentView === 'before' ? photo.beforeUrl : photo.afterUrl;

                  return (
                    <div 
                      key={photo.id}
                      onClick={() => setSelectedPhotoForPreview(photo)}
                      className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      {/* Photo Area with Toggle */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img 
                          src={activeImg || photo.afterUrl} 
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />

                        {/* Top Left View Switcher */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md flex items-center gap-1 z-10 border border-slate-200/60"
                        >
                          <button
                            type="button"
                            onClick={(e) => toggleCardPhotoView(photo.id, 'before', e)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                              currentView === 'before'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Before
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleCardPhotoView(photo.id, 'after', e)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                              currentView === 'after'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            After
                          </button>
                        </div>

                        {/* Top Right Quick Actions */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhotoForPreview(photo);
                            }}
                            title="Full comparison view"
                            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-md transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePhoto(photo.id, e)}
                            title="Delete photo"
                            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center shadow-md transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Bottom Tag on image */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
                            currentView === 'after'
                              ? 'bg-emerald-600/90 text-white'
                              : 'bg-amber-600/90 text-white'
                          }`}>
                            {currentView === 'after' ? '✨ After Grooming' : '📷 Before Grooming'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                              {photo.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{photo.uploadedAt}</span>
                          </div>
                          <h3 className="font-black text-slate-800 text-sm group-hover:text-emerald-800 transition">
                            {photo.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1">
                            <span>🐾</span> {photo.petName}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {photo.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-black">
                          <span>Click for side-by-side view</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Upload Photo Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 animate-fadeIn max-h-[92vh] overflow-y-auto text-slate-800">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0F2E23]">Upload Before & After Transformation</h3>
                    <p className="text-xs text-slate-500 font-medium">Showcase grooming results to pet parents booking appointments.</p>
                  </div>
                </div>

                <form onSubmit={handleUploadPhotoSubmit} className="space-y-4 mt-5">
                  {/* Title & Pet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Transformation Title *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Teddy Bear Cut & Blueberry Facial"
                        value={newPhotoTitle}
                        onChange={e => setNewPhotoTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Pet Name & Breed *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Milo (Shih Tzu, 1.5 yrs)"
                        value={newPhotoPet}
                        onChange={e => setNewPhotoPet(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Service Category
                    </label>
                    <select
                      value={newPhotoCategory}
                      onChange={e => setNewPhotoCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Full Grooming & Styling">Full Grooming & Styling</option>
                      <option value="De-shedding & Spa Bath">De-shedding & Spa Bath</option>
                      <option value="Creative Breed Styling">Creative Breed Styling</option>
                      <option value="Feline Spa & Hygiene">Feline Spa & Hygiene</option>
                      <option value="Nail & Paw Therapy">Nail & Paw Therapy</option>
                    </select>
                  </div>

                  {/* Two Photo Pickers: Before and After */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Before Photo */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          📷 Before Grooming
                        </span>
                        {newPhotoBeforeUrl && (
                          <span className="text-[10px] text-emerald-600 font-bold">✓ Selected</span>
                        )}
                      </div>

                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Choose File From Device
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'before')}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 transition cursor-pointer"
                      />

                      <div className="pt-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                          Or Paste Image URL
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..."
                          value={newPhotoBeforeUrl}
                          onChange={e => setNewPhotoBeforeUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {newPhotoBeforeUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-slate-200 relative">
                          <img src={newPhotoBeforeUrl} alt="Before preview" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Before Preview
                          </span>
                        </div>
                      )}
                    </div>

                    {/* After Photo */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          ✨ After Grooming *
                        </span>
                        {newPhotoAfterUrl && (
                          <span className="text-[10px] text-emerald-600 font-bold">✓ Selected</span>
                        )}
                      </div>

                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Choose File From Device
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'after')}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 transition cursor-pointer"
                      />

                      <div className="pt-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                          Or Paste Image URL
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..."
                          value={newPhotoAfterUrl}
                          onChange={e => setNewPhotoAfterUrl(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {newPhotoAfterUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-slate-200 relative">
                          <img src={newPhotoAfterUrl} alt="After preview" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            After Preview
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* One-Click Quick Presets for Demo / Testing */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                      Quick Fill Sample Transformations (1-Click Test)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: 'Shih Tzu Cut',
                          title: 'Shih Tzu Asian Fusion Face & Teddy Trim',
                          pet: 'Simba (Shih Tzu, 2 yrs)',
                          cat: 'Full Grooming & Styling',
                          before: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=800&auto=format&fit=crop',
                          after: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=800&auto=format&fit=crop',
                          desc: 'Full scissor sculpt, round muzzle styling, blueberry face scrub and silky coat gloss.'
                        },
                        {
                          label: 'Retriever Spa',
                          title: 'Golden Retriever Shed-Control & Hydrating Bath',
                          pet: 'Oscar (Golden Retriever, 3 yrs)',
                          cat: 'De-shedding & Spa Bath',
                          before: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
                          after: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop',
                          desc: 'Undercoat blow-out, oatmeal soothing conditioning, paw wax and ear sanitation.'
                        },
                        {
                          label: 'Poodle Royal',
                          title: 'Poodle Lamb Clip & Ear Fluffing',
                          pet: 'Koko (Toy Poodle, 1 yr)',
                          cat: 'Creative Breed Styling',
                          before: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
                          after: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
                          desc: 'Scissored leg columns, topknot band, breath freshness treatment and vanilla mist.'
                        }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewPhotoTitle(preset.title);
                            setNewPhotoPet(preset.pet);
                            setNewPhotoCategory(preset.cat);
                            setNewPhotoBeforeUrl(preset.before);
                            setNewPhotoAfterUrl(preset.after);
                            setNewPhotoDescription(preset.desc);
                          }}
                          className="p-1.5 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/40 transition text-left cursor-pointer"
                        >
                          <div className="flex gap-1 mb-1">
                            <img src={preset.before} alt="B" className="w-1/2 h-8 object-cover rounded" />
                            <img src={preset.after} alt="A" className="w-1/2 h-8 object-cover rounded" />
                          </div>
                          <p className="text-[9px] font-bold text-slate-700 truncate">{preset.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Grooming Treatment & Care Notes
                    </label>
                    <textarea 
                      rows="2"
                      placeholder="Describe the styling, tools used, medicated bath details, etc."
                      value={newPhotoDescription}
                      onChange={e => setNewPhotoDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 resize-none focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3">
                    <button 
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} /> Publish to Gallery
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Full Comparison Lightbox Modal */}
          {selectedPhotoForPreview && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-6 animate-fadeIn max-h-[92vh] overflow-y-auto">
                <button 
                  onClick={() => setSelectedPhotoForPreview(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer z-10"
                >
                  <X size={22} />
                </button>

                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {selectedPhotoForPreview.category}
                  </span>
                  <h3 className="text-xl font-black text-[#0F2E23] mt-2">{selectedPhotoForPreview.title}</h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">🐾 {selectedPhotoForPreview.petName} • Uploaded {selectedPhotoForPreview.uploadedAt}</p>
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-amber-700">
                      <span>BEFORE GROOMING</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Arrived at Velvet Fur Spa</span>
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                      <img 
                        src={selectedPhotoForPreview.beforeUrl} 
                        alt="Before" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-700">
                      <span>AFTER GROOMING</span>
                      <span className="text-[10px] text-emerald-600 font-bold">✨ Styled & Cleaned</span>
                    </div>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-emerald-200 shadow-sm">
                      <img 
                        src={selectedPhotoForPreview.afterUrl} 
                        alt="After" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Treatment & Styling Notes</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedPhotoForPreview.description}</p>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleDeletePhoto(selectedPhotoForPreview.id)}
                    className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Remove Photo
                  </button>
                  <button
                    onClick={() => setSelectedPhotoForPreview(null)}
                    className="px-6 py-2.5 bg-[#0F2E23] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#163e30] transition cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HOURS TAB */}
      {activeTab === 'hours' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Studio Hours & Availability</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your weekly schedule and walk-in availability.</p>
            </div>
            <button onClick={saveSchedule} className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Schedule
            </button>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-xl mt-1">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F2E23]">Accepting Walk-Ins?</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">Turn this on if you accept walk-in grooming without prior appointment.</p>
              </div>
            </div>
            <div 
              onClick={() => setSchedule(p => ({ ...p, acceptingWalkIns: !p.acceptingWalkIns }))}
              className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 shrink-0 ${schedule.acceptingWalkIns ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${schedule.acceptingWalkIns ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Weekly Operating Hours</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.keys(schedule.days).map((day) => (
                <div key={day} className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!schedule.days[day].isOpen ? 'bg-slate-50/50 opacity-75' : ''}`}>
                  <div className="flex items-center gap-4 w-40">
                    <div 
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${schedule.days[day].isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${schedule.days[day].isOpen ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                    <span className={`font-bold ${schedule.days[day].isOpen ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                  </div>
                  
                  {schedule.days[day].isOpen ? (
                    <div className="flex items-center gap-3 w-full max-w-sm">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-sm">
                        <Clock3 size={14} className="text-slate-400 mr-2" />
                        <input type="time" value={schedule.days[day].start} onChange={(e) => updateTime(day, 'start', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full" />
                      </div>
                      <span className="text-slate-400 font-bold text-xs uppercase">To</span>
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-sm">
                        <Clock3 size={14} className="text-slate-400 mr-2" />
                        <input type="time" value={schedule.days[day].end} onChange={(e) => updateTime(day, 'end', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm text-sm font-black text-rose-500 uppercase tracking-widest pl-2">Closed</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Customer Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Monitor your ratings and reply to client feedback.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-5xl font-black text-[#0F2E23] flex items-baseline gap-2">4.8 <span className="text-lg font-bold text-slate-400">/ 5.0</span></div>
              <div className="flex gap-1 text-[#ffd000] mt-2">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <StarHalf size={18} fill="currentColor" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-3">Based on 156 Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-fadeIn">
           <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Track your grooming earnings and bank settlements.</p>
            </div>
            <button 
              onClick={() => {
                setWithdrawAmount(walletBalance.toString());
                setShowWithdrawModal(true);
              }}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Wallet size={16} /> Withdraw to Bank
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Current Balance</h3>
            <div className="text-4xl font-black text-[#0F2E23]">₹{walletBalance.toLocaleString('en-IN')}</div>
            <button 
              onClick={() => {
                setWithdrawAmount(walletBalance.toString());
                setShowWithdrawModal(true);
              }}
              className="mt-4 px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-sm"
            >
              Withdraw to Bank
            </button>
          </div>

          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowWithdrawModal(false)}>
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Landmark size={20} className="text-[#0F2E23]" />
                    <h3 className="font-black text-[#0F2E23] text-base">Withdraw to Bank</h3>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-emerald-800">Available Balance:</span>
                    <span className="font-black text-[#0F2E23] text-base">₹{walletBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Amount (₹) *</label>
                    <input 
                      type="number"
                      required
                      min="500"
                      max={walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destination Bank Account</label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                      <span>HDFC Bank (••••5678)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">Verified</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmittingWithdraw} className="flex-1 py-2.5 bg-[#0F2E23] text-white rounded-xl font-black uppercase tracking-wider hover:bg-[#163e30] cursor-pointer">
                      {isSubmittingWithdraw ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Client Inquiries</h2>
              <p className="text-sm text-slate-500 font-medium">Respond to spa booking questions, product inquiries, and grooming consultation requests.</p>
            </div>
            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              {groomingInquiries.filter(i => i.isUnread).length} Unread
            </div>
          </div>

          <div className="h-[620px] flex border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            {/* Chat List */}
            <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search inquiries..." 
                    value={groomingSearchQuery}
                    onChange={(e) => setGroomingSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800" 
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {groomingInquiries
                  .filter(inq => 
                    inq.name.toLowerCase().includes(groomingSearchQuery.toLowerCase()) ||
                    inq.pet.toLowerCase().includes(groomingSearchQuery.toLowerCase()) ||
                    inq.service.toLowerCase().includes(groomingSearchQuery.toLowerCase())
                  )
                  .map((inq) => {
                    const isSelected = inq.id === selectedGroomId;
                    const isBlocked = Boolean(groomingBlockedClients[inq.id] || inq.isBlocked);
                    const lastMsg = groomingThreads[inq.id]?.[groomingThreads[inq.id].length - 1]?.text || 'New message';

                    return (
                      <div 
                        key={inq.id}
                        onClick={() => handleSelectGroomInquiry(inq.id)}
                        className={`p-4 cursor-pointer transition ${
                          isSelected ? 'bg-white border-l-4 border-l-emerald-600 shadow-2xs' : 'hover:bg-white/80 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-sm font-bold ${isSelected ? 'text-[#0F2E23]' : inq.isUnread ? 'text-[#0F2E23] font-black' : 'text-slate-700'}`}>
                              {inq.name}
                            </h4>
                            {inq.isUnread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}
                            {isBlocked && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                                Blocked
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{inq.date}</span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-600 mb-1 flex items-center gap-1">
                          <PawPrint size={10} /> {inq.pet}
                        </div>
                        <p className={`text-xs line-clamp-1 ${inq.isUnread ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                          {lastMsg}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col relative bg-[#FAF9F5]/40">
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${activeGroomInquiry?.color || 'bg-slate-200 text-slate-700'}`}>
                    {activeGroomInquiry?.initials || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-[#0F2E23] text-base">{activeGroomInquiry?.name}</h4>
                      {isCurrentGroomBlocked && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-black flex items-center gap-1">
                          <AlertCircle size={10} /> Blocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold">🐾 {activeGroomInquiry?.pet} • Inquiry regarding {activeGroomInquiry?.service}</p>
                  </div>
                </div>

                {/* Settings dropdown menu */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowGroomSettingsMenu(!showGroomSettingsMenu)}
                    className="p-2 text-slate-400 hover:text-[#0F2E23] hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    title="Conversation Settings"
                  >
                    <Settings size={18} />
                  </button>

                  {showGroomSettingsMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden text-xs font-bold divide-y divide-slate-100 animate-fadeIn">
                      <button 
                        type="button"
                        onClick={handleToggleGroomUnread}
                        className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                      >
                        <Mail size={14} /> Mark as Unread
                      </button>
                      <button 
                        type="button"
                        onClick={handleExportGroomChat}
                        className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                      >
                        <Download size={14} /> Copy / Export Chat
                      </button>
                      <button 
                        type="button"
                        onClick={handleToggleBlockGroomClient}
                        className={`w-full text-left px-4 py-2.5 transition cursor-pointer flex items-center gap-2 ${
                          isCurrentGroomBlocked ? 'text-emerald-700 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        {isCurrentGroomBlocked ? (
                          <>
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>Unblock Pet Parent</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} className="text-rose-600" />
                            <span>Block Pet Parent</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Conversation History
                  </span>
                </div>

                {activeGroomMessages.map((msg) => {
                  const isProvider = msg.sender === 'provider';
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isProvider ? 'justify-end' : 'justify-start'}`}>
                      {!isProvider && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activeGroomInquiry?.color || 'bg-slate-200'}`}>
                          {activeGroomInquiry?.initials || 'C'}
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl max-w-[80%] text-sm shadow-xs ${
                        isProvider 
                          ? 'bg-[#0F2E23] text-white rounded-tr-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                      }`}>
                        <p className="font-medium whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <span className={`text-[9px] font-bold mt-2 block ${isProvider ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                      {isProvider && (
                        <div className="w-8 h-8 rounded-full bg-[#0F2E23] flex items-center justify-center text-[#ffd000] font-black text-xs shrink-0">
                          You
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input Area or Blocked notice */}
              {isCurrentGroomBlocked ? (
                <div className="p-4 bg-rose-50/80 border-t border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                    <span>You have blocked {activeGroomInquiry?.name}. Messages cannot be sent to this client until unblocked.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleBlockGroomClient}
                    className="px-4 py-2 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-2xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} className="text-emerald-600" /> Unblock Pet Parent
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendGroomReply} className="p-4 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
                    <input 
                      type="text" 
                      placeholder={`Type a message to ${activeGroomInquiry?.name || 'client'}...`}
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 px-3" 
                    />
                    <button 
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="px-4 py-2 bg-[#0F2E23] hover:bg-[#1a4a38] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send size={14} /> Send
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroomingProviderContent;
