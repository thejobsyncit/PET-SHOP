import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Star, MessageSquare, Clock, CreditCard, Building, Check, Video, 
  Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, 
  Download, Edit3, HeartPulse, StarHalf, Home, Image as ImageIcon, Scissors, 
  Sparkles, Upload, Store, Trash2, X, Search, Send, ArrowLeft, Eye, 
  CheckCircle, AlertCircle, Phone, MapPin, ShieldCheck, ChevronRight,
  Wallet, Landmark, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { safeSetItem, safeGetItem } from '../../../../utils/safeStorage.js';
import { getStoredHostelBookings } from '../../../../data/hostelData.js';

// Default Initial Bookings
const DEFAULT_BOOKINGS = [
  {
    id: 'BK-101',
    petName: 'Leo',
    petBreed: 'Beagle (2 yrs)',
    kennelType: 'Standard Kennel #04',
    ownerName: 'Rahul Sharma',
    ownerPhone: '+91 98451 12345',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-10-04',
    nights: 3,
    status: 'pending_checkin', // 'pending_checkin' | 'checked_in' | 'checked_out'
    eta: 'ETA 2:00 PM Today',
    totalPrice: 2400,
    paid: true,
    dietaryNotes: 'Chicken & rice twice daily. No grain treats.',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    avatarLetter: 'L'
  },
  {
    id: 'BK-102',
    petName: 'Oreo',
    petBreed: 'Siberian Husky (3 yrs)',
    kennelType: 'Luxury Suite #02',
    ownerName: 'Ananya Iyer',
    ownerPhone: '+91 98840 56789',
    checkInDate: '2026-09-28',
    checkOutDate: '2026-10-01',
    nights: 3,
    status: 'checked_in',
    eta: 'Checking Out Today • 4:00 PM',
    totalPrice: 4500,
    paid: true,
    dietaryNotes: 'Needs 30 min daily pool exercise. Private play only.',
    avatarColor: 'bg-sky-100 text-sky-700',
    avatarLetter: 'O'
  },
  {
    id: 'BK-103',
    petName: 'Bella',
    petBreed: 'Golden Retriever (1.5 yrs)',
    kennelType: 'VIP Presidential Suite',
    ownerName: 'Karthik Verma',
    ownerPhone: '+91 98112 34567',
    checkInDate: '2026-10-01',
    checkOutDate: '2026-10-05',
    nights: 4,
    status: 'pending_checkin',
    eta: 'ETA 5:30 PM Today',
    totalPrice: 10000,
    paid: true,
    dietaryNotes: 'Special hypoallergenic kibble supplied in bag.',
    avatarColor: 'bg-amber-100 text-amber-700',
    avatarLetter: 'B'
  },
  {
    id: 'BK-104',
    petName: 'Simba',
    petBreed: 'Shih Tzu (4 yrs)',
    kennelType: 'Standard Kennel #01',
    ownerName: 'Meera Sen',
    ownerPhone: '+91 99223 88123',
    checkInDate: '2026-09-26',
    checkOutDate: '2026-09-30',
    nights: 4,
    status: 'checked_out',
    eta: 'Checked Out Yesterday 11:30 AM',
    totalPrice: 3200,
    paid: true,
    dietaryNotes: 'Daily combing and tick check done.',
    avatarColor: 'bg-violet-100 text-violet-700',
    avatarLetter: 'S'
  }
];

// Default Facility Photos
const DEFAULT_GALLERY_PHOTOS = [
  {
    id: 'gal-1',
    title: 'Outdoor Grass Play Yard',
    category: 'Play Area',
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
    uploadedAt: 'Today'
  },
  {
    id: 'gal-2',
    title: 'Luxury Private Dog Suite',
    category: 'Kennels',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop',
    uploadedAt: '2 days ago'
  },
  {
    id: 'gal-3',
    title: 'Canine Hydrotherapy Pool',
    category: 'Swimming Pool',
    url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=800&auto=format&fit=crop',
    uploadedAt: '3 days ago'
  },
  {
    id: 'gal-4',
    title: 'Indoor Climate Controlled Lounge',
    category: 'Indoor Lounge',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop',
    uploadedAt: 'Last week'
  },
  {
    id: 'gal-5',
    title: 'VIP Cat Condos & Scratch Towers',
    category: 'Cattery',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
    uploadedAt: 'Last week'
  },
  {
    id: 'gal-6',
    title: 'Agility Training & Obstacle Course',
    category: 'Play Area',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
    uploadedAt: '2 weeks ago'
  }
];

// Default Inquiries
const DEFAULT_INQUIRIES = [
  {
    id: 'inq-1',
    petParent: 'Arjun Reddy',
    petName: 'Rocky (Husky, 1.5 yrs)',
    avatar: 'A',
    avatarColor: 'bg-emerald-100 text-emerald-800',
    status: 'Inquiry re: Boarding',
    time: '11:15 AM',
    unread: false,
    messages: [
      {
        id: 1,
        sender: 'parent',
        senderName: 'Arjun Reddy',
        text: 'Hi, I need to board my Husky for a week from this Friday. However, he is not neutered yet. Do you have private play areas for him?',
        time: '11:15 AM'
      }
    ]
  },
  {
    id: 'inq-2',
    petParent: 'Priya Sharma',
    petName: 'Milo (Shih Tzu, 8 mos)',
    avatar: 'P',
    avatarColor: 'bg-amber-100 text-amber-800',
    status: 'Inquiry re: VIP Suite',
    time: '10:30 AM',
    unread: false,
    messages: [
      {
        id: 1,
        sender: 'parent',
        senderName: 'Priya Sharma',
        text: 'Hello! Does the VIP suite include daily webcam streaming access for pet parents?',
        time: '10:30 AM'
      },
      {
        id: 2,
        sender: 'provider',
        senderName: 'Happy Paws Pet Resort',
        text: 'Hello Priya! Yes, our VIP suites have dedicated 24/7 HD live webcams accessible through the app anytime.',
        time: '10:45 AM'
      }
    ]
  },
  {
    id: 'inq-3',
    petParent: 'Vikram Malhotra',
    petName: 'Bruno (Labrador, 3 yrs)',
    avatar: 'V',
    avatarColor: 'bg-sky-100 text-sky-800',
    status: 'Inquiry re: Medical Care',
    time: 'Yesterday',
    unread: false,
    messages: [
      {
        id: 1,
        sender: 'parent',
        senderName: 'Vikram Malhotra',
        text: 'Hi, can you administer oral medication twice a day with his meals? He has arthritis supplements.',
        time: 'Yesterday 4:20 PM'
      },
      {
        id: 2,
        sender: 'provider',
        senderName: 'Happy Paws Pet Resort',
        text: 'Absolutely Vikram! Our trained attendants log and administer all prescribed medications with meal times.',
        time: 'Yesterday 4:35 PM'
      }
    ]
  }
];

const POPULAR_AMENITIES_SUGGESTIONS = [
  '24/7 CCTV Live Stream',
  'Air Conditioned Kennels',
  'Swimming Pool & Splash Area',
  '24/7 Vet On Call',
  'Large Outdoor Play Yard',
  'Daily Video Updates',
  'Customized Meals',
  'Pick-up & Drop Pet Taxi',
  'Daily Coat Grooming',
  'Individual Caretaker',
  'Agility Obstacle Ground',
  'Tick & Flea Prevention Check'
];

const HostelProviderContent = ({ activeTab }) => {
  // 1. Profile State
  const [profile, setProfile] = useState(() => {
    const saved = safeGetItem('hostel_profile_data_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'my-hostel-profile',
      avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
      name: 'Happy Paws Pet Resort',
      registration: 'HOSTEL-2023-KA-102',
      certifications: 'Certified Boarding Facility (IBK)',
      address: 'Sarjapur Road, Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      experienceDisplay: '10+ Years Exp.',
      experienceYears: 10,
      rating: 4.9,
      reviewsCount: 312,
      phone: '+91 98765 43210',
      isVerified: true,
      openTodayTiming: '24 Hours',
      bio: 'Premium pet resort offering luxury kennels, large play areas, splash pool, and 24/7 vet on call.',
      facilities: ['Air Conditioned', '24/7 CCTV Live Stream', 'Swimming Pool & Splash Area', '24/7 Vet On Call', 'Outdoor Lawn & Play Area', 'Daily Video Updates'],
    };
  });

  // 2. Bookings State (Issue 1)
  const [bookings, setBookings] = useState(() => {
    const saved = safeGetItem('hostel_provider_bookings_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Also merge any bookings made through customer booking form
    const customerBookings = getStoredHostelBookings();
    if (customerBookings && customerBookings.length > 0) {
      const formatted = customerBookings.map((cb, idx) => ({
        id: `BK-CUST-${idx + 1}`,
        petName: cb.petName || 'Pet Guest',
        petBreed: `${cb.petBreed || 'Dog'} (${cb.petAge || 'Adult'})`,
        kennelType: cb.package || 'Deluxe Room',
        ownerName: cb.ownerName || 'Pet Parent',
        ownerPhone: cb.ownerPhone || '+91 98000 12345',
        checkInDate: cb.checkInDate || '2026-10-02',
        checkOutDate: cb.checkOutDate || '2026-10-05',
        nights: 3,
        status: 'pending_checkin',
        eta: 'Upcoming Reservation',
        totalPrice: cb.totalAmount || 2400,
        paid: true,
        dietaryNotes: cb.specialDiet || 'Standard diet',
        avatarColor: 'bg-emerald-100 text-emerald-700',
        avatarLetter: (cb.petName || 'P').charAt(0).toUpperCase()
      }));
      return [...DEFAULT_BOOKINGS, ...formatted];
    }
    return DEFAULT_BOOKINGS;
  });

  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'completed'
  const [bookingSearch, setBookingSearch] = useState('');
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    petName: '',
    petBreed: '',
    kennelType: 'Standard Kennel #05',
    ownerName: '',
    ownerPhone: '',
    checkInDate: '',
    checkOutDate: '',
    totalPrice: 2400,
    dietaryNotes: ''
  });

  // 3. Amenities Modal State (Issue 2)
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // 4. Facility Gallery State (Issues 3 & 4)
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = safeGetItem('hostel_gallery_photos_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_GALLERY_PHOTOS;
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Play Area');
  const [previewLightbox, setPreviewLightbox] = useState(null);

  // 5. Inquiries & Messenger State (Issues 5 & 6)
  const [inquiries, setInquiries] = useState(() => {
    const saved = safeGetItem('hostel_inquiries_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_INQUIRIES;
  });
  const [selectedInquiryId, setSelectedInquiryId] = useState('inq-1');
  const [messageInput, setMessageInput] = useState('');
  const [mobileChatView, setMobileChatView] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // 6. Kennels & Accommodations Pricing State
  const [kennelsState, setKennelsState] = useState(() => {
    const saved = safeGetItem('hostel_kennels_state_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      standard: { active: true, fee: 800, capacity: 20 },
      luxury: { active: true, fee: 1500, capacity: 10 },
      suite: { active: true, fee: 2500, capacity: 5 },
    };
  });

  // 7. Schedule & Timings State
  const [schedule, setSchedule] = useState(() => {
    const saved = safeGetItem('hostel_schedule_data_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      acceptingCheckins: true,
      checkInTime: '12:00',
      checkOutTime: '11:00'
    };
  });

  // Timings validation & helpers
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = mStr || '00';
    if (isNaN(hours)) return time24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const isTimingConflict = Boolean(
    schedule.checkInTime &&
    schedule.checkOutTime &&
    schedule.checkInTime.trim() === schedule.checkOutTime.trim()
  );

  const isTimingMissing = !schedule.checkInTime || !schedule.checkOutTime;

  const handleSaveTimings = () => {
    if (isTimingMissing) {
      toast.error('Please specify both standard check-in and check-out times.');
      return;
    }
    if (isTimingConflict) {
      toast.error('Check-in and check-out times cannot be identical. Please set different timings.');
      return;
    }
    safeSetItem('hostel_schedule_data_v2', JSON.stringify(schedule));
    toast.success('Timings saved successfully!');
  };

  // 8. Wallet & Payouts State
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = safeGetItem('hostel_wallet_balance_v2');
    return saved !== null && !isNaN(Number(saved)) ? Number(saved) : 24500;
  });

  const [payoutsHistory, setPayoutsHistory] = useState(() => {
    const saved = safeGetItem('hostel_payouts_history_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'PO-9821',
        date: '2026-09-28',
        amount: 12000,
        mode: 'Bank Transfer (HDFC Bank)',
        destination: 'HDFC Bank ••••4321',
        status: 'Completed',
        utr: 'UTR8192348123',
        time: '11:45 AM'
      },
      {
        id: 'PO-9755',
        date: '2026-09-15',
        amount: 18500,
        mode: 'Bank Transfer (HDFC Bank)',
        destination: 'HDFC Bank ••••4321',
        status: 'Completed',
        utr: 'UTR7719234011',
        time: '04:20 PM'
      }
    ];
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '24500',
    mode: 'bank', // 'bank' | 'upi'
    bankName: 'HDFC Bank',
    accountHolder: 'Happy Paws Pet Resort',
    accountNumber: '50100492814321',
    ifsc: 'HDFC0001234',
    upiId: 'happypaws@okhdfcbank',
    notes: ''
  });
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const handleRequestWithdrawal = (e) => {
    e.preventDefault();
    const numAmount = Number(withdrawForm.amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (numAmount < 500) {
      toast.error('Minimum withdrawal amount is ₹500.');
      return;
    }
    if (numAmount > walletBalance) {
      toast.error(`Withdrawal amount cannot exceed available balance of ₹${walletBalance.toLocaleString('en-IN')}.`);
      return;
    }

    if (withdrawForm.mode === 'bank') {
      if (!withdrawForm.bankName.trim() || !withdrawForm.accountNumber.trim() || !withdrawForm.ifsc.trim()) {
        toast.error('Please provide complete bank account details.');
        return;
      }
    } else if (withdrawForm.mode === 'upi') {
      if (!withdrawForm.upiId.trim() || !withdrawForm.upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. name@bank).');
        return;
      }
    }

    setIsSubmittingWithdraw(true);

    setTimeout(() => {
      const newBal = walletBalance - numAmount;
      setWalletBalance(newBal);
      safeSetItem('hostel_wallet_balance_v2', newBal.toString());

      const newRecord = {
        id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        amount: numAmount,
        mode: withdrawForm.mode === 'bank' 
          ? `Bank Transfer (${withdrawForm.bankName})` 
          : `Instant UPI (${withdrawForm.upiId})`,
        destination: withdrawForm.mode === 'bank' 
          ? `${withdrawForm.bankName} ••••${withdrawForm.accountNumber.slice(-4)}`
          : withdrawForm.upiId,
        status: 'Processing',
        utr: `UTR${Date.now().toString().slice(-10)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [newRecord, ...payoutsHistory];
      setPayoutsHistory(updatedHistory);
      safeSetItem('hostel_payouts_history_v2', JSON.stringify(updatedHistory));

      setIsSubmittingWithdraw(false);
      setShowWithdrawModal(false);
      toast.success(
        `Withdrawal of ₹${numAmount.toLocaleString('en-IN')} requested successfully! Funds will credit to ${newRecord.destination} shortly.`,
        { duration: 5000 }
      );
    }, 500);
  };

  // Auto-scroll chat on new message or conversation switch
  useEffect(() => {
    if (activeTab === 'messages') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inquiries, selectedInquiryId, activeTab]);

  // Sync to safeStorage
  const saveBookingsState = (updated) => {
    setBookings(updated);
    safeSetItem('hostel_provider_bookings_v2', JSON.stringify(updated));
  };

  const saveGalleryState = (updated) => {
    setGalleryPhotos(updated);
    safeSetItem('hostel_gallery_photos_v2', JSON.stringify(updated));
  };

  const saveInquiriesState = (updated) => {
    setInquiries(updated);
    safeSetItem('hostel_inquiries_v2', JSON.stringify(updated));
  };

  const saveProfileState = (updated) => {
    setProfile(updated);
    safeSetItem('hostel_profile_data_v2', JSON.stringify(updated));
  };

  // ==========================================
  // ISSUE 1 HANDLERS: Boarding Bookings Check-in & Checkout
  // ==========================================
  const handleCompleteCheckIn = (bookingId) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...b,
          status: 'checked_in',
          eta: `Active Guest • Checked in at ${timeNow}`
        };
      }
      return b;
    });

    saveBookingsState(updated);
    const target = bookings.find(b => b.id === bookingId);
    toast.success(`Check-in completed for ${target ? target.petName : 'Guest'}! Room assigned.`);
  };

  const handleProcessCheckOut = (bookingId) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...b,
          status: 'checked_out',
          eta: `Checked Out • Completed at ${timeNow}`
        };
      }
      return b;
    });

    saveBookingsState(updated);
    const target = bookings.find(b => b.id === bookingId);
    toast.success(`Check-out processed for ${target ? target.petName : 'Guest'}. Bill settled successfully!`);
  };

  const handleCreateNewBooking = (e) => {
    e.preventDefault();
    if (!newBookingForm.petName || !newBookingForm.ownerName) {
      toast.error('Please enter Pet Name and Owner Name');
      return;
    }

    if (newBookingForm.checkInDate && newBookingForm.checkOutDate) {
      if (new Date(newBookingForm.checkOutDate) <= new Date(newBookingForm.checkInDate)) {
        toast.error('Check-out date must be after check-in date.');
        return;
      }
    }

    const newBooking = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      petName: newBookingForm.petName,
      petBreed: newBookingForm.petBreed || 'Standard Breed',
      kennelType: newBookingForm.kennelType,
      ownerName: newBookingForm.ownerName,
      ownerPhone: newBookingForm.ownerPhone || '+91 98000 00000',
      checkInDate: newBookingForm.checkInDate || 'Today',
      checkOutDate: newBookingForm.checkOutDate || 'In 3 Days',
      nights: 3,
      status: 'pending_checkin',
      eta: 'Walk-in / Direct Reservation',
      totalPrice: Number(newBookingForm.totalPrice) || 2400,
      paid: true,
      dietaryNotes: newBookingForm.dietaryNotes || 'Standard boarding care',
      avatarColor: 'bg-emerald-100 text-emerald-700',
      avatarLetter: newBookingForm.petName.charAt(0).toUpperCase()
    };

    const updated = [newBooking, ...bookings];
    saveBookingsState(updated);
    setShowAddBookingModal(false);
    setNewBookingForm({
      petName: '',
      petBreed: '',
      kennelType: 'Standard Kennel #05',
      ownerName: '',
      ownerPhone: '',
      checkInDate: '',
      checkOutDate: '',
      totalPrice: 2400,
      dietaryNotes: ''
    });
    toast.success(`Boarding booking created for ${newBooking.petName}!`);
  };

  // ==========================================
  // ISSUE 2 HANDLERS: Included Amenities Modal & Removal
  // ==========================================
  const handleAddAmenity = (amenityText) => {
    const trimmed = (amenityText || customAmenityInput).trim();
    if (!trimmed) {
      toast.error('Please enter an amenity name');
      return;
    }
    if (profile.facilities.includes(trimmed)) {
      toast.error('This amenity is already included');
      return;
    }

    const updatedFacilities = [...profile.facilities, trimmed];
    const updatedProfile = { ...profile, facilities: updatedFacilities };
    saveProfileState(updatedProfile);
    setCustomAmenityInput('');
    toast.success(`Added "${trimmed}" to resort amenities!`);
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    const updatedFacilities = profile.facilities.filter(f => f !== amenityToRemove);
    const updatedProfile = { ...profile, facilities: updatedFacilities };
    saveProfileState(updatedProfile);
    toast.success(`Removed "${amenityToRemove}" from amenities`);
  };

  // ==========================================
  // ISSUE 3 & 4 HANDLERS: Facility Gallery Upload & Delete
  // ==========================================
  const handleUploadPhotoSubmit = (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) {
      toast.error('Please enter or select an image URL or choose a file');
      return;
    }

    const newPhoto = {
      id: `gal-${Date.now()}`,
      title: newPhotoTitle.trim() || 'Resort Facility Area',
      category: newPhotoCategory,
      url: newPhotoUrl.trim(),
      uploadedAt: 'Just now'
    };

    const updated = [newPhoto, ...galleryPhotos];
    saveGalleryState(updated);
    setShowUploadModal(false);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    toast.success(`Photo "${newPhoto.title}" added to Facility Gallery!`);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPhotoUrl(event.target.result);
      if (!newPhotoTitle) {
        setNewPhotoTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
      }
      toast.success('Image loaded! Click "Add to Gallery" to save.');
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (photoId) => {
    const target = galleryPhotos.find(p => p.id === photoId);
    const updated = galleryPhotos.filter(p => p.id !== photoId);
    saveGalleryState(updated);
    toast.success(`Photo "${target ? target.title : 'Image'}" deleted successfully!`);
  };

  // ==========================================
  // ISSUE 5 & 6 HANDLERS: Pet Parent Messenger Replies
  // ==========================================
  const activeInquiry = inquiries.find(inq => inq.id === selectedInquiryId) || inquiries[0];

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeInquiry) return;

    const newMsg = {
      id: Date.now(),
      sender: 'provider',
      senderName: 'Happy Paws Pet Resort',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedInquiries = inquiries.map(inq => {
      if (inq.id === activeInquiry.id) {
        return {
          ...inq,
          messages: [...inq.messages, newMsg],
          time: 'Just now'
        };
      }
      return inq;
    });

    saveInquiriesState(updatedInquiries);
    setMessageInput('');
    toast.success(`Reply sent to ${activeInquiry.petParent}!`);
  };

  // Kennels price update helper
  const toggleKennel = (key) => {
    const updated = {
      ...kennelsState,
      [key]: { ...kennelsState[key], active: !kennelsState[key].active }
    };
    setKennelsState(updated);
    safeSetItem('hostel_kennels_state_v2', JSON.stringify(updated));
  };

  const updateKennelFee = (key, val) => {
    const updated = {
      ...kennelsState,
      [key]: { ...kennelsState[key], fee: Number(val) || 0 }
    };
    setKennelsState(updated);
    safeSetItem('hostel_kennels_state_v2', JSON.stringify(updated));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...profile, [name]: value };
    saveProfileState(updated);
  };

  // Filtered Bookings calculation
  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'pending' && b.status !== 'pending_checkin') return false;
    if (bookingFilter === 'active' && b.status !== 'checked_in') return false;
    if (bookingFilter === 'completed' && b.status !== 'checked_out') return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchName = b.petName.toLowerCase().includes(q);
      const matchOwner = b.ownerName.toLowerCase().includes(q);
      const matchBreed = b.petBreed.toLowerCase().includes(q);
      const matchKennel = b.kennelType.toLowerCase().includes(q);
      if (!matchName && !matchOwner && !matchBreed && !matchKennel) return false;
    }
    return true;
  });

  return (
    <div className="w-full">
      {/* 
        ========================================================================
        1. BOARDING BOOKINGS TAB (ISSUE 1 FIXED)
        ========================================================================
      */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Boarding Bookings & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Manage guest check-ins, active boarding dogs, and checkout billing.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddBookingModal(true)}
                className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Plus size={16} /> New Booking
              </button>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Bookings', count: bookings.length },
                { id: 'pending', label: 'Pending Check-in', count: bookings.filter(b => b.status === 'pending_checkin').length },
                { id: 'active', label: 'Currently Boarding', count: bookings.filter(b => b.status === 'checked_in').length },
                { id: 'completed', label: 'Checked Out', count: bookings.filter(b => b.status === 'checked_out').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    bookingFilter === f.id 
                      ? 'bg-[#0F2E23] text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search pet, owner, room..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Bookings List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBookings.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">No boarding bookings found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing your filters or add a new walk-in guest reservation.</p>
              </div>
            ) : (
              filteredBookings.map(b => (
                <div 
                  key={b.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                    b.status === 'pending_checkin' 
                      ? 'border-l-4 border-l-emerald-500 border-slate-200' 
                      : b.status === 'checked_in'
                        ? 'border-l-4 border-l-sky-500 border-slate-200'
                        : 'border-l-4 border-l-slate-400 border-slate-200 opacity-90'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full ${b.avatarColor} flex items-center justify-center font-black text-sm shadow-sm`}>
                          {b.avatarLetter}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-sm">{b.petName}</h3>
                            <span className="text-[10px] text-slate-500 font-bold">({b.petBreed})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {b.kennelType} • Owner: <span className="text-slate-700 font-bold">{b.ownerName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {b.status === 'pending_checkin' && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                          <Clock size={11} /> {b.eta}
                        </span>
                      )}
                      {b.status === 'checked_in' && (
                        <span className="bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-100 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Active Guest
                        </span>
                      )}
                      {b.status === 'checked_out' && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check size={11} /> Checked Out
                        </span>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="bg-slate-50/70 rounded-xl p-3 text-xs space-y-1.5 mb-4 border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Stay Period:</span>
                        <span className="font-bold text-slate-700">{b.checkInDate} → {b.checkOutDate} ({b.nights} Nights)</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-semibold text-slate-400">Total Booking Bill:</span>
                        <span className="font-black text-emerald-700">₹{b.totalPrice.toLocaleString()} (Paid)</span>
                      </div>
                      {b.dietaryNotes && (
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                          <span className="font-bold text-slate-700">Diet & Care:</span> {b.dietaryNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    {b.status === 'pending_checkin' && (
                      <button 
                        onClick={() => handleCompleteCheckIn(b.id)}
                        className="flex-1 bg-[#0F2E23] hover:bg-[#163e30] text-white text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle size={14} /> Complete Check-in
                      </button>
                    )}

                    {b.status === 'checked_in' && (
                      <button 
                        onClick={() => handleProcessCheckOut(b.id)}
                        className="flex-1 bg-white border border-sky-300 text-sky-700 hover:bg-sky-50 text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ArrowLeft size={14} className="rotate-180" /> Process Check-out
                      </button>
                    )}

                    {b.status === 'checked_out' && (
                      <button 
                        onClick={() => toast.success(`Invoice #INV-${b.id} sent to ${b.ownerName} (${b.ownerPhone})`)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={14} /> View Invoice & Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Booking Modal */}
          {showAddBookingModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button 
                  onClick={() => setShowAddBookingModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#0F2E23] mb-1">New Boarding Reservation</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Record a direct phone or walk-in pet booking.</p>

                <form onSubmit={handleCreateNewBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pet Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Bruno" 
                        value={newBookingForm.petName} 
                        onChange={e => setNewBookingForm({...newBookingForm, petName: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Breed & Age</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Beagle (2 yrs)" 
                        value={newBookingForm.petBreed} 
                        onChange={e => setNewBookingForm({...newBookingForm, petBreed: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Owner Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Amit Kumar" 
                        value={newBookingForm.ownerName} 
                        onChange={e => setNewBookingForm({...newBookingForm, ownerName: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Owner Contact Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={newBookingForm.ownerPhone} 
                        onChange={e => setNewBookingForm({...newBookingForm, ownerPhone: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kennel / Room Type</label>
                    <select 
                      value={newBookingForm.kennelType} 
                      onChange={e => setNewBookingForm({...newBookingForm, kennelType: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      <option value="Standard Kennel #04">Standard Kennel (₹800/night)</option>
                      <option value="Luxury Suite #02">Luxury Suite (₹1,500/night)</option>
                      <option value="VIP Presidential Suite">VIP Suite with CCTV (₹2,500/night)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Check-in Date</label>
                      <input 
                        type="date" 
                        value={newBookingForm.checkInDate} 
                        onChange={e => setNewBookingForm({...newBookingForm, checkInDate: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Check-out Date</label>
                      <input 
                        type="date" 
                        value={newBookingForm.checkOutDate} 
                        min={
                          newBookingForm.checkInDate 
                            ? new Date(new Date(newBookingForm.checkInDate).getTime() + 86400000).toISOString().split('T')[0]
                            : undefined
                        }
                        onChange={e => setNewBookingForm({...newBookingForm, checkOutDate: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Special Diet / Instructions</label>
                    <textarea 
                      rows="2" 
                      placeholder="e.g. 2 meals a day, daily brushing, allergic to grains" 
                      value={newBookingForm.dietaryNotes} 
                      onChange={e => setNewBookingForm({...newBookingForm, dietaryNotes: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button 
                      type="button" 
                      onClick={() => setShowAddBookingModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        2. KENNELS & ACCOMMODATIONS TAB (ISSUE 2 FIXED: Real Amenities Modal)
        ========================================================================
      */}
      {activeTab === 'rooms' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Kennels & Accommodations</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your kennel types, capacities, and pricing per night.</p>
            </div>
            <button 
              onClick={() => toast.success('Kennel pricing updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition cursor-pointer">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Home size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Standard Kennel</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Comfortable 4x4ft indoor kennel with basic bedding and 2 walks/day.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('standard')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.standard.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.standard.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.standard.fee} onChange={e => updateKennelFee('standard', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Building size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Luxury Kennel</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Spacious 6x6ft indoor kennel with premium bedding and 3 walks/day.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('luxury')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.luxury.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.luxury.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.luxury.fee} onChange={e => updateKennelFee('luxury', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Star size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">VIP Suite</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Large private room with AC, CCTV for parents, and unlimited play time.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('suite')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.suite.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.suite.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.suite.fee} onChange={e => updateKennelFee('suite', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Included Amenities Section */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Included Resort Amenities</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">These perks and facilities are highlighted to pet parents during booking.</p>
              </div>
              <button 
                onClick={() => setShowAmenityModal(true)} 
                className="flex items-center gap-1.5 bg-[#0F2E23] hover:bg-[#163e30] text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer shadow-sm"
              >
                <Plus size={14}/> Add New
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {profile.facilities.map((spec, i) => (
                <span 
                  key={i} 
                  className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs group"
                >
                  <CheckCircle size={13} className="text-emerald-600" />
                  {spec} 
                  <button 
                    onClick={() => handleRemoveAmenity(spec)} 
                    title="Remove amenity"
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Real Amenities Modal */}
          {showAmenityModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fadeIn">
                <button 
                  onClick={() => setShowAmenityModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#0F2E23] mb-1">Manage Resort Amenities</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">
                  Add custom amenities or click from popular boarding features below.
                </p>

                {/* Custom Input */}
                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Custom Amenity Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Private Splash Pool, Organic Meals"
                      value={customAmenityInput}
                      onChange={e => setCustomAmenityInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      onClick={() => handleAddAmenity()}
                      className="px-4 py-2.5 bg-[#0F2E23] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#163e30] transition cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Suggested Chips */}
                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Quick Add Suggestions</label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {POPULAR_AMENITIES_SUGGESTIONS.map((sug, idx) => {
                      const alreadyAdded = profile.facilities.includes(sug);
                      return (
                        <button
                          key={idx}
                          disabled={alreadyAdded}
                          onClick={() => handleAddAmenity(sug)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1 ${
                            alreadyAdded 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <Plus size={11} /> {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Amenities preview */}
                <div className="mb-6 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                    Current Amenities ({profile.facilities.length})
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {profile.facilities.map((fac, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {fac}
                        <button onClick={() => handleRemoveAmenity(fac)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => {
                      setShowAmenityModal(false);
                      toast.success('Resort amenities saved!');
                    }}
                    className="px-6 py-2.5 bg-[#0F2E23] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#163e30] transition cursor-pointer shadow-md"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        3 & 4. FACILITY GALLERY TAB (ISSUES 3 & 4 FIXED: Working Upload, Delete, Layout)
        ========================================================================
      */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Facility Gallery</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Showcase your luxury kennels, play areas, splash pool, and lounge to pet parents.
              </p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} /> Upload Photo
            </button>
          </div>
          
          {/* Gallery Grid */}
          {galleryPhotos.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm mb-3">
                <ImageIcon size={30} />
              </div>
              <h3 className="text-base font-black text-slate-700">No photos in your gallery yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                Add photos of your resort suites, green play lawns, and care areas to help pet parents choose your facility.
              </p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer"
              >
                + Upload First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Image container with fixed aspect ratio */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-100 cursor-pointer">
                    <img 
                      src={photo.url} 
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#0F2E23]/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        {photo.category}
                      </span>
                    </div>

                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setPreviewLightbox(photo)}
                        className="bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full transition shadow-md cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full transition shadow-md cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Caption & Info bar below image */}
                  <div className="p-4 flex items-center justify-between bg-white border-t border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{photo.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Added {photo.uploadedAt}</p>
                    </div>
                    <button 
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Photo Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#0F2E23] mb-1">Upload Facility Photo</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Add photos of your resort rooms, yards, or play amenities.</p>

                <form onSubmit={handleUploadPhotoSubmit} className="space-y-4">
                  {/* File Upload Option */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Choose Image File From Device
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 transition cursor-pointer"
                    />
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">or image url</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Photo Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..."
                      value={newPhotoUrl}
                      onChange={e => setNewPhotoUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Preset quick test images */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Quick Select Sample Resort Photos</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { title: 'Supervised Play Lawn', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop', cat: 'Play Area' },
                        { title: 'Luxury Private Suite', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop', cat: 'Kennels' },
                        { title: 'Canine Splash Pool', url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=800&auto=format&fit=crop', cat: 'Swimming Pool' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewPhotoUrl(preset.url);
                            setNewPhotoTitle(preset.title);
                            setNewPhotoCategory(preset.cat);
                          }}
                          className="p-1 border border-slate-200 rounded-xl hover:border-emerald-500 transition text-left cursor-pointer"
                        >
                          <img src={preset.url} alt={preset.title} className="w-full h-12 object-cover rounded-lg mb-1" />
                          <p className="text-[9px] font-bold text-slate-700 truncate">{preset.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Title */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Area / Room Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. VIP Air Conditioned Suite #3"
                      value={newPhotoTitle}
                      onChange={e => setNewPhotoTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Facility Category</label>
                    <select 
                      value={newPhotoCategory} 
                      onChange={e => setNewPhotoCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800"
                    >
                      <option value="Play Area">Play Area & Grass Turf</option>
                      <option value="Kennels">Kennels & Accommodations</option>
                      <option value="Swimming Pool">Swimming Pool & Splash Area</option>
                      <option value="Indoor Lounge">Indoor Climate Lounge</option>
                      <option value="Cattery">Cat Condos & Cattery</option>
                      <option value="Veterinary Area">Medical / Vet Room</option>
                    </select>
                  </div>

                  {/* Preview if provided */}
                  {newPhotoUrl && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Photo Preview</span>
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      Add to Gallery
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Full Lightbox View Modal */}
          {previewLightbox && (
            <div 
              onClick={() => setPreviewLightbox(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <div 
                onClick={e => e.stopPropagation()} 
                className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-fadeIn"
              >
                <button 
                  onClick={() => setPreviewLightbox(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition z-10 cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                  <img src={previewLightbox.url} alt={previewLightbox.title} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      {previewLightbox.category}
                    </span>
                    <h3 className="text-base font-black text-slate-800 mt-1">{previewLightbox.title}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      handleDeletePhoto(previewLightbox.id);
                      setPreviewLightbox(null);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        5 & 6. PET PARENT INQUIRIES TAB (ISSUES 5 & 6 FIXED: Solid Alignment & Messages)
        ========================================================================
      */}
      {activeTab === 'messages' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h2 className="text-xl font-black text-[#0F2E23]">Pet Parent Inquiries & Messenger</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Chat directly with pet parents asking about boarding slots, diet, or amenities.
            </p>
          </div>

          {/* 
            Solid responsive 2-column layout:
            - Left Column: w-full md:w-80 lg:w-96 shrink-0 (never collapses or misaligns)
            - Right Column: flex-1 min-w-0 (accommodates all text and replies cleanly)
          */}
          <div className="h-[640px] flex flex-col md:flex-row border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            
            {/* Left Column: Inquiries List */}
            <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
              mobileChatView ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-black text-[#0F2E23] text-sm uppercase tracking-wider">Parent Inquiries ({inquiries.length})</h3>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {inquiries.map((inq) => {
                  const isSelected = inq.id === selectedInquiryId;
                  const lastMsg = inq.messages[inq.messages.length - 1];
                  return (
                    <div 
                      key={inq.id}
                      onClick={() => {
                        setSelectedInquiryId(inq.id);
                        setMobileChatView(true);
                      }}
                      className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600' 
                          : 'hover:bg-slate-100/70 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${inq.avatarColor} flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}>
                        {inq.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{inq.petParent}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-1">{inq.time}</span>
                        </div>
                        <p className="text-[11px] font-bold text-emerald-700 truncate">{inq.petName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.text : 'No messages'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className={`flex-1 min-w-0 flex flex-col bg-[#FAF9F5]/40 ${
              mobileChatView ? 'flex' : 'hidden md:flex'
            }`}>
              {/* Chat Header */}
              {activeInquiry && (
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    <button 
                      onClick={() => setMobileChatView(false)}
                      className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className={`w-10 h-10 rounded-full ${activeInquiry.avatarColor} flex items-center justify-center font-black text-sm shadow-xs`}>
                      {activeInquiry.avatar}
                    </div>
                    <div>
                      <h4 className="font-black text-[#0F2E23] text-sm">{activeInquiry.petParent}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{activeInquiry.petName} • {activeInquiry.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
              )}

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeInquiry?.messages.map((msg) => {
                  const isProvider = msg.sender === 'provider';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isProvider ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs ${
                        isProvider 
                          ? 'bg-[#0F2E23] text-white rounded-tr-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            isProvider ? 'text-emerald-300' : 'text-slate-400'
                          }`}>
                            {msg.senderName}
                          </span>
                          <span className={`text-[10px] ${
                            isProvider ? 'text-white/60' : 'text-slate-400'
                          }`}>
                            {msg.time}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] shrink-0">Quick Replies:</span>
                {[
                  'Yes, we provide 24/7 CCTV live stream access.',
                  'Private play sessions are fully supervised.',
                  'We administer oral supplements and medications.',
                  'Our check-in time is 12:00 PM and check-out is 11:00 AM.'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessageInput(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 font-medium whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-emerald-500 focus-within:bg-white transition">
                  <input 
                    type="text" 
                    placeholder="Type your reply to pet parent..." 
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 px-3" 
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-1.5 cursor-pointer ${
                      messageInput.trim() 
                        ? 'bg-[#0F2E23] text-white hover:bg-[#163e30] shadow-sm' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 
        ========================================================================
        4. CHECK-IN / CHECK-OUT TIMINGS TAB
        ========================================================================
      */}
      {activeTab === 'hours' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Check-in/Out Timings</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your standard check-in and check-out times.</p>
            </div>
            <button 
              onClick={handleSaveTimings}
              disabled={isTimingConflict || isTimingMissing}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition ${
                isTimingConflict || isTimingMissing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#0F2E23] hover:bg-[#163e30] text-white cursor-pointer active:scale-95'
              }`}
              title={isTimingConflict ? 'Cannot save: Check-in and check-out times cannot be identical' : 'Save Timings'}
            >
              <Save size={16} /> Save Timings
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Standard Check-In Time</label>
                    {schedule.checkInTime && (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {formatTime12Hour(schedule.checkInTime)}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-xl px-4 py-3 shadow-sm transition border ${
                    isTimingConflict 
                      ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-100' 
                      : 'bg-slate-50 border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
                  }`}>
                    {isTimingConflict ? (
                      <AlertCircle size={16} className="text-rose-500 mr-3 shrink-0" />
                    ) : (
                      <Clock3 size={16} className="text-slate-400 mr-3 shrink-0" />
                    )}
                    <input 
                      type="time" 
                      value={schedule.checkInTime} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedule(prev => ({ ...prev, checkInTime: val }));
                        if (val && schedule.checkOutTime && val === schedule.checkOutTime) {
                          toast.error('Check-in time cannot be the same as check-out time.', { id: 'timing-conflict-toast' });
                        }
                      }} 
                      className="bg-transparent border-none outline-none text-base font-bold text-slate-700 w-full" 
                    />
                  </div>
                  {isTimingConflict && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> Same as check-out time
                    </p>
                  )}
               </div>

               <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Standard Check-Out Time</label>
                    {schedule.checkOutTime && (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {formatTime12Hour(schedule.checkOutTime)}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-xl px-4 py-3 shadow-sm transition border ${
                    isTimingConflict 
                      ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-100' 
                      : 'bg-slate-50 border-slate-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100'
                  }`}>
                    {isTimingConflict ? (
                      <AlertCircle size={16} className="text-rose-500 mr-3 shrink-0" />
                    ) : (
                      <Clock3 size={16} className="text-slate-400 mr-3 shrink-0" />
                    )}
                    <input 
                      type="time" 
                      value={schedule.checkOutTime} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedule(prev => ({ ...prev, checkOutTime: val }));
                        if (val && schedule.checkInTime && val === schedule.checkInTime) {
                          toast.error('Check-out time cannot be the same as check-in time.', { id: 'timing-conflict-toast' });
                        }
                      }} 
                      className="bg-transparent border-none outline-none text-base font-bold text-slate-700 w-full" 
                    />
                  </div>
                  {isTimingConflict && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> Same as check-in time
                    </p>
                  )}
               </div>
            </div>

            {/* Error Notification Alert */}
            {isTimingConflict && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-rose-800 animate-fadeIn">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-rose-900">Timing Conflict: Same Check-in & Check-out Time</p>
                  <p className="text-xs font-medium text-rose-700 leading-relaxed">
                    Check-in time and check-out time cannot both be <strong>{formatTime12Hour(schedule.checkInTime)}</strong>. Pet hostels require a transition window between departing pets and arriving guests for kennel sanitization, deep disinfection, fresh bedding setup, and feeding preparation.
                  </p>
                </div>
              </div>
            )}

            {/* Missing Timing Notification */}
            {isTimingMissing && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-amber-800 animate-fadeIn">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900">Missing Timings</p>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">
                    Please specify both standard check-in and check-out times to ensure accurate boarding reservations for pet parents.
                  </p>
                </div>
              </div>
            )}

            {/* Valid Timings Confirmation */}
            {!isTimingConflict && !isTimingMissing && (
              <div className="mt-6 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-4 text-emerald-900 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Configured Operating Window</p>
                    <p className="text-xs text-emerald-700 font-medium">
                      Departing guests check out by <strong>{formatTime12Hour(schedule.checkOutTime)}</strong> • Arriving guests check in starting <strong>{formatTime12Hour(schedule.checkInTime)}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  Valid Timings
                </span>
              </div>
            )}

            {/* Recommended Industry Standards Presets */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                Recommended Host Timing Standards
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSchedule(prev => ({ ...prev, checkInTime: '12:00', checkOutTime: '11:00' }))}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    schedule.checkInTime === '12:00' && schedule.checkOutTime === '11:00'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">Standard Noon Stay</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">In: 12:00 PM • Out: 11:00 AM</p>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">1 hr turnaround buffer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchedule(prev => ({ ...prev, checkInTime: '14:00', checkOutTime: '12:00' }))}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    schedule.checkInTime === '14:00' && schedule.checkOutTime === '12:00'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">Afternoon Buffer</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">In: 02:00 PM • Out: 12:00 PM</p>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">2 hr turnaround buffer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSchedule(prev => ({ ...prev, checkInTime: '10:00', checkOutTime: '09:00' }))}
                  className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                    schedule.checkInTime === '10:00' && schedule.checkOutTime === '09:00'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">Morning Shift</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">In: 10:00 AM • Out: 09:00 AM</p>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">1 hr turnaround buffer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        5. GUEST REVIEWS TAB
        ========================================================================
      */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Guest Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Monitor your ratings and reply to pet parent feedback.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-5xl font-black text-[#0F2E23] flex items-baseline gap-2">4.9 <span className="text-lg font-bold text-slate-400">/ 5.0</span></div>
              <div className="flex gap-1 text-[#ffd000] mt-2">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-3">Based on 312 Verified Boarding Reviews</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { author: 'Rahul & Leo (Beagle)', date: '3 days ago', comment: 'Happy Paws is our go-to boarding facility whenever we travel out of Bangalore. The daily video updates and pool session gave us complete peace of mind!', rating: 5 },
              { author: 'Meera & Oreo (Husky)', date: '1 week ago', comment: 'The VIP Suite with 24/7 CCTV live stream is worth every single penny. Clean AC room and genuine caring attendants.', rating: 5 },
              { author: 'Karan & Bruno (Labrador)', date: '2 weeks ago', comment: 'Prompt check-in and checkout. Handled his special diet with great attention.', rating: 5 }
            ].map((rev, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{rev.author}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        6. WALLET & PAYOUTS TAB
        ========================================================================
      */}
      {activeTab === 'wallet' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Track your boarding earnings, escrow settlements, and withdraw directly to bank.</p>
            </div>
            <button 
              onClick={() => {
                setWithdrawForm(prev => ({
                  ...prev,
                  amount: walletBalance > 0 ? walletBalance.toString() : '0'
                }));
                setShowWithdrawModal(true);
              }}
              disabled={walletBalance <= 0}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition ${
                walletBalance <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#0F2E23] hover:bg-[#163e30] text-white cursor-pointer active:scale-95'
              }`}
            >
              <Wallet size={16} /> Withdraw to Bank
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Available Balance Card */}
            <div className="bg-gradient-to-br from-[#0F2E23] to-[#1a4a3a] text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px]">
              <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-1">
                  Available for Payout
                </span>
                <div className="text-3xl font-black tracking-tight text-white mt-1">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-emerald-800/60">
                <span className="text-[11px] text-emerald-200 font-medium flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" /> Instant Settlement
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawForm(prev => ({
                      ...prev,
                      amount: walletBalance > 0 ? walletBalance.toString() : '0'
                    }));
                    setShowWithdrawModal(true);
                  }}
                  disabled={walletBalance <= 0}
                  className="text-xs font-bold text-emerald-300 hover:text-white underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  Withdraw Now →
                </button>
              </div>
            </div>

            {/* Lifetime Boarding Revenue */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Lifetime Revenue
                </span>
                <div className="text-3xl font-black tracking-tight text-slate-800 mt-1">
                  ₹{(walletBalance + 55000).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  +18.4%
                </span>
                <span className="text-xs text-slate-500 font-medium">vs last month</span>
              </div>
            </div>

            {/* In Escrow / Active Bookings */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Active Guest Escrow
                </span>
                <div className="text-3xl font-black tracking-tight text-slate-800 mt-1">
                  ₹10,100
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock3 size={12} className="text-slate-400" /> Releases upon checkout
                </span>
              </div>
            </div>

            {/* Total Paid Out */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Total Settled to Bank
                </span>
                <div className="text-3xl font-black tracking-tight text-slate-800 mt-1">
                  ₹{payoutsHistory.reduce((sum, p) => sum + (p.status === 'Completed' ? p.amount : 0), 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {payoutsHistory.length} successful payouts
                </span>
              </div>
            </div>
          </div>

          {/* Linked Bank Account Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Landmark size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800">Primary Bank Settlement Account</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    HDFC Bank • Current Account ending in ••••4321 • IFSC: HDFC0001234
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawForm(prev => ({
                      ...prev,
                      amount: walletBalance > 0 ? walletBalance.toString() : '0'
                    }));
                    setShowWithdrawModal(true);
                  }}
                  disabled={walletBalance <= 0}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  Withdraw to this Account
                </button>
              </div>
            </div>
          </div>

          {/* Settlements History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Recent Settlements & Payouts</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">History of payouts transferred to your account</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{payoutsHistory.length} Transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-3.5">Reference ID</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5">Payout Method / Destination</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">UTR Number</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payoutsHistory.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {payout.id}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {payout.date} <span className="text-slate-400 text-[11px]">• {payout.time}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-bold">
                        {payout.mode}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 text-sm">
                        ₹{payout.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                        {payout.utr}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          payout.status === 'Completed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payout.status === 'Completed' ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WITHDRAW TO BANK POPUP MODAL */}
          {showWithdrawModal && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setShowWithdrawModal(false)}
            >
              <div 
                className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2E23] text-white flex items-center justify-center shadow-sm">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-base text-[#0F2E23]">Withdraw to Bank Account</h3>
                      <p className="text-xs text-slate-500 font-medium">Transfer boarding revenue to your account</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleRequestWithdrawal} className="p-6 overflow-y-auto space-y-5 text-xs">
                  {/* Current Balance Banner */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Current Withdrawable Balance
                      </span>
                      <div className="text-2xl font-black text-[#0F2E23] mt-0.5">
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                      Zero Transfer Fee
                    </span>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                      Withdrawal Amount (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                      <input 
                        type="number"
                        min="500"
                        max={walletBalance}
                        required
                        value={withdrawForm.amount}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                        placeholder="Enter amount"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl pl-9 pr-4 py-3 text-lg font-black text-slate-800 outline-none transition"
                      />
                    </div>
                    {/* Quick amount chips */}
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {[5000, 10000, 20000].filter(amt => amt <= walletBalance).map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawForm({ ...withdrawForm, amount: amt.toString() })}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50 text-[11px] font-bold text-slate-700 transition cursor-pointer"
                        >
                          ₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWithdrawForm({ ...withdrawForm, amount: walletBalance.toString() })}
                        className="px-2.5 py-1 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                      >
                        All Balance (₹{walletBalance.toLocaleString('en-IN')})
                      </button>
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                      Payout Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setWithdrawForm({ ...withdrawForm, mode: 'bank' })}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                          withdrawForm.mode === 'bank'
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <Landmark size={18} className={withdrawForm.mode === 'bank' ? 'text-emerald-700' : 'text-slate-400'} />
                        <div>
                          <p className="font-bold text-xs">Bank Transfer</p>
                          <p className="text-[10px] text-slate-400">NEFT / IMPS</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWithdrawForm({ ...withdrawForm, mode: 'upi' })}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                          withdrawForm.mode === 'upi'
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <CreditCard size={18} className={withdrawForm.mode === 'upi' ? 'text-emerald-700' : 'text-slate-400'} />
                        <div>
                          <p className="font-bold text-xs">Instant UPI</p>
                          <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Fields for Bank Transfer */}
                  {withdrawForm.mode === 'bank' && (
                    <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Bank Name *</label>
                          <input 
                            type="text"
                            required
                            value={withdrawForm.bankName}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">IFSC Code *</label>
                          <input 
                            type="text"
                            required
                            value={withdrawForm.ifsc}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, ifsc: e.target.value.toUpperCase() })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Account Holder Name *</label>
                        <input 
                          type="text"
                          required
                          value={withdrawForm.accountHolder}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Account Number *</label>
                        <input 
                          type="text"
                          required
                          value={withdrawForm.accountNumber}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for UPI */}
                  {withdrawForm.mode === 'upi' && (
                    <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Virtual Payment Address (UPI ID) *</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. happypaws@okhdfcbank"
                          value={withdrawForm.upiId}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Funds are dispatched instantly to your linked bank account via UPI 2.0 network.
                      </p>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Withdrawals are secured by 256-bit banking encryption. Payouts are usually processed within 2-24 banking hours.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(false)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWithdraw || Number(withdrawForm.amount) <= 0 || Number(withdrawForm.amount) > walletBalance}
                      className="flex-1 py-3 bg-[#0F2E23] hover:bg-[#163e30] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      {isSubmittingWithdraw ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Confirm Payout (₹${Number(withdrawForm.amount || 0).toLocaleString('en-IN')})`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        7. RESORT REGISTRATION & PROFILE TAB
        ========================================================================
      */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Resort Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional details and resort amenities.</p>
            </div>
            <button 
              onClick={() => {
                saveProfileState(profile);
                toast.success('Resort profile saved successfully!');
              }}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Save size={16} /> Save & Publish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-6">
                <div className="relative group cursor-pointer w-24 h-24 shrink-0">
                  <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort / Profile Image URL</label>
                  <input 
                    type="text"
                    name="avatar"
                    value={profile.avatar}
                    onChange={handleProfileChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registration / Trade License</label>
                <input type="text" name="registration" value={profile.registration} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certifications (e.g. IBK)</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Resort Address</label>
                <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none" placeholder="Tell pet parents about your boarding facility..."></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HostelProviderContent;
