import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

export const SELLER_PET_BREEDS = {
  dogs: [
    'Labrador Retriever',
    'Golden Retriever',
    'German Shepherd',
    'Siberian Husky',
    'Shih Tzu',
    'Pug',
    'Beagle',
    'Pomeranian',
    'Rottweiler',
    'Doberman Pinscher',
    'French Bulldog',
    'Indian Spitz',
    'Indian Breed (Indie / Pariah)',
    'Lhasa Apso',
    'Cocker Spaniel',
    'Chow Chow',
    'Tibetan Mastiff',
    'Samoyed',
    'Boxer',
    'Great Dane',
    'Saint Bernard',
    'Dalmatian',
    'Maltese',
    'Chihuahua',
    'Alaskan Malamute',
    'Poodle (Toy / Standard)',
    'Cane Corso',
    'Bullmastiff'
  ],
  cats: [
    'Persian Cat',
    'Maine Coon',
    'British Shorthair',
    'Siamese Cat',
    'Ragdoll',
    'Bengal Cat',
    'Scottish Fold',
    'Sphynx',
    'Indie / Domestic Shorthair',
    'Russian Blue',
    'American Shorthair',
    'Himalayan Cat',
    'Birman',
    'Abyssinian'
  ],
  birds: [
    'Cockatiel',
    'Budgerigar (Budgie)',
    'Lovebird (Fischer / Peach-faced)',
    'African Grey Parrot',
    'Sun Conure',
    'Macaw (Blue & Gold / Scarlet)',
    'Amazon Parrot',
    'Canary',
    'Finch (Zebra / Gouldian)',
    'Cockatoo',
    'Eclectus Parrot',
    'Indian Ringneck Parakeet',
    'Pigeon / Dove (Fantail / Jacobin)'
  ],
  fish: [
    'Flowerhorn Cichlid',
    'Super Red Arowana',
    'Discus Fish (Blue Diamond / Pigeon Blood)',
    'Halfmoon Betta / Fighter Fish',
    'Show Guppy (Full Red / Blue / Moscow)',
    'Angelfish (Altum / Koi / Marble)',
    'Goldfish (Oranda / Ranchu / Black Moor)',
    'Koi Carp',
    'Neon / Cardinal Tetra',
    'Oscar Fish (Albino / Tiger)',
    'Monster Fish / Cichlids',
    'Marine / Clownfish'
  ],
  reptiles: [
    'Bearded Dragon',
    'Leopard Gecko',
    'Corn Snake',
    'Ball Python',
    'Red-Eared Slider Turtle',
    'Indian Star Tortoise (Legal Exotic)',
    'Chameleon (Veiled / Panther)',
    'Crested Gecko',
    'Green Iguana'
  ],
  'small-pets': [
    'Holland Lop Rabbit',
    'Netherland Dwarf Rabbit',
    'Lionhead Rabbit',
    'Angora Rabbit',
    'Syrian Hamster',
    'Dwarf Hamster (Roborovski / Winter White)',
    'Guinea Pig (Abyssinian / Peruvian / American)',
    'Sugar Glider',
    'Chinchilla',
    'Ferret',
    'Hedgehog (African Pygmy)'
  ]
};

import { safeSetItem, safeGetItem } from '../utils/safeStorage.js';

const PetSellerDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || safeGetItem('sellerDashboardTab') || 'inventory';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [profileName, setProfileName] = useState(user?.name || currentProvider?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || user?.profilePicture || currentProvider?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.avatar || user.profilePicture) {
        setProfileAvatar(user.avatar || user.profilePicture);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileName?.trim()) {
      toast.error('Seller name cannot be empty');
      return;
    }
    const result = await dispatch(updateProfile({ 
      name: profileName.trim(), 
      businessName: profileName.trim(),
      avatar: profileAvatar, 
      profilePicture: profileAvatar 
    }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Seller profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = React.useRef(null);

  const handleOpenChat = async (inquiry) => {
    setActiveChatContact(inquiry);
    setLoadingChat(true);
    try {
      const res = await apiRequest(`/chats/messages/${inquiry.id}`);
      if (res.success) {
        setChatMessages(res.messages || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error('Error fetching chat', e);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !activeChatContact) return;

    try {
      const res = await apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: activeChatContact.id,
          messageText: newChatMessage
        })
      });

      if (res.success) {
        setChatMessages([...chatMessages, res.message]);
        setNewChatMessage('');
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  // Add Listing Modal State
  const [editListingId, setEditListingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [petType, setPetType] = useState('dogs');
  const [breed, setBreed] = useState(SELLER_PET_BREEDS.dogs[0]);
  const [customBreed, setCustomBreed] = useState('');
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [vaccinationFile, setVaccinationFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (newType) => {
    setPetType(newType);
    const available = SELLER_PET_BREEDS[newType] || SELLER_PET_BREEDS.dogs;
    setIsCustomBreed(false);
    setCustomBreed('');
    setBreed(available[0] || '');
  };

  const handleEditListing = (pet) => {
    setEditListingId(pet._id);
    setTitle(pet.title || '');
    const mappedType = pet.petType || 'dogs';
    setPetType(mappedType);
    const available = SELLER_PET_BREEDS[mappedType] || SELLER_PET_BREEDS.dogs;
    if (pet.breed && available.includes(pet.breed)) {
      setBreed(pet.breed);
      setIsCustomBreed(false);
      setCustomBreed('');
    } else {
      setBreed(pet.breed || available[0]);
      setIsCustomBreed(Boolean(pet.breed && !available.includes(pet.breed)));
      setCustomBreed(pet.breed || '');
    }
    setAge(pet.age || '');
    setPrice(pet.price || '');
    setOriginalPrice(pet.originalPrice || '');
    setLocation(pet.location || '');
    setContactPhone(pet.contactPhone || '');
    setDescription(pet.description || '');
    setQuantity(pet.quantity || 1);
    setImageFile(null); // Force upload new if they want, else backend keeps old
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditListingId(null);
    setTitle('');
    setPetType('dogs');
    setBreed(SELLER_PET_BREEDS.dogs[0]);
    setIsCustomBreed(false);
    setCustomBreed('');
    setAge('');
    setPrice('');
    setOriginalPrice('');
    setLocation('');
    setContactPhone('');
    setDescription('');
    setQuantity(1);
    setImageFile(null);
    setShowAddForm(true);
  };
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
      safeSetItem('sellerDashboardTab', activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
    safeSetItem('sellerDashboardTab', tabName);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/listings/my');
      if (data.success) {
        setAllListings(data.listings);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSellOne = async (id) => {
    try {
      const data = await apiRequest(`/listings/${id}/sell`, { method: 'PUT' });
      if (data.success) {
        toast.success('Successfully marked 1 pet as sold!');
        fetchListings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as sold.');
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const roomsRes = await apiRequest('/chats/rooms');
      if (roomsRes.success && roomsRes.rooms) {
        let loadedInquiries = [];
        for (const room of roomsRes.rooms) {
          try {
            const msgsRes = await apiRequest(`/chats/messages/${room._id}`);
            if (msgsRes.success && msgsRes.messages && msgsRes.messages.length > 0) {
              const lastMsg = msgsRes.messages[msgsRes.messages.length - 1];
              loadedInquiries.push({
                id: room._id,
                buyer: room.name,
                pet: 'General Inquiry',
                date: new Date(lastMsg.createdAt || Date.now()).toLocaleString(),
                message: lastMsg.messageText,
                unread: (lastMsg.recipient?._id || lastMsg.recipient) === user?._id && !lastMsg.read
              });
            }
          } catch (e) {}
        }
        loadedInquiries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setInquiries(loadedInquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentProvider?.id]);

  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setter(compressedDataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPayment = async (e) => {
    e.preventDefault();

    const finalBreed = (isCustomBreed ? customBreed : breed)?.trim();
    if (!title || !finalBreed || !age || !location || !contactPhone || !description) {
      toast.error('Please fill in all required listing details.');
      return;
    }

    if (editListingId) {
       await finalizeListingSubmission();
       return;
    }

    // Show the payment modal
    setShowPaymentModal(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const submitPaidListing = async () => {
    setIsProcessingPayment(true);

    try {
      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Failed to load Razorpay script. Check your connection.');
        setIsProcessingPayment(false);
        return;
      }

      // 2. Create Order on Backend
      const orderResponse = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: 200 })
      });

      if (!orderResponse.success) {
        toast.error('Could not create payment order');
        setIsProcessingPayment(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_test_placeholder_key_id', // Replace with real key ID or fetch from backend
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Pawora Pet Shop',
        description: 'Listing Fee for ' + title,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
        order_id: orderResponse.orderId,
        handler: async function (response) {
          try {
            // 4. Verify Payment on Backend
            const verifyRes = await apiRequest('/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });

            if (verifyRes.success) {
              // 5. Submit Listing after successful payment
              await finalizeListingSubmission();
            } else {
              toast.error('Payment verification failed!');
            }
          } catch (err) {
            toast.error('Verification error: ' + err.message);
          }
        },
        prefill: {
          name: profileName || 'Pet Seller',
          email: user?.email || 'seller@example.com',
          contact: contactPhone || '9999999999',
        },
        theme: {
          color: '#0F2E23',
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error(err.message || 'Payment initiation failed.');
      setIsProcessingPayment(false);
    }
  };

  const finalizeListingSubmission = async () => {
    const finalBreed = (isCustomBreed ? customBreed : breed)?.trim() || 'Standard Breed';
    const payload = {
      title,
      petType,
      breed: finalBreed,
      age,
      price: price ? parseFloat(price) : 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      description,
      location,
      contactPhone,
      quantity: parseInt(quantity) || 1,
      images: imageFile ? [imageFile] : undefined,
      vaccinationCertificate: vaccinationFile || undefined,
      paymentStatus: 'paid',
      paymentAmount: 200
    };

    try {
      const url = editListingId ? `/listings/${editListingId}` : '/listings';
      const method = editListingId ? 'PUT' : 'POST';
      const data = await apiRequest(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (data.success) {
        toast.success(editListingId ? 'Listing updated successfully!' : 'Payment successful! Your pet listing has been published.');
        setShowPaymentModal(false);
        setShowAddForm(false);
        
        // Clear inputs
        setEditListingId(null);
        setTitle('');
        setBreed('');
        setAge('');
        setPrice('');
        setOriginalPrice('');
        setDescription('');
        setImageFile(null);
        setVaccinationFile(null);
        setQuantity(1);
        
        // Refresh listings immediately
        fetchListings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit listing after payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const myPets = useMemo(() => {
    if (!searchQuery.trim()) return allListings;
    const query = searchQuery.toLowerCase().trim();
    return allListings.filter(pet => {
      return (
        pet.title?.toLowerCase().includes(query) ||
        pet.breed?.toLowerCase().includes(query) ||
        pet.petType?.toLowerCase().includes(query)
      );
    });
  }, [allListings, currentProvider, searchQuery]);

  const activePets = myPets.filter(p => p.status !== 'Sold Out' && p.quantity > 0);
  const soldOutPets = myPets.filter(p => p.status === 'Sold Out' || p.quantity === 0);
  const petsWithSales = myPets.filter(p => p.soldCount > 0 || p.status === 'Sold Out' || p.quantity === 0);
  
  const totalDiscountGiven = myPets.reduce((acc, curr) => {
    if (curr.originalPrice && curr.price && curr.originalPrice > curr.price) {
      return acc + (curr.originalPrice - curr.price);
    }
    return acc;
  }, 0);

  // Safe Stats Calculation
  const stats = {
    totalListings: myPets.length,
    availableStock: activePets.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
    soldOutCount: soldOutPets.length,
    totalOrders: petsWithSales.reduce((acc, curr) => acc + (curr.soldCount || 1), 0),
    revenue: petsWithSales.reduce((acc, curr) => acc + ((curr.soldCount || 1) * (curr.price || 0)), 0),
    discounts: totalDiscountGiven || 1500, 
    inquiries: 12,
    rating: currentProvider?.rating || 4.9,
    reviews: currentProvider?.reviewsCount || 100
  };

  const navItems = [
    { id: 'inventory', label: 'My Pet Inventory', icon: PawPrint, count: stats.totalListings },
    { id: 'orders', label: 'Sales & Orders', icon: DollarSign, count: stats.totalOrders },
    { id: 'inquiries', label: 'Buyer Leads', icon: MessageSquare, count: stats.inquiries },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  // Fix Profile Avatar - Use actual user's avatar if they are logged in, otherwise fallback
  const displayAvatar = user?.avatar || user?.profilePicture || profileAvatar || currentProvider?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
  const displayName = user?.name || profileName || currentProvider?.name || 'Pet Seller';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex">
      
      {/* 
        ========================================================
        LEFT SIDEBAR: NAVIGATION & PROFILE
        ========================================================
      */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 sticky top-[104px] h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-12 space-y-8">
          
          {/* Profile Widget */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd000] to-amber-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className={`w-3 h-3 rounded-full ${currentProvider?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </div>
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
                <ShieldCheck size={12} className="text-amber-500" /> Elite Seller
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black transition duration-300 ${
                  activeTab === item.id 
                    ? 'bg-[#0F2E23] text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2E23]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-[#ffd000]' : 'text-slate-400'} /> 
                  {item.label}
                </div>
                {item.count !== undefined && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === item.id ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-500 font-black'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Logout */}
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

      {/* 
        ========================================================
        RIGHT MAIN CONTENT
        ========================================================
      */}
      <main className="flex-1 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Seller Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Track your pet inventory, sales, and buyer leads in real-time.
            </p>
          </div>
          
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-[#ffd000] hover:bg-[#ffdf4d] text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> Post New Pet Listing
          </button>
        </div>

        {/* 
          ========================================================
          CUSTOM SELLER KPI METRICS
          ========================================================
        */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pets Listed</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalListings}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">All time</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available Stock</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">Pets remaining</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Sold Out</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Completed listings</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#ffd000]/80 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#ffd000]/10 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Orders & Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-amber-100">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹{stats.revenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-2 relative z-10">
              {stats.totalOrders} total sales
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

        {/* 
          ========================================================
          TAB CONTENT
          ========================================================
        */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
            
            {activeTab === 'inventory' && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-sans font-black text-[#0F2E23] flex items-center gap-2">
                    <PawPrint size={22} className="text-[#ffd000]" /> Manage Pet Listings
                  </h2>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search your pets..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] w-64 transition shadow-sm"
                    />
                  </div>
                </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium animate-pulse">Loading your pet inventory...</div>
              ) : myPets.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                    <PawPrint size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#0F2E23]">No Pets Listed Yet</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Start listing your healthy, verified pets to reach thousands of potential pet parents.</p>
                  <button
                    onClick={handleAddNew}
                    className="px-6 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-wider rounded-xl mt-3 transition shadow-md"
                  >
                    Post First Pet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {myPets.map(pet => {
                    const isSold = pet.status === 'Sold Out' || pet.quantity === 0;
                    return (
                      <div key={pet._id} className={`group bg-white border ${isSold ? 'border-rose-200' : 'border-slate-200'} rounded-2xl overflow-hidden hover:border-[#0F2E23]/30 transition duration-300 flex flex-col shadow-sm hover:shadow-lg ${isSold ? 'opacity-80' : ''}`}>
                        <div className="relative h-64 overflow-hidden bg-slate-100">
                          <img 
                            src={pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'} 
                            alt={pet.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition duration-700 ${isSold ? 'grayscale opacity-80' : ''}`}
                          />
                          
                          {/* Tags overlay */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-[#0F2E23] uppercase tracking-widest shadow-sm">
                            {pet.petType}
                          </div>
                          
                          {isSold ? (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                              <span className="bg-[#0F2E23] text-white px-5 py-2.5 text-sm font-black tracking-widest uppercase rotate-[-12deg] shadow-xl border-2 border-white">
                                SOLD OUT
                              </span>
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
                              {pet.quantity} In Stock
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5 flex flex-col flex-1 space-y-4">
                          <h3 className="font-sans font-black text-[#0F2E23] text-base leading-tight line-clamp-2">{pet.title}</h3>
                          
                          <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                            <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{pet.breed}</span>
                            <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{pet.age}</span>
                          </div>
                          
                          {(pet.soldCount > 0 || isSold) && (
                            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-700 flex items-center gap-1.5"><DollarSign size={14}/> Sold: {pet.soldCount || (isSold ? 1 : 0)}</span>
                              <span className="font-black text-emerald-700">₹{((pet.soldCount || (isSold ? 1 : 0)) * (pet.price || 0)).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                            <div>
                              {pet.originalPrice && pet.originalPrice > pet.price && (
                                <span className="text-[10px] text-slate-400 line-through block mb-0.5 font-black">₹{pet.originalPrice.toLocaleString('en-IN')}</span>
                              )}
                              <div className="text-xl font-sans font-black text-[#0F2E23]">
                                ₹{pet.price?.toLocaleString('en-IN') || 0}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTabChange('inquiries')}
                                className="px-2 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 transition flex items-center justify-center"
                                title="View Buyer Leads"
                              >
                                <MessageSquare size={16} />
                              </button>
                              {!isSold && (
                                <button 
                                  onClick={() => handleSellOne(pet._id)}
                                  className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition flex items-center justify-center gap-1 text-xs font-black uppercase tracking-wider"
                                  title="Mark 1 Sold Offline"
                                >
                                  Sell (-)
                                </button>
                              )}
                              <button 
                                onClick={isSold ? undefined : () => handleEditListing(pet)}
                                disabled={isSold}
                                className={`px-2 py-2 rounded-xl border transition flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider ${isSold ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed' : 'border-[#0F2E23] text-[#0F2E23] hover:bg-[#0F2E23] hover:text-white bg-white'}`}
                                title="Manage Listing"
                              >
                                <Settings size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-xl font-sans font-black text-[#0F2E23] flex items-center gap-2">
                <DollarSign size={22} className="text-[#ffd000]" /> Sales & Orders History
              </h2>
              {petsWithSales.length === 0 ? (
                 <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm font-medium">
                   No sales history recorded yet. When a pet is marked as sold, it will appear here.
                 </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Pet Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Sale Price</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {petsWithSales.map(pet => (
                        <tr key={pet._id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <img src={pet.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800'} alt={pet.title} className={`w-14 h-14 rounded-xl object-cover border border-slate-200 ${pet.status === 'Sold Out' || pet.quantity === 0 ? 'grayscale' : ''}`} />
                            <div>
                              <div className="font-black text-[#0F2E23] line-clamp-1">
                                {pet.title} {pet.soldCount > 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">x{pet.soldCount}</span>}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{pet.breed}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 capitalize font-medium">{pet.petType}</td>
                          <td className="px-6 py-4 font-black text-[#0F2E23] text-base">₹{pet.price?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                              <CheckCircle size={10} /> Delivered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === 'inquiries' && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-sans font-black text-[#0F2E23] flex items-center gap-2">
                    <MessageSquare size={22} className="text-[#ffd000]" /> Buyer Leads & Inquiries
                  </h2>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">12 Total Leads</span>
                </div>
                
                {activeChatContact ? (
                  <div className="border border-slate-200 bg-white rounded-2xl flex flex-col h-[600px] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setActiveChatContact(null)} className="p-2 text-slate-500 hover:text-[#0F2E23] transition rounded-full hover:bg-slate-200">
                          <X size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0F2E23] text-white flex items-center justify-center font-black text-sm shadow-sm">
                            {activeChatContact.buyer[0]}
                          </div>
                          <div>
                            <h3 className="font-black text-[#0F2E23] text-sm">{activeChatContact.buyer}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-2 py-0.5 rounded-md mt-1 inline-block shadow-sm">{activeChatContact.pet}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F5] space-y-4">
                      {loadingChat ? (
                        <p className="text-center text-slate-400 text-xs font-bold animate-pulse py-10">Loading conversation...</p>
                      ) : chatMessages.length > 0 ? (
                        chatMessages.map((m, index) => {
                          const isSoloTesting = chatMessages.every(msg => (msg.sender?._id || msg.sender) === (chatMessages[0].sender?._id || chatMessages[0].sender));
                          const isMe = isSoloTesting ? (index % 2 !== 0) : ((m.sender?._id || m.sender).toString() === user?._id?.toString());
                          
                          return (
                            <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-md p-3.5 text-xs shadow-sm rounded-2xl ${isMe ? 'bg-[#0F2E23] text-[#FAF9F5] rounded-br-none shadow-md' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                <p className="leading-relaxed">{m.messageText}</p>
                                <span className={`block text-[9px] text-right mt-1 font-bold ${isMe ? 'text-[#ffd000]' : 'text-slate-400'}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-slate-400 text-xs font-bold py-10 italic">No messages yet.</p>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 shrink-0">
                      <input 
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        placeholder="Type your reply to the buyer..."
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2E23] transition shadow-inner"
                        required
                      />
                      <button type="submit" className="px-5 py-3 bg-[#0F2E23] text-white rounded-xl hover:bg-[#163e30] transition shadow-md flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                        <span>Send</span>
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  {loadingInquiries ? (
                    <div className="text-center py-10 text-slate-500 text-sm font-bold animate-pulse">Loading inquiries...</div>
                  ) : inquiries.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mx-auto">
                        <MessageSquare size={24} />
                      </div>
                      <h3 className="text-lg font-black text-[#0F2E23]">No New Messages</h3>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto">When potential buyers are interested in your pets, their messages and adoption requests will appear here.</p>
                    </div>
                  ) : (
                    inquiries.map((inquiry) => (
                      <div key={inquiry.id} className={`p-6 rounded-2xl border transition duration-300 flex flex-col sm:flex-row gap-5 ${inquiry.unread ? 'bg-white border-[#ffd000]/50 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="w-12 h-12 rounded-full bg-[#0F2E23] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                        {inquiry.buyer.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-[#0F2E23] text-base">{inquiry.buyer}</h4>
                          <span className="text-xs font-bold text-slate-400">{inquiry.date}</span>
                        </div>
                        <p className="text-[10px] font-black text-[#ffd000] mb-3 uppercase tracking-widest bg-[#0F2E23] inline-block px-2.5 py-1 rounded-md">Interested in: {inquiry.pet}</p>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">"{inquiry.message}"</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                          <button onClick={() => handleOpenChat(inquiry)} className="px-5 py-2.5 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-[#163e30] transition shadow-sm">Reply to Lead</button>
                          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 transition">Mark as Read</button>
                        </div>
                      </div>
                      {inquiry.unread && (
                        <div className="shrink-0 flex items-start">
                          <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>
                )}
              </div>
            )}

          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-xl font-sans font-black text-[#0F2E23] flex items-center gap-2">
                <Settings size={22} className="text-[#ffd000]" /> Seller Profile Settings
              </h2>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-2xl">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="shrink-0 flex flex-col items-center gap-3">
                      <img 
                        src={profileAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400'} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                      />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Seller/Brand Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Profile Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setProfileAvatar)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] shadow-sm bg-slate-50 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:bg-[#0F2E23] file:text-white hover:file:bg-[#163e30]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* OVERLAY MODAL: CREATE NEW LISTING */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setShowAddForm(false)} className="fixed inset-0 bg-[#0F2E23]/40 backdrop-blur-sm"></div>
          
          <form 
            onSubmit={triggerPayment}
            className="relative bg-white w-full max-w-2xl border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          >
            <div className="px-6 py-5 bg-[#0F2E23] text-white flex justify-between items-center">
              <h3 className="font-sans text-lg font-black tracking-wider text-[#ffd000] uppercase flex items-center gap-2">
                <Plus size={20} /> {editListingId ? 'Edit Pet Listing' : 'List Pet for Sale'}
              </h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-300 hover:text-white transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="space-y-1.5">
                <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Purebred Siberian Husky Puppies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Pet Category *</label>
                  <select
                    value={petType}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="cats">Cats</option>
                    <option value="birds">Birds</option>
                    <option value="fish">Fish / Aquatic</option>
                    <option value="reptiles">Reptiles</option>
                    <option value="small-pets">Small Pets</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Breed *</label>
                  <select
                    value={isCustomBreed ? 'other' : breed}
                    onChange={(e) => {
                      if (e.target.value === 'other') {
                        setIsCustomBreed(true);
                        setBreed(customBreed || '');
                      } else {
                        setIsCustomBreed(false);
                        setBreed(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm font-semibold text-slate-800 cursor-pointer"
                    required
                  >
                    {(SELLER_PET_BREEDS[petType] || SELLER_PET_BREEDS.dogs).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="other">Other / Custom Breed (Type below)</option>
                  </select>
                </div>
              </div>

              {/* If Custom Breed is selected, show custom text input */}
              {isCustomBreed && (
                <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">
                    Enter Custom Breed Name *
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Rare Crossbreed / Specific ${petType === 'dogs' ? 'Dog' : petType === 'cats' ? 'Cat' : petType === 'birds' ? 'Bird' : 'Pet'} Breed`}
                    value={customBreed}
                    onChange={(e) => {
                      setCustomBreed(e.target.value);
                      setBreed(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-emerald-400 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-emerald-50/50 font-medium text-slate-800"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Age *</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 months"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">MRP / Orig Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 20000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Location City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Quantity Available *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 4"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Pet Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setImageFile)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] shadow-sm bg-slate-50 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:bg-[#0F2E23] file:text-white hover:file:bg-[#163e30]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Vaccination Cert. (optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, setVaccinationFile)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] shadow-sm bg-slate-50 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-600 font-black text-xs uppercase tracking-wider block">Health History & Details *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your pet's vaccination checks, personality details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23] shadow-sm bg-slate-50"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 rounded-xl bg-[#0F2E23] hover:bg-[#163e30] text-white font-black text-xs uppercase tracking-wider transition shadow-md"
              >
                {editListingId ? 'Update Listing' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F2E23]/60 backdrop-blur-md"></div>
          
          <div className="relative bg-white w-full max-w-md border border-slate-200 rounded-3xl shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-[#0F2E23] p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <PawPrint size={100} />
              </div>
              <div className="w-16 h-16 bg-[#ffd000] rounded-full mx-auto flex items-center justify-center mb-4 relative z-10 shadow-lg border-4 border-[#0F2E23]">
                <CreditCard size={28} className="text-[#0F2E23]" />
              </div>
              <h3 className="font-sans text-xl font-black text-white relative z-10">Listing Fee Required</h3>
              <p className="text-sm text-slate-300 mt-2 relative z-10 font-medium">To publish this listing, a one-time fee is required.</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-500">Listing:</span>
                  <span className="text-sm font-black text-[#0F2E23] line-clamp-1 text-right ml-4">{title || 'New Pet'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Amount to Pay:</span>
                  <span className="text-2xl font-black text-[#0F2E23]">₹200</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-center font-bold text-slate-500 uppercase tracking-widest">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="py-3 px-4 rounded-xl border-2 border-[#0F2E23] bg-[#0F2E23]/5 font-black text-[#0F2E23] text-sm flex items-center justify-center gap-2 hover:bg-[#0F2E23]/10 transition">
                    UPI (GPay/PhonePe)
                  </button>
                  <button type="button" className="py-3 px-4 rounded-xl border border-slate-200 bg-white font-black text-slate-600 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition">
                    Card / NetBanking
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col gap-3">
              <button 
                onClick={submitPaidListing}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-xl bg-[#0F2E23] text-[#ffd000] font-black text-sm uppercase tracking-widest hover:bg-[#163e30] transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹200 & Publish</>
                )}
              </button>
              <button 
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
                className="w-full py-3 rounded-xl bg-transparent text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PetSellerDashboard;
