import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile, fetchProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';
import GroomingProviderContent from './GroomingProviderContent.jsx';

const GroomingProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = localStorage.getItem('groomingDashboardTab');
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
  const [breed, setBreed] = useState('');
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

  const handleEditListing = (pet) => {
    setEditListingId(pet._id);
    setTitle(pet.title || '');
    setPetType(pet.petType || 'dogs');
    setBreed(pet.breed || '');
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
    setBreed('');
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
      localStorage.setItem('groomingDashboardTab', activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
    localStorage.setItem('groomingDashboardTab', tabName);
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

    if (!title || !breed || !age || !location || !contactPhone || !description) {
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
    const payload = {
      title,
      petType,
      breed,
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

  // Fix Profile Avatar - Use actual user's avatar if they are logged in, otherwise fallback
  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
  const displayName = user?.name || currentProvider?.name || 'Pet Seller';

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
                  handleFileChange(e, async (compressedDataUrl) => {
                    setProfileAvatar(compressedDataUrl);
                    const result = await dispatch(updateProfile({ name: profileName, avatar: compressedDataUrl, profilePicture: compressedDataUrl }));
                    if (updateProfile.fulfilled.match(result)) {
                      toast.success('Profile picture updated successfully!');
                    } else {
                      toast.error('Failed to update profile picture');
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
                <ShieldCheck size={12} className="text-amber-500" /> Elite Seller
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {[
                { id: 'appointments', label: 'Spa Appointments & Queue', count: 4, icon: Calendar },
                { id: 'packages', label: 'Grooming Packages & Pricing', count: 6, icon: Tag },
                { id: 'gallery', label: 'Before & After Gallery', count: 12, icon: Star },
                { id: 'messages', label: 'Client Inquiries', count: 2, icon: MessageSquare },
                { id: 'hours', label: 'Studio Hours & Slots', icon: Clock },
                { id: 'reviews', label: 'Customer Reviews', extra: '4.8 ★', icon: Heart },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Studio Registration & Profile', icon: Building }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
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
              Grooming Studio Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your spa appointments, grooming packages, and client gallery.
            </p>
          </div>

        </div>

        {/* 
          ========================================================
          CUSTOM SELLER KPI METRICS
          ========================================================
        */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Spa Appointments</span>
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
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pending Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">In queue</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Completed Sessions</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Groomed pets</div>
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
              <div className="text-2xl font-sans font-black text-[#0F2E23]">â‚¹{stats.revenue.toLocaleString('en-IN')}</div>
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
              <div className="text-2xl font-sans font-black text-[#0F2E23]">â‚¹{stats.discounts.toLocaleString('en-IN')}</div>
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
          <GroomingProviderContent activeTab={activeTab} />
        </div>
      </main>




    </div>
  );
};

export default GroomingProviderDashboard;
