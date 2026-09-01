import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MapPin, Search, Phone, MessageSquare, Info, ShieldCheck,
  CheckCircle2, X, Plus, ChevronRight, Sparkles, Filter, SlidersHorizontal,
  Home, Award, Calendar, User, Check, ArrowRight, ChevronLeft,
  UploadCloud, Camera, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  INDIAN_STATES_CITIES,
  POPULAR_BREEDS,
  CATEGORY_BREEDS,
  getStoredAdoptionPets,
  saveAdoptionPet,
  compressImageFile
} from '../data/adoptionPetsData';
import ScrollReveal from '../components/ScrollReveal.jsx';

// Hero Auto-Rotating Slides (Dogs, Cats, Birds)
const HERO_SLIDES = [
  {
    id: 'dogs',
    tag: '🐶 Dogs & Puppies',
    category: 'dogs',
    title: 'Dogs For Adoption',
    sub: 'Faithful companions waiting to shower your home with wagging tails and endless love',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200',
    badge: '580+ Rescues Active'
  },
  {
    id: 'cats',
    tag: '🐱 Cats & Kittens',
    category: 'cats',
    title: 'Cats For Adoption',
    sub: 'Serene, playful and affectionate feline friends seeking warmth and cozy lap naps',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1200',
    badge: '180+ Kittens Looking for Homes'
  },
  {
    id: 'birds',
    tag: '🦜 Birds & Macaws',
    category: 'birds',
    title: 'Macaws & Birds For Adoption',
    sub: 'Charming, singing, and colorful feathery Macaws looking for loving caretakers',
    image: 'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=1200',
    badge: '45+ Tamed Birds Available'
  }
];

const AdoptionShelter = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Pets state with persistence
  const [petsList, setPetsList] = useState(getStoredAdoptionPets);

  // Auto-scrolling Hero Carousel State (Cycles every 3 seconds)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Top Search Filter States
  const [selectedPetType, setSelectedPetType] = useState('dogs');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  // Sidebar Filter States
  const [selectedBreedFilter, setSelectedBreedFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('Any'); // 'Male' | 'Female' | 'Any'
  const [qualityFilter, setQualityFilter] = useState('All'); // 'Pet Quality' | 'KCI Registered' | 'Champion Bloodline' | 'All'
  const [budgetLimit, setBudgetLimit] = useState(500000); // 0 to 1000000

  // UI Expand / Read More State
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);

  // Workable "Add Pet" Modal States
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState('dogs');
  const [newPetBreed, setNewPetBreed] = useState('Labrador Retriever');
  const [newPetGender, setNewPetGender] = useState('Male');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetState, setNewPetState] = useState('Karnataka');
  const [newPetCity, setNewPetCity] = useState('Bangalore');
  const [newPetQuality, setNewPetQuality] = useState('Pet Quality');
  const [newPetPersonality, setNewPetPersonality] = useState('Playful, Friendly, Loving');
  const [newPetGuardianName, setNewPetGuardianName] = useState('');
  const [newPetPhone, setNewPetPhone] = useState('');
  const [newPetImage, setNewPetImage] = useState('');
  const [newPetImageFileName, setNewPetImageFileName] = useState('');
  const [newPetImageSizeKB, setNewPetImageSizeKB] = useState(null);
  const [newPetBio, setNewPetBio] = useState('');
  const [newPetVaccinated, setNewPetVaccinated] = useState(true);
  const [newPetDewormed, setNewPetDewormed] = useState(true);
  const [newPetNeutered, setNewPetNeutered] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-slide effect for Hero Banner (cycles every 3 seconds smoothly)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pawora_adoption_pets', JSON.stringify(petsList));
    } catch (e) {}
  }, [petsList]);

  // Autofill user info if logged in
  useEffect(() => {
    if (user && !newPetGuardianName) {
      setNewPetGuardianName(user.name || '');
      setNewPetPhone(user.mobile || '');
    }
  }, [user]);

  // Handle image upload from device gallery / file (Max 5MB)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file size (Maximum 5MB = 5 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB! Please upload a photo smaller than 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Compress for instant display and quota-free storage
    try {
      const compressed = await compressImageFile(file, 800, 0.75);
      setNewPetImage(compressed);
      setNewPetImageFileName(file.name);
      setNewPetImageSizeKB((file.size / 1024).toFixed(1));
      toast.success(`Photo selected (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load image. Please try another photo.');
    }
  };

  const handleRemoveUploadedPhoto = () => {
    setNewPetImage('');
    setNewPetImageFileName('');
    setNewPetImageSizeKB(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Available Cities based on State
  const availableCities = INDIAN_STATES_CITIES[selectedState] || ['All Cities'];
  const newPetAvailableCities = INDIAN_STATES_CITIES[newPetState] || ['Bangalore'];

  // Handle State Change in Top Search
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity('All Cities');
  };

  // Filtered Pets calculation
  const filteredPets = useMemo(() => {
    return petsList.filter((pet) => {
      // Pet Type filter
      if (selectedPetType !== 'all' && pet.type !== selectedPetType) {
        return false;
      }
      // State filter
      if (selectedState !== 'All States' && pet.state !== selectedState) {
        return false;
      }
      // City filter
      if (selectedCity !== 'All Cities' && pet.city !== selectedCity) {
        return false;
      }
      // Popular Breed filter
      if (selectedBreedFilter !== 'All') {
        const pBreed = pet.breed.toLowerCase();
        const sBreed = selectedBreedFilter.toLowerCase();
        if (!pBreed.includes(sBreed) && !sBreed.includes(pBreed)) {
          return false;
        }
      }
      // Gender filter
      if (genderFilter !== 'Any' && pet.gender !== genderFilter) {
        return false;
      }
      // Quality filter
      if (qualityFilter !== 'All' && pet.quality !== qualityFilter) {
        return false;
      }
      return true;
    });
  }, [petsList, selectedPetType, selectedState, selectedCity, selectedBreedFilter, genderFilter, qualityFilter]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSelectedPetType('dogs');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setSelectedBreedFilter('All');
    setGenderFilter('Any');
    setQualityFilter('All');
    setBudgetLimit(500000);
    toast.success('Filters reset to default!');
  };

  // Open WhatsApp direct chat
  const handleWhatsAppChat = (pet) => {
    const text = encodeURIComponent(
      `Hello! I am interested in adopting "${pet.name}" (${pet.breed}, ${pet.city}) listed on JOSH PETS HUB.`
    );
    window.open(`https://wa.me/918306688827?text=${text}`, '_blank');
  };

  // Auto-fill guardian info if logged in when opening Add Pet modal
  useEffect(() => {
    if (showAddPetModal && user) {
      if (user.name && !newPetGuardianName) setNewPetGuardianName(user.name);
      if (user.mobile && !newPetPhone) setNewPetPhone(user.mobile);
    }
  }, [showAddPetModal, user]);

  // Handle "Add Pet" Submission (Workable Feature)
  const handleAddPetSubmit = (e) => {
    e.preventDefault();

    if (!newPetName.trim()) {
      toast.error('Please enter the pet name.');
      return;
    }
    if (!newPetAge.trim()) {
      toast.error('Please enter the pet age (e.g. 3 Months, 1 Year).');
      return;
    }
    if (!newPetPhone.trim()) {
      toast.error('Please enter guardian contact number.');
      return;
    }

    const defaultSamplePhotos = {
      dogs: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800',
      cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800',
      birds: 'https://images.unsplash.com/photo-1550853024-fae8dd4be47f?q=80&w=800'
    };
    const pickedImage = newPetImage || defaultSamplePhotos[newPetType] || defaultSamplePhotos.dogs;

    const createdPet = {
      id: 'adopt_' + Date.now(),
      name: newPetName.trim(),
      type: newPetType,
      breed: newPetBreed,
      gender: newPetGender,
      age: newPetAge.trim(),
      ageGroup: newPetAge.toLowerCase().includes('month') || newPetAge.toLowerCase().includes('week') ? 'puppy' : 'young',
      city: newPetCity,
      state: newPetState,
      quality: newPetQuality,
      personality: newPetPersonality.trim() || 'Friendly, Loving, Playful',
      image: pickedImage,
      gallery: [pickedImage],
      ownerId: user ? (user._id || user.id) : ('guest_' + Date.now()),
      ownerName: user ? user.name : (newPetGuardianName.trim() || 'Pet Guardian'),
      ownerEmail: user ? user.email : '',
      ownerPhone: user ? user.mobile : newPetPhone.trim(),
      parentContact: newPetPhone.trim() || (user ? user.mobile : '+91 8306-688-827'),
      parentName: newPetGuardianName.trim() || (user ? user.name : 'Pet Guardian'),
      fee: 0,
      vaccinated: newPetVaccinated,
      neutered: newPetNeutered,
      dewormed: newPetDewormed,
      description: newPetBio.trim() || `${newPetName} is an affectionate ${newPetBreed} looking for a loving forever home.`,
      createdAt: new Date().toISOString()
    };

    // Save permanently in shared storage & memory cache
    const updated = saveAdoptionPet(createdPet);
    setPetsList(updated);

    toast.success(`🎉 "${newPetName}" has been listed for adoption successfully!`, {
      duration: 6000,
      icon: '🐾'
    });

    // Reset Form & Close Modal
    setShowAddPetModal(false);
    setNewPetName('');
    setNewPetAge('');
    setNewPetBio('');
    setNewPetImage('');
    setNewPetImageFileName('');
    setNewPetImageSizeKB(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeSlide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="min-h-screen bg-[#faf8fc] text-slate-800 pb-24">
      
      {/* =========================================================================
          1. HERO BANNER WITH AUTO-SCROLLING ROTATOR (Dogs, Cats, Birds)
         ========================================================================= */}
      <section
        className="relative overflow-hidden bg-gradient-premium pt-10 pb-16 md:pt-14 md:pb-20 border-b border-beige/70"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading & Subtitle */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              <div className="inline-flex items-center gap-2 bg-white/90 border border-beige px-3.5 py-1 rounded-full shadow-xs">
                <span className="text-primary font-bold text-xs tracking-wider uppercase">🐾 PET ADOPTION IN INDIA</span>
                <span className="text-[10px] bg-beige text-gold-dark font-bold px-2 py-0.5 rounded-full">100% Free Rehoming</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-extrabold text-slate-900 leading-tight">
                Their second innings <br className="hidden sm:block" />
                starts with <span className="text-primary">you</span>
              </h1>

              <p className="text-sm md:text-base text-slate-600 font-medium max-w-xl leading-relaxed min-h-[44px]">
                {activeSlide.sub}
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-purple-150">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>Vaccination Verified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-purple-150">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Certified Animal Shelters</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Seamless Auto-Rotating Pet Card */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-md">
                
                {/* Main Dynamic Lifestyle Image Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[16/11]">
                  {HERO_SLIDES.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        currentSlideIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1480044965905-02098d419e96?q=80&w=1200';
                        }}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 text-white z-20">
                        <p className="text-xs font-bold uppercase tracking-wider drop-shadow-xs">{slide.title}</p>
                        <p className="text-[11px] text-beige drop-shadow-xs">{slide.badge}</p>
                      </div>
                    </div>
                  ))}

                  {/* Auto-Slide Indicator Dots */}
                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {HERO_SLIDES.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          currentSlideIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Cute Hand-drawn Dog House Illustration Badge */}
                <div className="absolute -top-4 -right-3 bg-white p-3 rounded-2xl shadow-xl border border-beige transform rotate-3 flex items-center gap-2 z-30">
                  <span className="text-2xl">🏠</span>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-800 leading-tight">Adopt Love</p>
                    <p className="text-[9px] text-primary font-semibold">Save a Life</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          2. TOP SEARCH FILTER BAR
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-7 relative z-30">
        <div className="bg-white p-3 md:p-4 rounded-2xl border border-beige/90 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          
          {/* 1. Pet Type Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 pl-1">Pet Category</label>
            <select
              value={selectedPetType}
              onChange={(e) => setSelectedPetType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige transition"
            >
              <option value="dogs">Dogs & Puppies</option>
              <option value="cats">Cats & Kittens</option>
              <option value="birds">Birds & Parrots</option>
              <option value="all">All Pets</option>
            </select>
          </div>

          {/* 2. State Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 pl-1">Select State</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige transition"
            >
              {Object.keys(INDIAN_STATES_CITIES).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 3. City Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1 pl-1">Select City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige transition"
            >
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. Search Button */}
          <div className="pt-4 sm:pt-0 sm:self-end">
            <button
              type="button"
              onClick={() => toast.success(`Showing results for ${selectedPetType} in ${selectedCity}, ${selectedState}`)}
              className="w-full py-2.5 bg-primary hover:bg-accent text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-gold/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Search size={16} />
              <span>Search Pets</span>
            </button>
          </div>

        </div>
      </div>


      {/* =========================================================================
          3. MAIN CONTENT: SIDEBAR (Filter ON TOP, Most Popular Breeds BELOW)
         ========================================================================= */}
      <ScrollReveal variant="fade">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
  
            {/* -----------------------------------------------------------------
                LEFT SIDEBAR:
                1. Add Pet Button Card
                2. Filter Card (ON TOP as requested)
                3. Most Popular Breeds Card (BELOW as requested)
               ----------------------------------------------------------------- */}
            <aside className="lg:col-span-3 space-y-6">
              
              {/* 1. Workable "Add Pet" Card */}
              <div className="bg-white rounded-2xl border border-beige shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-primary font-extrabold text-sm flex items-center gap-1.5">
                    <Plus size={16} className="text-primary" />
                    Add Pet
                  </span>
                  <span className="text-[10px] bg-sand text-primary font-bold px-2 py-0.5 rounded-full">List Free</span>
                </div>
  
                <p className="text-xs text-slate-500">
                  Have a pet needing a loving home or rescue? List them for adoption for free.
                </p>
  
                <button
                  type="button"
                  onClick={() => setShowAddPetModal(true)}
                  className="w-full py-2.5 px-3 bg-primary hover:bg-accent text-white rounded-xl font-bold text-xs shadow-md shadow-gold/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>List Pet For Adoption</span>
                </button>
              </div>
  
              {/* 2. FILTER CARD (ON TOP) */}
              <div className="bg-white rounded-2xl border border-beige shadow-sm p-5 space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    Filter
                  </h3>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
  
                {/* A. Gender */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Gender</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {['Male', 'Female', 'Any'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        <input
                          type="radio"
                          name="genderFilter"
                          checked={genderFilter === g}
                          onChange={() => setGenderFilter(g)}
                          className="text-primary focus:ring-0 cursor-pointer"
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
  
                {/* B. Puppy / Pet Quality */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Puppy Quality</h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {['Pet Quality', 'KCI Registered', 'Champion Bloodline', 'All'].map((q) => (
                      <label key={q} className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                        <input
                          type="radio"
                          name="qualityFilter"
                          checked={qualityFilter === q}
                          onChange={() => setQualityFilter(q)}
                          className="text-primary focus:ring-0 cursor-pointer"
                        />
                        <span>{q}</span>
                      </label>
                    ))}
                  </div>
                </div>
  
                {/* C. Budget Range Slider */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Budget</h4>
                    <span className="text-[11px] font-bold text-primary">₹0 - ₹10L</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000000}
                    step={25000}
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Number(e.target.value))}
                    className="w-full accent-[#7c56dc] cursor-pointer"
                  />
                  <div className="text-[11px] text-slate-500 font-semibold flex justify-between">
                    <span>0</span>
                    <span>Your Budget ₹: <strong>{budgetLimit.toLocaleString('en-IN')}</strong></span>
                    <span>10L</span>
                  </div>
                </div>
  
              </div>
  
              {/* 3. MOST POPULAR BREEDS CARD (BELOW THE FILTER) */}
              <div className="bg-white rounded-2xl border border-beige shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-base font-bold text-primary">
                    Most Popular Breeds
                  </h3>
                  {selectedBreedFilter !== 'All' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBreedFilter('All')}
                      className="text-[11px] text-primary font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
  
                <div className="space-y-1 text-xs">
                  {POPULAR_BREEDS.filter((b) => selectedPetType === 'all' || b.type === selectedPetType).map((b) => {
                    const isSelected = selectedBreedFilter === b.name;
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBreedFilter('All');
                          } else {
                            setSelectedBreedFilter(b.name);
                            toast.success(`Filtered by ${b.name}`);
                          }
                        }}
                        className={`w-full flex items-center justify-between py-2 px-2.5 rounded-xl transition font-medium cursor-pointer text-left ${
                          isSelected
                            ? 'bg-sand text-primary font-bold border border-beige'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{b.name}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-primary font-bold' : 'text-slate-400'}`}>
                          ({b.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
  
            </aside>
  
  
            {/* -----------------------------------------------------------------
                RIGHT MAIN CONTENT: BREADCRUMB, HEADER, READ MORE & ADOPTION CARDS
               ----------------------------------------------------------------- */}
            <main className="lg:col-span-9 space-y-6">
              
              {/* Top Breadcrumb & SEO Header Card */}
              <div className="bg-white rounded-2xl border border-beige p-5 shadow-sm space-y-2">
                
                {/* Breadcrumb */}
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Link to="/" className="hover:text-slate-700">Home</Link>
                  <span>&gt;</span>
                  <span className="text-primary font-semibold capitalize">
                    {selectedPetType === 'dogs' ? 'Dogs for adoption' : selectedPetType === 'cats' ? 'Cats for adoption' : selectedPetType === 'birds' ? 'Birds for adoption' : 'Pets for adoption'}
                  </span>
                  {selectedBreedFilter !== 'All' && (
                    <>
                      <span>&gt;</span>
                      <span className="text-slate-700 font-bold">{selectedBreedFilter}</span>
                    </>
                  )}
                </div>
  
                {/* Title & Results Count */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pt-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-slate-900 capitalize">
                    {selectedBreedFilter !== 'All'
                      ? `${selectedBreedFilter} For Adoption`
                      : selectedPetType === 'dogs'
                      ? 'Dogs For Adoption'
                      : selectedPetType === 'cats'
                      ? 'Cats For Adoption'
                      : selectedPetType === 'birds'
                      ? 'Birds For Adoption'
                      : 'Pets For Adoption'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold-dark bg-sand px-3 py-1 rounded-full border border-beige">
                      {filteredPets.length} Results Found
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPetModal(true)}
                      className="sm:hidden px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Plus size={13} /> Add Pet
                    </button>
                  </div>
                </div>
  
                {/* Description with Read More */}
                <div className="text-xs text-slate-500 leading-relaxed pt-1">
                  <p>
                    Are you planning to adopt a pet? You have come to the right place! JOSH PETS HUB provides healthy puppies, dogs, cats and birds for adoption in India. We help you find animal shelters and pet adoption centres near you.
                    {!isReadMoreOpen && (
                      <button
                        type="button"
                        onClick={() => setIsReadMoreOpen(true)}
                        className="text-primary font-bold hover:underline ml-1 cursor-pointer"
                      >
                        ... Read More
                      </button>
                    )}
                  </p>
  
                  {isReadMoreOpen && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 space-y-1.5 animate-in fade-in duration-200">
                      <p>
                        Every pet listed under our adoption umbrella undergoes medical verification, deworming, and vaccination checks. We connect compassionate pet parents with certified shelters, NGO rescues, and verified pet guardians across India.
                      </p>
                      <p>
                        Adopting a companion brings immense joy to your family while giving a second chance of life to a deserving animal.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsReadMoreOpen(false)}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Show Less
                      </button>
                    </div>
                  )}
                </div>
  
              </div>
  
  
              {/* =========================================================================
                  ADOPTION CARDS GRID (With Separate Page Navigation on "Know More")
                 ========================================================================= */}
              {filteredPets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-white rounded-2xl border border-beige/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
                    >
                      
                      {/* Card Top: Image with Quality Badge (Clickable to detail page) */}
                      <Link to={`/adopt/${pet.id}`} className="relative aspect-[4/3] overflow-hidden bg-sand block">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        
                        {/* Quality Pill Badge Top Right */}
                        <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                          {pet.quality}
                        </span>
                      </Link>
  
                      {/* Card Body: Details */}
                      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        
                        <div className="space-y-1.5">
                          {/* Name Header */}
                          <h3 className="text-sm font-bold text-slate-800">
                            Hi! My name is:{' '}
                            <Link to={`/adopt/${pet.id}`} className="text-primary font-extrabold text-base hover:underline">
                              {pet.name}
                            </Link>
                          </h3>
  
                          {/* Specs Row 1 */}
                          <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1">
                              Breed : <strong className="text-slate-800">{pet.breed}</strong>
                              <Info size={12} className="text-slate-400 inline" title="Verified Breed Information" />
                            </span>
                            <span>
                              Gender : <strong className="text-slate-800">{pet.gender}</strong>
                            </span>
                          </div>
  
                          {/* Specs Row 2 */}
                          <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
                            <span>
                              Age : <strong className="text-slate-800">{pet.age}</strong>
                            </span>
                            <span>
                              City : <strong className="text-slate-800">{pet.city}</strong>
                            </span>
                          </div>
  
                          {/* Personality Pill Tag */}
                          <div className="pt-1">
                            <span className="inline-block w-full bg-[#fef2f2] text-rose-700 text-[10.5px] font-semibold px-2.5 py-1 rounded-full text-center border border-rose-100/70 truncate">
                              {pet.personality}
                            </span>
                          </div>
  
                          {/* Parent Contact Trigger */}
                          <div className="text-center pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                toast.success(`📞 Contact for ${pet.name}: ${pet.parentContact} (${pet.parentName})`);
                              }}
                              className="text-[11px] text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{pet.name} Parent Contact</span>
                              <Phone size={11} />
                            </button>
                          </div>
                        </div>
  
                        {/* Action Buttons Row: WhatsApp + Separate Page "Know More" Button */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          {/* WhatsApp Button */}
                          <button
                            type="button"
                            onClick={() => handleWhatsAppChat(pet)}
                            title={`Chat on WhatsApp about ${pet.name}`}
                            className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                          >
                            <MessageSquare size={18} />
                          </button>
  
                          {/* Know More Button -> Navigates to SEPARATE PAGE */}
                          <Link
                            to={`/adopt/${pet.id}`}
                            className="flex-1 py-2.5 px-3 bg-primary hover:bg-accent text-white rounded-xl font-bold text-xs shadow-md shadow-gold/20 active:scale-95 transition cursor-pointer text-center truncate block"
                          >
                            Know More About {pet.name}
                          </Link>
                        </div>
  
                      </div>
  
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-beige p-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-sand flex items-center justify-center text-primary">
                    <Search size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-800">No Adoption Pets Matching Filter</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your breed or city filters to explore more available companion pets.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
  
            </main>
  
          </div>
        </div>
      </ScrollReveal>


      {/* =========================================================================
          4. WORKABLE "ADD PET FOR ADOPTION" MODAL
         ========================================================================= */}
      {showAddPetModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
          <div
            onClick={() => setShowAddPetModal(false)}
            className="fixed inset-0 bg-transparent"
          ></div>

          <form
            onSubmit={handleAddPetSubmit}
            className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-beige overflow-hidden z-10 flex flex-col min-h-0 max-h-[85vh] sm:max-h-[88vh] my-auto"
          >
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-base font-bold tracking-wide uppercase flex items-center gap-2">
                  <Plus size={18} /> Add Pet For Free Adoption
                </h3>
                <p className="text-[11px] text-beige mt-0.5">
                  Help a loving companion find their forever family in India
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPetModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs custom-scrollbar">
              
              {/* Pet Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pet's Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Prince, Bella, Rocky"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Category *</label>
                  <select
                    value={newPetType}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      setNewPetType(selectedType);
                      const breeds = CATEGORY_BREEDS[selectedType] || CATEGORY_BREEDS.dogs;
                      setNewPetBreed(breeds[0]);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium bg-slate-50"
                  >
                    <option value="dogs">🐶 Dog / Puppy</option>
                    <option value="cats">🐱 Cat / Kitten</option>
                    <option value="birds">🦜 Bird / Parrot</option>
                  </select>
                </div>
              </div>

              {/* Breed & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Breed *</label>
                  <select
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium bg-slate-50"
                  >
                    {(CATEGORY_BREEDS[newPetType] || CATEGORY_BREEDS.dogs).map((breedName) => (
                      <option key={breedName} value={breedName}>
                        {breedName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Gender *</label>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {['Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setNewPetGender(g)}
                        className={`py-2 text-center rounded-xl font-bold border transition cursor-pointer ${
                          newPetGender === g
                            ? 'bg-sand border-primary text-primary'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age & Pet Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Age * (e.g. 8 Weeks, 1.5 Years)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Weeks or 1 Year"
                    value={newPetAge}
                    onChange={(e) => setNewPetAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pet Quality Tag</label>
                  <select
                    value={newPetQuality}
                    onChange={(e) => setNewPetQuality(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium bg-slate-50"
                  >
                    <option value="Pet Quality">Pet Quality</option>
                    <option value="KCI Registered">KCI Registered</option>
                    <option value="Champion Bloodline">Champion Bloodline</option>
                    <option value="Shelter Rescue">Shelter Rescue</option>
                  </select>
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">State *</label>
                  <select
                    value={newPetState}
                    onChange={(e) => {
                      const st = e.target.value;
                      setNewPetState(st);
                      const cities = INDIAN_STATES_CITIES[st] || ['Bangalore'];
                      setNewPetCity(cities[1] || cities[0]);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium bg-slate-50"
                  >
                    {Object.keys(INDIAN_STATES_CITIES).filter(s => s !== 'All States').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">City *</label>
                  <select
                    value={newPetCity}
                    onChange={(e) => setNewPetCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium bg-slate-50"
                  >
                    {newPetAvailableCities.filter(c => c !== 'All Cities').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Personality Tags */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Personality & Highlights</label>
                <input
                  type="text"
                  placeholder="e.g. Playful, Friendly, intelligent, House-trained"
                  value={newPetPersonality}
                  onChange={(e) => setNewPetPersonality(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-beige font-medium"
                />
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Guardian / Shelter Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name or Shelter Name"
                    value={newPetGuardianName}
                    onChange={(e) => setNewPetGuardianName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Contact Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newPetPhone}
                    onChange={(e) => setNewPetPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                    required
                  />
                </div>
              </div>

              {/* Pet Photo Upload from Device / Gallery (Max 5MB) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Pet Photo from Gallery / Device
                  </label>
                  <span className="text-[10px] text-gold font-semibold bg-sand px-2 py-0.5 rounded-md">
                    Max size: 5MB
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pet-photo-upload"
                />

                {!newPetImage ? (
                  <label
                    htmlFor="pet-photo-upload"
                    className="border-2 border-dashed border-beige hover:border-primary bg-sand/40 hover:bg-sand/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-beige group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        Click to upload photo from your device / gallery
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports JPG, PNG, WEBP (Less than 5MB)
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="relative rounded-2xl border border-beige bg-sand/50 p-2.5 flex items-center gap-3">
                    <img
                      src={newPetImage}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-white shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {newPetImageFileName || 'Selected Pet Photo'}
                      </p>
                      <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <Check size={12} /> {newPetImageSizeKB ? `${newPetImageSizeKB} KB` : 'Ready'} (Under 5MB limit)
                      </p>
                      <label
                        htmlFor="pet-photo-upload"
                        className="text-[11px] text-primary font-bold hover:underline cursor-pointer inline-block mt-0.5"
                      >
                        Change Photo
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveUploadedPhoto}
                      className="w-8 h-8 rounded-full bg-white text-rose-500 hover:bg-rose-50 border border-slate-200 flex items-center justify-center transition cursor-pointer"
                      title="Remove photo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Medical Verification Checkboxes */}
              <div className="bg-sand/70 p-3 rounded-xl border border-purple-150 space-y-2">
                <span className="font-bold text-slate-800 block">Health & Verification:</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newPetVaccinated}
                      onChange={(e) => setNewPetVaccinated(e.target.checked)}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Vaccinated</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newPetDewormed}
                      onChange={(e) => setNewPetDewormed(e.target.checked)}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Dewormed</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newPetNeutered}
                      onChange={(e) => setNewPetNeutered(e.target.checked)}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Neutered</span>
                  </label>
                </div>
              </div>

              {/* Bio / Story */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Pet Bio / Rescue Story *</label>
                <textarea
                  rows={3}
                  placeholder="Tell adopting families about their habits, favorite games, and gentle nature..."
                  value={newPetBio}
                  onChange={(e) => setNewPetBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary font-medium"
                  required
                ></textarea>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddPetModal(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-accent text-white font-bold rounded-xl text-xs shadow-md shadow-gold/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check size={16} />
                <span>Publish Free Adoption Listing</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default AdoptionShelter;
