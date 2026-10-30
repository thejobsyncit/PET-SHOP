import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Heart, ArrowLeft, MapPin, MessageSquare, ShieldCheck,
  CircleCheck, Check, User, Calendar, Award, Share2, Info, Home,
  Sparkles, AlertCircle, ArrowRight, Lock, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getStoredAdoptionPets,
  saveAdoptionApplication,
  getUserAdoptionApplications,
  getStoredAdoptionApplications,
  isPetApplicantMatch,
  saveAdoptionInquiry
} from '../../data/adoptionPetsData';
import FlyingMacawMessenger from '../../components/widgets/FlyingMacawMessenger.jsx';

const WhatsAppIcon = ({ className = 'w-4 h-4', size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.71 1.457h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const AdoptionPetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [pets, setPets] = useState(() => getStoredAdoptionPets());
  const [pet, setPet] = useState(() => {
    const allPets = getStoredAdoptionPets();
    const decodedId = decodeURIComponent(id || '').trim();
    return (
      allPets.find(
        (p) =>
          p && (
            p.id === id ||
            String(p.id) === String(id) ||
            String(p.id) === decodedId ||
            p._id === id ||
            String(p.id).toLowerCase() === decodedId.toLowerCase()
          )
      ) || null
    );
  });
  const [selectedImage, setSelectedImage] = useState(() => pet?.image || '');

  // Application Form States
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [homeType, setHomeType] = useState('Apartment');
  const [hasPetExperience, setHasPetExperience] = useState('Yes');
  const [adoptionReason, setAdoptionReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [showFlyingMacaw, setShowFlyingMacaw] = useState(false);

  // In-App Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquirySenderName, setInquirySenderName] = useState('');
  const [inquirySenderPhone, setInquirySenderPhone] = useState('');

  // Check if currently logged in user is the owner/creator of this pet listing
  const isPetOwner = Boolean(
    user && pet && (
      (pet.ownerId && (pet.ownerId === user._id || pet.ownerId === user.id || String(pet.ownerId) === String(user._id || user.id))) ||
      (pet.ownerEmail && user.email && pet.ownerEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
      (pet.ownerPhone && user.mobile && pet.ownerPhone.replace(/\D/g, '') === user.mobile.replace(/\D/g, '')) ||
      (pet.parentContact && user.mobile && pet.parentContact.replace(/\D/g, '') === user.mobile.replace(/\D/g, ''))
    )
  );

  // Calculate received applicants for this pet
  const [storedApps, setStoredApps] = useState(() => getStoredAdoptionApplications() || []);

  useEffect(() => {
    const handleSync = () => {
      setStoredApps(getStoredAdoptionApplications() || []);
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('adoption-pets-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('adoption-pets-updated', handleSync);
    };
  }, []);

  const petApplicants = React.useMemo(() => {
    if (!pet) return [];
    try {
      return (storedApps || []).filter((a) => isPetApplicantMatch(a, pet, pets));
    } catch (e) {
      return [];
    }
  }, [pet, pets, storedApps]);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Direct WhatsApp chat connect with pet details
  const handleWhatsAppChat = (targetPet) => {
    const p = targetPet || pet;
    const rawContact = p?.parentContact || p?.shelterPhone || p?.ownerPhone || '+91 98765 43210';
    let cleanPhone = rawContact.replace(/\D/g, '') || '919876543210';
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    const message = encodeURIComponent(
      `Hi ${p?.parentName || 'Guardian'}, I saw ${p?.name} (${p?.breed}) on Josh Pets Hub and would love to know more details about adopting!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Navigate to another pet's detail page
  const handleKnowMore = (targetPet) => {
    if (!targetPet?.id) return;
    navigate(`/adopt/${targetPet.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load target pet with robust ID and string matching & real-time sync
  useEffect(() => {
    const loadPet = () => {
      const currentPets = getStoredAdoptionPets();
      setPets(currentPets);
      const decodedId = decodeURIComponent(id || '').trim();
      const found = currentPets.find(
        (p) =>
          p && (
            p.id === id ||
            String(p.id) === String(id) ||
            String(p.id) === decodedId ||
            p._id === id ||
            String(p.id).toLowerCase() === decodedId.toLowerCase()
          )
      );
      if (found) {
        setPet(found);
        setSelectedImage((prev) => prev || found.image);
      }
    };

    loadPet();
    window.addEventListener('adoption-pets-updated', loadPet);
    window.addEventListener('storage', loadPet);
    return () => {
      window.removeEventListener('adoption-pets-updated', loadPet);
      window.removeEventListener('storage', loadPet);
    };
  }, [id]);

  // Pre-fill user information if authenticated & check for existing application
  useEffect(() => {
    if (user) {
      if (user.name) {
        setApplicantName(user.name);
        setInquirySenderName(user.name);
      }
      if (user.mobile) {
        setApplicantPhone(user.mobile);
        setInquirySenderPhone(user.mobile);
      }
      if (user.email) setApplicantEmail(user.email);

      if (pet) {
        const userApps = getUserAdoptionApplications(user);
        const matchedApp = userApps.find((a) => String(a.petId) === String(pet.id));
        if (matchedApp) {
          setExistingApplication(matchedApp);
          setIsSubmitted(true);
        }
      }
    }
  }, [user, pet]);

  // Handle in-app question inquiry submission
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryQuestion.trim()) {
      toast.error('Please enter your question or message.');
      return;
    }
    const sender = inquirySenderName.trim() || user?.name || 'Prospective Adopter';
    const contact = inquirySenderPhone.trim() || user?.mobile || '';

    saveAdoptionInquiry({
      id: 'lead_' + Date.now(),
      petId: pet.id,
      buyer: sender,
      pet: `${pet.name} (${pet.breed})`,
      phone: contact,
      email: user?.email || '',
      date: 'Just now',
      message: inquiryQuestion.trim(),
      unread: true,
      messages: [
        {
          id: 'msg_' + Date.now(),
          sender: sender,
          messageText: inquiryQuestion.trim(),
          createdAt: new Date().toISOString()
        }
      ]
    });

    setShowInquiryModal(false);
    setInquiryQuestion('');
    toast.success(`✉️ Your inquiry for ${pet.name} was sent directly to the shelter! They will review and reply in their dashboard.`, {
      duration: 5000,
      icon: '💬'
    });
  };

  // Handle Application Submit
  const handleApplicationSubmit = (e) => {
    e.preventDefault();

    // 1. Without login: Do not submit, show registration popup with identical template & format
    if (!isAuthenticated || !user) {
      toast.error('Please register or log in as a user to submit an adoption application.', {
        duration: 5000,
        icon: '🔒'
      });
      window.dispatchEvent(new CustomEvent('open-register-modal', {
        detail: {
          tab: 'user',
          hideProviderTab: true,
          source: 'adoption'
        }
      }));
      return;
    }

    // 2. Prevent Pet Owner from applying for their own pet
    if (isPetOwner) {
      toast.error('You are the guardian of this pet and cannot apply to adopt your own listing.', {
        duration: 5000,
        icon: '🛡️'
      });
      return;
    }

    if (!applicantPhone.trim()) {
      toast.error('Please enter your contact phone number.');
      return;
    }
    if (!adoptionReason.trim()) {
      toast.error('Please let us know why you would like to adopt this pet.');
      return;
    }

    const applicationData = {
      id: 'APP-' + Date.now().toString().slice(-6),
      petId: pet.id,
      petName: pet.name,
      petBreed: pet.breed,
      petType: pet.type || 'dogs',
      petImage: pet.image,
      petCity: pet.city,
      guardianPhone: pet.parentContact || '',
      guardianId: pet.ownerId || null,
      guardianEmail: pet.ownerEmail || null,
      applicantId: user._id || user.id,
      applicantName: applicantName.trim() || user.name,
      applicantPhone: applicantPhone.trim() || user.mobile,
      applicantEmail: applicantEmail.trim() || user.email,
      homeType,
      hasPetExperience,
      adoptionReason: adoptionReason.trim(),
      status: 'Submitted', // 'Submitted' | 'Under Review' | 'Contacted' | 'Approved' | 'Rejected'
      createdAt: new Date().toISOString()
    };

    saveAdoptionApplication(applicationData);

    // Also register as an active lead in the provider's chat inquiries
    saveAdoptionInquiry({
      id: 'lead_' + Date.now(),
      petId: pet.id,
      buyer: applicantName.trim() || user.name,
      pet: `${pet.name} (${pet.breed})`,
      phone: applicantPhone.trim() || user.mobile,
      email: applicantEmail.trim() || user.email,
      date: 'Just now',
      message: `Adoption Screening Application: "${adoptionReason.trim()}" (Home: ${homeType}, Experience: ${hasPetExperience})`,
      unread: true,
      applicationId: applicationData.id,
      messages: [
        {
          id: 'msg_' + Date.now(),
          sender: applicantName.trim() || user.name,
          messageText: `Hello! I have submitted an official adoption screening application for ${pet.name}. Reason: "${adoptionReason.trim()}". Living in ${homeType}, Prior experience: ${hasPetExperience}. Looking forward to connecting with you!`,
          createdAt: new Date().toISOString()
        }
      ]
    });

    setExistingApplication(applicationData);
    setIsSubmitted(true);
    setShowFlyingMacaw(true);

    toast.success(`🎉 Adoption application for ${pet.name} submitted successfully! You can track its status in your User Dashboard.`, {
      duration: 6000,
      icon: '🐾'
    });
  };

  // Handle direct WhatsApp inquiry
  const handleWhatsApp = () => {
    if (!pet) return;
    const text = encodeURIComponent(
      `Hello! I am interested in adopting "${pet.name}" (${pet.breed}, ${pet.city}) listed on JOSH PETS HUB.`
    );
    const phone = pet.parentContact ? pet.parentContact.replace(/\D/g, '') : '918306688827';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-amber-200/60 shadow-md max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-[#b89228]">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-800">Pet Listing Not Found</h2>
          <p className="text-xs text-slate-500">
            The pet listing you are looking for might have been adopted or removed.
          </p>
          <Link
            to="/adopt"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-slate-900 rounded-xl font-bold text-xs shadow-md hover:brightness-105 transition"
          >
            <ArrowLeft size={16} /> Back to All Adoption Pets
          </Link>
        </div>
      </div>
    );
  }

  // Other related pets for carousel/grid
  const relatedPets = (pets || []).filter((p) => p && pet && p.id !== pet.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-800 pb-24 relative overflow-x-hidden">

      {/* Animated Flying Macaw Delivery Messenger */}
      {showFlyingMacaw && (
        <FlyingMacawMessenger
          petName={pet.name}
          onComplete={() => setShowFlyingMacaw(false)}
        />
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-amber-200/60 py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <span>&gt;</span>
            <Link to="/adopt" className="hover:text-slate-900">Pet Adoption</Link>
            <span>&gt;</span>
            <span className="text-[#b89228] font-bold">{pet.name}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/adopt')}
            className="text-xs font-bold text-[#b89228] hover:underline flex items-center gap-1 cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-amber-200/60 shadow-sm overflow-hidden p-4 space-y-4">

              {/* Big High-Res Main Image */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-amber-50/50">
                <img
                  src={selectedImage || pet.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800'}
                  alt={pet.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800';
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  <span className={`${(pet.fee > 0 || pet.price > 0) ? 'bg-[#0F2E23]/90 text-amber-300' : 'bg-emerald-600/90 text-white'} backdrop-blur-xs text-[11px] font-bold px-3 py-1 rounded-full shadow-sm`}>
                    {(pet.fee > 0 || pet.price > 0) ? `₹${pet.fee || pet.price} Adoption Fee` : '100% Free Adoption'}
                  </span>
                  <span className="bg-gold-gradient backdrop-blur-xs text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {pet.quality}
                  </span>
                  {petApplicants.length > 0 && (
                    <span className="bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      👥 {petApplicants.length} Applicant{petApplicants.length !== 1 ? 's' : ''}
                    </span>
                  )}
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
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${selectedImage === imgUrl ? 'border-[#d4af37] ring-2 ring-amber-200' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Thumbnail ${idx}`} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800';
                        }}
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* 2. Key Attributes Grid Card */}
            <div className="bg-white rounded-3xl border border-amber-200/60 shadow-sm p-6 space-y-6">

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h1 className="font-serif text-3xl font-extrabold text-slate-900">
                    Hi! My name is <span className="text-[#b89228]">{pet.name}</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                    <MapPin size={14} className="text-[#b89228]" />
                    <span>{pet.city}, {pet.state}</span>
                  </p>
                </div>

                <div className="inline-block bg-[#fdf8e8] text-[#856312] font-bold text-xs px-3.5 py-1.5 rounded-xl border border-[#e8d595]">
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
                  <span className={`font-bold ${(pet.fee > 0 || pet.price > 0) ? 'text-amber-700' : 'text-emerald-600'} text-xs sm:text-sm`}>
                    {(pet.fee > 0 || pet.price > 0) ? `₹${(pet.fee || pet.price).toLocaleString('en-IN')}` : 'Free (₹0)'}
                  </span>
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
                    <CircleCheck size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Vaccinated</p>
                      <p className="text-[10px] text-emerald-600">Up to date on shots</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-150 text-blue-800">
                    <CircleCheck size={18} className="text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Dewormed</p>
                      <p className="text-[10px] text-blue-600">Internal parasite clear</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                    <ShieldCheck size={18} className="text-[#b89228] shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Shelter Verified</p>
                      <p className="text-[10px] text-[#b89228]">Health checked by Vet</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adoption Process Guarantee */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-2 text-xs text-slate-700">
                <p className="font-bold text-[#b89228] flex items-center gap-1.5">
                  <Sparkles size={16} /> JOSH PETS HUB Adoption Commitment
                </p>
                <p className="text-[11.5px] leading-relaxed text-slate-600">
                  Every pet adopted through JOSH PETS HUB receives free post-adoption guidance, a starter medical passport, and direct connection with verified animal shelters.
                </p>
              </div>

            </div>

          </div>


          {/* =========================================================================
              RIGHT COLUMN: Sticky Adoption Application Card (5 cols)
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* Guardian & Direct Contact Card */}
            <div className="bg-white rounded-3xl border border-amber-200/60 shadow-md p-6 space-y-5 sticky top-24">

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37]/20 via-[#fef08a]/30 to-[#b89228]/20 border border-amber-200 flex items-center justify-center text-[#8c6710] font-bold text-base shadow-xs">
                    {pet.parentName ? pet.parentName.charAt(0) : 'G'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pet Guardian</span>
                    <h4 className="font-bold text-slate-800 text-sm">{pet.parentName || 'Verified Guardian'}</h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Location</span>
                  <span className="text-xs font-bold text-[#b89228]">{pet.city}</span>
                </div>
              </div>

              {/* Guardian Direct Actions: Dedicated WhatsApp, Call, In-App Chat */}
              <div className="space-y-2.5">
                {/* Dedicated WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppChat(pet)}
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <WhatsAppIcon size={18} />
                  <span>Chat on WhatsApp with Guardian</span>
                </button>

                {/* In-App Direct Chat */}
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(true)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-[#8c6710] border border-amber-200 hover:border-[#d4af37] rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare size={14} />
                  <span>In-App Chat</span>
                </button>
              </div>

              {/* Adoption Application Form Section */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Heart size={16} className="text-[#b89228]" />
                    <span>Adopt {pet.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fill this quick application to introduce yourself to {pet.name}'s guardian.
                  </p>
                </div>

                {/* CASE 1: Current Logged In User is the Owner of this Pet */}
                {isPetOwner ? (
                  <div className="p-5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                    <div className="w-12 h-12 bg-amber-100 text-[#b89228] rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <ShieldCheck size={26} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        Pet Guardian Notice
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">You are the Guardian of {pet.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        You posted this pet for free adoption. As the guardian, you cannot submit an adoption application for your own listing.
                      </p>

                      {/* Applicant Count Highlight Box */}
                      <div className="p-3 bg-white/95 rounded-xl border border-amber-200 mt-3 flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-bold text-slate-700">Total Applicants:</span>
                        <span className="px-3 py-1 bg-blue-50 text-[#15559c] font-extrabold text-xs rounded-full border border-blue-200">
                          👥 {petApplicants.length} Applicant{petApplicants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/account?tab=adoption-listings"
                        className="w-full py-2.5 px-4 bg-gold-gradient hover:brightness-105 text-slate-900 font-bold text-xs rounded-xl shadow-md active:scale-95 transition inline-flex items-center justify-center gap-2"
                      >
                        <span>View & Manage {petApplicants.length} Applicant{petApplicants.length !== 1 ? 's' : ''} in Dashboard</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ) : isSubmitted ? (
                  /* CASE 2: Application Already Submitted */
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Check size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-emerald-200">
                        Status: {existingApplication?.status || 'Submitted'}
                      </span>
                      <h4 className="font-bold text-emerald-900 text-sm">Adoption Application Sent!</h4>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        The guardian will reach out on your contact number to review your profile and schedule a meet & greet.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Link
                        to="/account?tab=my-applications"
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <span>Track Status in User Dashboard</span>
                        <ArrowRight size={14} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setIsSubmitted(false)}
                        className="text-xs text-[#b89228] font-bold hover:underline py-1"
                      >
                        Edit / Submit New Application
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE 3: Active Application Form */
                  <form onSubmit={handleApplicationSubmit} className="space-y-3 text-xs">

                    {/* Non-logged in helper prompt */}
                    {!isAuthenticated && (
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-[#15559c] flex items-start gap-2">
                        <Lock size={15} className="shrink-0 mt-0.5 text-[#15559c]" />
                        <div>
                          <p className="font-bold">Login / Registration Required</p>
                          <p className="text-slate-600 mt-0.5">
                            Clicking submit will open the user registration popup so you can track your adoption application.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-amber-200 font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Your Contact Phone *</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-amber-200 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Home Type</label>
                        <select
                          value={homeType}
                          onChange={(e) => setHomeType(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d4af37] font-medium bg-slate-50"
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
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d4af37] font-medium bg-slate-50"
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
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-amber-200 font-medium"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 btn-adoption-submit font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <Heart size={16} className="transition-transform group-hover:scale-110" />
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
          <div className="mt-16 pt-8 border-t border-amber-200/60 space-y-6">
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
                className="text-xs font-bold text-[#b89228] hover:underline flex items-center gap-1"
              >
                View All Pets &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPets.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div
                    onClick={() => handleKnowMore(p)}
                    className="aspect-[4/3] overflow-hidden bg-amber-50/50 cursor-pointer group"
                  >
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">
                      Hi! My name is: <span className="text-[#b89228]">{p.name}</span>
                    </h4>
                    <p className="text-xs text-slate-500">{p.breed} • {p.city}</p>
                    <button
                      type="button"
                      onClick={() => handleKnowMore(p)}
                      className="w-full text-center py-2 bg-gold-gradient hover:brightness-105 text-slate-900 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Know More About {p.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct In-App Question Modal */}
        {showInquiryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 relative">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 via-[#fef08a]/30 to-[#b89228]/20 border border-amber-200 text-[#8c6710] flex items-center justify-center font-bold">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Ask Shelter About {pet.name}</h3>
                    <p className="text-[11px] text-slate-500">Your message will go directly to the provider's dashboard chat.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={inquirySenderName}
                    onChange={(e) => setInquirySenderName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={inquirySenderPhone}
                    onChange={(e) => setInquirySenderPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Question / Message *</label>
                  <textarea
                    rows={4}
                    value={inquiryQuestion}
                    onChange={(e) => setInquiryQuestion(e.target.value)}
                    placeholder={`e.g. Hi! Is ${pet.name} friendly around other pets and toddlers? Can we schedule a visit to your sanctuary?`}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-gradient hover:brightness-105 text-slate-900 rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Send Message</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdoptionPetDetail;
