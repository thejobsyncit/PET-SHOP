import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, MapPin, MessageSquare, ShieldCheck, Tag, Phone, X, Heart, Lock, ShieldAlert, Briefcase, Clock, Syringe } from 'lucide-react';
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
    navigate('/chat', { state: { recipientId: owner._id || owner, ownerName: owner.name } });
  };

  const handleBuy = async (id) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase a pet.');
      navigate('/login');
      return;
    }
    
    if (window.confirm('Are you sure you want to purchase this pet? The stock will decrease by 1.')) {
      try {
        const data = await apiRequest(`/listings/${id}/buy`, { method: 'PUT' });
        if (data.success) {
          toast.success('Successfully purchased! The seller will be notified.');
          loadListings();
        }
      } catch (err) {
        toast.error(err.message || 'Purchase failed.');
      }
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">🐾 PET CLASSIFIEDS</span>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">Buy, Sell & Rehome</h1>
          <p className="text-xs text-gray-400 font-medium">Verify credentials, adopt locally, and find healthy litters near you.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-primary hover:bg-accent text-white hover:text-primary font-bold tracking-widest text-xs uppercase flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus size={14} /> {user?.role === 'SERVICE_PROVIDER' && (user?.serviceCategory || '').toLowerCase() === 'pet seller' ? 'POST PET LISTING (SELLER)' : 'LIST MY PET'}
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-beige p-4 shadow-sm">
        
        {/* Department Switchers */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
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
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition cursor-pointer ${
                selectedPetType === tab.id 
                  ? 'bg-primary text-white' 
                  : 'text-gray-500 hover:bg-secondary hover:text-primary'
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
            className="w-full pl-9 pr-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary bg-secondary"
          />
        </div>

      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="bg-white border border-beige h-80 animate-pulse"></div>
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredListings.map((l) => (
            <div key={l._id} className="card-premium bg-white flex flex-col justify-between h-full">
              
              <div>
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden bg-gray-50 border-b border-beige relative">
                  <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                  
                  {/* Rehome / Price Tag */}
                  <span className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    {l.price === 0 ? 'Rehome (Free)' : `₹${l.price}`}
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
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold text-accent tracking-widest uppercase">
                    <span>{l.breed}</span>
                    <span>{l.age}</span>
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-primary leading-snug line-clamp-1">
                    {l.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                    {l.description}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="p-5 pt-0 mt-auto space-y-3">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold border-t border-beige pt-3">
                  <MapPin size={12} className="text-accent" />
                  <span>{l.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 relative z-20">
                  <a 
                    href={l.status === 'Sold Out' || l.quantity === 0 ? '#' : `tel:${l.contactPhone}`}
                    className={`py-2 border text-[10px] tracking-widest font-bold uppercase text-center flex items-center justify-center gap-1 transition ${l.status === 'Sold Out' || l.quantity === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-beige hover:border-primary text-primary'}`}
                    onClick={(e) => {
                      if (l.status === 'Sold Out' || l.quantity === 0) e.preventDefault();
                    }}
                  >
                    <Phone size={12} /> CALL OWNER
                  </a>
                  <button
                    onClick={() => handleStartChat(l.user)}
                    disabled={l.status === 'Sold Out' || l.quantity === 0}
                    className={`py-2 text-[10px] tracking-widest font-bold uppercase flex items-center justify-center gap-1 transition ${l.status === 'Sold Out' || l.quantity === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-accent hover:text-primary cursor-pointer'}`}
                  >
                    <MessageSquare size={12} /> CHAT NOW
                  </button>
                </div>
                
                {/* Buy Action */}
                {l.status !== 'Sold Out' && l.quantity !== 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleBuy(l._id)}
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
        <div className="text-center py-20 bg-white border border-beige max-w-md mx-auto text-gray-500 text-xs">
          No active classified listings found matching the criteria.
        </div>
      )}

      {/* OVERLAY MODAL: CREATE NEW LISTING */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddForm(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <form 
            onSubmit={handleCreateListing}
            className="relative bg-white w-full max-w-2xl border border-beige shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-base font-bold tracking-wider text-accent uppercase flex items-center gap-1">
                List Pet for Sale / Rehome
              </h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-white hover:text-accent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Listing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Purebred Siberian Husky Puppies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-beige text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pet Category *</label>
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
                  <label className="text-gray-500 font-semibold block">Breed *</label>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Age *</label>
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
                  <label className="text-gray-500 font-semibold block">Price (0 for free rehome) *</label>
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
                  <label className="text-gray-500 font-semibold block">Location City *</label>
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
                  <label className="text-gray-500 font-semibold block">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="Phone number"
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

    </div>
  );
};

export default PetClassifieds;
