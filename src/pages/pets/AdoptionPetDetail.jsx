import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Heart, ArrowLeft, MapPin, MessageSquare, ShieldCheck,
  CircleCheck, Check, User, Calendar, Award, Share2, Info, Home,
  Sparkles, AlertCircle, ArrowRight, Lock, X, Edit3, Clock, ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toggleWishlistAPI, getWishlistItemIdStr } from '../../store/slices/wishlistSlice.js';
import { addToCartAPI } from '../../store/slices/cartSlice.js';
import { formatWhatsAppTargetPhone, resolveProviderWhatsApp } from '../../utils/whatsappHelper.js';
import {
  getStoredAdoptionPets,
  saveAdoptionApplication,
  getUserAdoptionApplications,
  getStoredAdoptionApplications,
  isPetApplicantMatch,
  saveAdoptionInquiry
} from '../../data/adoptionPetsData';
import FlyingMacawMessenger from '../../components/widgets/FlyingMacawMessenger.jsx';
import CountryPhoneInput from '../../components/ui/CountryPhoneInput.jsx';
import { getRequiredPhoneLength } from '../../data/countryCodes.js';
import SharedItemAuthGate from '../../components/ui/SharedItemAuthGate.jsx';

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
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

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
  const [applicantCountryCode, setApplicantCountryCode] = useState('+91');
  const [applicantPhoneError, setApplicantPhoneError] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [homeType, setHomeType] = useState('Apartment');
  const [hasPetExperience, setHasPetExperience] = useState('Yes');
  const [adoptionReason, setAdoptionReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [showFlyingMacaw, setShowFlyingMacaw] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [autoCloseCountdown, setAutoCloseCountdown] = useState(4);

  // In-App Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryQuestion, setInquiryQuestion] = useState('');
  const [inquirySenderName, setInquirySenderName] = useState('');
  const [inquirySenderPhone, setInquirySenderPhone] = useState('');
  const [inquiryCountryCode, setInquiryCountryCode] = useState('+91');
  const [inquiryPhoneError, setInquiryPhoneError] = useState('');

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

  // Automatically close adoption application success popup after a short period (4 seconds)
  useEffect(() => {
    let timer;
    let interval;
    if (showSuccessPopup) {
      setAutoCloseCountdown(4);
      interval = setInterval(() => {
        setAutoCloseCountdown((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
      timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [showSuccessPopup]);

  // Direct WhatsApp chat connect with pet details
  const handleWhatsAppChat = (targetPet) => {
    const p = targetPet || pet;
    const rawContact = resolveProviderWhatsApp(p) || p?.parentContact || p?.shelterPhone || p?.ownerPhone || '+91 98765 43210';
    const cleanPhone = formatWhatsAppTargetPhone(rawContact, p?.whatsappCountryCode || '+91');
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

  const petId = String(pet?.id || pet?._id || id);
  const isWishlisted = wishlistItems.some(item => getWishlistItemIdStr(item) === petId);

  const handleToggleWishlist = async () => {
    if (!pet) return;
    const action = isWishlisted ? 'remove' : 'add';
    const petPayload = {
      _id: petId,
      id: petId,
      name: pet.name,
      title: pet.name,
      breed: pet.breed || '',
      petType: pet.petType || pet.type || pet.category || 'pet',
      price: Number(pet.fee ?? pet.price ?? 0) || 0,
      fee: Number(pet.fee ?? pet.price ?? 0) || 0,
      images: pet.image ? [pet.image] : [],
      image: pet.image || '',
      city: pet.city || '',
      quality: pet.quality || '',
      itemType: 'adoption',
      isPet: true
    };
    const result = await dispatch(toggleWishlistAPI({ product: petPayload, action }));
    if (toggleWishlistAPI.fulfilled.match(result)) {
      const updatedList = result.payload?.wishlist || [];
      const nowInWishlist = updatedList.some(item => getWishlistItemIdStr(item) === petId);
      if (nowInWishlist) {
        toast.success(`Added ${pet.name} to wishlist`);
      } else {
        toast.success(`Removed ${pet.name} from wishlist`);
      }
    }
  };

  const handleAddToCart = () => {
    if (!pet) return;
    if (isPetOwner) {
      toast.error('You cannot adopt or add your own pet listing to cart.');
      return;
    }
    const cleanFee = Number(pet.fee ?? pet.price ?? 0) || 0;
    const petObj = {
      _id: petId,
      id: petId,
      name: pet.name,
      title: pet.name,
      price: cleanFee,
      fee: cleanFee,
      breed: pet.breed || '',
      petType: pet.petType || pet.type || pet.category || 'pet',
      quality: pet.quality || '',
      images: pet.image ? [pet.image] : [],
      image: pet.image || '',
      city: pet.city || '',
      isPet: true,
      itemType: 'adoption',
      stock: 1
    };
    dispatch(addToCartAPI({ product: petObj, quantity: 1 }));
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

  // Helper to populate form fields from an existing application
  const populateFormFromApplication = (app) => {
    if (!app) return;
    if (app.applicantName) setApplicantName(app.applicantName);
    if (app.applicantCountryCode) {
      setApplicantCountryCode(app.applicantCountryCode);
    }
    const cleanDigits = app.applicantRawPhone || (app.applicantPhone ? String(app.applicantPhone).replace(/\D/g, '') : '');
    const code = app.applicantCountryCode || '+91';
    const reqDigits = getRequiredPhoneLength(code);
    setApplicantPhone(cleanDigits.slice(-reqDigits));
    if (app.applicantEmail) setApplicantEmail(app.applicantEmail);
    if (app.homeType) setHomeType(app.homeType);
    if (app.hasPetExperience) setHasPetExperience(app.hasPetExperience);
    if (app.adoptionReason) setAdoptionReason(app.adoptionReason);
  };

  // Pre-fill user information if authenticated & check for existing application
  useEffect(() => {
    if (user) {
      if (!existingApplication && !isEditing) {
        if (user.name) {
          setApplicantName(user.name);
          setInquirySenderName(user.name);
        }
        if (user.mobileCountryCode || user.countryCode) {
          const uCode = user.mobileCountryCode || user.countryCode;
          setApplicantCountryCode(uCode);
          setInquiryCountryCode(uCode);
        }
        if (user.mobile) {
          const uCode = user.mobileCountryCode || user.countryCode || '+91';
          const expectedLen = getRequiredPhoneLength(uCode);
          const cleanDigits = String(user.mobile).replace(/\D/g, '');
          const subscriberDigits = cleanDigits.slice(-expectedLen);
          setApplicantPhone(subscriberDigits);
          setInquirySenderPhone(subscriberDigits);
        }
        if (user.email) setApplicantEmail(user.email);
      }

      if (pet) {
        const userApps = getUserAdoptionApplications(user);
        const matchedApp = userApps.find((a) => String(a.petId) === String(pet.id));
        if (matchedApp) {
          setExistingApplication(matchedApp);
          if (!isEditing) {
            setIsSubmitted(true);
            populateFormFromApplication(matchedApp);
          }
        }
      }
    }
  }, [user, pet, isEditing]);

  // Handle start editing an already submitted application
  const handleStartEdit = () => {
    if (existingApplication) {
      populateFormFromApplication(existingApplication);
    }
    setIsEditing(true);
    setIsSubmitted(false);
  };

  // Handle cancel editing an already submitted application
  const handleCancelEdit = () => {
    if (existingApplication) {
      populateFormFromApplication(existingApplication);
      setIsSubmitted(true);
    }
    setIsEditing(false);
  };

  // Handle in-app question inquiry submission
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryQuestion.trim()) {
      toast.error('Please enter your question or message.');
      return;
    }

    const reqDigits = getRequiredPhoneLength(inquiryCountryCode);
    const cleanInquiryPhone = inquirySenderPhone.replace(/\D/g, '');
    if (!cleanInquiryPhone) {
      setInquiryPhoneError('Please enter your contact phone number.');
      toast.error('Please enter your contact phone number.');
      return;
    }
    if (cleanInquiryPhone.length !== reqDigits) {
      const err = `Phone number must be exactly ${reqDigits} digits for ${inquiryCountryCode} (${cleanInquiryPhone.length}/${reqDigits}).`;
      setInquiryPhoneError(err);
      toast.error(err);
      return;
    }
    setInquiryPhoneError('');

    const sender = inquirySenderName.trim() || user?.name || 'Prospective Adopter';
    const contact = `${inquiryCountryCode} ${cleanInquiryPhone}`;

    saveAdoptionInquiry({
      id: 'lead_' + Date.now(),
      petId: pet.id,
      buyer: sender,
      pet: `${pet.name} (${pet.breed})`,
      phone: contact,
      countryCode: inquiryCountryCode,
      rawPhone: cleanInquiryPhone,
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

    const reqLen = getRequiredPhoneLength(applicantCountryCode);
    const cleanPhone = String(applicantPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      setApplicantPhoneError('Please enter your contact phone number.');
      toast.error('Please enter your contact phone number.');
      return;
    }
    if (cleanPhone.length !== reqLen) {
      const err = `Phone number must be exactly ${reqLen} digits for ${applicantCountryCode} (${cleanPhone.length}/${reqLen}).`;
      setApplicantPhoneError(err);
      toast.error(err);
      return;
    }
    setApplicantPhoneError('');

    if (!adoptionReason.trim()) {
      toast.error('Please let us know why you would like to adopt this pet.');
      return;
    }

    const formattedContact = `${applicantCountryCode} ${cleanPhone}`;

    const isEditMode = Boolean(isEditing && existingApplication?.id);
    const appId = isEditMode ? existingApplication.id : ('APP-' + Date.now().toString().slice(-6));
    const createdTimestamp = isEditMode && existingApplication?.createdAt ? existingApplication.createdAt : new Date().toISOString();
    const currentStatus = isEditMode && existingApplication?.status ? existingApplication.status : 'Submitted';

    const applicationData = {
      id: appId,
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
      applicantPhone: formattedContact,
      applicantCountryCode,
      applicantRawPhone: cleanPhone,
      applicantEmail: applicantEmail.trim() || user.email,
      homeType,
      hasPetExperience,
      adoptionReason: adoptionReason.trim(),
      status: currentStatus,
      createdAt: createdTimestamp,
      updatedAt: new Date().toISOString()
    };

    saveAdoptionApplication(applicationData);

    // Also register or update active lead in the provider's chat inquiries
    saveAdoptionInquiry({
      id: isEditMode && existingApplication?.inquiryId ? existingApplication.inquiryId : ('lead_' + Date.now()),
      petId: pet.id,
      buyer: applicantName.trim() || user.name,
      pet: `${pet.name} (${pet.breed})`,
      phone: formattedContact,
      countryCode: applicantCountryCode,
      rawPhone: cleanPhone,
      email: applicantEmail.trim() || user.email,
      date: isEditMode ? 'Updated just now' : 'Just now',
      message: `Adoption Screening Application (${isEditMode ? 'Updated' : 'New'}): "${adoptionReason.trim()}" (Home: ${homeType}, Experience: ${hasPetExperience})`,
      unread: true,
      applicationId: applicationData.id,
      messages: [
        {
          id: 'msg_' + Date.now(),
          sender: applicantName.trim() || user.name,
          messageText: isEditMode
            ? `Hello! I have updated my adoption screening application for ${pet.name}. Updated reason: "${adoptionReason.trim()}". Living in ${homeType}, Prior experience: ${hasPetExperience}.`
            : `Hello! I have submitted an official adoption screening application for ${pet.name}. Reason: "${adoptionReason.trim()}". Living in ${homeType}, Prior experience: ${hasPetExperience}. Looking forward to connecting with you!`,
          createdAt: new Date().toISOString()
        }
      ]
    });

    setExistingApplication(applicationData);
    setIsEditing(false);
    setIsSubmitted(true);
    setShowSuccessPopup(true);
    setAutoCloseCountdown(4);
    if (!isEditMode) {
      setShowFlyingMacaw(true);
    }

    toast.success(
      isEditMode
        ? `✓ Your adoption application for ${pet.name} has been updated successfully!`
        : `🎉 Adoption application for ${pet.name} submitted successfully! You can track its status in your User Dashboard.`,
      {
        duration: 5000,
        icon: isEditMode ? '✏️' : '🐾'
      }
    );
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isWishlisted
                  ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-amber-200 bg-white text-slate-700 hover:border-[#b89228] hover:text-[#b89228]"
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
              <span>{isWishlisted ? "Saved" : "Save to Wishlist"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/adopt')}
              className="text-xs font-bold text-[#b89228] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Pets
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <SharedItemAuthGate itemType="adoption" itemName={pet?.name} itemCategory={pet?.type}>
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

                {/* Wishlist Heart Button Top Right */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md border shadow-md transition-all duration-300 cursor-pointer ${
                    isWishlisted 
                      ? "bg-white text-red-500 border-red-200 hover:bg-red-50" 
                      : "bg-white/90 text-gray-500 hover:text-red-500 border-white hover:bg-white"
                  }`}
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                </button>

                <div className="absolute bottom-4 right-4">
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/adopt/${pet.id}?shared=true`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('Listing link copied to clipboard!');
                      } else {
                        toast.success(`Share URL: ${shareUrl}`);
                      }
                      try {
                        window.history.replaceState(null, '', shareUrl);
                      } catch (_) {}
                    }}
                    className="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-amber-200/60 shadow-md p-6 space-y-5 relative lg:sticky lg:top-24">

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

                {/* Add to Cart & Save to Wishlist Buttons Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-2.5 px-3 bg-primary hover:bg-primary-light text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShoppingCart size={14} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`w-full py-2.5 px-3 border rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isWishlisted 
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" 
                        : "border-amber-200 bg-white text-slate-700 hover:border-[#b89228] hover:text-[#b89228]"
                    }`}
                  >
                    <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                    <span>{isWishlisted ? "Saved Wishlist" : "Wishlist"}</span>
                  </button>
                </div>
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
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Ref: <span className="font-bold text-slate-700">#{existingApplication?.id}</span>
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        The guardian will reach out on your contact number to review your profile and schedule a meet & greet.
                      </p>
                    </div>

                    {/* Quick Summary Box of Submitted Details */}
                    {existingApplication && (
                      <div className="bg-white/80 border border-emerald-200/80 rounded-xl p-3 text-left space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold">Applicant:</span>
                          <span className="font-bold text-slate-800">{existingApplication.applicantName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold">Contact:</span>
                          <span className="font-mono font-bold text-slate-800">{existingApplication.applicantPhone}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold">Home & Experience:</span>
                          <span className="text-slate-800 font-medium">{existingApplication.homeType} • {existingApplication.hasPetExperience}</span>
                        </div>
                        {existingApplication.adoptionReason && (
                          <div className="pt-1 border-t border-slate-100 text-slate-600">
                            <span className="font-semibold block text-[10px] uppercase text-slate-400">Reason:</span>
                            <p className="text-slate-700 italic line-clamp-2">"{existingApplication.adoptionReason}"</p>
                          </div>
                        )}
                      </div>
                    )}

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
                        onClick={handleStartEdit}
                        className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={13} className="text-[#b89228]" />
                        <span>Edit Application Details</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE 3: Active Application Form */
                  <form onSubmit={handleApplicationSubmit} className="space-y-3 text-xs">

                    {/* Active Edit Mode Banner */}
                    {isEditing && existingApplication && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <Edit3 size={15} className="text-[#b89228] shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 text-xs">Editing Your Application</p>
                            <p className="text-[10px] text-slate-500">Ref: <span className="font-mono font-bold text-[#b89228]">#{existingApplication.id}</span></p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

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

                    <CountryPhoneInput
                      id="applicant-phone"
                      label="Your Contact Phone"
                      required
                      phone={applicantPhone}
                      setPhone={setApplicantPhone}
                      countryCode={applicantCountryCode}
                      setCountryCode={setApplicantCountryCode}
                      error={applicantPhoneError}
                      setError={setApplicantPhoneError}
                      theme="gold"
                    />

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
                      {isEditing ? (
                        <>
                          <Check size={16} className="text-white" />
                          <span>Save & Update Application</span>
                        </>
                      ) : (
                        <>
                          <Heart size={16} className="transition-transform group-hover:scale-110" />
                          <span>Submit Adoption Application</span>
                        </>
                      )}
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

                <CountryPhoneInput
                  id="inquiry-phone"
                  label="Contact Phone Number"
                  required
                  phone={inquirySenderPhone}
                  setPhone={setInquirySenderPhone}
                  countryCode={inquiryCountryCode}
                  setCountryCode={setInquiryCountryCode}
                  error={inquiryPhoneError}
                  setError={setInquiryPhoneError}
                  theme="gold"
                />

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

        {/* Adoption Application Success Popup (Auto-closing after short period) */}
        {showSuccessPopup && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="adoption-success-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowSuccessPopup(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-emerald-200/90 shadow-2xl max-w-md w-full overflow-hidden text-center relative animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-5"
            >
              {/* Top gold & emerald gradient line */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-[#ffd000] to-emerald-600" />

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Animated Celebration Icon */}
              <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                <Check size={40} className="stroke-[3] text-emerald-600 animate-in zoom-in duration-300" />
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-xs font-black shadow-sm">
                  🎉
                </span>
              </div>

              {/* Headings */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  <Sparkles size={12} className="text-amber-600" />
                  <span>Adoption Application {isEditing ? 'Updated' : 'Submitted'}</span>
                </div>
                <h3 id="adoption-success-title" className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                  Application Received!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your adoption application for <strong>{pet?.name}</strong> has been submitted successfully to the pet guardian.
                </p>
              </div>

              {/* Summary Details */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Reference ID:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    #{existingApplication?.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Status:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                    {existingApplication?.status || 'Submitted'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Applicant:</span>
                  <span className="font-bold text-slate-800">{existingApplication?.applicantName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Contact:</span>
                  <span className="font-mono text-slate-800">{existingApplication?.applicantPhone}</span>
                </div>
              </div>

              {/* Auto-closing Countdown & Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock size={12} className="text-emerald-600 animate-spin" />
                    Auto-closing in <strong className="text-emerald-700">{autoCloseCountdown}s</strong>...
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuccessPopup(false)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                  >
                    close now
                  </button>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(autoCloseCountdown / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  OK, Got It
                </button>
                <Link
                  to="/account?tab=my-applications"
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full sm:w-1/2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Track in Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}

        </div>
      </SharedItemAuthGate>

    </div>
  );
};

export default AdoptionPetDetail;
