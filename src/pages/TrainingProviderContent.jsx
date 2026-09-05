import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Calendar, MapPin, Phone, ShieldCheck, Star, Clock, 
  DollarSign, CheckCircle, AlertCircle, Plus, Search, ChevronRight, 
  Send, X, Edit3, Trash2, ExternalLink, SlidersHorizontal, 
  Sparkles, FileText, Check, MessageSquare, Info, Shield, 
  Eye, RefreshCw, Award, Heart, Tag, PawPrint, UserCheck, 
  TrendingUp, Wallet, ArrowRight, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getStoredTrainingProviders,
  getProviderTrainingService,
  saveOrUpdateTrainingService,
  deleteProviderTrainingService,
  getStoredTrainingSessions,
  saveTrainingSession,
  updateTrainingSessionStatus,
  getStoredTrainingCourses,
  saveStoredTrainingCourses,
  getStoredTrainingEnquiries,
  updateTrainingEnquiryStatus,
  getStoredTrainingReviews,
  saveStoredTrainingReviews
} from '../data/trainingData.js';
import { INDIAN_STATES_CITIES } from '../data/adoptionPetsData.js';

// Preset high-quality images for easy selection when posting training service
const PRESET_TRAINING_IMAGES = [
  { label: 'Puppy Kindergarten & Socialization', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=800' },
  { label: 'Golden Retriever Obedience', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800' },
  { label: 'Working Dog Agility & Protection', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800' },
  { label: 'Coastal Pack & Fun Outdoor Manners', url: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=800' },
  { label: 'Positive Clicker & Home Manners', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800' }
];

const AVAILABLE_SPECIALTIES = [
  'Puppy Socialization',
  'Basic & Advanced Obedience',
  'Anxiety Modification',
  'Leash Reactivity Solutions',
  'Agility & Obstacle Sports',
  'Protection & Guard Training',
  'Show Ring & Conformation Prep',
  'Clicker Training',
  'Potty & Crate Training',
  'Separation Anxiety Rehab'
];

const AVAILABLE_SESSION_MODES = [
  'At-Home 1-on-1',
  'Training Center / Camp',
  'Online Video Consultation'
];

const AVAILABLE_PET_TYPES = [
  'Dogs',
  'Puppies',
  'Cats'
];

const AVAILABLE_CERTIFICATIONS = [
  'CCPDT-KA Certified',
  'Fear Free Certified Professional',
  'Karen Pryor Academy (KPA CTP)',
  'KCI Championship Handler',
  'IPDTA Master Trainer',
  'Pet First Aid & CPR Certified',
  'IAABC Member'
];

const TrainingProviderContent = ({ activeTab, user }) => {
  const navigate = useNavigate();

  // 1. PROVIDER SERVICE STATE (STRICT 1 SERVICE PER PROVIDER)
  const [myService, setMyService] = useState(() => getProviderTrainingService(user?._id || user?.id || user?.email));
  const [isEditingService, setIsEditingService] = useState(false);

  // Form State for Posting / Editing Service
  const [serviceForm, setServiceForm] = useState({
    name: user?.businessName || user?.name || 'Clever Canines K9 Academy',
    tagline: 'Positive Reinforcement & Certified Behavioral Problem Solving',
    leadTrainer: user?.name || 'Aryan Roy',
    experience: '8+ Years Experience',
    phone: user?.mobile || '+91 98453 34455',
    whatsapp: user?.mobile || '+91 98453 34455',
    email: user?.email || 'clevercanines@pawora.com',
    state: user?.location?.split(',')[1]?.trim() || 'Karnataka',
    city: user?.location?.split(',')[0]?.trim() || 'Bangalore',
    area: 'Indiranagar, HSR Layout & Whitefield',
    pricePerSession: 850,
    packageStarting: 4999,
    sessionModes: ['At-Home 1-on-1', 'Training Center / Camp'],
    petTypes: ['Dogs', 'Puppies'],
    specialties: ['Puppy Socialization', 'Basic & Advanced Obedience', 'Anxiety Modification'],
    certifications: ['CCPDT-KA Certified', 'Fear Free Certified Professional'],
    image: PRESET_TRAINING_IMAGES[0].url,
    packages: [
      {
        id: 'pkg-default-1',
        name: 'Puppy Socialization & Potty Basics (6 Sessions)',
        price: 4999,
        sessions: '6 Doorstep Sessions',
        desc: 'Potty scheduling, crate adaptation, bite inhibition, gentle leash manners, and puppy socialization.'
      },
      {
        id: 'pkg-default-2',
        name: 'Master Complete Obedience (10 Sessions)',
        price: 8999,
        sessions: '10 Doorstep Sessions',
        desc: 'Sit, Down, 60-second Stay, Bulletproof Recall, Leave It, Off, and high-distraction park heel work.'
      }
    ]
  });

  // Sync service from storage
  const refreshService = () => {
    const found = getProviderTrainingService(user?._id || user?.id || user?.email);
    setMyService(found);
    if (found) {
      setServiceForm({
        name: found.name || user?.businessName || user?.name || '',
        tagline: found.tagline || '',
        leadTrainer: found.leadTrainer || user?.name || '',
        experience: found.experience || '8+ Years Experience',
        phone: found.phone || user?.mobile || '',
        whatsapp: found.whatsapp || found.phone || '',
        email: found.email || user?.email || '',
        state: found.state || 'Karnataka',
        city: found.city || 'Bangalore',
        area: found.area || '',
        pricePerSession: found.pricePerSession || 850,
        packageStarting: found.packageStarting || 4999,
        sessionModes: found.sessionModes || ['At-Home 1-on-1'],
        petTypes: found.petTypes || ['Dogs', 'Puppies'],
        specialties: found.specialties || ['Puppy Socialization', 'Basic & Advanced Obedience'],
        certifications: found.certifications || ['CCPDT-KA Certified'],
        image: found.image || PRESET_TRAINING_IMAGES[0].url,
        packages: found.packages && found.packages.length > 0 ? found.packages : [
          {
            id: 'pkg-1',
            name: 'Puppy Socialization & Potty Basics (6 Sessions)',
            price: 4999,
            sessions: '6 Doorstep Sessions',
            desc: 'Foundational house-training and manners.'
          }
        ]
      });
    }
  };

  useEffect(() => {
    refreshService();
    window.addEventListener('training-providers-updated', refreshService);
    return () => window.removeEventListener('training-providers-updated', refreshService);
  }, [user]);

  // Handle Save / Update Service
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      toast.error('Please enter your training academy / business name');
      return;
    }
    if (!serviceForm.phone.trim()) {
      toast.error('Please enter a trainer contact phone number');
      return;
    }

    const payload = {
      ...serviceForm,
      id: myService?.id,
      pricePerSession: Number(serviceForm.pricePerSession) || 850,
      packageStarting: Number(serviceForm.packageStarting) || 4999
    };

    const saved = saveOrUpdateTrainingService(payload, user);
    if (saved) {
      setMyService(saved);
      setIsEditingService(false);
      toast.success(myService ? 'Training service updated successfully!' : 'Training service posted & live on public directory!');
    } else {
      toast.error('Failed to save training service');
    }
  };

  // Handle Delete Service
  const handleDeleteService = () => {
    if (!myService?.id) return;
    if (window.confirm('Are you sure you want to unpublish your training service? It will no longer appear on the public Pet Training directory.')) {
      deleteProviderTrainingService(myService.id);
      setMyService(null);
      setIsEditingService(false);
      toast.success('Training service unpublished from public directory');
    }
  };

  // Helper to toggle multi-select item in array
  const toggleArrayItem = (field, value) => {
    setServiceForm(prev => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      if (exists) {
        if (current.length === 1) {
          toast.error(`At least one ${field === 'sessionModes' ? 'session mode' : 'specialty'} is required.`);
          return prev;
        }
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  // Add Package row in form
  const handleAddPackage = () => {
    setServiceForm(prev => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: 'pkg-' + Date.now().toString(36),
          name: 'Advanced Obedience Course',
          price: 7999,
          sessions: '8 Doorstep Sessions',
          desc: 'High-distraction heel, reliable recall, and impulse control.'
        }
      ]
    }));
  };

  const handleUpdatePackage = (index, key, value) => {
    setServiceForm(prev => {
      const updated = [...prev.packages];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, packages: updated };
    });
  };

  const handleRemovePackage = (index) => {
    if (serviceForm.packages.length <= 1) {
      toast.error('You must keep at least one training package');
      return;
    }
    setServiceForm(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  // 2. TRAINING SESSIONS (APPOINTMENTS) TAB STATE
  const [sessions, setSessions] = useState(() => getStoredTrainingSessions());
  const [sessionFilter, setSessionFilter] = useState('All');
  const [sessionSearch, setSessionSearch] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({
    petName: '',
    petSpecies: 'Dog',
    petBreed: '',
    petAge: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    programName: 'Basic & Advanced Obedience',
    sessionNumber: 'Session 1 of 6',
    date: 'Tomorrow, 10:00 AM',
    mode: 'At-Home 1-on-1',
    location: '',
    trainerNotes: ''
  });

  const refreshSessions = () => setSessions(getStoredTrainingSessions());

  useEffect(() => {
    window.addEventListener('training-session-created', refreshSessions);
    window.addEventListener('training-session-updated', refreshSessions);
    return () => {
      window.removeEventListener('training-session-created', refreshSessions);
      window.removeEventListener('training-session-updated', refreshSessions);
    };
  }, []);

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newSession.petName.trim() || !newSession.customerName.trim()) {
      toast.error('Please provide at least the pet name and customer name');
      return;
    }
    const created = saveTrainingSession(newSession);
    if (created) {
      toast.success(`Training session scheduled for ${newSession.petName}!`);
      setShowSessionModal(false);
      setNewSession({
        petName: '',
        petSpecies: 'Dog',
        petBreed: '',
        petAge: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        programName: 'Basic & Advanced Obedience',
        sessionNumber: 'Session 1 of 6',
        date: 'Tomorrow, 10:00 AM',
        mode: 'At-Home 1-on-1',
        location: '',
        trainerNotes: ''
      });
      refreshSessions();
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateTrainingSessionStatus(id, newStatus);
    refreshSessions();
    toast.success(`Session status updated to "${newStatus}"`);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (sessionFilter !== 'All' && s.status !== sessionFilter) return false;
      if (sessionSearch) {
        const query = sessionSearch.toLowerCase();
        return (
          (s.petName && s.petName.toLowerCase().includes(query)) ||
          (s.customerName && s.customerName.toLowerCase().includes(query)) ||
          (s.programName && s.programName.toLowerCase().includes(query)) ||
          (s.id && s.id.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [sessions, sessionFilter, sessionSearch]);

  // 3. COURSES & PRICING TAB STATE
  const [courses, setCourses] = useState(() => getStoredTrainingCourses());
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    sessionsCount: '8 Doorstep Sessions',
    targetAge: 'All Ages',
    price: 6999,
    perSession: 875,
    description: '',
    topicsStr: ''
  });

  const refreshCourses = () => setCourses(getStoredTrainingCourses());

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name.trim()) {
      toast.error('Please enter a course name');
      return;
    }
    const current = getStoredTrainingCourses();
    const courseObj = {
      id: 'CRS-' + Date.now().toString(36).toUpperCase(),
      name: newCourse.name,
      sessionsCount: newCourse.sessionsCount,
      targetAge: newCourse.targetAge,
      price: Number(newCourse.price) || 4999,
      perSession: Number(newCourse.perSession) || 850,
      description: newCourse.description || 'Structured positive reinforcement curriculum tailored to your pet.',
      topics: newCourse.topicsStr ? newCourse.topicsStr.split(',').map(t => t.trim()).filter(Boolean) : ['Foundational Recall', 'Leash Manners', 'Focus Exercises']
    };
    saveStoredTrainingCourses([courseObj, ...current]);
    refreshCourses();
    setShowCourseModal(false);
    setNewCourse({
      name: '',
      sessionsCount: '8 Doorstep Sessions',
      targetAge: 'All Ages',
      price: 6999,
      perSession: 875,
      description: '',
      topicsStr: ''
    });
    toast.success('New training course package published!');
  };

  const handleDeleteCourse = (id) => {
    const current = getStoredTrainingCourses();
    const filtered = current.filter(c => c.id !== id);
    saveStoredTrainingCourses(filtered);
    refreshCourses();
    toast.success('Course deleted');
  };

  // 4. CLIENT INQUIRIES TAB STATE
  const [enquiries, setEnquiries] = useState(() => getStoredTrainingEnquiries());
  const [enquiryFilter, setEnquiryFilter] = useState('All');
  const [selectedEnquiryForQuote, setSelectedEnquiryForQuote] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');

  const refreshEnquiries = () => setEnquiries(getStoredTrainingEnquiries());

  useEffect(() => {
    window.addEventListener('training-enquiry-created', refreshEnquiries);
    window.addEventListener('training-enquiry-updated', refreshEnquiries);
    return () => {
      window.removeEventListener('training-enquiry-created', refreshEnquiries);
      window.removeEventListener('training-enquiry-updated', refreshEnquiries);
    };
  }, []);

  const handleSendQuote = (e) => {
    e.preventDefault();
    if (!quoteAmount || isNaN(Number(quoteAmount))) {
      toast.error('Please enter a valid quote amount in ₹');
      return;
    }
    updateTrainingEnquiryStatus(
      selectedEnquiryForQuote.id, 
      'Quote Sent', 
      Number(quoteAmount), 
      quoteMessage || 'Thank you for your inquiry. Here is our customized training proposal.'
    );
    refreshEnquiries();
    setSelectedEnquiryForQuote(null);
    setQuoteAmount('');
    setQuoteMessage('');
    toast.success('Training quote & proposal sent to client!');
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enq => {
      if (enquiryFilter !== 'All' && enq.status !== enquiryFilter) return false;
      return true;
    });
  }, [enquiries, enquiryFilter]);

  // 5. CUSTOMER REVIEWS TAB STATE
  const [reviews, setReviews] = useState(() => getStoredTrainingReviews());
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const refreshReviews = () => setReviews(getStoredTrainingReviews());

  const handlePostReply = (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please type a reply message');
      return;
    }
    const current = getStoredTrainingReviews();
    const updated = current.map(r => r.id === reviewId ? { ...r, reply: replyText.trim() } : r);
    saveStoredTrainingReviews(updated);
    refreshReviews();
    setReplyingReviewId(null);
    setReplyText('');
    toast.success('Reply published to customer review');
  };

  // 6. WALLET & PAYOUTS STATE
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('15000');
  const [payoutUpi, setPayoutUpi] = useState('trainer@okhdfcbank');
  const [payoutsHistory, setPayoutsHistory] = useState([
    { id: 'PAY-101', date: '28 Aug 2026', amount: 18500, mode: 'UPI / Bank Transfer', status: 'Completed' },
    { id: 'PAY-102', date: '15 Aug 2026', amount: 24000, mode: 'NEFT Transfer', status: 'Completed' }
  ]);

  const handleRequestPayout = (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) < 1000) {
      toast.error('Minimum payout amount is ₹1,000');
      return;
    }
    const newReq = {
      id: 'PAY-' + Math.floor(100 + Math.random() * 900),
      date: 'Today, Just now',
      amount: Number(payoutAmount),
      mode: 'Instant UPI: ' + payoutUpi,
      status: 'Processing'
    };
    setPayoutsHistory([newReq, ...payoutsHistory]);
    setShowPayoutModal(false);
    toast.success(`Payout request of ₹${Number(payoutAmount).toLocaleString('en-IN')} submitted!`);
  };

  // 7. TRAINER PROFILE STATE
  const [profileBio, setProfileBio] = useState('Certified Professional Canine Instructor with a strict positive-reinforcement philosophy. Specializing in puppy foundations, loose leash walking, and overcoming fear/anxiety in shelter rescues.');
  const [trainerCertifications, setTrainerCertifications] = useState('CCPDT-KA Certified (2021), KPA CTP Dog Trainer, Pet First Aid & CPR Certified');
  const [workingHours, setWorkingHours] = useState('Monday - Saturday: 7:00 AM - 6:30 PM (Sundays by appointment)');
  const [emergencyConsult, setEmergencyConsult] = useState(true);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Trainer profile updated successfully!');
  };

  return (
    <div>
      {/* ========================================================================= */}
      {/* TAB 1: MY TRAINING SERVICE (SERVICE POSTING & PUBLIC LISTING PREVIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'service' && (
        <div className="space-y-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <GraduationCap size={22} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">My Training Service Listing</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Post and manage your single official listing visible to pet parents on the public Pet Training directory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {myService && !isEditingService && (
                <>
                  <button
                    onClick={() => navigate('/training')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition shadow-sm"
                  >
                    <ExternalLink size={14} /> View Live on Directory
                  </button>
                  <button
                    onClick={() => setIsEditingService(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2E23] text-white hover:bg-emerald-900 text-xs font-bold transition shadow-md"
                  >
                    <Edit3 size={14} /> Edit Service Details
                  </button>
                </>
              )}
            </div>
          </div>

          {/* If service exists and not editing -> SHOW LIVE PREVIEW & STATUS */}
          {myService && !isEditingService ? (
            <div className="space-y-6">
              
              {/* Status Alert Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-300/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#0F2E23] text-base">Your Training Service is Live</span>
                      <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                        Active on Directory
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Pet parents searching in {myService.city}, {myService.state} can view your packages, contact you, and book 1-on-1 sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsEditingService(true)}
                    className="px-4 py-2 bg-white text-[#0F2E23] border border-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100/50 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={handleDeleteService}
                    className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Unpublish
                  </button>
                </div>
              </div>

              {/* Public Preview Card matching PetTraining.jsx */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Image & Badges */}
                    <div className="lg:w-1/3 relative shrink-0">
                      <div className="h-60 sm:h-72 rounded-2xl overflow-hidden relative shadow-inner bg-slate-100">
                        <img 
                          src={myService.image || PRESET_TRAINING_IMAGES[0].url} 
                          alt={myService.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className="bg-[#0F2E23]/90 backdrop-blur-md text-amber-400 font-black text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <ShieldCheck size={13} className="text-amber-400" /> Verified Academy
                          </span>
                          <span className="bg-emerald-900/90 backdrop-blur-md text-emerald-200 font-bold text-[10px] px-3 py-0.5 rounded-full shadow-sm">
                            {myService.experience || '8+ Years Exp.'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-[#0F2E23] flex items-center gap-1 shadow">
                          <Star size={13} className="fill-amber-400 text-amber-400" /> {myService.rating || '5.0'} ({myService.reviews || 1})
                        </div>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="lg:w-2/3 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h3 className="text-2xl font-black text-[#0F2E23] tracking-tight">{myService.name}</h3>
                          <div className="text-right">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Single Session</span>
                            <span className="text-xl font-black text-emerald-700">₹{myService.pricePerSession}</span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-500 mb-3">{myService.tagline}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
                          <span className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Award size={15} className="text-emerald-700" /> Lead: {myService.leadTrainer}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={15} className="text-rose-500" /> {myService.city}, {myService.state} {myService.area ? `(${myService.area})` : ''}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <PawPrint size={15} className="text-amber-500" /> Pets: {Array.isArray(myService.petTypes) ? myService.petTypes.join(', ') : 'Dogs, Puppies'}
                          </span>
                        </div>

                        {/* Session Modes */}
                        <div className="mb-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Modes Offered:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(myService.sessionModes || ['At-Home 1-on-1', 'Training Center / Camp']).map((m, idx) => (
                              <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Specialties:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(myService.specialties || []).map((spec, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-lg">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Packages Breakdown */}
                        {myService.packages && myService.packages.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">Available Packages:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {myService.packages.map((pkg, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-xs font-black text-[#0F2E23]">{pkg.name}</span>
                                    <span className="text-xs font-black text-emerald-700 shrink-0">₹{pkg.price}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{pkg.sessions}</span>
                                  {pkg.desc && <p className="text-[11px] text-slate-500 mt-1">{pkg.desc}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <Phone size={13} className="text-emerald-700" /> {myService.phone}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <MessageCircle size={13} className="text-emerald-500" /> {myService.whatsapp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate('/training')}
                            className="bg-[#0F2E23] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition shadow-sm flex items-center gap-1.5"
                          >
                            <ExternalLink size={13} /> View on Public Page
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* SERVICE CREATION / EDIT FORM */
            <form onSubmit={handleSaveService} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-8 shadow-sm">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-sans font-black text-[#0F2E23]">
                    {myService ? 'Edit Your Training Service Listing' : 'Post Your Training Service Listing'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out your official academy details. Once published, pet parents can find and book your training programs.
                  </p>
                </div>
                {myService && isEditingService && (
                  <button
                    type="button"
                    onClick={() => setIsEditingService(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 bg-slate-100 rounded-lg transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-emerald-600" /> Academy & Trainer Basics
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Academy / Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="e.g. Clever Canines K9 Academy"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tagline / Motto <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.tagline}
                      onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })}
                      placeholder="e.g. Gentle Science-Backed Dog Training & Behavior Rehabilitation"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Lead Trainer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.leadTrainer}
                      onChange={(e) => setServiceForm({ ...serviceForm, leadTrainer: e.target.value })}
                      placeholder="e.g. Aryan Roy (Head Trainer)"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Experience Summary
                    </label>
                    <input
                      type="text"
                      value={serviceForm.experience}
                      onChange={(e) => setServiceForm({ ...serviceForm, experience: e.target.value })}
                      placeholder="e.g. 8+ Years Experience"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={serviceForm.email}
                      onChange={(e) => setServiceForm({ ...serviceForm, email: e.target.value })}
                      placeholder="e.g. trainer@pawora.com"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={serviceForm.phone}
                      onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                      placeholder="+91 98453 34455"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      WhatsApp Booking Number
                    </label>
                    <input
                      type="tel"
                      value={serviceForm.whatsapp}
                      onChange={(e) => setServiceForm({ ...serviceForm, whatsapp: e.target.value })}
                      placeholder="+91 98453 34455"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Coverage */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin size={15} className="text-rose-500" /> Location & Service Neighborhoods
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                    <select
                      value={serviceForm.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        const cities = INDIAN_STATES_CITIES[newState] || ['All Cities'];
                        setServiceForm({
                          ...serviceForm,
                          state: newState,
                          city: cities[0] || 'Bangalore'
                        });
                      }}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                    <select
                      value={serviceForm.city}
                      onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      {(INDIAN_STATES_CITIES[serviceForm.state] || [serviceForm.city]).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Localities / Hubs Covered
                    </label>
                    <input
                      type="text"
                      value={serviceForm.area}
                      onChange={(e) => setServiceForm({ ...serviceForm, area: e.target.value })}
                      placeholder="e.g. Indiranagar, HSR Layout & Whitefield"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Modes, Pet Types & Specialties */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <SlidersHorizontal size={15} className="text-sky-500" /> Training Modalities & Specialties
                </h4>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Training Modes Offered:</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SESSION_MODES.map((mode) => {
                      const isSelected = serviceForm.sessionModes.includes(mode);
                      return (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => toggleArrayItem('sessionModes', mode)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                            isSelected 
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {isSelected && <Check size={12} />} {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Pet Types Accepted:</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_PET_TYPES.map((pt) => {
                      const isSelected = serviceForm.petTypes.includes(pt);
                      return (
                        <button
                          type="button"
                          key={pt}
                          onClick={() => toggleArrayItem('petTypes', pt)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                            isSelected 
                              ? 'bg-[#0F2E23] text-amber-300 border-[#0F2E23] shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F2E23]/40'
                          }`}
                        >
                          {isSelected && <Check size={12} />} {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Training Specialties:</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SPECIALTIES.map((spec) => {
                      const isSelected = serviceForm.specialties.includes(spec);
                      return (
                        <button
                          type="button"
                          key={spec}
                          onClick={() => toggleArrayItem('specialties', spec)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                            isSelected 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? <Check size={12} className="text-emerald-700" /> : <Plus size={12} />} {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Certifications & Badges:</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_CERTIFICATIONS.map((cert) => {
                      const isSelected = serviceForm.certifications.includes(cert);
                      return (
                        <button
                          type="button"
                          key={cert}
                          onClick={() => toggleArrayItem('certifications', cert)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                            isSelected 
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          {isSelected ? <Award size={12} className="text-amber-600" /> : <Plus size={12} />} {cert}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pricing & Packages */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-emerald-600" /> Pricing & Package Tiers
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Price Per Single Session (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={serviceForm.pricePerSession}
                      onChange={(e) => setServiceForm({ ...serviceForm, pricePerSession: e.target.value })}
                      placeholder="850"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Package Starting Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={serviceForm.packageStarting}
                      onChange={(e) => setServiceForm({ ...serviceForm, packageStarting: e.target.value })}
                      placeholder="4999"
                      className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                {/* Editable Package List */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Custom Training Packages:</label>
                    <button
                      type="button"
                      onClick={handleAddPackage}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Package Tier
                    </button>
                  </div>

                  <div className="space-y-3">
                    {serviceForm.packages.map((pkg, idx) => (
                      <div key={pkg.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-500 uppercase">Package #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePackage(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => handleUpdatePackage(idx, 'name', e.target.value)}
                              placeholder="Package Title (e.g. Master Complete Obedience)"
                              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={(e) => handleUpdatePackage(idx, 'price', e.target.value)}
                              placeholder="Total Price (₹)"
                              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={pkg.sessions}
                              onChange={(e) => handleUpdatePackage(idx, 'sessions', e.target.value)}
                              placeholder="Sessions description (e.g. 10 Doorstep Sessions)"
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={pkg.desc}
                              onChange={(e) => handleUpdatePackage(idx, 'desc', e.target.value)}
                              placeholder="Key outcomes (e.g. Loose leash walking, reliable recall)"
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Image Selection */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-500" /> Service Cover Image
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PRESET_TRAINING_IMAGES.map((img, idx) => {
                    const isSelected = serviceForm.image === img.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setServiceForm({ ...serviceForm, image: img.url })}
                        className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                          isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-20 object-cover" />
                        <span className="text-[10px] font-bold text-slate-700 p-1 block truncate text-center bg-slate-50">
                          {img.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                            <Check size={10} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Or Enter Custom Image URL
                  </label>
                  <input
                    type="url"
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-sm px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                {myService && isEditingService && (
                  <button
                    type="button"
                    onClick={() => setIsEditingService(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#0F2E23] text-white px-8 py-3 rounded-xl font-black text-sm tracking-wide hover:bg-emerald-900 transition shadow-lg flex items-center gap-2"
                >
                  <CheckCircle size={16} className="text-amber-400" />
                  {myService ? 'Update & Sync Service' : 'Publish Service to Public Directory'}
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPOINTMENTS (TRAINING SESSIONS & BOOKINGS) */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Calendar size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Training Sessions</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Manage upcoming 1-on-1 sessions, track dog progress, and log handler notes.
              </p>
            </div>

            <button
              onClick={() => setShowSessionModal(true)}
              className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2"
            >
              <Plus size={16} /> Schedule Session
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search pet name, customer, program, or session ID..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSessionFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    sessionFilter === st
                      ? 'bg-[#0F2E23] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Session Cards List */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No training sessions found</h4>
              <p className="text-xs text-slate-400 mt-0.5">Try changing your filters or schedule a new training session.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#0F2E23]">{session.petName}</span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {session.petBreed} • {session.petAge}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 block mt-0.5">{session.programName}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{session.sessionNumber}</span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      session.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : session.status === 'In Progress' 
                        ? 'bg-sky-100 text-sky-800' 
                        : session.status === 'Cancelled' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{session.customerName}</span>
                      <span className="text-slate-500">{session.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={13} className="text-emerald-700 shrink-0" />
                      <span>{session.date} ({session.mode})</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    )}
                    {session.trainerNotes && (
                      <div className="pt-2 mt-2 border-t border-slate-200 text-slate-600 text-[11px] italic">
                        <strong>Trainer Note:</strong> "{session.trainerNotes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400">ID: {session.id}</span>
                    
                    <div className="flex items-center gap-2">
                      {session.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusChange(session.id, 'Completed')}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-lg transition"
                        >
                          Mark Done
                        </button>
                      )}
                      {session.status !== 'In Progress' && session.status !== 'Completed' && (
                        <button
                          onClick={() => handleStatusChange(session.id, 'In Progress')}
                          className="px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold rounded-lg transition"
                        >
                          Start
                        </button>
                      )}
                      {session.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusChange(session.id, 'Cancelled')}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-medium rounded-lg transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule Session Modal */}
          {showSessionModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Calendar size={18} />
                    </span>
                    <h3 className="text-lg font-black text-[#0F2E23]">Schedule Training Session</h3>
                  </div>
                  <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Pet Name *</label>
                      <input
                        type="text"
                        value={newSession.petName}
                        onChange={(e) => setNewSession({ ...newSession, petName: e.target.value })}
                        placeholder="e.g. Rocky"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Breed & Age</label>
                      <input
                        type="text"
                        value={newSession.petBreed}
                        onChange={(e) => setNewSession({ ...newSession, petBreed: e.target.value })}
                        placeholder="e.g. Beagle, 1 yr"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Owner Name *</label>
                      <input
                        type="text"
                        value={newSession.customerName}
                        onChange={(e) => setNewSession({ ...newSession, customerName: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={newSession.customerPhone}
                        onChange={(e) => setNewSession({ ...newSession, customerPhone: e.target.value })}
                        placeholder="+91 98201 12345"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Program</label>
                      <select
                        value={newSession.programName}
                        onChange={(e) => setNewSession({ ...newSession, programName: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                      >
                        <option value="Puppy Socialization & Potty Basics">Puppy Socialization Basics</option>
                        <option value="Basic & Advanced Obedience">Basic & Advanced Obedience</option>
                        <option value="Behavior Rehabilitation">Behavior Rehabilitation</option>
                        <option value="Agility & Tricks">Agility & Tricks</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Session Number</label>
                      <input
                        type="text"
                        value={newSession.sessionNumber}
                        onChange={(e) => setNewSession({ ...newSession, sessionNumber: e.target.value })}
                        placeholder="Session 1 of 6"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Date & Time</label>
                      <input
                        type="text"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                        placeholder="e.g. Tomorrow, 10:00 AM"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Training Mode</label>
                      <select
                        value={newSession.mode}
                        onChange={(e) => setNewSession({ ...newSession, mode: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                      >
                        <option value="At-Home 1-on-1">At-Home 1-on-1</option>
                        <option value="Training Center / Camp">Training Center / Camp</option>
                        <option value="Online Video Consultation">Online Video Consultation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Location / Address</label>
                    <input
                      type="text"
                      value={newSession.location}
                      onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                      placeholder="e.g. Bandra West, Mumbai"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Focus Areas / Trainer Notes</label>
                    <textarea
                      rows={2}
                      value={newSession.trainerNotes}
                      onChange={(e) => setNewSession({ ...newSession, trainerNotes: e.target.value })}
                      placeholder="e.g. Focus on loose leash walking and greeting visitors calmly."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSessionModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0F2E23] text-white text-xs font-bold hover:bg-emerald-900 shadow-md"
                    >
                      Save Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COURSES & PRICING */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Tag size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Courses & Pricing Packages</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Design and price structured behavior packages offered to pet parents.
              </p>
            </div>

            <button
              onClick={() => setShowCourseModal(true)}
              className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2"
            >
              <Plus size={16} /> Add Course Package
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ID: {course.id}</span>
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {course.targetAge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#0F2E23] mb-1">{course.name}</h3>
                  <span className="text-xs font-bold text-slate-400 block mb-3">{course.sessionsCount}</span>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{course.description}</p>

                  {course.topics && course.topics.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Key Learning Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {course.topics.map((t, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Check size={10} className="text-emerald-600" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Total Fee</span>
                    <span className="text-xl font-black text-[#0F2E23]">₹{course.price.toLocaleString('en-IN')}</span>
                    {course.perSession && (
                      <span className="text-[10px] text-slate-400 block">₹{course.perSession}/session</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Course Modal */}
          {showCourseModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-[#0F2E23]">Create Course Package</h3>
                  <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Name *</label>
                    <input
                      type="text"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      placeholder="e.g. Master Loose-Leash Manners"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Sessions Count</label>
                      <input
                        type="text"
                        value={newCourse.sessionsCount}
                        onChange={(e) => setNewCourse({ ...newCourse, sessionsCount: e.target.value })}
                        placeholder="e.g. 8 Doorstep Sessions"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Target Pet Profile</label>
                      <input
                        type="text"
                        value={newCourse.targetAge}
                        onChange={(e) => setNewCourse({ ...newCourse, targetAge: e.target.value })}
                        placeholder="e.g. Ages 6+ Months"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Total Fee (₹)</label>
                      <input
                        type="number"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                        placeholder="6999"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Per Session (₹)</label>
                      <input
                        type="number"
                        value={newCourse.perSession}
                        onChange={(e) => setNewCourse({ ...newCourse, perSession: e.target.value })}
                        placeholder="875"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Description</label>
                    <textarea
                      rows={2}
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Outline the core goals and training methodologies..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Key Topics (comma separated)</label>
                    <input
                      type="text"
                      value={newCourse.topicsStr}
                      onChange={(e) => setNewCourse({ ...newCourse, topicsStr: e.target.value })}
                      placeholder="Sit & Stay under distraction, Doorbell manners, Recall cue"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCourseModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0F2E23] text-white text-xs font-bold hover:bg-emerald-900 shadow-md"
                    >
                      Publish Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLIENT INQUIRIES (LEADS & QUOTES) */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <MessageSquare size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Client Inquiries</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Respond to incoming inquiries submitted by pet owners from the public training page.
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Under Review', 'Quote Sent', 'Confirmed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEnquiryFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    enquiryFilter === st
                      ? 'bg-[#0F2E23] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <MessageSquare size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No client inquiries at the moment</h4>
              <p className="text-xs text-slate-400 mt-0.5">When pet parents submit an inquiry on your service page, they appear right here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnquiries.map((enq) => (
                <div key={enq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#0F2E23]">{enq.fullName || enq.userName || 'Pet Parent'}</span>
                        <span className="text-[10px] font-bold text-slate-400">ID: {enq.id}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                        Goal: {enq.trainingGoal || enq.trainingType || 'General Obedience'}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      enq.status === 'Quote Sent'
                        ? 'bg-sky-100 text-sky-800'
                        : enq.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {enq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pet Details</span>
                      <span className="font-semibold text-slate-800">
                        {enq.petBreed || 'Dog'} {enq.petAge ? `(${enq.petAge})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Client Contact</span>
                      <span className="font-semibold text-slate-800 block">{enq.phone || 'Phone not provided'}</span>
                      <span className="text-slate-500">{enq.city || 'City not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Preferred Time</span>
                      <span className="font-semibold text-slate-800">{enq.preferredSlot || 'Flexible'}</span>
                    </div>
                  </div>

                  {enq.notes && (
                    <div className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <strong>Notes from parent:</strong> "{enq.notes}"
                    </div>
                  )}

                  {enq.quoteAmount && (
                    <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-xs">
                      <div>
                        <span className="font-black">Proposed Fee: ₹{enq.quoteAmount.toLocaleString('en-IN')}</span>
                        {enq.quoteMessage && <p className="text-[11px] text-emerald-800 mt-0.5">{enq.quoteMessage}</p>}
                      </div>
                      <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">Quote Sent</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Received {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recently'}</span>

                    <div className="flex items-center gap-2">
                      {enq.phone && (
                        <a
                          href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
                        >
                          <MessageCircle size={13} className="text-emerald-600" /> WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedEnquiryForQuote(enq)}
                        className="px-4 py-1.5 bg-[#0F2E23] text-white hover:bg-emerald-900 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                      >
                        <Send size={12} /> {enq.quoteAmount ? 'Revise Quote' : 'Send Training Quote'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Send Quote Modal */}
          {selectedEnquiryForQuote && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-[#0F2E23]">Send Training Proposal & Quote</h3>
                  <button onClick={() => setSelectedEnquiryForQuote(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSendQuote} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Client: {selectedEnquiryForQuote.fullName || selectedEnquiryForQuote.userName}
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Inquiry for: {selectedEnquiryForQuote.trainingGoal || selectedEnquiryForQuote.trainingType}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Quote Amount (₹) *</label>
                    <input
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 7499"
                      className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Personalized Message & Schedule</label>
                    <textarea
                      rows={3}
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      placeholder="e.g. 8 doorstep 1-on-1 sessions starting this Saturday morning with clicker homework."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiryForQuote(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0F2E23] text-white text-xs font-bold hover:bg-emerald-900 shadow-md flex items-center gap-1.5"
                    >
                      <Send size={13} /> Send Quote
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CUSTOMER REVIEWS */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Heart size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Customer Reviews & Ratings</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Read pet parent feedback, success stories, and post official trainer responses.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
              <Star size={20} className="fill-amber-400 text-amber-400" />
              <div>
                <span className="text-base font-black text-[#0F2E23]">5.0 / 5.0</span>
                <span className="text-[10px] text-slate-500 block font-bold">100% Positive Feedback</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-black text-[#0F2E23]">{rev.customerName}</h4>
                    <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                      Pet: {rev.petName} • Course: {rev.courseName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-900">{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                  "{rev.comment}"
                </p>

                {rev.reply ? (
                  <div className="ml-4 pl-4 border-l-2 border-emerald-600 bg-emerald-50/60 p-3.5 rounded-r-2xl text-xs">
                    <span className="font-black text-emerald-900 block mb-0.5">Trainer Official Reply:</span>
                    <p className="text-emerald-800">{rev.reply}</p>
                  </div>
                ) : (
                  replyingReviewId === rev.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a supportive reply to the pet parent..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setReplyingReviewId(null); setReplyText(''); }}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostReply(rev.id)}
                          className="px-4 py-1.5 bg-[#0F2E23] text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingReviewId(rev.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <MessageSquare size={13} /> Reply to Review
                    </button>
                  )
                )}

                <span className="text-[10px] text-slate-400 block pt-1">{rev.date}</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WALLET & PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <DollarSign size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Wallet & Payouts</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Track your course earnings, escrow payouts, and request instant bank settlements.
              </p>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              className="bg-[#0F2E23] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2"
            >
              <Wallet size={16} /> Request Payout
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#0F2E23] to-emerald-900 text-white p-6 rounded-3xl shadow-lg">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block mb-1">Available for Payout</span>
              <div className="text-3xl font-black mb-3">₹28,500</div>
              <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">Ready to withdraw</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">In Escrow (Upcoming Sessions)</span>
              <div className="text-3xl font-black text-[#0F2E23] mb-3">₹14,000</div>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full">Released on session completion</span>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lifetime Earnings</span>
              <div className="text-3xl font-black text-[#0F2E23] mb-3">₹1,42,500</div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">100% payout track record</span>
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-[#0F2E23]">Recent Settlement History</h3>
            
            <div className="divide-y divide-slate-100">
              {payoutsHistory.map((pay) => (
                <div key={pay.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-[#0F2E23] block">{pay.id}</span>
                    <span className="text-[11px] text-slate-500">{pay.date} • {pay.mode}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#0F2E23] block">₹{pay.amount.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      pay.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Payout Modal */}
          {showPayoutModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-[#0F2E23]">Request Bank / UPI Payout</h3>
                  <button onClick={() => setShowPayoutModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Withdrawal Amount (₹) *</label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="15000"
                      max="28500"
                      className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Maximum available: ₹28,500</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID or Bank Account Details *</label>
                    <input
                      type="text"
                      value={payoutUpi}
                      onChange={(e) => setPayoutUpi(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPayoutModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0F2E23] text-white text-xs font-bold hover:bg-emerald-900 shadow-md flex items-center gap-1.5"
                    >
                      Confirm Payout
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: TRAINER PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <PawPrint size={20} />
                </span>
                <h2 className="text-2xl font-sans font-black text-[#0F2E23]">Trainer Professional Profile</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Customize your bio, philosophy, operating hours, and certifications visible to clients.
              </p>
            </div>

            <button
              type="submit"
              className="bg-[#0F2E23] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md flex items-center gap-2"
            >
              <Check size={16} /> Save Profile
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Professional Bio & Philosophy (Positive Reinforcement)
              </label>
              <textarea
                rows={4}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Certifications & Badges
                </label>
                <input
                  type="text"
                  value={trainerCertifications}
                  onChange={(e) => setTrainerCertifications(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Working Hours & Availability
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Emergency Reactive Dog Support</span>
                <span className="text-[11px] text-slate-500">Enable 24-hr urgent behavioral video consultations for aggression triggers</span>
              </div>
              <input
                type="checkbox"
                checked={emergencyConsult}
                onChange={(e) => setEmergencyConsult(e.target.checked)}
                className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
              />
            </div>
          </div>

        </form>
      )}

    </div>
  );
};

export default TrainingProviderContent;
