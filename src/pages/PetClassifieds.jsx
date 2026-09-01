import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, MapPin, MessageSquare, ShieldCheck, Tag, Phone, X, Heart, Lock, ShieldAlert, Briefcase } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const PetClassifieds = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetType, setSelectedPetType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [petType, setPetType] = useState('dogs');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
      images: imageUrl ? [imageUrl] : undefined
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
        setImageUrl('');
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
    // We navigate to chat page passing recipientId state
    navigate('/chat', { state: { recipientId: owner._id || owner, ownerName: owner.name } });
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
        
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto px-5 py-3 bg-primary hover:bg-accent text-white hover:text-primary font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Plus size={15} /> {user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller' ? 'POST PET LISTING (SELLER)' : 'LIST MY PET'}
        </button>
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
                  {l.isVerified && (
                    <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-0.5 shadow-sm">
                      <ShieldCheck size={11} /> Verified
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

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a 
                    href={`tel:${l.contactPhone}`}
                    className="py-2.5 sm:py-2 border border-beige hover:border-primary text-[10px] sm:text-[11px] tracking-wider font-bold uppercase text-center text-primary flex items-center justify-center gap-1 transition active:scale-[0.98]"
                  >
                    <Phone size={12} /> CALL
                  </a>
                  <button
                    onClick={() => handleStartChat(l.user)}
                    className="py-2.5 sm:py-2 bg-primary text-white hover:bg-accent hover:text-primary text-[10px] sm:text-[11px] tracking-wider font-bold uppercase flex items-center justify-center gap-1 transition cursor-pointer active:scale-[0.98]"
                  >
                    <MessageSquare size={12} /> CHAT
                  </button>
                </div>
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
            className="relative bg-white w-full max-w-lg border border-beige shadow-2xl flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] z-10 my-auto overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-primary text-white flex justify-between items-center border-b border-white/10 shrink-0">
              <h3 className="font-serif text-xs sm:text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1.5">
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

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-3.5 sm:space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Purebred Siberian Husky Puppies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Pet Category *</label>
                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
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
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
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
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
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
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
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
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Contact Phone *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Image Link (optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-600 font-semibold block text-[11px] sm:text-xs">Description & Health History *</label>
                <textarea
                  rows={3}
                  placeholder="Describe vaccination checks, personality details, diet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary resize-none"
                  required
                ></textarea>
              </div>
            </div>

            <div className="bg-secondary px-4 sm:px-6 py-3 sm:py-4 border-t border-beige flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase transition cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white hover:bg-accent hover:text-primary font-bold text-[11px] sm:text-xs tracking-wider uppercase transition cursor-pointer shadow-sm"
              >
                PUBLISH CLASSIFIED
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default PetClassifieds;
