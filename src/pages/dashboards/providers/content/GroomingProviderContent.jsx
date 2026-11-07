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
import ProviderWalletPayoutView from '../../../../components/dashboards/ProviderWalletPayoutView.jsx';
import ProviderReviewsView from '../../../../components/dashboards/ProviderReviewsView.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { apiRequest } from '../../../../services/api.js';
import { updateProfile } from '../../../../store/slices/authSlice.js';
import { safeSetItem, safeGetItem } from '../../../../utils/safeStorage.js';
import { 
  getStoredGroomingBookings,
  getStoredGroomingSchedule,
  saveGroomingSchedule,
  DEFAULT_GROOMING_SCHEDULE
} from '../../../../data/groomingData.js';

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

export const DEFAULT_GROOMING_ADDONS = [
  {
    id: 'addon-1',
    name: 'Teeth Cleaning & Breath Freshener',
    price: 350,
    duration: '15 mins',
    petType: 'All Pets',
    description: 'Enzymatic toothpaste tartar cleansing, plaque removal, and spearmint breath freshening spray.',
    active: true
  },
  {
    id: 'addon-2',
    name: 'De-shedding & Undercoat Blowout',
    price: 550,
    duration: '30 mins',
    petType: 'Dogs',
    description: 'High-velocity undercoat blowout and specialized deshedding fur treatment to eliminate loose hair.',
    active: true
  },
  {
    id: 'addon-3',
    name: 'Flea & Tick Defense Bath',
    price: 450,
    duration: '20 mins',
    petType: 'All Pets',
    description: 'Medicated organic neem herbal soak and tick repelling dip for fast parasite elimination.',
    active: true
  },
  {
    id: 'addon-4',
    name: 'Ear Cleaning & Hair Plucking',
    price: 250,
    duration: '15 mins',
    petType: 'All Pets',
    description: 'Gentle antiseptic ear canal flush, wax extraction, plucking, and soothing hygiene wipe.',
    active: true
  },
  {
    id: 'addon-5',
    name: 'Paw Pad Butter Spa & Balm',
    price: 200,
    duration: '10 mins',
    petType: 'All Pets',
    description: 'Nourishing organic shea butter and vitamin E balm massage for cracked paw pads and dry nose.',
    active: true
  }
];

export const PRESET_ADDONS = [
  { name: 'Blueberry Facial & Coat Glow', price: 350, duration: '15 mins', petType: 'All Pets', description: 'Antioxidant blueberry face massage, tear stain brightening, and coat shine conditioning.' },
  { name: 'Teeth Cleaning & Breath Freshener', price: 350, duration: '15 mins', petType: 'All Pets', description: 'Enzymatic tartar scrub and refreshing herbal breath spray.' },
  { name: 'Paw Pad Butter Spa & Balm', price: 200, duration: '10 mins', petType: 'All Pets', description: 'Deep shea butter moisturizing massage for paw pads and nose leather.' },
  { name: 'De-shedding & Undercoat Blowout', price: 550, duration: '30 mins', petType: 'Dogs', description: 'High-velocity undercoat blowout removing dead fur and stubborn mats.' },
  { name: 'Flea & Tick Defense Bath', price: 450, duration: '20 mins', petType: 'All Pets', description: 'Herbal medicated wash eliminating ticks, fleas, and larvae.' },
  { name: 'Nail Grinding & Precision Buffing', price: 250, duration: '15 mins', petType: 'All Pets', description: 'Smooth rounded edges with precision Dremel rotary tool.' },
  { name: 'Medicated Anti-Itch Soak', price: 400, duration: '20 mins', petType: 'All Pets', description: 'Colloidal oatmeal bath providing instant relief from itchy or dry skin.' },
  { name: 'Aromatherapy Fur Perfume Mist', price: 150, duration: '5 mins', petType: 'All Pets', description: 'Hypoallergenic lavender coat mist that leaves pets smelling fresh for days.' }
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

  const [schedule, setSchedule] = useState(() => getStoredGroomingSchedule(user));

  useEffect(() => {
    if (user) {
      const stored = getStoredGroomingSchedule(user);
      if (stored) {
        setSchedule(stored);
      }
    }
  }, [user?.email, user?._id]);

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
  
  const [packagesState, setPackagesState] = useState(() => {
    const saved = safeGetItem('velvet_grooming_packages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      fullGroom: { active: true, fee: 1500 },
      bathBrush: { active: true, fee: 800 },
      nailClip: { active: true, fee: 300 },
    };
  });

  const togglePackage = (key) => setPackagesState(p => ({ ...p, [key]: { ...p[key], active: !p[key].active }}));
  const updatePackageFee = (key, val) => setPackagesState(p => ({ ...p, [key]: { ...p[key], fee: val }}));

  // Add-On Services State
  const [addOns, setAddOns] = useState(() => {
    const saved = safeGetItem('velvet_grooming_addons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GROOMING_ADDONS;
  });

  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [editingAddOnId, setEditingAddOnId] = useState(null);
  const [addOnForm, setAddOnForm] = useState({
    name: '',
    price: '',
    duration: '15 mins',
    petType: 'All Pets',
    description: ''
  });

  const handleOpenAddOnModal = (addon = null) => {
    if (addon) {
      setEditingAddOnId(addon.id);
      setAddOnForm({
        name: addon.name,
        price: addon.price,
        duration: addon.duration || '15 mins',
        petType: addon.petType || 'All Pets',
        description: addon.description || ''
      });
    } else {
      setEditingAddOnId(null);
      setAddOnForm({
        name: '',
        price: '',
        duration: '15 mins',
        petType: 'All Pets',
        description: ''
      });
    }
    setShowAddOnModal(true);
  };

  const handleApplyPreset = (preset) => {
    setAddOnForm({
      name: preset.name,
      price: String(preset.price),
      duration: preset.duration,
      petType: preset.petType,
      description: preset.description
    });
  };

  const handleSaveAddOn = (e) => {
    e.preventDefault();
    const trimmedName = addOnForm.name.trim();
    const numPrice = Number(addOnForm.price);

    if (!trimmedName) {
      toast.error('Please enter the add-on service name.');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid price for the add-on service.');
      return;
    }

    let updatedList;
    if (editingAddOnId) {
      updatedList = addOns.map(item => item.id === editingAddOnId ? {
        ...item,
        name: trimmedName,
        price: numPrice,
        duration: addOnForm.duration,
        petType: addOnForm.petType,
        description: addOnForm.description.trim()
      } : item);
      toast.success(`Updated "${trimmedName}" successfully!`);
    } else {
      const newEntry = {
        id: 'addon-' + Date.now(),
        name: trimmedName,
        price: numPrice,
        duration: addOnForm.duration,
        petType: addOnForm.petType,
        description: addOnForm.description.trim(),
        active: true
      };
      updatedList = [...addOns, newEntry];
      toast.success(`Added "${trimmedName}" to add-on services!`);
    }

    setAddOns(updatedList);
    safeSetItem('velvet_grooming_addons', JSON.stringify(updatedList));
    setShowAddOnModal(false);
  };

  const handleDeleteAddOn = (id, name) => {
    const updatedList = addOns.filter(item => item.id !== id);
    setAddOns(updatedList);
    safeSetItem('velvet_grooming_addons', JSON.stringify(updatedList));
    toast.success(`Removed "${name}" from add-ons.`);
  };

  const handleToggleAddOnStatus = (id) => {
    const updatedList = addOns.map(item => item.id === id ? { ...item, active: !item.active } : item);
    setAddOns(updatedList);
    safeSetItem('velvet_grooming_addons', JSON.stringify(updatedList));
    const target = updatedList.find(i => i.id === id);
    if (target) {
      toast.success(`"${target.name}" is now ${target.active ? 'active' : 'paused'}.`);
    }
  };

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
    window.addEventListener('service-booking-updated', fetchData);
    window.addEventListener('grooming-booking-created', fetchData);
    return () => {
      window.removeEventListener('service-booking-updated', fetchData);
      window.removeEventListener('grooming-booking-created', fetchData);
    };
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
      const servicesList = (servRes && servRes.success && (servRes.services || servRes.data)) || [];
      if (Array.isArray(servicesList) && servicesList.length > 0) {
        // Find a grooming service, or just take the first one
        const srv = servicesList.find(s => s.category === 'Grooming') || servicesList[0];
        setServiceId(srv._id);
        
        if (srv.schedule && typeof srv.schedule === 'object' && Object.keys(srv.schedule).length > 0) {
           const synced = {
             acceptingWalkIns: srv.acceptingWalkIns !== false,
             days: srv.schedule
           };
           setSchedule(synced);
           saveGroomingSchedule(synced, user);
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
       if (packagesState.fullGroom.active) pkgs.push({ name: 'Full Grooming', price: Number(packagesState.fullGroom.fee) });
       if (packagesState.bathBrush.active) pkgs.push({ name: 'Bath & Brush', price: Number(packagesState.bathBrush.fee) });
       if (packagesState.nailClip.active) pkgs.push({ name: 'Nail Clipping', price: Number(packagesState.nailClip.fee) });

       safeSetItem('velvet_grooming_packages', JSON.stringify(packagesState));
       safeSetItem('velvet_grooming_addons', JSON.stringify(addOns));

       if (serviceId) {
         await apiRequest(`/services/${serviceId}`, {
           method: 'PUT',
           body: JSON.stringify({ 
             packages: pkgs,
             addOns: addOns
           })
         });
       }
       toast.success('Grooming packages & add-on services saved successfully!');
     } catch (err) {
       console.error(err);
       toast.error('Failed to save packages');
     }
  };

  const saveSchedule = async () => {
     try {
       // 1. Save locally with user-scoped key, generic fallback, and registered users list
       saveGroomingSchedule(schedule, user);

       // 2. Persist to user profile in Redux & server auth profile
       dispatch(updateProfile({
         groomingSchedule: schedule
       }));

       // 3. Sync to backend service profile if serviceId is available
       if (serviceId) {
         try {
           await apiRequest(`/services/${serviceId}`, {
             method: 'PUT',
             body: JSON.stringify({ 
               schedule: schedule.days,
               acceptingWalkIns: schedule.acceptingWalkIns 
             })
           });
         } catch (apiErr) {
           console.warn('Backend service schedule update failed (using local sync):', apiErr);
         }
       }
       toast.success('Studio hours & schedule saved successfully!');
     } catch (err) {
       console.error('Failed to save schedule:', err);
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-sm">{apt.petDetails?.name || apt.petName || 'Pet'}</h3>
                            <span className="text-xs text-slate-500 font-semibold">({apt.petDetails?.breed || apt.petBreed || 'Dog'})</span>
                          </div>
                          <p className="text-xs font-extrabold text-[#0F2E23] mt-0.5">{apt.packageName || apt.serviceType || 'Full Grooming Spa'}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {dateObj.toLocaleDateString()} • {apt.timeSlot || 'Scheduled Slot'}
                          </p>
                          <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                            Owner: <span className="text-slate-800 font-bold">{apt.ownerName || 'Pet Parent'}</span>
                            {(apt.ownerPhone || apt.phone) && <span className="text-slate-500 font-normal"> • 📞 {apt.ownerPhone || apt.phone}</span>}
                            {(apt.fee || apt.packagePrice) && <span className="text-emerald-700 font-extrabold ml-1.5">• Fee: ₹{apt.fee || apt.packagePrice}</span>}
                          </p>
                          {apt.specialNotes && (
                            <p className="text-[10px] text-amber-800 bg-amber-50 rounded-md px-1.5 py-0.5 mt-1 border border-amber-100">
                              Note: {apt.specialNotes}
                            </p>
                          )}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-700" /> Add-On Services & Treatments
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Offer optional extras and luxury care treatments bookable alongside grooming packages.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => handleOpenAddOnModal()} 
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus size={15}/> Add New
              </button>
            </div>

            {addOns.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
                <Sparkles size={32} className="mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-700">No add-on services yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Add teeth cleaning, de-shedding, tick baths, or facial treatments that pet parents can book with their grooming packages.</p>
                <button
                  type="button"
                  onClick={() => handleOpenAddOnModal()}
                  className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#163e30] transition cursor-pointer"
                >
                  <Plus size={14} className="inline mr-1" /> Add Your First Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {addOns.map((addon) => (
                  <div 
                    key={addon.id} 
                    className={`bg-white border rounded-xl p-4 shadow-2xs transition-all relative group ${
                      addon.active ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="text-xs font-black text-slate-800 leading-snug truncate">{addon.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-black text-emerald-700">₹{addon.price}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={10} /> {addon.duration}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-md">
                            {addon.petType || 'All Pets'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAddOnStatus(addon.id)}
                          title={addon.active ? 'Pause this add-on' : 'Activate this add-on'}
                          className={`w-7 h-4 rounded-full relative cursor-pointer transition-colors duration-200 ${addon.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-xs transition-all duration-200 ${addon.active ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAddOnModal(addon)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Add-On"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddOn(addon.id, addon.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Add-On"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {addon.description && (
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {addon.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD / EDIT ADD-ON SERVICE MODAL */}
          {showAddOnModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
              <div 
                className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative animate-fadeIn overflow-hidden text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#0F2E23]">
                        {editingAddOnId ? 'Edit Add-On Service' : 'Add New Add-On Service'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Configure extra treatments and pricing for Velvet Fur Studio.
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowAddOnModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveAddOn} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Quick Presets if adding new */}
                    {!editingAddOnId && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                          Popular Service Suggestions (Click to autofill):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_ADDONS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyPreset(preset)}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition cursor-pointer text-left flex items-center gap-1 shadow-2xs"
                            >
                              <span>{preset.name}</span>
                              <span className="text-emerald-600 font-black">₹{preset.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* Service Name */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Service / Treatment Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addOnForm.name}
                      onChange={(e) => setAddOnForm({ ...addOnForm, name: e.target.value })}
                      placeholder="e.g. Blueberry Facial & Coat Glow"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  {/* Price and Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                        Base Price (₹) *
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-600 focus-within:bg-white transition">
                        <span className="text-slate-500 font-bold mr-1.5 text-sm">₹</span>
                        <input
                          type="number"
                          required
                          min="1"
                          step="10"
                          value={addOnForm.price}
                          onChange={(e) => setAddOnForm({ ...addOnForm, price: e.target.value })}
                          placeholder="350"
                          className="bg-transparent border-none outline-none text-xs font-bold w-full text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                        Estimated Duration *
                      </label>
                      <select
                        value={addOnForm.duration}
                        onChange={(e) => setAddOnForm({ ...addOnForm, duration: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition cursor-pointer"
                      >
                        <option value="5 mins">5 mins (Quick Spritz / Wipe)</option>
                        <option value="10 mins">10 mins (Paw / Ear Care)</option>
                        <option value="15 mins">15 mins (Teeth / Facial)</option>
                        <option value="20 mins">20 mins (Flea Dip / Medicated)</option>
                        <option value="30 mins">30 mins (De-shedding)</option>
                        <option value="45 mins">45 mins (Deep Fur Therapy)</option>
                        <option value="60 mins">60 mins (Full Luxury Spa)</option>
                      </select>
                    </div>
                  </div>

                  {/* Applicable For */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Applicable Pet Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['All Pets', 'Dogs', 'Cats'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddOnForm({ ...addOnForm, petType: type })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                            addOnForm.petType === type
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-black shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-1">
                      Treatment Details / Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={addOnForm.description}
                      onChange={(e) => setAddOnForm({ ...addOnForm, description: e.target.value })}
                      placeholder="Describe the treatment benefits, ingredients used, or process..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition resize-none"
                    />
                  </div>
                  </div>

                  {/* Fixed Modal Footer Buttons */}
                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddOnModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                    >
                      <Save size={14} /> {editingAddOnId ? 'Save Changes' : 'Add Treatment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
              <div 
                className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 relative animate-fadeIn overflow-hidden text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Modal Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#0F2E23]">Upload Before & After Transformation</h3>
                      <p className="text-xs text-slate-500 font-medium">Showcase grooming results to pet parents booking appointments.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUploadPhotoSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                  </div>

                  {/* Fixed Modal Footer Actions */}
                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex gap-3 shrink-0">
                    <button 
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
              <div 
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-fadeIn overflow-hidden text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      {selectedPhotoForPreview.category}
                    </span>
                    <h3 className="text-xl font-black text-[#0F2E23] mt-2">{selectedPhotoForPreview.title}</h3>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">🐾 {selectedPhotoForPreview.petName} • Uploaded {selectedPhotoForPreview.uploadedAt}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPhotoForPreview(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">


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

                </div>

                {/* Fixed Footer */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(selectedPhotoForPreview.id)}
                    className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Remove Photo
                  </button>
                  <button
                    type="button"
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
        <ProviderReviewsView
          serviceCategory="Pet Grooming Spa"
          title="Customer Reviews"
          subtitle="Verified client ratings, styling feedback, and official spa replies."
          roleTitle="Groomer"
          storageKeyPrefix="grooming"
        />
      )}

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <ProviderWalletPayoutView
          serviceCategory="Pet Grooming Spa"
          storageKeyPrefix="grooming"
          initialBalance={32500}
          escrowAmount={8500}
        />
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
