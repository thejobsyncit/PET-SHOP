import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, MapPin, Award, ShieldCheck, Mail, MessageSquare, Phone, X } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const BreedingDirectory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [studs, setStuds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [studName, setStudName] = useState('');
  const [petType, setPetType] = useState('dogs');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [kciNumber, setKciNumber] = useState('');
  const [studFee, setStudFee] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pedigreeSire, setPedigreeSire] = useState('');
  const [pedigreeDam, setPedigreeDam] = useState('');

  useEffect(() => {
    loadStuds();
  }, [searchQuery]);

  const loadStuds = async () => {
    setLoading(true);
    try {
      const endpoint = searchQuery ? `/breeding?breed=${searchQuery}` : '/breeding';
      const data = await apiRequest(endpoint);
      if (data.success) {
        setStuds(data.studs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStud = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a stud listing.');
      navigate('/login');
      return;
    }

    if (!studName || !breed || !age || !kciNumber || !studFee || !location || !contactPhone) {
      toast.error('Please enter all required stud details.');
      return;
    }

    const payload = {
      studName,
      petType,
      breed,
      age,
      kciNumber,
      studFee: parseFloat(studFee),
      description,
      location,
      contactPhone,
      images: imageUrl ? [imageUrl] : undefined,
      pedigreeDetails: { sire: pedigreeSire || 'Sire line', dam: pedigreeDam || 'Dam line' }
    };

    try {
      const data = await apiRequest('/breeding', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        toast.success('Stud profile registered successfully! Admin KCI validation pending.');
        setShowAddForm(false);
        // Clear forms
        setStudName('');
        setBreed('');
        setAge('');
        setKciNumber('');
        setStudFee('');
        setDescription('');
        setLocation('');
        setContactPhone('');
        setImageUrl('');
        setPedigreeSire('');
        setPedigreeDam('');
        loadStuds();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit profile.');
    }
  };

  const handleStartChat = (breeder) => {
    if (!isAuthenticated) {
      toast.error('Please login to chat with the breeder.');
      navigate('/login');
      return;
    }
    navigate('/chat', { state: { recipientId: breeder._id || breeder, ownerName: breeder.name } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-beige pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">🧬 BREEDER REGISTRY</span>
          <h1 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">Pedigree Stud Finder</h1>
          <p className="text-xs text-gray-400 font-medium">Kennel Club of India (KCI) registered champions and pedigree bloodlines moderation.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-primary hover:bg-accent text-white hover:text-primary font-bold tracking-widest text-xs uppercase flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus size={14} /> REGISTER STUD
        </button>
      </div>

      {/* Search Input bar */}
      <div className="bg-white border border-beige p-4 shadow-sm flex items-center max-w-md">
        <Search size={14} className="text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Filter studs by breed (e.g. Golden Retriever)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs focus:outline-none bg-transparent"
        />
      </div>

      {/* Grid of Studs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2].map(idx => (
            <div key={idx} className="bg-white border border-beige h-96 animate-pulse"></div>
          ))}
        </div>
      ) : studs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {studs.map((s) => (
            <div key={s._id} className="card-premium bg-white flex flex-col justify-between h-full">
              
              <div>
                {/* Photo */}
                <div className="aspect-[16/10] overflow-hidden bg-gray-50 border-b border-beige relative">
                  <img src={s.images[0]} alt={s.studName} className="w-full h-full object-cover" />
                  
                  {/* Verification status badge */}
                  <span className={`absolute top-3 right-3 text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest flex items-center gap-0.5 ${
                    s.isVerified ? 'bg-green-600 text-white' : 'bg-orange-100 text-orange-800'
                  }`}>
                    <ShieldCheck size={10} /> {s.isVerified ? 'KCI Certified' : 'Verification Pending'}
                  </span>
                  
                  <span className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    Stud Fee: ₹{s.studFee}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold text-accent tracking-widest uppercase">
                    <span>{s.breed}</span>
                    <span>{s.age}</span>
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-primary">{s.studName}</h3>
                  
                  {/* Pedigree lineages */}
                  <div className="bg-secondary p-2.5 border border-beige text-[10px] space-y-1">
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">Pedigree Bloodline</p>
                    <p><strong className="text-primary font-semibold">Sire (Father):</strong> {s.pedigreeDetails.sire}</p>
                    <p><strong className="text-primary font-semibold">Dam (Mother):</strong> {s.pedigreeDetails.dam}</p>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>
              </div>

              {/* Contact / Chat */}
              <div className="p-5 pt-0 mt-auto space-y-3">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-beige pt-3">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-accent" /> {s.location}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">License: {s.kciNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`tel:${s.contactPhone}`}
                    className="py-2 border border-beige hover:border-primary text-[10px] tracking-widest font-bold uppercase text-center text-primary flex items-center justify-center gap-1 transition"
                  >
                    <Phone size={12} /> CALL OWNER
                  </a>
                  <button
                    onClick={() => handleStartChat(s.user)}
                    className="py-2 bg-primary text-white hover:bg-accent hover:text-primary text-[10px] tracking-widest font-bold uppercase flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <MessageSquare size={12} /> CHAT NOW
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-beige max-w-md mx-auto text-gray-500 text-xs">
          No breeder studs registered under this category yet.
        </div>
      )}

      {/* OVERLAY MODAL: REGISTER STUD PROFILE */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddForm(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <form 
            onSubmit={handleCreateStud}
            className="relative bg-white w-full max-w-lg border border-beige shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1">
                Register Champion Stud Profile
              </h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-white hover:text-accent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Stud Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Max"
                    value={studName}
                    onChange={(e) => setStudName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Breed *</label>
                  <input
                    type="text"
                    placeholder="e.g. Golden Retriever"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Age *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">KCI License Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. KCI-RET-98210"
                    value={kciNumber}
                    onChange={(e) => setKciNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Stud Fee (INR) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={studFee}
                    onChange={(e) => setStudFee(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pedigree Sire (Father)</label>
                  <input
                    type="text"
                    placeholder="Father champion pedigree details"
                    value={pedigreeSire}
                    onChange={(e) => setPedigreeSire(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pedigree Dam (Mother)</label>
                  <input
                    type="text"
                    placeholder="Mother champion pedigree details"
                    value={pedigreeDam}
                    onChange={(e) => setPedigreeDam(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-gray-500 font-semibold block">Location City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, KA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pet Type *</label>
                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="cats">Cats</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Stud Image URL</label>
                  <input
                    type="text"
                    placeholder="Image URL link"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Breeder Comments & Health *</label>
                <textarea
                  rows={3}
                  placeholder="Describe mating logs, health clearances details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-secondary-premium py-2 text-xs"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="btn-premium py-2 text-xs"
              >
                REGISTER PROFILE
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default BreedingDirectory;
