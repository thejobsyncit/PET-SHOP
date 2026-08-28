import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, CheckCircle2, ShieldCheck, ClipboardCheck, X } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const AdoptionShelter = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Inquiry Modal states
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [activePet, setActivePet] = useState(null);
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  useEffect(() => {
    loadAdoptions();
  }, [activeTab]);

  const loadAdoptions = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab !== 'all' ? `/adoptions?petType=${activeTab}` : '/adoptions';
      const data = await apiRequest(endpoint);
      if (data.success) {
        setAdoptions(data.adoptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInquiry = (pet) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit an adoption application.');
      navigate('/login');
      return;
    }
    setActivePet(pet);
    setShowInquiryModal(true);
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryPhone || !inquiryMessage) {
      toast.error('Please enter all parameters.');
      return;
    }

    try {
      const data = await apiRequest(`/adoptions/${activePet._id}/inquiry`, {
        method: 'POST',
        body: JSON.stringify({
          phone: inquiryPhone,
          message: inquiryMessage
        })
      });

      if (data.success) {
        toast.success(`Application for ${activePet.petName} submitted successfully! The shelter NGO will reach out shortly.`);
        setShowInquiryModal(false);
        setInquiryPhone('');
        setInquiryMessage('');
        loadAdoptions();
      }
    } catch (err) {
      toast.error(err.message || 'Inquiry submission failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12 pb-20">
      
      {/* Title */}
      <div className="border-b border-beige pb-6 text-center space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-accent font-bold">❤️ NGO RESCUE CENTRES</span>
        <h1 className="font-serif text-2xl md:text-4xl text-primary font-medium mt-1">Adopt A Companion</h1>
        <p className="text-xs text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
          Rehome dogs, cats, and birds from certified shelters. Give neglected animals a second lease on life.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-1.5 justify-center border-b border-beige pb-4">
        {[
          { id: 'all', label: 'All Rescues' },
          { id: 'dogs', label: 'Dogs' },
          { id: 'cats', label: 'Cats' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-500 border border-beige hover:border-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Adoption Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(idx => (
            <div key={idx} className="bg-white border border-beige h-72 animate-pulse"></div>
          ))}
        </div>
      ) : adoptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {adoptions.map((a) => (
            <div key={a._id} className="border border-beige bg-white p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm">
              
              {/* Pet Photo (5 columns) */}
              <div className="md:col-span-5 aspect-[4/5] overflow-hidden bg-gray-50 border border-beige relative">
                <img src={a.image} alt={a.petName} className="w-full h-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-accent text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest">
                  {a.breed}
                </span>
              </div>

              {/* Pet Details (7 columns) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-primary">{a.petName}</h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{a.age}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                    <MapPin size={12} />
                    <span>{a.shelterName} ({a.shelterLocation})</span>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed italic">
                    "{a.rescueStory}"
                  </p>

                  {/* Health checks tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {a.healthStatus.vaccinated && (
                      <span className="bg-green-50 text-green-700 border border-green-150 text-[9px] px-2 py-0.5 uppercase font-bold tracking-wider">Vaccinated</span>
                    )}
                    {a.healthStatus.neutered && (
                      <span className="bg-blue-50 text-blue-700 border border-blue-150 text-[9px] px-2 py-0.5 uppercase font-bold tracking-wider">Neutered</span>
                    )}
                    {a.healthStatus.microchipped && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-150 text-[9px] px-2 py-0.5 uppercase font-bold tracking-wider">Microchipped</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenInquiry(a)}
                  className="w-full py-2.5 bg-primary text-white hover:bg-accent hover:text-primary text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Heart size={14} /> ADOPT {a.petName.toUpperCase()}
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-beige max-w-md mx-auto text-gray-500 text-xs">
          No rescue records currently listed. Thank you for caring!
        </div>
      )}

      {/* OVERLAY MODAL: SUBMIT ADOPTION INQUIRY */}
      {showInquiryModal && activePet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowInquiryModal(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>
          
          <form 
            onSubmit={handleSubmitInquiry}
            className="relative bg-white w-full max-w-md border border-beige shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1">
                <ClipboardCheck size={16} /> Adoption Application
              </h3>
              <button type="button" onClick={() => setShowInquiryModal(false)} className="text-white hover:text-accent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-secondary p-3 border border-beige flex items-center gap-3">
                <img src={activePet.image} alt={activePet.petName} className="w-10 h-10 object-cover bg-gray-50" />
                <div>
                  <p className="font-serif font-bold text-primary">Applying to adopt: {activePet.petName}</p>
                  <p className="text-[10px] text-gray-400">Shelter: {activePet.shelterName}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Contact Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-500 font-semibold block">Why would you like to adopt? *</label>
                <textarea
                  rows={4}
                  placeholder="Tell the shelter about your home, yard size, previous pet history..."
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setShowInquiryModal(false)}
                className="btn-secondary-premium py-2 text-xs"
              >
                CANCEL
              </button>
              <button 
                type="submit" 
                className="btn-premium py-2 text-xs"
              >
                SUBMIT APPLICATION
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdoptionShelter;
