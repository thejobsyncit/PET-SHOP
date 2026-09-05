import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, MapPin, MessageSquare, ShieldCheck, Tag, Phone, X, Heart, Lock, ShieldAlert, Briefcase, Clock, Syringe, CreditCard, Check, Shield } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const PetClassifieds = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const selectedPetType = searchParams.get('petType') || 'all';
  
  const setSelectedPetType = (type) => {
    if (type === 'all') {
      searchParams.delete('petType');
    } else {
      searchParams.set('petType', type);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Checkout states
  const [checkoutPet, setCheckoutPet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'processing', 'success'

  // Form states
  const [title, setTitle] = useState('');
  const [petType, setPetType] = useState('dogs');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [vaccinationFile, setVaccinationFile] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

  useEffect(() => {
    loadListings();
  }, [selectedPetType]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const endpoint = selectedPetType !== 'all' ? `/listings?petType=${selectedPetType}` : '/listings';
      const data = await apiRequest(endpoint);
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a classified listing.');
      navigate('/login');
      return;
    }

    if (!title || !breed || !age || !location || !contactPhone || !description) {
      toast.error('Please fill in all required listing details.');
      return;
    }

    const payload = {
      title,
      petType,
      breed,
      age,
      price: price ? parseFloat(price) : 0,
      description,
      location,
      contactPhone,
      quantity: parseInt(quantity) || 1,
      images: imageFile ? [imageFile] : undefined,
      vaccinationCertificate: vaccinationFile || undefined
    };

    try {
      const data = await apiRequest('/listings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        toast.success('Your pet listing has been published for moderation!');
        setShowAddForm(false);
        // Clear inputs
        setTitle('');
        setBreed('');
        setAge('');
        setPrice('');
        setLocation('');
        setContactPhone('');
        setDescription('');
        setImageFile(null);
        setVaccinationFile(null);
        setQuantity(1);
        loadListings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit listing.');
    }
  };

  const handleStartChat = async (owner) => {
    if (!isAuthenticated) {
      toast.error('Please login to initiate a direct chat.');
      navigate('/login');
      return;
    }
    
    const ownerId = owner._id || owner;
    if (ownerId === user?._id) {
      toast.error('You cannot chat with yourself.');
      return;
    }
    
    navigate('/chat', { state: { recipientId: ownerId, ownerName: owner.name || 'Seller' } });
  };

  const handleBuy = (pet) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase a pet.');
      navigate('/login');
      return;
    }
    
    if (user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller') {
      toast.error('Sellers cannot buy pets.');
      return;
    }
    
    const ownerId = pet.user?._id || pet.user;
    if (ownerId === user?._id) {
      toast.error('You cannot buy your own pet listing.');
      return;
    }

    setCheckoutPet(pet);
  };

  const handleConfirmPurchase = async () => {
    if (paymentMethod !== 'Cash on Delivery') {
      setPaymentStep('processing');
      // simulate network/gateway delay for Razorpay/Stripe
      await new Promise(resolve => setTimeout(resolve, 2500));
    } else {
      setIsProcessingPayment(true);
    }

    try {
      const data = await apiRequest(`/listings/${checkoutPet._id}/buy`, { method: 'PUT' });
      if (data.success) {
        if (paymentMethod !== 'Cash on Delivery') {
          setPaymentStep('success');
          // play success for a brief moment before closing
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          toast.success('Successfully purchased! The seller will be notified.');
        }
        
        setCheckoutPet(null);
        setPaymentStep('details');
        setIsProcessingPayment(false);
        loadListings();
      }
    } catch (err) {
      toast.error(err.message || 'Purchase failed.');
      setPaymentStep('details');
      setIsProcessingPayment(false);
    }
  };

  const handleSellOne = async (id) => {
    try {
      const data = await apiRequest(`/listings/${id}/sell`, { method: 'PUT' });
      if (data.success) {
        toast.success('Successfully marked 1 pet as sold!');
        loadListings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as sold.');
    }
  };

  // Filter listings locally on search query
  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNonSellerProvider = user?.role === 'SERVICE_PROVIDER' && 
    (user?.serviceCategory || '').toLowerCase() !== 'pet seller';

  if (isNonSellerProvider) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-3">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
            🔒 Pet Seller Exclusive Section
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-slate-900 font-bold">
            Access Restricted to Verified Pet Sellers
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your account is currently registered as a <strong className="text-slate-900">{user?.serviceCategory || 'Service Provider'}</strong>. The Pet Classifieds & Sales marketplace is exclusively reserved for registered <strong>Pet Sellers</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs text-slate-600 text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Briefcase size={14} className="text-[#0F2E23]" />
            <span>Manage Your Service Appointments</span>
          </div>
          <p className="text-[11px] text-slate-500">
            To view client bookings, configure your operating schedule, and post {user?.serviceCategory || 'service'} packages, please visit your Service Provider Hub.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/provider-dashboard')}
            className="px-6 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <Briefcase size={15} /> Go to {user?.serviceCategory || 'Service'} Dashboard
          </button>
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            My Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-5 sm:pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">🐾 PET CLASSIFIEDS</span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary font-bold mt-1">Buy, Sell & Rehome</h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">Verify credentials, adopt locally, and find healthy litters near you.</p>
        </div>
        
        {(user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller') || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto px-5 py-3 bg-primary hover:bg-accent text-white hover:text-primary font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus size={15} /> POST PET LISTING
          </button>
        ) : null}
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 bg-white border border-beige p-3 sm:p-4 shadow-sm">
        
        {/* Department Switchers (Horizontally Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Pets' },
            { id: 'dogs', label: 'Dogs' },
            { id: 'cats', label: 'Cats' },
            { id: 'birds', label: 'Birds' },
            { id: 'reptiles', label: 'Reptiles' },
            { id: 'small-pets', label: 'Small Pets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedPetType(tab.id)}
              className={`px-3.5 py-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedPetType === tab.id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-50 md:bg-transparent text-gray-600 hover:bg-secondary hover:text-primary border border-gray-200 md:border-0'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar input */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search breed, title, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary bg-secondary/50 focus:bg-white transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={12} />
            </button>
          )}
        </div>

      </div>

      {/* Listings Grid (Responsive 1-col on mobile, 2-col on tablet, 3-col on desktop) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(idx => (
            <div key={idx} className="bg-white border border-beige h-72 sm:h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredListings.map((l) => (
            <div key={l._id} className="card-premium bg-white flex flex-col justify-between h-full border border-beige shadow-sm hover:shadow-md transition">
              
              <div>
                {/* Image */}
                <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gray-100 border-b border-beige relative">
                  <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" loading="lazy" />
                  
                  {/* Rehome / Price Tag */}
                  <span className="absolute bottom-2.5 left-2.5 bg-primary text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider shadow-sm">
                    {l.price === 0 ? 'Rehome (Free)' : `₹${l.price.toLocaleString('en-IN')}`}
                  </span>

                  {/* Verification Badge */}
                  {l.isVerified ? (
                    <span className="absolute top-3 right-3 bg-green-600 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-0.5">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-orange-100 text-orange-800 border border-orange-200 text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-0.5">
                      <Clock size={10} /> Pending
                    </span>
                  )}

                  {/* Vaccinated Badge */}
                  {l.vaccinationCertificate && (
                    <span className="absolute top-10 right-3 bg-blue-100 text-blue-800 border border-blue-200 text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-0.5 mt-1">
                      <Syringe size={10} /> Vaccinated
                    </span>
                  )}

                  {/* Sold Out / Quantity Badge */}
                  {l.status === 'Sold Out' || l.quantity === 0 ? (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-black text-white px-4 py-2 text-sm font-black tracking-widest uppercase rotate-[-12deg] shadow-2xl border-2 border-white">
                        SOLD OUT
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-3 left-3 bg-white/90 text-primary text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest shadow-sm rounded-sm">
                      Available: {l.quantity || 1}
                    </span>
                  )}
                </div>

                {/* Body details */}
                <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-accent tracking-widest uppercase">
                    <span className="truncate max-w-[60%]">{l.breed}</span>
                    <span className="shrink-0">{l.age}</span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-primary leading-snug line-clamp-1">
                    {l.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {l.description}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="p-4 sm:p-5 pt-0 mt-auto space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 font-bold border-t border-beige pt-2.5 sm:pt-3">
                  <MapPin size={12} className="text-accent shrink-0" />
                  <span className="truncate">{l.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 relative z-20">
                  <a 
                    href={l.status === 'Sold Out' || l.quantity === 0 ? '#' : `tel:${l.contactPhone}`}
                    className={`py-2 border text-[10px] tracking-widest font-bold uppercase text-center flex items-center justify-center gap-1 transition ${l.status === 'Sold Out' || l.quantity === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-beige hover:border-primary text-primary'}`}
                    onClick={(e) => {
                      if (l.status === 'Sold Out' || l.quantity === 0) e.preventDefault();
                    }}
                  >
                    <Phone size={12} /> CALL
                  </a>
                  <button
                    onClick={() => handleStartChat(l.user)}
                    disabled={l.status === 'Sold Out' || l.quantity === 0}
                    className={`py-2 text-[10px] tracking-widest font-bold uppercase flex items-center justify-center gap-1 transition ${l.status === 'Sold Out' || l.quantity === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-accent hover:text-primary cursor-pointer'}`}
                  >
                    <MessageSquare size={12} /> CHAT
                  </button>
                </div>
                
                {/* Buy Action */}
                {l.status !== 'Sold Out' && l.quantity !== 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleBuy(l)}
                      className="w-full py-2 bg-[#ffd000] hover:bg-[#e6bb00] text-[#0F2E23] text-[11px] font-black tracking-widest uppercase rounded-md transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                      BUY NOW
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 bg-white border border-beige max-w-md mx-auto px-4 text-gray-500 text-xs sm:text-sm">
          No active classified listings found matching the criteria.
        </div>
      )}

      {/* OVERLAY MODAL: CREATE NEW LISTING (Fully Responsive Mobile/Tablet/Desktop) */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div onClick={() => setShowAddForm(false)} className="fixed inset-0 bg-transparent"></div>
          
          <form 
            onSubmit={handleCreateListing}
            className="relative bg-white w-full max-w-2xl border border-beige shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-base font-bold tracking-wider text-accent uppercase flex items-center gap-1">
                List Pet for Sale / Rehome
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="text-white hover:text-accent p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="space-y-1">
                <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Purebred Siberian Husky Puppies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Pet Category *</label>
                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="cats">Cats</option>
                    <option value="birds">Birds</option>
                    <option value="reptiles">Reptiles</option>
                    <option value="small-pets">Small Pets</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Breed *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alaskan Malamute"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Age, Price, Location (Responsive 1-col on mobile, 3-col on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Age *</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 months"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Price (0 for free) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Location City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Contact Phone *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Number of Pets (Quantity) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 4"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pet Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setImageFile)}
                    className="w-full px-3 py-2 border border-beige text-sm focus:outline-none focus:border-primary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-primary hover:file:bg-beige"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Vaccination Certificate (optional)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, setVaccinationFile)}
                    className="w-full px-3 py-2 border border-beige text-sm focus:outline-none focus:border-primary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-primary hover:file:bg-beige"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Description & Health history *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your pet's vaccination checks, personality details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-secondary px-6 py-5 border-t border-beige flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-secondary-premium py-2.5 px-6 text-sm"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="btn-premium py-2.5 px-6 text-sm"
              >
                PUBLISH CLASSIFIED
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHECKOUT MODAL OVERLAY */}
      {checkoutPet && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-beige shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-accent" /> Checkout Securely
              </h3>
              {paymentStep === 'details' && (
                <button 
                  onClick={() => setCheckoutPet(null)}
                  className="text-white hover:text-accent p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="p-6">
              
              {paymentStep === 'processing' && (
                <div className="py-16 flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                   <div className="relative">
                     <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-accent">
                       <Shield size={20} />
                     </div>
                   </div>
                   <div className="text-center">
                     <h3 className="text-lg font-bold text-primary font-serif">Processing Payment...</h3>
                     <p className="text-xs text-gray-500 mt-1">Please do not close this window or press back.</p>
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                     <Lock size={12} /> Secured by Razorpay
                   </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                     <Check size={40} className="animate-[bounce_0.5s_ease-in-out_1]" />
                   </div>
                   <div className="text-center">
                     <h3 className="text-xl font-bold text-green-700 font-serif">Payment Successful!</h3>
                     <p className="text-xs text-gray-500 mt-1 font-medium">Your order has been confirmed.</p>
                   </div>
                </div>
              )}

              {paymentStep === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Pet Info */}
                  <div className="flex gap-4 p-4 border border-beige bg-secondary rounded-xl">
                    <img src={checkoutPet.images[0]} alt={checkoutPet.title} className="w-16 h-16 object-cover bg-gray-100 rounded-lg shadow-sm" />
                    <div>
                      <h4 className="font-bold text-primary text-sm line-clamp-1">{checkoutPet.title}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{checkoutPet.breed}</p>
                      <p className="text-primary font-black mt-1">₹{(checkoutPet.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Select Payment Method</label>
                    <div className="grid gap-2">
                      {['Credit Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map((method) => (
                        <label 
                          key={method}
                          className={`flex items-center gap-3 p-3.5 border cursor-pointer text-xs font-semibold rounded-lg transition-colors ${
                            paymentMethod === method ? 'border-primary bg-secondary text-primary shadow-sm' : 'border-beige text-gray-500 hover:border-primary/50 hover:bg-gray-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="pet-payment" 
                            checked={paymentMethod === method}
                            onChange={() => setPaymentMethod(method)}
                            className="text-primary focus:ring-0" 
                          />
                          <span>{method === 'Credit Card' ? 'Credit / Debit Card' : method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Action */}
                  <div className="pt-5 border-t border-beige space-y-5">
                    <div className="flex justify-between items-center text-sm font-bold text-primary bg-[#fdfaf2] p-3 rounded-lg border border-[#e6c968]/30">
                      <span>Grand Total</span>
                      <span>₹{(checkoutPet.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    
                    <button
                      onClick={handleConfirmPurchase}
                      disabled={isProcessingPayment}
                      className="w-full btn-premium py-3 text-xs uppercase shadow-md flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> PAY ₹{(checkoutPet.price || 0).toLocaleString('en-IN')} SECURELY
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PetClassifieds;
