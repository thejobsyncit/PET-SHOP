import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, Award, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const ServiceBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('Veterinary');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Booking Form states
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('10:00 AM - 11:00 AM');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petBreed, setPetBreed] = useState('');

  const providers = {
    Veterinary: [
      { name: 'Dr. Ramesh Kumar', clinic: 'Pawora Luxury Vet Clinic', rating: 4.9, reviews: 120, fee: 600, location: 'MG Road, Bangalore', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800' },
      { name: 'Dr. Anita Desai', clinic: 'Max Care Animal Clinic', rating: 4.8, reviews: 98, fee: 500, location: 'Jayanagar, Bangalore', image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=800' }
    ],
    Grooming: [
      { name: 'Velvet Fur Spa Studio', clinic: 'Signature Grooming & Bath', rating: 5.0, reviews: 75, fee: 1200, location: 'Koramangala, Bangalore', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800' },
      { name: 'Paws & Bubbles Groomers', clinic: 'Premium Spa Therapy', rating: 4.7, reviews: 62, fee: 900, location: 'Indiranagar, Bangalore', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800' }
    ],
    Training: [
      { name: 'Major Vikram (Retd.)', clinic: 'Canine Academy of Obedience', rating: 4.9, reviews: 110, fee: 1500, location: 'Whitefield, Bangalore', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800' },
      { name: 'Elite K9 Behaviorist', clinic: 'Therapy & Puppy Training', rating: 4.8, reviews: 88, fee: 1800, location: 'HSR Layout, Bangalore', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800' }
    ],
    Hostel: [
      { name: 'Happy Paws Pet Resort & Hostel', clinic: 'AC Suites & 24/7 Care', rating: 4.9, reviews: 145, fee: 800, location: 'Sarjapur, Bangalore', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' },
      { name: 'Cozy Tails Boarding House', clinic: 'Homely Stay & Play Area', rating: 4.7, reviews: 92, fee: 650, location: 'Hebbal, Bangalore', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800' }
    ],
    Walking: [
      { name: 'Pawsome Walkers Squad', clinic: 'Daily Tracked Dog Walking', rating: 4.8, reviews: 115, fee: 350, location: 'Koramangala, Bangalore', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800' },
      { name: 'Urban Pet Escorts', clinic: 'Private & Group Fitness Walks', rating: 4.9, reviews: 84, fee: 400, location: 'Indiranagar, Bangalore', image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800' }
    ],
    Transport: [
      { name: 'Pet Taxi Express', clinic: 'AC Intercity & Local Relocation', rating: 4.9, reviews: 78, fee: 1500, location: 'Bangalore Metro Area', image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800' },
      { name: 'Safe Paws Travel Service', clinic: 'Veterinary Escort & Crate Transport', rating: 4.8, reviews: 54, fee: 1200, location: 'Airport Road, Bangalore', image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=800' }
    ],
    Insurance: [
      { name: 'Pawora Care Shield', clinic: 'Comprehensive Health & Emergency Coverage', rating: 4.9, reviews: 210, fee: 999, location: 'Pan India Coverage', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800' },
      { name: 'Pet Protection Plan', clinic: 'Accident & Surgery Cover', rating: 4.7, reviews: 130, fee: 799, location: 'Pan India Coverage', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=800' }
    ]
  };

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat === 'Grooming') {
      navigate('/grooming');
      return;
    }
    if (cat && providers[cat]) {
      setActiveTab(cat);
    }
  }, [searchParams, navigate]);

  const handleOpenBooking = (provider) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a service appointment.');
      navigate('/login');
      return;
    }
    setSelectedProvider(provider);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate || !petName || !petBreed) {
      toast.error('Please fill in all booking parameters.');
      return;
    }

    const payload = {
      providerName: selectedProvider.name,
      serviceType: activeTab,
      location: selectedProvider.location,
      date: bookingDate,
      timeSlot: bookingSlot,
      petDetails: {
        name: petName,
        type: petType,
        breed: petBreed
      },
      fee: selectedProvider.fee
    };

    try {
      const data = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data.success) {
        toast.success(`Booking confirmed for ${petName} on ${bookingDate}! Please pay during visit.`);
        setShowBookingModal(false);
        setBookingDate('');
        setPetName('');
        setPetBreed('');
      }
    } catch (err) {
      toast.error(err.message || 'Booking reservation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12 pb-20">

      {/* Title */}
      <div className="border-b border-beige pb-6 text-center space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-accent font-bold">🛠 PET UTILITY SERVICES</span>
        <h1 className="font-serif text-2xl md:text-4xl text-primary font-medium mt-1">Book Premium Care</h1>
        <p className="text-xs text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
          Schedule grooming spa, vet consultation checks, and puppy behavioral training with verified professionals.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-1.5 justify-center border-b border-beige pb-4">
        {['Veterinary', 'Grooming', 'Walking', 'Transport', 'Insurance', 'Training'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (tab === 'Grooming') {
                navigate('/grooming');
              } else {
                setActiveTab(tab);
              }
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500 border border-beige hover:border-primary'
              }`}
          >
            {tab === 'Veterinary' ? 'Vet Consult' : tab}
          </button>
        ))}
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {providers[activeTab].map((p) => (
          <div key={p.name} className="border border-beige bg-white p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm">

            {/* Image (5 cols) */}
            <div className="md:col-span-5 aspect-[4/5] overflow-hidden bg-gray-50 border border-beige">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>

            {/* Info (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-base font-bold text-primary">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 font-semibold">{p.clinic}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">₹{p.fee}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                  <MapPin size={12} />
                  <span>{p.location}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(idx => (
                      <Star key={idx} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">({p.reviews} verified reviews)</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenBooking(p)}
                className="w-full py-2.5 bg-primary text-white hover:bg-accent hover:text-primary text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Calendar size={14} /> BOOK APPOINTMENT
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* OVERLAY MODAL: BOOK SLOT */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowBookingModal(false)} className="fixed inset-0 bg-primary/40 backdrop-blur-sm"></div>

          <form
            onSubmit={handleConfirmBooking}
            className="relative bg-white w-full max-w-md border border-beige shadow-2xl flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="px-6 py-4 bg-primary text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-serif text-sm font-bold tracking-wider text-accent uppercase flex items-center gap-1">
                <Calendar size={16} /> Schedule Reservation slot
              </h3>
              <button type="button" onClick={() => setShowBookingModal(false)} className="text-white hover:text-accent cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-secondary p-3 border border-beige flex items-center gap-3">
                <img src={selectedProvider.image} alt={selectedProvider.name} className="w-10 h-10 object-cover bg-gray-50" />
                <div>
                  <p className="font-serif font-bold text-primary">{selectedProvider.name}</p>
                  <p className="text-[10px] text-gray-400">Consultation Fee: ₹{selectedProvider.fee}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Select Date *</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Choose Hour *</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-gray-500 font-semibold block">Pet Companion Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bruno"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 font-semibold block">Pet Breed *</label>
                  <input
                    type="text"
                    placeholder="e.g. Indie"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-secondary px-6 py-4 border-t border-beige flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="btn-secondary-premium py-2 text-xs"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="btn-premium py-2 text-xs"
              >
                CONFIRM APPOINTMENT
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ServiceBooking;
