import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Heart, ArrowLeft, MapPin, Phone, MessageSquare, ShieldCheck,
  CheckCircle2, Check, User, Calendar, Award, Share2, Info, Home,
  Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredAdoptionPets } from '../data/adoptionPetsData';

const AdoptionPetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [pets, setPets] = useState(getStoredAdoptionPets);
  const [pet, setPet] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  // Application Form States
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [homeType, setHomeType] = useState('Apartment');
  const [hasPetExperience, setHasPetExperience] = useState('Yes');
  const [adoptionReason, setAdoptionReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Load target pet with robust ID and string matching
  useEffect(() => {
    const currentPets = getStoredAdoptionPets();
    setPets(currentPets);
    const decodedId = decodeURIComponent(id || '').trim();
    const found = currentPets.find(
      (p) =>
        p.id === id ||
        String(p.id) === String(id) ||
        String(p.id) === decodedId ||
        p._id === id ||
        String(p.id).toLowerCase() === decodedId.toLowerCase()
    );
    if (found) {
      setPet(found);
      setSelectedImage(found.image);
    }
  }, [id]);

  // Pre-fill user information if authenticated
  useEffect(() => {
    if (user) {
      if (user.name) setApplicantName(user.name);
      if (user.mobile) setApplicantPhone(user.mobile);
      if (user.email) setApplicantEmail(user.email);
    }
  }, [user]);

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-md max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-[#7c56dc]">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-800">Pet Listing Not Found</h2>
          <p className="text-xs text-slate-500">
            The pet listing you are looking for might have been adopted or removed.
          </p>
          <Link
            to="/adopt"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7c56dc] text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            <ArrowLeft size={16} /> Back to All Adoption Pets
          </Link>
        </div>
      </div>
    );
  }

  // Handle direct WhatsApp inquiry
  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I am interested in adopting "${pet.name}" (${pet.breed}, ${pet.city}) listed on India Pet Hub.`
    );
    window.open(`https://wa.me/918306688827?text=${text}`, '_blank');
  };

  // Handle Application Submit
  const handleApplicationSubmit = (e) => {
    e.preventDefault();

    if (!applicantPhone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }
    if (!adoptionReason.trim()) {
      toast.error('Please let us know why you would like to adopt this pet.');
      return;
    }

    setIsSubmitted(true);
    toast.success(`🎉 Adoption application for ${pet.name} submitted successfully! The guardian will call you within 24 hours.`, {
      duration: 6000,
      icon: '🐾'
    });
  };

  // Other related pets for carousel/grid
  const relatedPets = pets.filter((p) => p.id !== pet.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">
      
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-purple-100 py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <span>&gt;</span>
            <Link to="/adopt" className="hover:text-slate-900">Pet Adoption</Link>
            <span>&gt;</span>
            <span className="text-[#7c56dc] font-bold">{pet.name}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/adopt')}
            className="text-xs font-bold text-[#7c56dc] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Pets
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: Pet Gallery, Bio, Medical Details (7 cols)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Main Gallery Card */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden p-4 space-y-4">
              
              {/* Big High-Res Main Image */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-purple-50">
                <img
                  src={selectedImage || pet.image}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    100% Free Adoption
                  </span>
                  <span className="bg-[#7c56dc]/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    {pet.quality}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Listing link copied to clipboard!');
                      }
                    }}
                    className="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>

              {/* Thumbnails Gallery */}
              {pet.gallery && pet.gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {pet.gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        selectedImage === imgUrl ? 'border-[#7c56dc] ring-2 ring-purple-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* 2. Key Attributes Grid Card */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h1 className="font-serif text-3xl font-extrabold text-slate-900">
                    Hi! My name is <span className="text-[#7c56dc]">{pet.name}</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                    <MapPin size={14} className="text-[#7c56dc]" />
                    <span>{pet.city}, {pet.state}</span>
                  </p>
                </div>

                <div className="inline-block bg-purple-50 text-[#7c56dc] font-bold text-xs px-3.5 py-1.5 rounded-xl border border-purple-100">
                  {pet.personality}
                </div>
              </div>

              {/* 4-Box Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Breed</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{pet.breed}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{pet.gender}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Age</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{pet.age}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Adoption Fee</span>
                  <span className="font-bold text-emerald-600 text-xs sm:text-sm">Free (₹0)</span>
                </div>
              </div>

              {/* Story / Description */}
              <div className="space-y-2">
                <h3 className="font-serif text-base font-bold text-slate-900">About {pet.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pet.description}
                </p>
              </div>

              {/* Medical Verification Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="font-serif text-base font-bold text-slate-900">Health & Medical Records</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-800">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Vaccinated</p>
                      <p className="text-[10px] text-emerald-600">Up to date on shots</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-150 text-blue-800">
                    <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Dewormed</p>
                      <p className="text-[10px] text-blue-600">Internal parasite clear</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-150 text-purple-800">
                    <ShieldCheck size={18} className="text-[#7c56dc] shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Shelter Verified</p>
                      <p className="text-[10px] text-[#7c56dc]">Health checked by Vet</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adoption Process Guarantee */}
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-2 text-xs text-slate-700">
                <p className="font-bold text-[#7c56dc] flex items-center gap-1.5">
                  <Sparkles size={16} /> India Pet Hub Adoption Commitment
                </p>
                <p className="text-[11.5px] leading-relaxed text-slate-600">
                  Every pet adopted through India Pet Hub receives free post-adoption guidance, a starter medical passport, and direct connection with verified animal shelters.
                </p>
              </div>

            </div>

          </div>


          {/* =========================================================================
              RIGHT COLUMN: Sticky Adoption Application Card (5 cols)
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Guardian & Direct Contact Card */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-md p-6 space-y-5 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-[#7c56dc] font-bold text-base">
                    {pet.parentName ? pet.parentName.charAt(0) : 'G'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Guardian</span>
                    <h4 className="font-bold text-slate-800 text-sm">{pet.parentName || 'Verified Guardian'}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Location</span>
                  <span className="text-xs font-bold text-[#7c56dc]">{pet.city}</span>
                </div>
              </div>

              {/* Instant WhatsApp & Call Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-3 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp Chat</span>
                </button>

                <a
                  href={`tel:${pet.parentContact || '8306688827'}`}
                  className="py-3 px-3 bg-[#7c56dc] hover:bg-[#6842c8] text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  <span>Call Guardian</span>
                </a>
              </div>

              {/* Adoption Application Form */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Heart size={16} className="text-[#7c56dc]" />
                    <span>Adopt {pet.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fill this quick application to introduce yourself to {pet.name}'s guardian.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <Check size={24} />
                    </div>
                    <h4 className="font-bold text-emerald-900 text-sm">Application Sent!</h4>
                    <p className="text-xs text-emerald-700">
                      The guardian will reach out on your contact number to schedule a meet & greet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs text-[#7c56dc] font-bold hover:underline pt-2 block mx-auto"
                    >
                      Submit another application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplicationSubmit} className="space-y-3 text-xs">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7c56dc] focus:ring-2 focus:ring-purple-100 font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Your Contact Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7c56dc] focus:ring-2 focus:ring-purple-100 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Home Type</label>
                        <select
                          value={homeType}
                          onChange={(e) => setHomeType(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7c56dc] font-medium bg-slate-50"
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="House with Yard">House with Yard</option>
                          <option value="Farmhouse">Farmhouse</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Pet Experience?</label>
                        <select
                          value={hasPetExperience}
                          onChange={(e) => setHasPetExperience(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7c56dc] font-medium bg-slate-50"
                        >
                          <option value="Yes">Yes (Had pets before)</option>
                          <option value="First Time">First-time parent</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Why do you want to adopt {pet.name}? *</label>
                      <textarea
                        rows={3}
                        placeholder="Tell about your daily routine, family, and home environment..."
                        value={adoptionReason}
                        onChange={(e) => setAdoptionReason(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#7c56dc] focus:ring-2 focus:ring-purple-100 font-medium"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#7c56dc] hover:bg-[#6842c8] text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Heart size={16} />
                      <span>Submit Adoption Application</span>
                    </button>

                  </form>
                )}

              </div>

            </div>

          </div>

        </div>


        {/* =========================================================================
            BOTTOM: Other Pets Looking For A Forever Home
           ========================================================================= */}
        {relatedPets.length > 0 && (
          <div className="mt-16 pt-8 border-t border-purple-150 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Other Companions Looking for Homes
                </h3>
                <p className="text-xs text-slate-500">
                  Explore other loving puppies and cats ready for adoption
                </p>
              </div>
              <Link
                to="/adopt"
                className="text-xs font-bold text-[#7c56dc] hover:underline flex items-center gap-1"
              >
                View All Pets &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPets.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-purple-50">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Hi! My name is: <span className="text-[#7c56dc]">{p.name}</span>
                    </h4>
                    <p className="text-xs text-slate-500">{p.breed} • {p.city}</p>
                    <Link
                      to={`/adopt/${p.id}`}
                      className="block text-center py-2 bg-[#7c56dc] hover:bg-[#6842c8] text-white text-xs font-bold rounded-xl transition"
                    >
                      Know More About {p.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdoptionPetDetail;
