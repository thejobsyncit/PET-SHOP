import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Heart,
  Search,
  Plus,
  MapPin,
  Award,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Filter,
  Calendar,
  User,
  ExternalLink,
  Share2,
  Send,
  Star,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BREEDING_BREEDS_BY_CATEGORY,
  INITIAL_MATING_PETS,
  getStoredMatingPets,
  saveMatingPet,
  saveMatingEnquiry
} from '../../data/breedingData.js';
import { INDIAN_STATES_CITIES } from '../../data/adoptionPetsData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../../components/ui/ServiceAccessLock.jsx';
import PetBreedDropdown from '../../components/ui/PetBreedDropdown.jsx';

import ScrollReveal from '../../components/ui/ScrollReveal.jsx';
import { handleServiceAction } from '../../components/widgets/ServicePackageAccessModal.jsx';
const BreedingDirectory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isServicePathLockedForUser(user, '/breeding')) {
    return <ServiceAccessLock serviceName="Pet Mating & Breeding" attemptedPath="/breeding" />;
  }

  // Mating Pets Data
  const [pets, setPets] = useState([]);

  // Filter States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dogs'); // 'Dogs' | 'Cats' | 'All'
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [selectedGender, setSelectedGender] = useState('Any'); // 'Male' | 'Female' | 'Any'
  const [selectedQuality, setSelectedQuality] = useState('All'); // 'All' | 'Pet Quality' | 'KCI Registered' | 'Champion Bloodline'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'age-low' | 'age-high'
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [availableCities, setAvailableCities] = useState(['All Cities']);
  
  // Health & Verification Checklist Filters
  const [vaccinatedOnly, setVaccinatedOnly] = useState(false);
  const [dewormedOnly, setDewormedOnly] = useState(false);
  const [geneticTestedOnly, setGeneticTestedOnly] = useState(false);

  // Hero Quick Search States
  const [heroBreed, setHeroBreed] = useState('All Breeds');
  const [heroState, setHeroState] = useState('All States');
  const [heroCity, setHeroCity] = useState('All Cities');
  const [heroAvailableCities, setHeroAvailableCities] = useState(['All Cities']);

  // Modals
  const [selectedPetForDetails, setSelectedPetForDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Proposal / Enquiry Form State
  const [proposalOwnerName, setProposalOwnerName] = useState(user?.name || '');
  const [proposalOwnerPhone, setProposalOwnerPhone] = useState(user?.mobile || user?.phone || '');
  const [proposalPetName, setProposalPetName] = useState('');
  const [proposalPetBreed, setProposalPetBreed] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');

  // Register Pet Form States
  const [newPetName, setNewPetName] = useState('');
  const [newPetCategory, setNewPetCategory] = useState('Dogs');
  const [newBreed, setNewBreed] = useState('Pug');
  const [newGender, setNewGender] = useState('Male');
  const [newAge, setNewAge] = useState('2 Years');
  const [newQuality, setNewQuality] = useState('Pet Quality');
  const [newPrice, setNewPrice] = useState('');
  const [newIsPuppyShare, setNewIsPuppyShare] = useState(false);
  const [newState, setNewState] = useState(user?.state || 'Karnataka');
  const [newCity, setNewCity] = useState(user?.city || 'Bangalore');
  const [newParentName, setNewParentName] = useState(user?.name || '');
  const [newParentPhone, setNewParentPhone] = useState(user?.mobile || '');
  const [newWhatsappNumber, setNewWhatsappNumber] = useState(user?.mobile || '');
  const [newKciNumber, setNewKciNumber] = useState('');
  const [newTemperament, setNewTemperament] = useState('Playful, Gentle, Affectionate');
  const [newMateRequirement, setNewMateRequirement] = useState('');
  const [newSire, setNewSire] = useState('');
  const [newDam, setNewDam] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load Mating Pets
  useEffect(() => {
    window.scrollTo(0, 0);
    setPets(getStoredMatingPets());
  }, []);

  // Sync user info on auth changes
  useEffect(() => {
    if (user) {
      if (user.name) {
        setProposalOwnerName(user.name);
        setNewParentName(user.name);
      }
      if (user.mobile || user.phone) {
        setProposalOwnerPhone(user.mobile || user.phone);
        setNewParentPhone(user.mobile || user.phone);
        setNewWhatsappNumber(user.mobile || user.phone);
      }
      if (user.city) setNewCity(user.city);
      if (user.state) setNewState(user.state);
    }
  }, [user]);

  // Handle State Changes for Filters
  const handleStateChange = (e) => {
    const st = e.target.value;
    setSelectedState(st);
    if (st === 'All States' || !INDIAN_STATES_CITIES[st]) {
      setAvailableCities(['All Cities']);
      setSelectedCity('All Cities');
    } else {
      setAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[st]]);
      setSelectedCity('All Cities');
    }
  };

  // Handle Hero State Change
  const handleHeroStateChange = (e) => {
    const st = e.target.value;
    setHeroState(st);
    if (st === 'All States' || !INDIAN_STATES_CITIES[st]) {
      setHeroAvailableCities(['All Cities']);
      setHeroCity('All Cities');
    } else {
      setHeroAvailableCities(['All Cities', ...INDIAN_STATES_CITIES[st]]);
      setHeroCity('All Cities');
    }
  };

  // Hero Quick Search Form Submit
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroBreed !== 'All Breeds') {
      setSelectedBreed(heroBreed);
    }
    if (heroState !== 'All States') {
      setSelectedState(heroState);
      setAvailableCities(['All Cities', ...(INDIAN_STATES_CITIES[heroState] || [])]);
      setSelectedCity(heroCity);
    }
    toast.success('Applied search criteria to mating directory!');
    const el = document.getElementById('mating-directory-results');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('Dogs');
    setSelectedBreed('All Breeds');
    setSelectedGender('Any');
    setSelectedQuality('All');
    setSortBy('newest');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setAvailableCities(['All Cities']);
    setVaccinatedOnly(false);
    setDewormedOnly(false);
    setGeneticTestedOnly(false);
    setHeroBreed('All Breeds');
    setHeroState('All States');
    setHeroCity('All Cities');
    toast.success('All filters have been reset.');
  };

  // Available Breeds based on selected category
  const availableBreeds = useMemo(() => {
    if (selectedCategory === 'Dogs') return BREEDING_BREEDS_BY_CATEGORY.Dogs;
    if (selectedCategory === 'Cats') return BREEDING_BREEDS_BY_CATEGORY.Cats;
    if (selectedCategory === 'Birds') return BREEDING_BREEDS_BY_CATEGORY.Birds;
    return [
      'All Breeds',
      ...BREEDING_BREEDS_BY_CATEGORY.Dogs.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Cats.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Birds.slice(1)
    ];
  }, [selectedCategory]);

  // Filtered & Sorted Mating Pets
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      // 1. Keyword search (Name, breed, description, city, parent)
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchName = pet.name.toLowerCase().includes(query);
        const matchBreed = pet.breed.toLowerCase().includes(query);
        const matchDesc = (pet.description || '').toLowerCase().includes(query);
        const matchCity = pet.city.toLowerCase().includes(query);
        const matchReq = (pet.mateRequirement || '').toLowerCase().includes(query);
        if (!matchName && !matchBreed && !matchDesc && !matchCity && !matchReq) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && pet.petCategory !== selectedCategory) {
        return false;
      }

      // 3. Breed filter
      if (selectedBreed !== 'All Breeds' && pet.breed !== selectedBreed) {
        return false;
      }

      // 4. Gender filter
      if (selectedGender !== 'Any' && pet.gender !== selectedGender) {
        return false;
      }

      // 5. Quality filter
      if (selectedQuality !== 'All' && pet.quality !== selectedQuality) {
        return false;
      }

      // 6. State filter
      if (selectedState !== 'All States' && pet.state !== selectedState) {
        return false;
      }

      // 7. City filter
      if (selectedCity !== 'All Cities' && pet.city !== selectedCity) {
        return false;
      }

      // 8. Health checks
      if (vaccinatedOnly && !pet.vaccinated) return false;
      if (dewormedOnly && !pet.dewormed) return false;
      if (geneticTestedOnly && !pet.geneticTested) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'age-low') return a.ageMonths - b.ageMonths;
      if (sortBy === 'age-high') return b.ageMonths - a.ageMonths;
      // Default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [
    pets,
    searchKeyword,
    selectedCategory,
    selectedBreed,
    selectedGender,
    selectedQuality,
    selectedState,
    selectedCity,
    vaccinatedOnly,
    dewormedOnly,
    geneticTestedOnly,
    sortBy
  ]);

  // Open Details Modal / Visit Mating Profile
  const handleOpenDetails = (pet) => {
    if (!isAuthenticated) {
      toast('Please sign up or log in to view breeding companion details.', {
        icon: '🔐',
        duration: 4000
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: {
            tab: 'user',
            hideProviderTab: true,
            source: 'mating-details',
            petName: pet?.name
          }
        })
      );
      return;
    }
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Breeding',
      provider: { name: `${pet.name} (${pet.parentName})`, phone: pet.parentPhone, city: pet.city, image: pet.image },
      action: 'view_expert_profile'
    });
  };

  // Open Proposal & Package Access Modal (Requires Login)
  const handleOpenProposal = (pet) => {
    setSelectedPet(pet);
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Breeding',
      provider: { name: `${pet.name} (${pet.parentName})`, phone: pet.parentPhone, city: pet.city, image: pet.image },
      action: 'book',
      onAuthorized: () => {
        setSelectedPet(pet);
        setShowProposalModal(true);
      }
    });
  };

  // Open Add Pet Modal (Requires Login)
  const handleOpenAddPet = () => {
    if (!isAuthenticated) {
      toast('Please sign up or log in to list your pet for mating & breeding.', {
        icon: '🔐',
        duration: 4000
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: {
            tab: 'user',
            hideProviderTab: true,
            source: 'mating-register'
          }
        })
      );
      return;
    }
    setShowAddForm(true);
  };

  // Submit Proposal
  const handleProposalSubmit = (e) => {
    e.preventDefault();
    if (!proposalOwnerName || !proposalOwnerPhone || !proposalPetName) {
      toast.error('Please enter your Name, Mobile Number, and Pet Name.');
      return;
    }

    const payload = {
      id: `PROP-${Date.now()}`,
      targetPetId: selectedPetForDetails?.id,
      targetPetName: selectedPetForDetails?.name,
      targetParentName: selectedPetForDetails?.parentName,
      targetParentPhone: selectedPetForDetails?.parentPhone,
      senderName: proposalOwnerName,
      senderPhone: proposalOwnerPhone,
      senderPetName: proposalPetName,
      senderPetBreed: proposalPetBreed,
      message: proposalMessage,
      createdAt: new Date().toISOString()
    };

    saveMatingEnquiry(payload);
    toast.success(`Mating proposal sent to ${selectedPetForDetails?.parentName}! They will contact you shortly.`);
    setShowProposalModal(false);
    setProposalMessage('');
  };

  // Submit Register Pet Form
  const handleRegisterPetSubmit = (e) => {
    e.preventDefault();
    if (!newPetName || !newBreed || !newParentPhone) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    const priceNum = parseFloat(newPrice) || (newIsPuppyShare ? 0 : 5000);
    const newPetObj = {
      id: `mate-${Date.now()}`,
      name: newPetName,
      petCategory: newPetCategory,
      breed: newBreed,
      gender: newGender,
      age: newAge,
      ageMonths: parseInt(newAge) * 12 || 24,
      quality: newQuality,
      price: priceNum,
      priceDisplay: newIsPuppyShare ? `₹${priceNum.toLocaleString('en-IN')} / Puppy Share` : `₹${priceNum.toLocaleString('en-IN')} Stud Fee`,
      isFreeOrShare: newIsPuppyShare,
      state: newState,
      city: newCity,
      temperament: newTemperament.split(',').map((t) => t.trim()).filter(Boolean),
      mateRequirement: newMateRequirement || `${newPetName} Seeking Healthy ${newBreed} Mate`,
      parentName: newParentName || user?.name || 'Pet Parent',
      parentPhone: newParentPhone,
      whatsappNumber: (newWhatsappNumber || newParentPhone).replace(/\D/g, ''),
      isVerified: true,
      kciRegistered: newQuality === 'KCI Registered' || newQuality === 'Champion Bloodline',
      kciNumber: newKciNumber,
      vaccinated: true,
      dewormed: true,
      geneticTested: true,
      image: newImageUrl || (newPetCategory === 'Cats' 
        ? 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=800&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop'),
      description: newDescription || `${newPetName} is a healthy, active ${newBreed} ready for mating. Up to date on all vaccinations and deworming.`,
      sire: newSire || 'Registered Pedigree Sire',
      dam: newDam || 'Registered Pedigree Dam',
      matingTerms: '2 supervised matings guaranteed. Health test verification required before tie.',
      createdAt: new Date().toISOString()
    };

    const updated = saveMatingPet(newPetObj);
    setPets(updated);
    toast.success(`🎉 ${newPetName} has been successfully registered for mating!`);
    setShowAddForm(false);

    // Reset Form
    setNewPetName('');
    setNewPrice('');
    setNewKciNumber('');
    setNewDescription('');
    setNewImageUrl('');
  };

  // Open Direct WhatsApp Chat or Service Access Modal
  const handleOpenWhatsApp = (pet) => {
    if (!isAuthenticated) {
      toast('Please sign up or log in first to contact pet parents.', {
        icon: '🔐',
        duration: 4000
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: {
            tab: 'user',
            hideProviderTab: true,
            source: 'mating-whatsapp',
            petName: pet?.name
          }
        })
      );
      return;
    }
    handleServiceAction({
      isAuthenticated,
      serviceType: 'Breeding',
      provider: { name: `${pet.name} (${pet.parentName})`, phone: pet.parentPhone, city: pet.city, image: pet.image },
      action: 'view_expert_profile'
    });
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800">
      
      {/* ================= 1. CREATIVE & LUXURIOUS HERO SECTION ================= */}
      <ScrollReveal
        variant="fade"
        style={{ background: 'linear-gradient(135deg, #d4af37 0%, #fef08a 50%, #b89228 100%)' }}
        className="border-b border-[#b89228] pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 md:px-8 relative overflow-hidden text-slate-900"
      >
        
        {/* Soft Ambient Glows & Decorative Floating Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#b89228]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight size={12} />
            <Link to="/services" className="hover:text-black transition">Pet Services</Link>
            <ChevronRight size={12} />
            <span className="font-bold text-slate-950">Pet Mating & Breeding</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-[#b89228]/40 text-[#1D3B2E] rounded-full text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
                <Sparkles size={13} className="text-amber-500 fill-amber-400 animate-spin-slow" />
                <span>India's #1 Verified Pet Mating & Pedigree Registry</span>
              </div>

              {/* Romantic Serif Title */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-[1.15] tracking-tight">
                Paws are matched in heaven <br />
                <span className="text-[#1D3B2E] italic font-serif">
                  JOSH PETS HUB Matchmaker
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-800 max-w-xl font-medium leading-relaxed">
                Your pet deserves a legacy of love and health. Discover certified studs & queens, review multi-generation pedigrees, and arrange ethical, supervised matings across all major Indian cities.
              </p>

              {/* Trust Highlights Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/85 border border-[#b89228]/30 rounded-lg text-[11px] font-bold text-slate-900 shadow-2xs">
                  <Award size={13} className="text-amber-600" /> 1,500+ KCI Registered Studs
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/85 border border-[#b89228]/30 rounded-lg text-[11px] font-bold text-slate-900 shadow-2xs">
                  <ShieldCheck size={13} className="text-emerald-700" /> 100% DNA & Health Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/85 border border-[#b89228]/30 rounded-lg text-[11px] font-bold text-slate-900 shadow-2xs">
                  <Heart size={13} className="text-rose-500 fill-rose-500" /> 3,400+ Joyful Litters
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddPet}
                  className="px-6 py-3.5 btn-footer-green-gold text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Plus size={16} /> Register My Pet for Mating
                </button>
                <a
                  href="#mating-directory-results"
                  className="px-6 py-3.5 bg-white hover:bg-stone-50 text-slate-900 border border-[#b89228]/40 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Search size={15} /> Browse Studs & Queens
                </a>
              </div>

            </div>

            {/* Right Creative Showcase Card: "Interactive Romantic Match Duo" */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                
                {/* Main Glassmorphic Photo Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-white aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800&auto=format&fit=crop"
                    alt="Paws Matched in Heaven"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1e16]/80 via-transparent to-black/20"></div>

                  {/* Top Live Match Header */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-white">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Matchmaking Hub
                    </span>
                    <span className="px-2.5 py-1 bg-[#1D3B2E]/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 text-white shadow-sm">
                      KCI Supervised
                    </span>
                  </div>

                  {/* Bottom Couple Preview Tag */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-lg text-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        <img
                          src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800&auto=format&fit=crop"
                          alt="Thor"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop"
                          alt="Zara"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold text-[#1D3B2E] leading-tight">
                          Thor ♂ & Luna ♀
                        </div>
                        <span className="text-[9px] text-emerald-800 font-bold block">
                          Purebred Goldens • 99.4% Genetic Match
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs animate-pulse">
                      <Heart size={14} className="fill-rose-500" />
                    </div>
                  </div>

                </div>

                {/* Floating Aesthetic Pedigree Score Tag */}
                <div className="absolute -top-3 -left-3 bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-lg border border-stone-200 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">
                    0% Inbreeding Coeff. Verified
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= HERO SEARCH BAR WIDGET ================= */}
          <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-xl border border-[#b89228]/40 space-y-3">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs items-center">
              
              {/* Breed */}
              <div className="relative">
                <select
                  value={heroBreed}
                  onChange={(e) => setHeroBreed(e.target.value)}
                  aria-label="Select Breed"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
                >
                  <option value="All Breeds">All Breeds (Dogs, Cats, Birds)</option>
                  {[
                    ...BREEDING_BREEDS_BY_CATEGORY.Dogs.slice(1),
                    ...BREEDING_BREEDS_BY_CATEGORY.Cats.slice(1),
                    ...BREEDING_BREEDS_BY_CATEGORY.Birds.slice(1)
                  ].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* State */}
              <div className="relative">
                <select
                  value={heroState}
                  onChange={handleHeroStateChange}
                  aria-label="Select State"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
                >
                  <option value="All States">All States</option>
                  {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* City */}
              <div className="relative">
                <select
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  aria-label="Select City"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none"
                >
                  {heroAvailableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 md:col-span-1">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 btn-footer-green-gold text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Sparkles size={14} className="text-amber-300" /> Find Match
                </button>
              </div>
            </form>

            {/* Quick Filter Breeds Chips */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap mr-1">
                Popular:
              </span>
              {[
                'Pug',
                'Golden Retriever',
                'Persian Cat',
                'African Grey Parrot',
                'Flowerhorn Cichlid',
                'Bearded Dragon (Hypo Leatherback)',
                'Leopard Gecko (Tremper Albino)'
              ].map((breed) => (
                <button
                  key={breed}
                  type="button"
                  onClick={() => {
                    setSelectedBreed(breed);
                    const el = document.getElementById('mating-directory-results');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 bg-white/80 hover:bg-white text-slate-800 border border-stone-200 rounded-lg whitespace-nowrap transition cursor-pointer font-medium"
                >
                  {breed}
                </button>
              ))}
            </div>

          </div>

        </div>
      </ScrollReveal>

      {/* ================= 2. MAIN 2-COLUMN SECTION ================= */}
      <div id="mating-directory-results" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR: DEDICATED FILTERS ================= */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              
              {/* Header with Title & Reset Button */}
              <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#1D3B2E]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Filter Options
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-[#1D3B2E] hover:text-[#0F241C] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={11} /> Reset All
                </button>
              </div>

              {/* Natural Height Filter Body */}
              <div className="p-4 space-y-4 text-xs">

                {/* Keyword Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Search
                  </label>
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Hiroki, Pug, Chennai..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-gray-400 focus:outline-none focus:border-[#1D3B2E]"
                    />
                  </div>
                </div>

                {/* 1. Pet Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Pet Category
                  </label>
                  <div className="space-y-1">
                    {[
                      { id: 'Dogs', label: 'Dogs' },
                      { id: 'Cats', label: 'Cats' },
                      { id: 'Birds', label: 'Birds' },
                      { id: 'All', label: 'All Pets' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(item.id);
                          setSelectedBreed('All Breeds');
                        }}
                        className={`w-full text-left text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                          selectedCategory === item.id
                            ? 'bg-[#1D3B2E] text-white font-bold'
                            : 'text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        {selectedCategory === item.id && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sort By */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                    >
                      <option value="newest">What's New / Recommended</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="age-low">Age: Youngest First</option>
                      <option value="age-high">Age: Senior First</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Gender */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'Any', label: 'All' },
                      { id: 'Male', label: 'Male ♂' },
                      { id: 'Female', label: 'Female ♀' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGender(g.id)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer text-center ${
                          selectedGender === g.id
                            ? 'bg-[#1D3B2E] text-white border-[#1D3B2E]'
                            : 'bg-stone-50 text-gray-600 border-stone-200 hover:border-gray-400'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Puppy Quality / Bloodline */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Puppy Quality & Pedigree
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'All', label: 'All Qualities' },
                      { id: 'Pet Quality', label: 'Pet Quality' },
                      { id: 'KCI Registered', label: 'KCI Registered' },
                      { id: 'Champion Bloodline', label: 'Champion Blood' }
                    ].map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuality(q.id)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition cursor-pointer text-center truncate ${
                          selectedQuality === q.id
                            ? 'bg-[#1D3B2E] text-white border-[#1D3B2E]'
                            : 'bg-stone-50 text-gray-600 border-stone-200 hover:border-gray-400'
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Health & Certification Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Health Verification
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={vaccinatedOnly}
                        onChange={(e) => setVaccinatedOnly(e.target.checked)}
                        className="accent-[#1D3B2E] rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-700" /> Fully Vaccinated
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={dewormedOnly}
                        onChange={(e) => setDewormedOnly(e.target.checked)}
                        className="accent-[#1D3B2E] rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-700" /> Dewormed Up to Date
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={geneticTestedOnly}
                        onChange={(e) => setGeneticTestedOnly(e.target.checked)}
                        className="accent-[#1D3B2E] rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-700" /> Genetic / Dysplasia Free
                      </span>
                    </label>
                  </div>
                </div>

                {/* 6. State & City Filter */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Location Filter
                  </label>
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        <option value="All States">All States</option>
                        {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D3B2E] cursor-pointer appearance-none pr-8 font-semibold"
                      >
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Register Pet CTA Button */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleOpenAddPet}
                    className="w-full py-2.5 btn-footer-green-gold text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                  >
                    <Plus size={14} /> List Pet for Mating
                  </button>
                </div>

              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN: LIST OF MATING PETS ================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Results Header */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#1D3B2E]">
                  Available Mating Pets ({filteredPets.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified purebred studs and healthy mating companions across India
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#1D3B2E] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={13} /> KCI & Pedigree Verified
                </span>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'Dogs' || selectedBreed !== 'All Breeds' || selectedGender !== 'Any' || selectedQuality !== 'All' || selectedState !== 'All States' || searchKeyword) && (
              <div className="flex flex-wrap items-center gap-1.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 rounded">
                    Category: {selectedCategory}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedBreed !== 'All Breeds' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 rounded">
                    Breed: {selectedBreed}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedBreed('All Breeds')} />
                  </span>
                )}
                {selectedGender !== 'Any' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 rounded">
                    Gender: {selectedGender}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedGender('Any')} />
                  </span>
                )}
                {selectedQuality !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 rounded">
                    Quality: {selectedQuality}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedQuality('All')} />
                  </span>
                )}
                {selectedState !== 'All States' && (
                  <span className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[11px] px-2 py-0.5 rounded">
                    State: {selectedState}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedState('All States')} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-red-600 font-bold hover:underline ml-2 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredPets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-4 lg:p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-[#1D3B2E]">
                  <Heart size={28} />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#1D3B2E]">No Matching Mating Profiles Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your filters, searching for a different breed, or clearing location constraints to discover more verified studs and queens.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#1D3B2E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#152e24] transition cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Mating Cards Grid (3 Columns) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    
                    {/* Top Section: Photo + Quality Badge + View Price Overlay */}
                    <div>
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Quality Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                            pet.quality === 'Champion Bloodline'
                              ? 'bg-amber-500 text-white'
                              : pet.quality === 'KCI Registered'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#1D3B2E] text-white'
                          }`}>
                            {pet.quality === 'Champion Bloodline' && <Star size={10} className="fill-white" />}
                            {pet.quality === 'KCI Registered' && <ShieldCheck size={11} />}
                            {pet.quality}
                          </span>
                        </div>

                        {/* Bottom Gradient Overlay with Price */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-end justify-between text-white">
                          <span className="text-[11px] font-extrabold tracking-wide drop-shadow-md">
                            {pet.priceDisplay}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-200">
                            {pet.city}
                          </span>
                        </div>
                      </div>

                      {/* Pet Information Body */}
                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        
                        {/* Title: Hi! My name is: Hiroki */}
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            Hi! My name is: <strong className="text-[#1D3B2E] font-serif text-sm">{pet.name}</strong>
                          </div>
                        </div>

                        {/* Pet Attributes Grid */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-800">Breed : </span>
                            {pet.breed}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Gender : </span>
                            {pet.gender === 'Male' ? 'Male ♂' : 'Female ♀'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Age : </span>
                            {pet.age}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-800">City : </span>
                            {pet.city}
                          </div>
                        </div>

                        {/* Temperament Pills */}
                        <div className="flex flex-wrap gap-1">
                          {pet.temperament.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-stone-100 text-slate-700 border border-stone-200 rounded-md text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Pink Seeking Mate Box */}
                        <div className="px-2.5 py-2 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-[11px] font-medium leading-snug min-h-[44px] flex items-center overflow-hidden">
                          <p className="line-clamp-2">
                            {pet.mateRequirement}
                          </p>
                        </div>

                        {/* Parent Contact Link */}
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleOpenProposal(pet)}
                            className="text-[#1D3B2E] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Phone size={12} /> {pet.name} Parent Contact
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Card Footer Actions (WhatsApp + Know More About) */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(pet)}
                        className="w-10 h-9 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
                        title={`Chat on WhatsApp with ${pet.parentName}`}
                      >
                        <MessageSquare size={16} />
                      </button>

                      {/* Know More About Hiroki */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(pet)}
                        className="flex-1 py-2 px-2 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center truncate shadow-sm"
                      >
                        Know More About {pet.name}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ================= 3. KNOW MORE ABOUT [PET] DETAILS MODAL ================= */}
      {showDetailsModal && selectedPetForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl sm:max-w-3xl my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[88vh]">
            
            {/* Modal Header with Branding */}
            <div className="bg-gradient-to-r from-[#1D3B2E] to-[#2E5947] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-lg shadow">
                  🐾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      {selectedPetForDetails.name}'s Mating & Pedigree Profile
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 font-bold uppercase rounded">
                      {selectedPetForDetails.quality}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90">
                    {selectedPetForDetails.breed} • {selectedPetForDetails.gender} • {selectedPetForDetails.age} • {selectedPetForDetails.city}, {selectedPetForDetails.state}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 text-xs custom-scrollbar">
              
              {/* Pet Photo & Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="sm:col-span-4 aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={selectedPetForDetails.image}
                    alt={selectedPetForDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Stud / Mating Fee</span>
                      <div className="text-xl font-extrabold text-[#1D3B2E] font-serif">
                        {selectedPetForDetails.priceDisplay}
                      </div>
                    </div>
                    {selectedPetForDetails.kciNumber && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-1 font-mono font-bold rounded border border-emerald-300">
                        {selectedPetForDetails.kciNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {selectedPetForDetails.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedPetForDetails.temperament.map((t, idx) => (
                      <span key={idx} className="bg-white text-slate-700 border border-stone-200 px-2 py-0.5 rounded text-[10px] font-medium">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pedigree Lineage Card */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-600" /> Pedigree & Bloodline Lineage
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Sire (Father Line)</span>
                    <strong className="text-slate-900 text-xs">{selectedPetForDetails.sire || 'Registered Pedigree Sire'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Dam (Mother Line)</span>
                    <strong className="text-slate-900 text-xs">{selectedPetForDetails.dam || 'Registered Pedigree Dam'}</strong>
                  </div>
                </div>
              </div>

              {/* Health Clearances & Mating Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Health */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-700" /> Health & Vet Clearances
                  </h4>
                  <ul className="space-y-1 text-[11px] text-emerald-900">
                    <li className="flex items-center gap-1.5">✓ Up-to-date Rabies & Core Vaccinations</li>
                    <li className="flex items-center gap-1.5">✓ Regular Deworming Schedule</li>
                    <li className="flex items-center gap-1.5">✓ Negative for Brucellosis & Transmissible Illness</li>
                  </ul>
                </div>

                {/* Terms */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Info size={14} className="text-[#1D3B2E]" /> Mating Terms & Supervised Care
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {selectedPetForDetails.matingTerms}
                  </p>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Pet Guardian / Breeder</span>
                  <strong className="text-xs text-slate-900">{selectedPetForDetails.parentName}</strong>
                  <span className="text-[11px] text-slate-500 block">{selectedPetForDetails.city}, {selectedPetForDetails.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(selectedPetForDetails)}
                    className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </button>
                  <a
                    href={`tel:${selectedPetForDetails.parentPhone}`}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Phone size={14} /> {selectedPetForDetails.parentPhone}
                  </a>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleOpenProposal(selectedPetForDetails);
                }}
                className="px-5 py-2.5 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Heart size={14} className="fill-white" /> Send Mating Proposal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 4. SEND MATING PROPOSAL MODAL ================= */}
      {showProposalModal && selectedPetForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-lg my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[88vh]">
            
            <div className="bg-gradient-to-r from-[#1D3B2E] to-[#2E5947] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Send Mating Proposal for {selectedPetForDetails.name}
                </h3>
                <p className="text-[11px] text-emerald-100/90">
                  Guardian: {selectedPetForDetails.parentName} ({selectedPetForDetails.city})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProposalSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={proposalOwnerName}
                  onChange={(e) => setProposalOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Contact Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={proposalOwnerPhone}
                  onChange={(e) => setProposalOwnerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Pet's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalPetName}
                    onChange={(e) => setProposalPetName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. Maya"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Pet's Breed
                  </label>
                  <PetBreedDropdown
                    petType={selectedPetForDetails?.petCategory || 'Dogs'}
                    value={proposalPetBreed}
                    onChange={setProposalPetBreed}
                    placeholder={`Select ${selectedPetForDetails?.petCategory || 'Pet'} Breed`}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E] text-xs"
                    allowedCategories={['dogs', 'cats', 'birds']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message / Mating Preferences
                </label>
                <textarea
                  rows={3}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  placeholder="Describe your pet's heat cycle, vaccination status, or mating terms preference..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send size={14} /> Send Mating Proposal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= 5. REGISTER PET FOR MATING MODAL ================= */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[88vh]">
            
            <div className="bg-gradient-to-r from-[#1D3B2E] to-[#2E5947] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Register Your Pet for Mating & Breeding
                </h3>
                <p className="text-[11px] text-emerald-100/90">
                  List your stud or queen in India's verified pedigree matchmaking registry
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterPetSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar flex-1">
              
              {/* Pet Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. Bruno"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newPetCategory}
                    onChange={(e) => {
                      setNewPetCategory(e.target.value);
                      setNewBreed('');
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  >
                    <option value="Dogs">Dogs</option>
                    <option value="Cats">Cats</option>
                    <option value="Birds">Birds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Breed *
                  </label>
                  <PetBreedDropdown
                    petType={newPetCategory}
                    value={newBreed}
                    onChange={setNewBreed}
                    required
                    placeholder="Select Breed *"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E] text-xs"
                    allowedCategories={['dogs', 'cats', 'birds']}
                  />
                </div>
              </div>

              {/* Gender, Age & Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  >
                    <option value="Male">Male (Stud)</option>
                    <option value="Female">Female (Dam / Queen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. 2.5 Years"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Puppy Quality *
                  </label>
                  <select
                    value={newQuality}
                    onChange={(e) => setNewQuality(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  >
                    <option value="Pet Quality">Pet Quality</option>
                    <option value="KCI Registered">KCI Registered</option>
                    <option value="Champion Bloodline">Champion Bloodline</option>
                  </select>
                </div>
              </div>

              {/* Stud Fee / Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Stud Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. 8000"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsPuppyShare}
                      onChange={(e) => setNewIsPuppyShare(e.target.checked)}
                      className="text-[#1D3B2E] rounded focus:ring-0 cursor-pointer"
                    />
                    <span>Open to Puppy / Kitten Share (Pick of Litter)</span>
                  </label>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. Bangalore"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {/* Image URL & KCI Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    KCI / Microchip Reg. Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={newKciNumber}
                    onChange={(e) => setNewKciNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                    placeholder="e.g. KCI/2024/P-12345"
                  />
                </div>
              </div>

              {/* Requirement & Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mate Requirement (Pink Tag)
                </label>
                <input
                  type="text"
                  value={newMateRequirement}
                  onChange={(e) => setNewMateRequirement(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  placeholder={`e.g. ${newPetName || 'Pet'} Need a Female ${newBreed || 'Pug'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pet Description & Pedigree Notes
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D3B2E]"
                  placeholder="Describe your pet's physical features, temperament, champion parent lines..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1D3B2E] hover:bg-[#152e24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> Submit Mating Profile
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default BreedingDirectory;
