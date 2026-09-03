import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BREEDING_BREEDS_BY_CATEGORY,
  INITIAL_MATING_PETS,
  getStoredMatingPets,
  saveMatingPet,
  saveMatingEnquiry
} from '../data/breedingData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';
import ServiceAccessLock, { isServicePathLockedForUser } from '../components/ServiceAccessLock.jsx';

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
    if (selectedCategory === 'Fish') return BREEDING_BREEDS_BY_CATEGORY.Fish;
    if (selectedCategory === 'Reptiles') return BREEDING_BREEDS_BY_CATEGORY.Reptiles;
    return [
      'All Breeds',
      ...BREEDING_BREEDS_BY_CATEGORY.Dogs.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Cats.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Birds.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Fish.slice(1),
      ...BREEDING_BREEDS_BY_CATEGORY.Reptiles.slice(1)
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

  // Open Details Modal
  const handleOpenDetails = (pet) => {
    setSelectedPetForDetails(pet);
    setShowDetailsModal(true);
  };

  // Open Proposal / Contact Modal (Requires Login)
  const handleOpenProposal = (pet) => {
    if (!isAuthenticated) {
      toast('Please sign up or log in to connect with pet parents for mating.', {
        icon: '🔐',
        duration: 4000
      });
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: {
            tab: 'user',
            hideProviderTab: true,
            source: 'mating-proposal',
            petName: pet?.name
          }
        })
      );
      return;
    }
    setSelectedPetForDetails(pet);
    setProposalPetBreed(pet.breed);
    setShowProposalModal(true);
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
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'),
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

  // Open Direct WhatsApp Chat
  const handleOpenWhatsApp = (pet) => {
    const rawNumber = pet.whatsappNumber || pet.parentPhone.replace(/\D/g, '');
    const cleanNumber = rawNumber.startsWith('91') ? rawNumber : `91${rawNumber}`;
    const text = encodeURIComponent(
      `Hello ${pet.parentName}, I saw your pet ${pet.name} (${pet.breed}) on Josh Pets Hub Pet Mating Directory. I am interested in discussing a mating proposal for my pet.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-slate-800">
      
      {/* ================= 1. CREATIVE & LUXURIOUS HERO SECTION ================= */}
      <section className="bg-gradient-to-br from-[#F5EEFD] via-[#ECE0FA] to-[#DFCEF5] border-b border-purple-200/80 pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 md:px-8 relative overflow-hidden">
        
        {/* Soft Ambient Glows & Decorative Floating Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-300/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md border border-purple-200/80 text-[#5B21B6] rounded-full text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
                <Sparkles size={13} className="text-amber-500 fill-amber-400 animate-spin-slow" />
                <span>India's #1 Verified Pet Mating & Pedigree Registry</span>
              </div>

              {/* Romantic Serif Title */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#26123D] leading-[1.15] tracking-tight">
                Paws are matched in heaven <br />
                <span className="bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#D946EF] bg-clip-text text-transparent italic font-serif">
                  JOSH PETS HUB Matchmaker
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-700 max-w-xl font-medium leading-relaxed">
                Your pet deserves a legacy of love and health. Discover certified studs & queens, review multi-generation pedigrees, and arrange ethical, supervised matings across all major Indian cities.
              </p>

              {/* Trust Highlights Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-purple-200 rounded-lg text-[11px] font-bold text-purple-900 shadow-2xs">
                  <Award size={13} className="text-amber-500" /> 1,500+ KCI Registered Studs
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-purple-200 rounded-lg text-[11px] font-bold text-purple-900 shadow-2xs">
                  <ShieldCheck size={13} className="text-emerald-600" /> 100% DNA & Health Verified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-purple-200 rounded-lg text-[11px] font-bold text-purple-900 shadow-2xs">
                  <Heart size={13} className="text-rose-500 fill-rose-500" /> 3,400+ Joyful Litters
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddPet}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/25 active:scale-95"
                >
                  <Plus size={16} /> Register My Pet for Mating
                </button>
                <a
                  href="#mating-directory-results"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#2E1A47] border border-purple-200 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm hover:border-purple-300"
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
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                    alt="Paws Matched in Heaven"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#200B36]/80 via-transparent to-black/20"></div>

                  {/* Top Live Match Header */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-white">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Matchmaking Hub
                    </span>
                    <span className="px-2.5 py-1 bg-purple-600/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-400/40">
                      KCI Supervised
                    </span>
                  </div>

                  {/* Bottom Couple Preview Tag */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-purple-100 shadow-lg text-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        <img
                          src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=120&q=80"
                          alt="Thor"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=120&q=80"
                          alt="Zara"
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold text-[#2E1A47] leading-tight">
                          Thor ♂ & Luna ♀
                        </div>
                        <span className="text-[9px] text-purple-700 font-bold block">
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
                <div className="absolute -top-3 -left-3 bg-white text-slate-900 px-3 py-1.5 rounded-xl shadow-lg border border-purple-200 flex items-center gap-2">
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
          <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-xl border border-purple-200/80 space-y-3">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs items-center">
              
              {/* Breed */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  🐾 Select Breed
                </label>
                <div className="relative">
                  <select
                    value={heroBreed}
                    onChange={(e) => setHeroBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#6D28D9] cursor-pointer appearance-none"
                  >
                    <option value="All Breeds">All Breeds (Dogs, Cats, Birds, Fish, Reptiles)</option>
                    {[
                      ...BREEDING_BREEDS_BY_CATEGORY.Dogs.slice(1),
                      ...BREEDING_BREEDS_BY_CATEGORY.Cats.slice(1),
                      ...BREEDING_BREEDS_BY_CATEGORY.Birds.slice(1),
                      ...BREEDING_BREEDS_BY_CATEGORY.Fish.slice(1),
                      ...BREEDING_BREEDS_BY_CATEGORY.Reptiles.slice(1)
                    ].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  📍 State
                </label>
                <div className="relative">
                  <select
                    value={heroState}
                    onChange={handleHeroStateChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#6D28D9] cursor-pointer appearance-none"
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
              </div>

              {/* City */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">
                  🏙️ City
                </label>
                <div className="relative">
                  <select
                    value={heroCity}
                    onChange={(e) => setHeroCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl focus:outline-none focus:border-[#6D28D9] cursor-pointer appearance-none"
                  >
                    {heroAvailableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 md:col-span-1 pt-4 sm:pt-0">
                <label className="hidden md:block text-[10px] font-bold text-transparent mb-1 select-none">
                  Find Match
                </label>
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
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
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/70 rounded-lg whitespace-nowrap transition cursor-pointer font-medium"
                >
                  {breed}
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ================= 2. MAIN 2-COLUMN SECTION ================= */}
      <section id="mating-directory-results" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR: DEDICATED FILTERS ================= */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm space-y-5 lg:sticky lg:top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto custom-scrollbar">
            
            {/* Header & Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#6D28D9]" />
                <h3 className="font-serif font-bold text-base text-[#2E1A47] uppercase tracking-wider">
                  Filter Options
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Pet / Breed / City
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Hiroki, Pug, Chennai..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* 1. Pet Category */}
            <div>
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                Pet Category
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'Dogs', label: '🐶 Dogs' },
                  { id: 'Cats', label: '🐱 Cats' },
                  { id: 'Birds', label: '🦜 Birds' },
                  { id: 'Fish', label: '🐠 Fish' },
                  { id: 'Reptiles', label: '🦎 Reptiles' },
                  { id: 'All', label: '🐾 All Pets' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition select-none ${
                      selectedCategory === item.id
                        ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="petCategory"
                        value={item.id}
                        checked={selectedCategory === item.id}
                        onChange={() => {
                          setSelectedCategory(item.id);
                          setSelectedBreed('All Breeds');
                        }}
                        className="text-[#6D28D9] focus:ring-0 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Sort By */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'newest', label: "What's New" },
                  { id: 'price-low', label: 'Price Low to High' },
                  { id: 'price-high', label: 'Price High to Low' },
                  { id: 'age-low', label: 'Age Low to High' },
                  { id: 'age-high', label: 'Age High to Low' }
                ].map((sortItem) => (
                  <label
                    key={sortItem.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition select-none text-xs ${
                      sortBy === sortItem.id ? 'text-[#6D28D9] font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="matingSort"
                      value={sortItem.id}
                      checked={sortBy === sortItem.id}
                      onChange={() => setSortBy(sortItem.id)}
                      className="text-[#6D28D9] focus:ring-0 cursor-pointer"
                    />
                    <span>{sortItem.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Gender */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                Gender
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'Male', label: 'Male (Stud)' },
                  { id: 'Female', label: 'Female (Queen / Dam)' },
                  { id: 'Any', label: 'Any' }
                ].map((g) => (
                  <label
                    key={g.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition select-none text-xs ${
                      selectedGender === g.id ? 'text-[#6D28D9] font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="petGender"
                      value={g.id}
                      checked={selectedGender === g.id}
                      onChange={() => setSelectedGender(g.id)}
                      className="text-[#6D28D9] focus:ring-0 cursor-pointer"
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Puppy Quality / Bloodline */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                Puppy Quality
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'All', label: 'All' },
                  { id: 'Pet Quality', label: 'Pet Quality' },
                  { id: 'KCI Registered', label: 'KCI Registered' },
                  { id: 'Champion Bloodline', label: 'Champion Bloodline' }
                ].map((q) => (
                  <label
                    key={q.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition select-none text-xs ${
                      selectedQuality === q.id ? 'text-[#6D28D9] font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="petQuality"
                      value={q.id}
                      checked={selectedQuality === q.id}
                      onChange={() => setSelectedQuality(q.id)}
                      className="text-[#6D28D9] focus:ring-0 cursor-pointer"
                    />
                    <span>{q.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Health & Certification Checklist */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
                Health Certification
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={vaccinatedOnly}
                    onChange={(e) => setVaccinatedOnly(e.target.checked)}
                    className="text-[#6D28D9] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Fully Vaccinated</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={dewormedOnly}
                    onChange={(e) => setDewormedOnly(e.target.checked)}
                    className="text-[#6D28D9] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Dewormed Up to Date</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={geneticTestedOnly}
                    onChange={(e) => setGeneticTestedOnly(e.target.checked)}
                    className="text-[#6D28D9] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Genetic Tested / Dysplasia Free</span>
                </label>
              </div>
            </div>

            {/* 6. State & City Filter */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="block text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider">
                Location (State & City)
              </label>
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="w-full p-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-[#6D28D9] cursor-pointer"
              >
                <option value="All States">All States</option>
                {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:border-[#6D28D9] cursor-pointer"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Register Pet CTA Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleOpenAddPet}
                className="w-full py-2.5 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={14} /> List Pet for Mating
              </button>
            </div>

          </aside>

          {/* ================= RIGHT MAIN: LIST OF MATING PETS ================= */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* Results Header */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#2E1A47]">
                  Available Mating Pets ({filteredPets.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified purebred studs and healthy mating companions across India
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#6D28D9] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1">
                  <ShieldCheck size={13} /> KCI & Pedigree Verified
                </span>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'Dogs' || selectedBreed !== 'All Breeds' || selectedGender !== 'Any' || selectedQuality !== 'All' || selectedState !== 'All States' || searchKeyword) && (
              <div className="flex flex-wrap items-center gap-1.5 p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 text-[11px] px-2 py-0.5 rounded">
                    Category: {selectedCategory}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedBreed !== 'All Breeds' && (
                  <span className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 text-[11px] px-2 py-0.5 rounded">
                    Breed: {selectedBreed}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedBreed('All Breeds')} />
                  </span>
                )}
                {selectedGender !== 'Any' && (
                  <span className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 text-[11px] px-2 py-0.5 rounded">
                    Gender: {selectedGender}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedGender('Any')} />
                  </span>
                )}
                {selectedQuality !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 text-[11px] px-2 py-0.5 rounded">
                    Quality: {selectedQuality}
                    <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedQuality('All')} />
                  </span>
                )}
                {selectedState !== 'All States' && (
                  <span className="inline-flex items-center gap-1 bg-white text-purple-900 border border-purple-300 text-[11px] px-2 py-0.5 rounded">
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
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 border border-purple-200 rounded-full flex items-center justify-center mx-auto text-[#6D28D9]">
                  <Heart size={28} />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#2E1A47]">No Matching Mating Profiles Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your filters, searching for a different breed, or clearing location constraints to discover more verified studs and queens.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#5B21B6] transition cursor-pointer"
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
                              : 'bg-[#6D28D9] text-white'
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
                          <span className="text-[10px] font-medium text-purple-200">
                            {pet.city}
                          </span>
                        </div>
                      </div>

                      {/* Pet Information Body */}
                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        
                        {/* Title: Hi! My name is: Hiroki */}
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            Hi! My name is: <strong className="text-[#6D28D9] font-serif text-sm">{pet.name}</strong>
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
                              className="px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Pink Seeking Mate Box */}
                        <div className="p-2 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl text-[10.5px] font-medium leading-tight line-clamp-1">
                          {pet.mateRequirement}
                        </div>

                        {/* Parent Contact Link */}
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleOpenProposal(pet)}
                            className="text-[#6D28D9] font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 py-2 px-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center truncate shadow-sm"
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
      </section>

      {/* ================= 3. KNOW MORE ABOUT [PET] DETAILS MODAL ================= */}
      {showDetailsModal && selectedPetForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div className="relative bg-white text-slate-900 w-full max-w-2xl sm:max-w-3xl my-auto shadow-2xl border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[88vh]">
            
            {/* Modal Header with Branding */}
            <div className="bg-gradient-to-r from-[#2E1A47] to-[#4C1D95] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 text-white flex items-center justify-center font-bold text-lg shadow">
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
                  <p className="text-[11px] text-purple-200">
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
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
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
                      <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Stud / Mating Fee</span>
                      <div className="text-xl font-extrabold text-[#2E1A47] font-serif">
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
                      <span key={idx} className="bg-white text-purple-900 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-medium">
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
                <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-purple-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Info size={14} className="text-purple-700" /> Mating Terms & Supervised Care
                  </h4>
                  <p className="text-[11px] text-purple-900 leading-relaxed">
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
                className="px-5 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
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
            
            <div className="bg-gradient-to-r from-[#2E1A47] to-[#6D28D9] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Send Mating Proposal for {selectedPetForDetails.name}
                </h3>
                <p className="text-[11px] text-purple-200">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                    placeholder="e.g. Maya"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Pet's Breed
                  </label>
                  <input
                    type="text"
                    value={proposalPetBreed}
                    onChange={(e) => setProposalPetBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                    placeholder={selectedPetForDetails.breed}
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                  placeholder="Describe your pet's heat cycle, vaccination status, or mating terms preference..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
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
            
            <div className="bg-gradient-to-r from-[#2E1A47] to-[#6D28D9] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Register Your Pet for Mating & Breeding
                </h3>
                <p className="text-[11px] text-purple-200">
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                    placeholder="e.g. Bruno"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={newPetCategory}
                    onChange={(e) => setNewPetCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                  >
                    <option value="Dogs">Dogs</option>
                    <option value="Cats">Cats</option>
                    <option value="Birds">Birds</option>
                    <option value="Fish">Fish</option>
                    <option value="Reptiles">Reptiles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Breed *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                    placeholder="e.g. Pug, Golden Retriever"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                    placeholder="e.g. 8000"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-800 font-bold">
                    <input
                      type="checkbox"
                      checked={newIsPuppyShare}
                      onChange={(e) => setNewIsPuppyShare(e.target.checked)}
                      className="text-[#6D28D9] rounded focus:ring-0 cursor-pointer"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6D28D9]"
                  placeholder="Describe your pet's physical features, temperament, champion parent lines..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
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
