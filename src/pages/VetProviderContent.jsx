import React, { useState, useEffect } from 'react';
import { 
  Calendar, Stethoscope, Star, MessageSquare, Clock, CreditCard, Building, Check, 
  Video, Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, 
  Download, Edit3, HeartPulse, StarHalf, Home, X, Printer, Phone, MapPin, 
  Mic, MicOff, VideoOff, PhoneOff, Send, Eye, RefreshCw, AlertCircle, Sparkles,
  Trash2, ShieldCheck, CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  updateVetProfile, 
  getStoredVetDoctors, 
  getVetAppointments, 
  updateVetAppointmentStatus, 
  saveVetAppointment,
  getStoredVetPrescriptions,
  saveVetPrescription,
  getStoredVetSchedule,
  saveVetSchedule,
  getStoredVetWallet,
  withdrawVetFunds,
  getStoredVetReviews,
  addVetReviewReply,
  getStoredVetChats,
  sendVetChatMessage,
  getStoredVetServicesFees,
  saveVetServicesFees,
  VET_SPECIALIZATIONS
} from '../data/veterinaryData.js';

const VetProviderContent = ({ activeTab }) => {
  // -------------------------------------------------------------
  // 1. Profile State
  // -------------------------------------------------------------
  const [profile, setProfile] = useState({
    id: 'my-vet-profile',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    name: 'Dr. Ramesh Kumar',
    vciRegistration: 'VCI/2010/KA-08492',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery)',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    address: 'Plot 42, MG Road, HAL 2nd Stage, Bangalore - 560038',
    city: 'Bangalore',
    state: 'Karnataka',
    experienceDisplay: '14+ Years Exp.',
    experienceYears: 14,
    rating: 4.9,
    reviewsCount: 124,
    phone: '+91 98450 88219',
    inClinicFee: 800,
    videoConsultFee: 500,
    homeVisitFee: 1500,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: ['General Physician & Vaccines', 'Orthopedics & Soft Tissue Surgery', 'Pet Nutrition', 'Feline Medicine'],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 09:00 PM',
    bio: 'Dedicated small animal surgeon with 14+ years of clinical excellence in veterinary orthopedics, soft tissue surgery, and preventive care.',
    facilities: ['Digital X-Ray', 'In-House Blood Lab', 'Surgical OT (Isoflurane)', 'Pharmacy On-Site', 'Emergency Oxygen ICU'],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  });

  // -------------------------------------------------------------
  // 2. Tab Datasets & Storage Sync
  // -------------------------------------------------------------
  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedule, setSchedule] = useState(() => getStoredVetSchedule());
  const [wallet, setWallet] = useState(() => getStoredVetWallet());
  const [reviews, setReviews] = useState(() => getStoredVetReviews());
  const [chats, setChats] = useState(() => getStoredVetChats());
  const [activeChatId, setActiveChatId] = useState('chat-aarav');
  const [messageInput, setMessageInput] = useState('');

  // Services & Fees state
  const [servicesState, setServicesState] = useState({
    inClinic: { active: true, fee: 800 },
    video: { active: true, fee: 500 },
    home: { active: true, fee: 1500 }
  });
  const [specializations, setSpecializations] = useState([
    'General Physician & Vaccines',
    'Orthopedics & Soft Tissue Surgery',
    'Pet Nutrition',
    'Feline Medicine'
  ]);

  // -------------------------------------------------------------
  // 3. Modals & Interactive States
  // -------------------------------------------------------------
  // Reschedule Modal
  const [selectedAppForReschedule, setSelectedAppForReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('11:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');

  // Add Walk-in Appointment Modal
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newApp, setNewApp] = useState({
    petName: '',
    petSpecies: 'Dog',
    petBreed: '',
    ownerName: '',
    ownerPhone: '',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTimeSlot: '11:00 AM',
    bookingMode: 'In-Clinic Visit',
    petSymptoms: '',
    fee: 800
  });

  // Specialization Modal
  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [newSpecInput, setNewSpecInput] = useState('');

  // Prescription Modals
  const [showNewRxModal, setShowNewRxModal] = useState(false);
  const [selectedRxForPdf, setSelectedRxForPdf] = useState(null);
  const [newRx, setNewRx] = useState({
    petName: '',
    petSpecies: 'Dog',
    petBreed: '',
    petAge: '2 Years',
    petWeight: '15 kg',
    ownerName: '',
    ownerPhone: '',
    diagnosis: '',
    vitals: { temp: '101.5 °F', weight: '15 kg', pulse: '90 bpm' },
    symptoms: '',
    medicines: [
      { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' }
    ],
    advice: 'Keep pet well-hydrated and rest in a quiet, dry area.',
    followUpDate: 'In 7 days'
  });

  // Wallet Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedTxnForInvoice, setSelectedTxnForInvoice] = useState(null);

  // Reviews Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Video Consult Simulation Modal
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [videoCallDuration, setVideoCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Schedule Custom Slot state
  const [selectedDayForSlot, setSelectedDayForSlot] = useState(null);
  const [newSlotStart, setNewSlotStart] = useState('14:00');
  const [newSlotEnd, setNewSlotEnd] = useState('17:00');

  // -------------------------------------------------------------
  // 4. Initial Load & Reactive Listener
  // -------------------------------------------------------------
  const loadAllData = () => {
    // Load Appointments
    const allApps = getVetAppointments();
    setAppointments(allApps);

    // Load Services & Fees
    const storedFees = getStoredVetServicesFees();
    if (storedFees && storedFees.inClinic) {
      setServicesState({
        inClinic: storedFees.inClinic,
        video: storedFees.video,
        home: storedFees.home
      });
      if (storedFees.specializations && Array.isArray(storedFees.specializations)) {
        setSpecializations(storedFees.specializations);
      }
    }

    // Load Prescriptions
    setPrescriptions(getStoredVetPrescriptions());

    // Load Schedule
    setSchedule(getStoredVetSchedule());

    // Load Wallet
    setWallet(getStoredVetWallet());

    // Load Reviews
    setReviews(getStoredVetReviews());

    // Load Chats
    setChats(getStoredVetChats());

    // Load Doctor Profile
    const docs = getStoredVetDoctors();
    const myDoc = docs.find(d => d.id === profile.id);
    if (myDoc) {
      setProfile(myDoc);
    } else {
      updateVetProfile(profile);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleDataUpdate = () => {
      loadAllData();
    };

    window.addEventListener('vet-data-updated', handleDataUpdate);
    return () => window.removeEventListener('vet-data-updated', handleDataUpdate);
  }, [activeTab]);

  // Video call timer
  useEffect(() => {
    let timer;
    if (activeVideoCall) {
      timer = setInterval(() => {
        setVideoCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVideoCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeVideoCall]);

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------------------------------------------
  // 5. Handlers for Services Tab
  // -------------------------------------------------------------
  const toggleService = (key) => {
    setServicesState(p => ({
      ...p,
      [key]: { ...p[key], active: !p[key].active }
    }));
  };

  const updateServiceFee = (key, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setServicesState(p => ({
      ...p,
      [key]: { ...p[key], fee: num }
    }));
  };

  const handleSaveServices = () => {
    // 1. Persist to services_fees storage
    saveVetServicesFees(servicesState, specializations);

    // 2. Sync with Doctor Public Profile
    const activeModes = [];
    if (servicesState.inClinic.active) activeModes.push('In-Clinic Visit');
    if (servicesState.video.active) activeModes.push('24/7 Video Tele-Consult');
    if (servicesState.home.active) activeModes.push('Home Visit Vet');

    const updatedProfile = {
      ...profile,
      inClinicFee: Number(servicesState.inClinic.fee),
      videoConsultFee: Number(servicesState.video.fee),
      homeVisitFee: Number(servicesState.home.fee),
      isHomeVisitAvailable: servicesState.home.active,
      consultationModes: activeModes,
      specializations: specializations
    };

    setProfile(updatedProfile);
    updateVetProfile(updatedProfile);
    toast.success('Clinical Services & Fees updated and synced to public directory!');
  };

  const handleRemoveSpecialization = (spec) => {
    const updated = specializations.filter(s => s !== spec);
    setSpecializations(updated);
    saveVetServicesFees(servicesState, updated);
    toast.success(`Removed "${spec}" from specializations`);
  };

  const handleAddSpecialization = (specName) => {
    const name = (specName || newSpecInput).trim();
    if (!name) return;
    if (specializations.includes(name)) {
      toast.error('Specialization already added');
      return;
    }
    const updated = [...specializations, name];
    setSpecializations(updated);
    saveVetServicesFees(servicesState, updated);
    setNewSpecInput('');
    setShowAddSpecModal(false);
    toast.success(`Added "${name}" to offered specializations!`);
  };

  // -------------------------------------------------------------
  // 6. Handlers for Appointments Tab
  // -------------------------------------------------------------
  const handleCompleteAppointment = (appId) => {
    const target = appointments.find(a => a.id === appId);
    const updated = updateVetAppointmentStatus(appId, 'Completed');
    setAppointments(updated);
    toast.success(`Completed consultation for ${target?.petName || 'Patient'}!`);
  };

  const handleOpenRescheduleModal = (app) => {
    setSelectedAppForReschedule(app);
    setRescheduleDate(app.bookingDate === 'Today' ? new Date().toISOString().split('T')[0] : app.bookingDate);
    setRescheduleTimeSlot(app.bookingTimeSlot || '11:00 AM');
    setRescheduleNote('');
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!selectedAppForReschedule || !rescheduleDate) {
      toast.error('Please select a valid date for rescheduling');
      return;
    }

    const updated = updateVetAppointmentStatus(selectedAppForReschedule.id, 'Rescheduled', {
      bookingDate: rescheduleDate,
      bookingTimeSlot: rescheduleTimeSlot,
      rescheduleNote: rescheduleNote || 'Rescheduled by Clinic'
    });

    setAppointments(updated);
    setSelectedAppForReschedule(null);
    toast.success(`Rescheduled appointment for ${selectedAppForReschedule.petName} to ${rescheduleDate} (${rescheduleTimeSlot})`);
  };

  const handleCreateWalkInAppointment = (e) => {
    e.preventDefault();
    if (!newApp.petName.trim() || !newApp.ownerName.trim() || !newApp.ownerPhone.trim()) {
      toast.error('Please fill in Pet Name, Owner Name, and Phone number');
      return;
    }

    const appointmentObj = {
      id: `app-${Date.now()}`,
      doctorId: profile.id,
      doctorName: profile.name,
      clinicName: profile.clinicName,
      petName: newApp.petName.trim(),
      petSpecies: newApp.petSpecies,
      petBreed: newApp.petBreed.trim() || 'Mixed / Indie',
      ownerName: newApp.ownerName.trim(),
      ownerPhone: newApp.ownerPhone.trim(),
      bookingDate: newApp.bookingDate,
      bookingTimeSlot: newApp.bookingTimeSlot,
      bookingMode: newApp.bookingMode,
      petSymptoms: newApp.petSymptoms.trim() || 'In-clinic physical examination',
      status: 'In Queue',
      fee: newApp.fee || 800,
      createdAt: new Date().toISOString()
    };

    const updated = saveVetAppointment(appointmentObj);
    setAppointments(updated);
    setShowAddAppModal(false);
    toast.success(`Walk-in appointment created for ${newApp.petName}!`);
    
    // Reset form
    setNewApp({
      petName: '',
      petSpecies: 'Dog',
      petBreed: '',
      ownerName: '',
      ownerPhone: '',
      bookingDate: new Date().toISOString().split('T')[0],
      bookingTimeSlot: '11:00 AM',
      bookingMode: 'In-Clinic Visit',
      petSymptoms: '',
      fee: 800
    });
  };

  // -------------------------------------------------------------
  // 7. Handlers for Prescriptions Tab
  // -------------------------------------------------------------
  const handleAddMedicineRow = () => {
    setNewRx(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' }
      ]
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (newRx.medicines.length <= 1) return;
    setNewRx(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateMedicine = (index, field, value) => {
    setNewRx(prev => {
      const updatedMeds = [...prev.medicines];
      updatedMeds[index] = { ...updatedMeds[index], [field]: value };
      return { ...prev, medicines: updatedMeds };
    });
  };

  const handleSavePrescription = (e) => {
    e.preventDefault();
    if (!newRx.petName.trim() || !newRx.ownerName.trim() || !newRx.diagnosis.trim()) {
      toast.error('Please enter Pet Name, Owner Name, and Diagnosis');
      return;
    }

    const rxObj = {
      id: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      petName: newRx.petName.trim(),
      petSpecies: newRx.petSpecies,
      petBreed: newRx.petBreed.trim() || 'General Breed',
      petAge: newRx.petAge,
      petWeight: newRx.petWeight,
      ownerName: newRx.ownerName.trim(),
      ownerPhone: newRx.ownerPhone.trim(),
      diagnosis: newRx.diagnosis.trim(),
      vitals: newRx.vitals,
      symptoms: newRx.symptoms.trim() || 'Evaluated during consultation',
      medicines: newRx.medicines.filter(m => m.name.trim()),
      advice: newRx.advice.trim(),
      followUpDate: newRx.followUpDate.trim(),
      doctorName: profile.name,
      doctorDegrees: profile.degrees,
      vciRegistration: profile.vciRegistration,
      clinicName: profile.clinicName,
      clinicAddress: profile.address,
      createdAt: new Date().toISOString()
    };

    const updated = saveVetPrescription(rxObj);
    setPrescriptions(updated);
    setShowNewRxModal(false);
    toast.success(`Prescription #${rxObj.id} issued successfully!`);
    setSelectedRxForPdf(rxObj); // Preview the generated prescription
  };

  // -------------------------------------------------------------
  // 8. Handlers for Clinic Hours Tab
  // -------------------------------------------------------------
  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...prev.days[day], isOpen: !prev.days[day].isOpen }
      }
    }));
  };

  const updateTime = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...prev.days[day], [field]: value }
      }
    }));
  };

  const handleSaveSchedule = () => {
    saveVetSchedule(schedule);
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todayConfig = schedule.days[todayName];
    const timingStr = todayConfig?.isOpen ? `${todayConfig.start} - ${todayConfig.end}` : 'Closed Today';

    const updatedProfile = {
      ...profile,
      isEmergencyAvailable: schedule.emergency,
      openTodayTiming: timingStr
    };

    setProfile(updatedProfile);
    updateVetProfile(updatedProfile);
    toast.success('Clinic hours and emergency availability saved successfully!');
  };

  const handleAddSlotToDay = (e) => {
    e.preventDefault();
    if (!selectedDayForSlot) return;

    const slotStr = `${newSlotStart} - ${newSlotEnd}`;
    setSchedule(prev => {
      const currentSlots = prev.days[selectedDayForSlot].slots || [];
      return {
        ...prev,
        days: {
          ...prev.days,
          [selectedDayForSlot]: {
            ...prev.days[selectedDayForSlot],
            slots: [...currentSlots, slotStr]
          }
        }
      };
    });

    toast.success(`Added slot "${slotStr}" to ${selectedDayForSlot}`);
    setSelectedDayForSlot(null);
  };

  // -------------------------------------------------------------
  // 9. Handlers for Tele-Consult Messages Tab
  // -------------------------------------------------------------
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const text = messageInput.trim();
    setMessageInput('');
    const updatedChats = sendVetChatMessage(activeChat.id, text, 'doctor');
    setChats(updatedChats);

    // Realistic patient reply simulation
    setTimeout(() => {
      const replies = [
        'Thank you so much Doctor! We will follow this medication routine carefully.',
        'Got it Dr. Ramesh, Bruno is resting comfortably now. Will update you tomorrow.',
        'Understood Doctor, we will avoid water during grooming as instructed.',
        'Thank you for the prompt guidance! We have received the digital prescription.'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      sendVetChatMessage(activeChat.id, randomReply, 'patient');
    }, 1500);
  };

  const handleAttachRxToChat = () => {
    if (!activeChat) return;
    const latestRx = prescriptions[0];
    const attachmentText = latestRx 
      ? `Attached Digital Prescription #${latestRx.id} for ${latestRx.petName} (${latestRx.diagnosis})`
      : 'Attached Digital E-Prescription';
    
    sendVetChatMessage(activeChat.id, attachmentText, 'doctor', { type: 'prescription', rxId: latestRx?.id });
    toast.success('Prescription attached to chat thread!');
  };

  // -------------------------------------------------------------
  // 10. Handlers for Reviews Tab
  // -------------------------------------------------------------
  const handleOpenReplyBox = (reviewId) => {
    setReplyingReviewId(reviewId);
    setReplyText('');
  };

  const handlePostReviewReply = (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    const updated = addVetReviewReply(reviewId, replyText.trim());
    setReviews(updated);
    setReplyingReviewId(null);
    setReplyText('');
    toast.success('Doctor reply published under review!');
  };

  // -------------------------------------------------------------
  // 11. Handlers for Wallet Tab
  // -------------------------------------------------------------
  const handleConfirmWithdrawal = (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount) || wallet.availableBalance;
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > wallet.availableBalance) {
      toast.error(`Amount cannot exceed available balance of ₹${wallet.availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    const res = withdrawVetFunds(amount);
    if (res.success) {
      setWallet(res.wallet);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      toast.success(`Withdrawal of ₹${amount.toLocaleString('en-IN')} initiated via IMPS! Ref: ${res.txn.id}`);
    } else {
      toast.error(res.message || 'Withdrawal failed');
    }
  };

  // -------------------------------------------------------------
  // 12. Handlers for Profile Tab
  // -------------------------------------------------------------
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmenity = (amenity) => {
    setProfile(prev => {
      const exists = prev.facilities?.includes(amenity);
      const updated = exists 
        ? prev.facilities.filter(f => f !== amenity)
        : [...(prev.facilities || []), amenity];
      return { ...prev, facilities: updated };
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateVetProfile(profile);
    toast.success('Doctor & Clinic profile saved and published to directory!');
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    if (appointmentFilter === 'all') return true;
    if (appointmentFilter === 'in_queue') return app.status === 'In Queue';
    if (appointmentFilter === 'confirmed') return app.status === 'Confirmed';
    if (appointmentFilter === 'completed') return app.status === 'Completed';
    if (appointmentFilter === 'rescheduled') return app.status === 'Rescheduled';
    return true;
  });

  return (
    <>
      {/* =========================================================
          TAB 1: CLINICAL SERVICES & FEES
          ========================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinical Services & Fees</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage consultation modes, pricing, and medical specializations.</p>
            </div>
            <button 
              onClick={handleSaveServices}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition cursor-pointer">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* In-Clinic Visit Card */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${servicesState.inClinic.active ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-200 opacity-80'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><Building size={48}/></div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#0F2E23]">In-Clinic Visit</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${servicesState.inClinic.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {servicesState.inClinic.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">Physical examination at your registered clinic address.</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Service Status</span>
                  <div 
                    onClick={() => toggleService('inClinic')} 
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.inClinic.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={servicesState.inClinic.active}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-200 ${servicesState.inClinic.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#0F2E23] focus-within:bg-white transition">
                    <span className="text-slate-500 font-bold mr-2 text-sm">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.inClinic.fee} 
                      onChange={e => updateServiceFee('inClinic', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-black w-full text-slate-800" 
                      placeholder="800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Tele-Consult Card */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${servicesState.video.active ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-200 opacity-80'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><Video size={48}/></div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#0F2E23]">Video Tele-Consult</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${servicesState.video.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {servicesState.video.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">Remote diagnosis, video triage, and digital prescriptions.</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Service Status</span>
                  <div 
                    onClick={() => toggleService('video')} 
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.video.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={servicesState.video.active}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-200 ${servicesState.video.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#0F2E23] focus-within:bg-white transition">
                    <span className="text-slate-500 font-bold mr-2 text-sm">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.video.fee} 
                      onChange={e => updateServiceFee('video', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-black w-full text-slate-800" 
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Home Visit Vet Card */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${servicesState.home.active ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-200 opacity-80'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><HeartPulse size={48}/></div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-black text-[#0F2E23]">Home Visit Vet</h3>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${servicesState.home.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {servicesState.home.active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">On-site veterinary examination at patient's residence.</p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Service Status</span>
                  <div 
                    onClick={() => toggleService('home')} 
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.home.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    role="switch"
                    aria-checked={servicesState.home.active}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-200 ${servicesState.home.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-[#0F2E23] focus-within:bg-white transition">
                    <span className="text-slate-500 font-bold mr-2 text-sm">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.home.fee} 
                      onChange={e => updateServiceFee('home', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-black w-full text-slate-800" 
                      placeholder="1500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specializations Section */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Offered Specializations</h3>
                <p className="text-xs text-slate-500 mt-0.5">Specializations displayed on your public verified profile.</p>
              </div>
              <button 
                onClick={() => setShowAddSpecModal(true)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition cursor-pointer shadow-sm">
                <Plus size={14}/> Add New
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {specializations.map((spec, i) => (
                <span key={i} className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 shadow-xs group hover:border-emerald-400 transition">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {spec} 
                  <button 
                    type="button"
                    onClick={() => handleRemoveSpecialization(spec)} 
                    className="text-slate-400 hover:text-rose-600 transition ml-1 p-0.5 rounded hover:bg-rose-50"
                    title={`Remove ${spec}`}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: APPOINTMENTS & QUEUE
          ========================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Appointments & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage booked appointments, patient check-ins, and consultation queue.</p>
            </div>
            <button 
              onClick={() => setShowAddAppModal(true)}
              className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition cursor-pointer">
              <Plus size={16} /> New Walk-In Patient
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'all', label: 'All Bookings', count: appointments.length },
              { id: 'in_queue', label: 'In Queue', count: appointments.filter(a => a.status === 'In Queue').length },
              { id: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length },
              { id: 'rescheduled', label: 'Rescheduled', count: appointments.filter(a => a.status === 'Rescheduled').length },
              { id: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setAppointmentFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                  appointmentFilter === f.id
                    ? 'bg-[#0F2E23] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${appointmentFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="h-[360px] bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-[#0F2E23] rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                <Calendar size={28} />
              </div>
              <h3 className="text-lg font-black text-[#0F2E23]">No Appointments in this view</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">When patients book appointments from your public directory or when you add a walk-in, they will appear here.</p>
              <button
                onClick={() => setShowAddAppModal(true)}
                className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#163e30] transition shadow-sm"
              >
                + Add Walk-In Patient
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-[#0F2E23] text-lg">
                        {app.petName} 
                        <span className="text-sm font-bold text-slate-500 ml-2">({app.petBreed || app.petSpecies})</span>
                      </h3>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'Rescheduled' ? 'bg-purple-100 text-purple-800' :
                        app.status === 'Confirmed' ? 'bg-sky-100 text-sky-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-3">
                      Owner: {app.ownerName} • {app.ownerPhone} • Fee: ₹{app.fee}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12}/> {app.bookingDate}
                      </span>
                      <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Clock3 size={12}/> {app.bookingTimeSlot}
                      </span>
                      <span className="bg-sky-50 text-sky-800 border border-sky-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Stethoscope size={12}/> {app.bookingMode || 'In-Clinic Visit'}
                      </span>
                    </div>

                    {app.petSymptoms && (
                      <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-slate-800">Reason / Symptoms:</strong> {app.petSymptoms}
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 justify-end md:w-40">
                    {app.status !== 'Completed' ? (
                      <>
                        <button 
                          onClick={() => handleCompleteAppointment(app.id)}
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition shadow-sm w-full cursor-pointer flex items-center justify-center gap-1.5">
                          <Check size={14}/> Complete
                        </button>
                        <button 
                          onClick={() => handleOpenRescheduleModal(app)}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition w-full cursor-pointer flex items-center justify-center gap-1.5">
                          <Clock size={14}/> Reschedule
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          setNewRx(p => ({
                            ...p,
                            petName: app.petName,
                            petSpecies: app.petSpecies || 'Dog',
                            petBreed: app.petBreed || '',
                            ownerName: app.ownerName,
                            ownerPhone: app.ownerPhone,
                            symptoms: app.petSymptoms || ''
                          }));
                          setShowNewRxModal(true);
                        }}
                        className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#163e30] transition shadow-sm w-full cursor-pointer flex items-center justify-center gap-1.5">
                        <FileText size={14}/> Issue Rx
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: E-PRESCRIPTIONS & RECORDS
          ========================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">E-Prescriptions & Records</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Issue digital medical records, generate prescription PDFs, and track patient histories.</p>
            </div>
            <button 
              onClick={() => setShowNewRxModal(true)}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition whitespace-nowrap cursor-pointer">
              <Plus size={16} /> New Prescription
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black">
                  <tr>
                    <th className="px-6 py-4">Rx Ref & Date</th>
                    <th className="px-6 py-4">Patient & Owner</th>
                    <th className="px-6 py-4">Diagnosis</th>
                    <th className="px-6 py-4">Prescribed Medicines</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-800 block">{rx.id}</span>
                        <span className="text-[11px] text-slate-400">{rx.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                            {rx.petName ? rx.petName.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p className="text-slate-800 font-bold">{rx.petName}</p>
                            <p className="text-[11px] text-slate-400 font-semibold">{rx.petSpecies} • {rx.petBreed}</p>
                            <p className="text-[10px] text-slate-500">{rx.ownerName} ({rx.ownerPhone})</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-700 font-bold block">{rx.diagnosis}</span>
                        {rx.followUpDate && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                            Follow-up: {rx.followUpDate}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 space-y-0.5 max-w-xs">
                          {rx.medicines && rx.medicines.slice(0, 2).map((m, mi) => (
                            <div key={mi} className="truncate font-medium">
                              • <strong className="text-slate-700">{m.name}</strong> ({m.dosage})
                            </div>
                          ))}
                          {rx.medicines && rx.medicines.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-bold">+{rx.medicines.length - 2} more medications</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedRxForPdf(rx)}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-1.5 transition cursor-pointer">
                          <FileText size={14}/> View / PDF Rx
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: CLINIC HOURS & SLOTS
          ========================================================= */}
      {activeTab === 'hours' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinic Hours & Slots</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your weekly operating schedule, time slots, and emergency availability.</p>
            </div>
            <button 
              onClick={handleSaveSchedule}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition cursor-pointer">
              <Save size={16} /> Save Schedule
            </button>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-black text-rose-800 flex items-center gap-2">
                <Clock3 size={18}/> 24/7 Emergency & Critical Care Availability
              </h3>
              <p className="text-xs text-rose-700 font-medium mt-1">
                Show up with an Emergency Badge in odd-hour vet searches and critical triage filters.
              </p>
            </div>
            <div 
              onClick={() => setSchedule(prev => ({ ...prev, emergency: !prev.emergency }))}
              className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${schedule.emergency ? 'bg-rose-600' : 'bg-slate-300'}`}
              role="switch"
              aria-checked={schedule.emergency}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-200 ${schedule.emergency ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-2">Weekly Consultation Schedule</h3>
            
            {Object.entries(schedule.days).map(([day, config]) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3.5 border-b border-slate-100 last:border-0">
                <div className="w-36 flex items-center justify-between sm:justify-start gap-3">
                  <span className={`text-sm font-black ${!config.isOpen ? 'text-slate-400' : 'text-slate-800'}`}>{day}</span>
                  <div 
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${!config.isOpen ? 'bg-slate-200' : 'bg-emerald-500'}`}
                    role="switch"
                    aria-checked={config.isOpen}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${!config.isOpen ? 'left-0.5' : 'right-0.5'}`}></div>
                  </div>
                </div>

                {config.isOpen ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Open:</span>
                      <input 
                        type="time" 
                        value={config.start}
                        onChange={(e) => updateTime(day, 'start', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]" 
                      />
                    </div>
                    <span className="text-slate-400 font-bold text-xs">to</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Close:</span>
                      <input 
                        type="time" 
                        value={config.end}
                        onChange={(e) => updateTime(day, 'end', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]" 
                      />
                    </div>

                    {/* Slots display */}
                    {config.slots && config.slots.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center ml-2">
                        {config.slots.map((s, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={() => setSelectedDayForSlot(day)}
                      className="text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:text-emerald-800 ml-auto flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer">
                      <Plus size={12}/> Add Custom Slot
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-lg w-fit">
                    Clinic Closed on {day}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: TELE-CONSULT MESSAGES
          ========================================================= */}
      {activeTab === 'messages' && (
        <div className="flex h-[620px] -m-8 sm:-m-10 border border-slate-200 overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-300">
          {/* Left Pane - Chat List */}
          <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Patient Consultations</h3>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {chats.length} Active
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition ${
                    activeChatId === chat.id 
                      ? 'border-l-4 border-emerald-600 bg-emerald-50/50' 
                      : 'border-l-4 border-transparent hover:bg-slate-50'
                  }`}
                >
                  <img src={chat.avatar} alt={chat.patientName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-black text-[#0F2E23] truncate">{chat.patientName}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{chat.lastTime}</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-700 truncate mb-1">{chat.petName} ({chat.petBreed})</p>
                    <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane - Active Conversation */}
          <div className="flex-1 bg-slate-50 flex flex-col relative min-w-0">
            {activeChat ? (
              <>
                {/* Header */}
                <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img src={activeChat.avatar} alt={activeChat.patientName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="text-sm font-black text-[#0F2E23]">{activeChat.patientName}</h4>
                      <p className="text-xs font-bold text-emerald-700">{activeChat.petName} ({activeChat.petBreed}) • {activeChat.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveVideoCall(activeChat)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-black uppercase tracking-widest shadow-sm transition cursor-pointer">
                      <Video size={16} /> Start Video Consult
                    </button>
                    <button 
                      onClick={handleAttachRxToChat}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">
                      <FileText size={15} /> Attach Rx
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
                  {activeChat.messages && activeChat.messages.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-2xl shadow-xs text-sm ${
                        msg.sender === 'doctor' 
                          ? 'bg-[#0F2E23] text-white rounded-tr-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}>
                        <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachment && msg.attachment.type === 'prescription' && (
                          <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between gap-3 bg-black/10 p-2 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              <FileText size={14} />
                              <span className="text-xs font-bold">Digital Prescription</span>
                            </div>
                            <button 
                              onClick={() => {
                                const target = prescriptions.find(p => p.id === msg.attachment.rxId) || prescriptions[0];
                                if (target) setSelectedRxForPdf(target);
                              }}
                              className="text-[10px] bg-white text-[#0F2E23] px-2 py-0.5 rounded font-black uppercase tracking-wider hover:bg-emerald-50">
                              View
                            </button>
                          </div>
                        )}
                        <p className={`text-[10px] font-bold mt-1.5 text-right ${msg.sender === 'doctor' ? 'text-emerald-200/80' : 'text-slate-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Input Area */}
                <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:border-[#0F2E23] focus-within:bg-white transition">
                    <button 
                      type="button" 
                      onClick={() => toast.success('Select diagnostic report or lab image to upload')}
                      className="p-2 text-slate-400 hover:text-[#0F2E23] transition cursor-pointer">
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="text" 
                      placeholder={`Type clinical advice or message for ${activeChat.patientName}...`}
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-800 placeholder-slate-400" 
                    />
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-[#0F2E23] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1a4a38] transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <Send size={14} /> Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">
                Select a patient to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: PATIENT REVIEWS
          ========================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Patient Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Verified patient ratings, clinical feedback, and official doctor replies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F2E23] text-white rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center">
              <h3 className="text-5xl font-black text-amber-300 mb-2">4.9</h3>
              <div className="flex items-center gap-1 text-amber-300 mb-3">
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <StarHalf size={20} fill="currentColor" />
              </div>
              <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">Based on {reviews.length * 40} reviews</p>
            </div>
            
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">{star} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: star === 5 ? '88%' : star === 4 ? '12%' : '0%' }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-8 text-right">{star === 5 ? '108' : star === 4 ? '16' : '0'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Verified Patient Testimonials</h3>
            
            {reviews.map(rev => (
              <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      {rev.avatarInitial || rev.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F2E23]">{rev.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{rev.time} • For {rev.petType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "text-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 font-medium leading-relaxed">{rev.comment}</p>

                {/* Doctor's verified response */}
                {rev.reply && (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 mt-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#0F2E23]">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>{profile.name} (Verified Doctor Reply)</span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-auto">{rev.reply.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{rev.reply.text}</p>
                  </div>
                )}

                {/* Reply action */}
                {!rev.reply && (
                  <div className="pt-2">
                    {replyingReviewId === rev.id ? (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-200">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your professional response to this patient..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F2E23]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition cursor-pointer">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostReviewReply(rev.id)}
                            className="px-4 py-1.5 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#163e30] transition cursor-pointer shadow-xs">
                            Post Public Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleOpenReplyBox(rev.id)}
                        className="text-emerald-700 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-800 transition cursor-pointer">
                        <MessageSquare size={14}/> Reply publicly as Doctor
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: WALLET & PAYOUTS
          ========================================================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage consultation earnings, available balances, and instant bank settlements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Balance Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">Available Balance</span>
                <h3 className="text-4xl font-black text-[#0F2E23] mb-1">₹{wallet.availableBalance.toLocaleString('en-IN')}</h3>
                <p className="text-xs font-bold text-emerald-600 mb-6 flex items-center gap-1">
                  <CheckCircle2 size={14}/> Ready for instant bank settlement
                </p>
              </div>
              <button 
                onClick={() => {
                  setWithdrawAmount(wallet.availableBalance.toString());
                  setShowWithdrawModal(true);
                }}
                className="w-full bg-[#0F2E23] hover:bg-[#1a4a38] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-sm cursor-pointer flex items-center justify-center gap-2">
                Withdraw to Bank Account →
              </button>
            </div>

            {/* Lifetime Revenue Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">Lifetime Clinical Revenue</span>
              <h3 className="text-4xl font-black text-[#0F2E23] mb-1">₹{wallet.lifetimeRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-xs font-bold text-slate-500 mt-2">From 142 completed patient consultations</p>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 font-bold">
                Pawora Commission: 0% Direct Provider Tier
              </div>
            </div>

            {/* Default Bank Account Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Default Settlement Account</span>
              <h4 className="text-base font-black text-[#0F2E23] mb-1">{wallet.bankAccount?.bankName || 'HDFC Bank Limited'}</h4>
              <p className="text-xs font-mono text-slate-500 mb-3">A/C: {wallet.bankAccount?.accountNumber} (IFSC: {wallet.bankAccount?.ifsc})</p>
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md w-fit">
                ✓ Verified for Instant IMPS
              </span>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-4">Recent Settlements & Payouts</h3>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Settled Amount</th>
                      <th className="px-6 py-4">Payout Method</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Invoice / Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {wallet.transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 text-slate-800 font-mono font-bold">{txn.id}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{txn.date}</td>
                        <td className="px-6 py-4 text-slate-800 font-black text-sm">₹{txn.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{txn.type || 'Bank Payout'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                            <CheckCircle2 size={12}/> {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedTxnForInvoice(txn)}
                            className="text-emerald-700 hover:text-emerald-800 font-bold text-xs uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer">
                            <Download size={14}/> Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 8: CLINIC REGISTRATION & PROFILE
          ========================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinic Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage doctor credentials, clinic amenities, and public directory details.</p>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition cursor-pointer">
              <Save size={16} /> Save & Publish
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-2">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0 shadow-xs">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-slate-400" />
              )}
            </div>
            <div>
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest block mb-2">Hospital / Profile Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0F2E23] file:text-white hover:file:bg-[#163e30] transition cursor-pointer" />
              <p className="text-[10px] text-slate-500 mt-2 font-bold">Recommended: Square image (1:1 ratio), max 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Doctor Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">VCI Registration Number</label>
              <input type="text" name="vciRegistration" value={profile.vciRegistration} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Degrees & Qualifications</label>
              <input type="text" name="degrees" value={profile.degrees} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Clinic Hospital Name</label>
              <input type="text" name="clinicName" value={profile.clinicName} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Clinic Full Address</label>
              <input type="text" name="address" value={profile.address} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Professional Bio & Philosophy</label>
              <textarea name="bio" rows={3} value={profile.bio} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0F2E23] focus:bg-white" />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-4">Hospital Amenities & Diagnostic Equipment Available</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Digital X-Ray', 
                'In-House Blood Lab', 
                'Surgical OT (Isoflurane)', 
                'Pharmacy On-Site', 
                'Emergency Oxygen ICU', 
                'Ultrasound Doppler', 
                'Ultrasonic Dental Scaler', 
                'Medicated Med-Bath'
              ].map((amenity, i) => {
                const checked = profile.facilities?.includes(amenity);
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition select-none ${checked ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'}`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition ${checked ? 'bg-[#0F2E23] text-white' : 'border border-slate-300 bg-white'}`}>
                      {checked && <Check size={14} />}
                    </div>
                    <span className={`text-xs font-bold ${checked ? 'text-[#0F2E23]' : 'text-slate-700'}`}>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      )}

      {/* =========================================================
          MODAL 1: RESCHEDULE APPOINTMENT MODAL
          ========================================================= */}
      {selectedAppForReschedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-[#0F2E23] flex items-center gap-2">
                <Clock size={20} className="text-emerald-700" /> Reschedule Appointment
              </h3>
              <button onClick={() => setSelectedAppForReschedule(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-700 font-bold">Patient: <span className="text-[#0F2E23]">{selectedAppForReschedule.petName}</span> ({selectedAppForReschedule.petBreed})</p>
              <p className="text-slate-500">Owner: {selectedAppForReschedule.ownerName} • {selectedAppForReschedule.ownerPhone}</p>
              <p className="text-slate-500">Current Slot: <span className="text-rose-600 font-bold">{selectedAppForReschedule.bookingDate} ({selectedAppForReschedule.bookingTimeSlot})</span></p>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">New Appointment Date</label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">New Time Slot</label>
                <select 
                  value={rescheduleTimeSlot}
                  onChange={e => setRescheduleTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                >
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'].map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">Reason / Note to Patient</label>
                <input 
                  type="text"
                  placeholder="e.g., Clinic emergency OT schedule or client requested shift"
                  value={rescheduleNote}
                  onChange={e => setRescheduleNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedAppForReschedule(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-sm">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: WALK-IN APPOINTMENT MODAL
          ========================================================= */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#0F2E23]">Book In-Clinic Walk-In Patient</h3>
                <p className="text-xs text-slate-500 font-medium">Add patient directly into today's queue.</p>
              </div>
              <button onClick={() => setShowAddAppModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWalkInAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Pet Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Bruno" 
                    value={newApp.petName} 
                    onChange={e => setNewApp({...newApp, petName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Species</label>
                  <select 
                    value={newApp.petSpecies} 
                    onChange={e => setNewApp({...newApp, petSpecies: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other Pet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Pet Breed</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Golden Retriever" 
                    value={newApp.petBreed} 
                    onChange={e => setNewApp({...newApp, petBreed: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Consultation Mode</label>
                  <select 
                    value={newApp.bookingMode} 
                    onChange={e => setNewApp({...newApp, bookingMode: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  >
                    <option value="In-Clinic Visit">In-Clinic Visit</option>
                    <option value="24/7 Video Tele-Consult">24/7 Video Tele-Consult</option>
                    <option value="Home Visit Vet">Home Visit Vet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Owner Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Rahul Sharma" 
                    value={newApp.ownerName} 
                    onChange={e => setNewApp({...newApp, ownerName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Owner Contact Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 98765 43210" 
                    value={newApp.ownerPhone} 
                    onChange={e => setNewApp({...newApp, ownerPhone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newApp.bookingDate} 
                    onChange={e => setNewApp({...newApp, bookingDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Time Slot</label>
                  <select 
                    value={newApp.bookingTimeSlot} 
                    onChange={e => setNewApp({...newApp, bookingTimeSlot: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  >
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Chief Symptoms / Complaint</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Skin itchiness, routine vaccination, limping on left paw" 
                  value={newApp.petSymptoms} 
                  onChange={e => setNewApp({...newApp, petSymptoms: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-sm">
                  Add to Patient Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD SPECIALIZATION MODAL
          ========================================================= */}
      {showAddSpecModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#0F2E23]">Add Specialization</h3>
              <button onClick={() => setShowAddSpecModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Select from standard specializations:</label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                {VET_SPECIALIZATIONS.filter(s => s !== 'All Specializations' && !specializations.includes(s)).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSpecialization(s)}
                    className="text-xs font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Or type a custom specialization:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Exotic Avian Surgery"
                  value={newSpecInput}
                  onChange={e => setNewSpecInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                />
                <button
                  type="button"
                  onClick={() => handleAddSpecialization()}
                  className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#163e30] transition cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: NEW DIGITAL PRESCRIPTION MODAL
          ========================================================= */}
      {showNewRxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-[#0F2E23] flex items-center gap-2">
                  <FileText className="text-emerald-600" size={22} /> Generate Digital E-Prescription
                </h3>
                <p className="text-xs text-slate-500 font-medium">Create and issue verifiable clinical prescriptions with Rx batch ID.</p>
              </div>
              <button onClick={() => setShowNewRxModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-5">
              {/* Patient and Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Pet Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Bruno" 
                    value={newRx.petName} 
                    onChange={e => setNewRx({...newRx, petName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Species / Breed</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dog • Golden Retriever" 
                    value={newRx.petBreed} 
                    onChange={e => setNewRx({...newRx, petBreed: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Weight & Age</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 28 kg • 3.5 Yrs" 
                    value={newRx.petWeight} 
                    onChange={e => setNewRx({...newRx, petWeight: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Owner Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Aarav Sharma" 
                    value={newRx.ownerName} 
                    onChange={e => setNewRx({...newRx, ownerName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Owner Contact Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98234 56789" 
                    value={newRx.ownerPhone} 
                    onChange={e => setNewRx({...newRx, ownerPhone: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Vitals (Temp / Pulse)</label>
                  <input 
                    type="text" 
                    placeholder="101.4 °F, 88 bpm" 
                    value={newRx.vitals.temp} 
                    onChange={e => setNewRx({...newRx, vitals: {...newRx.vitals, temp: e.target.value}})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="text-xs font-black text-[#0F2E23] uppercase tracking-wider block mb-1.5">Clinical Diagnosis *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Acute Otitis Externa / Bilateral Ear Canal Inflammation" 
                  value={newRx.diagnosis} 
                  onChange={e => setNewRx({...newRx, diagnosis: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                />
              </div>

              {/* Medicines Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#0F2E23] uppercase tracking-wider">Prescribed Medicines & Dosages</label>
                  <button 
                    type="button" 
                    onClick={handleAddMedicineRow}
                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <Plus size={14}/> Add Medicine
                  </button>
                </div>

                {newRx.medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                    <div className="sm:col-span-4">
                      <input 
                        type="text" 
                        placeholder="Medicine name (e.g. Otolin Drops)" 
                        value={med.name} 
                        onChange={e => handleUpdateMedicine(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input 
                        type="text" 
                        placeholder="Dosage (e.g. 4 drops / 1 tab)" 
                        value={med.dosage} 
                        onChange={e => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Duration (7 days)" 
                        value={med.duration} 
                        onChange={e => handleUpdateMedicine(idx, 'duration', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input 
                        type="text" 
                        placeholder="Instructions" 
                        value={med.instructions} 
                        onChange={e => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-800 outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveMedicineRow(idx)}
                        disabled={newRx.medicines.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice & Follow-Up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Dietary & Home Care Advice</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Keep ears dry, avoid chicken protein, clean water daily" 
                    value={newRx.advice} 
                    onChange={e => setNewRx({...newRx, advice: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">Follow-Up Assessment Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. In 7 days (Sept 12, 2026)" 
                    value={newRx.followUpDate} 
                    onChange={e => setNewRx({...newRx, followUpDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowNewRxModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-md flex items-center gap-2">
                  <Check size={16} /> Generate & Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: PDF RX VIEWER / PRINTABLE MODAL
          ========================================================= */}
      {selectedRxForPdf && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-700" size={22} />
                <span className="text-sm font-black text-[#0F2E23]">Electronic Medical Prescription ({selectedRxForPdf.id})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer shadow-sm">
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button onClick={() => setSelectedRxForPdf(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Prescription Layout */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-6 bg-white shadow-xs">
              {/* Clinic & Doctor Letterhead */}
              <div className="border-b-2 border-[#0F2E23] pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-serif font-black text-[#0F2E23] tracking-tight">{selectedRxForPdf.clinicName || profile.clinicName}</h2>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{selectedRxForPdf.doctorName || profile.name} • {selectedRxForPdf.doctorDegrees || profile.degrees}</p>
                  <p className="text-[11px] font-mono text-slate-500">VCI Reg No: {selectedRxForPdf.vciRegistration || profile.vciRegistration}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{selectedRxForPdf.clinicAddress || profile.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 block mb-1">
                    {selectedRxForPdf.id}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{selectedRxForPdf.date}</span>
                </div>
              </div>

              {/* Patient Information Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Patient</span>
                  <span className="font-black text-slate-800 text-sm">{selectedRxForPdf.petName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Species & Breed</span>
                  <span className="font-bold text-slate-700">{selectedRxForPdf.petSpecies} ({selectedRxForPdf.petBreed})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Owner Name</span>
                  <span className="font-bold text-slate-700">{selectedRxForPdf.ownerName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Owner Phone</span>
                  <span className="font-bold text-slate-700">{selectedRxForPdf.ownerPhone}</span>
                </div>
              </div>

              {/* Diagnosis & Vitals */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Diagnosis:</span>
                  <span className="text-sm font-black text-[#0F2E23] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                    {selectedRxForPdf.diagnosis}
                  </span>
                </div>
                {selectedRxForPdf.symptoms && (
                  <p className="text-xs text-slate-600"><strong className="text-slate-700">Presenting Symptoms:</strong> {selectedRxForPdf.symptoms}</p>
                )}
              </div>

              {/* Rx Symbol and Medications */}
              <div className="space-y-3 pt-2">
                <div className="text-2xl font-serif font-black text-[#0F2E23]">℞ <span className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400">Prescription Details</span></div>
                
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 uppercase tracking-wider text-[10px] font-black text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Medicine Name</th>
                      <th className="p-2.5">Dosage</th>
                      <th className="p-2.5">Frequency</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRxForPdf.medicines && selectedRxForPdf.medicines.map((med, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-black text-slate-800">{med.name}</td>
                        <td className="p-2.5 font-bold text-slate-700">{med.dosage}</td>
                        <td className="p-2.5 text-slate-600">{med.frequency}</td>
                        <td className="p-2.5 text-slate-600 font-bold">{med.duration}</td>
                        <td className="p-2.5 text-slate-500 italic">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advice and Next Follow-up */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {selectedRxForPdf.advice && (
                  <p className="text-slate-600"><strong className="text-slate-800">Diet & Care Instructions:</strong> {selectedRxForPdf.advice}</p>
                )}
                {selectedRxForPdf.followUpDate && (
                  <p className="text-slate-600"><strong className="text-slate-800">Next Scheduled Review:</strong> {selectedRxForPdf.followUpDate}</p>
                )}
              </div>

              {/* Footer Stamp & Signature */}
              <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-end">
                <div className="text-[10px] text-slate-400 font-mono">
                  Digitally Authenticated through Pawora Health Network<br/>
                  Record ID: {selectedRxForPdf.id}
                </div>
                <div className="text-right space-y-1">
                  <div className="w-32 h-10 border-b border-slate-400 mx-auto flex items-end justify-center pb-1">
                    <span className="text-xs font-serif italic text-emerald-800 font-bold">Dr. Ramesh Kumar</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">Authorized Signature & Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: WITHDRAW FUNDS MODAL
          ========================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#0F2E23]">Instant Bank Settlement</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Available for Payout</span>
              <h4 className="text-3xl font-black text-[#0F2E23]">₹{wallet.availableBalance.toLocaleString('en-IN')}</h4>
            </div>

            <form onSubmit={handleConfirmWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">Withdrawal Amount (₹)</label>
                <input 
                  type="number" 
                  min="100" 
                  max={wallet.availableBalance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:border-[#0F2E23]"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-black text-[#0F2E23]">{wallet.bankAccount?.bankName}</p>
                <p className="text-slate-500 font-mono">Account: {wallet.bankAccount?.accountNumber}</p>
                <p className="text-slate-500 font-mono">IFSC: {wallet.bankAccount?.ifsc}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Instant IMPS Transfer • No platform settlement fee</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-sm">
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 7: SETTLEMENT INVOICE / VOUCHER MODAL
          ========================================================= */}
      {selectedTxnForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#0F2E23]">Payout Settlement Voucher</h3>
              <button onClick={() => setSelectedTxnForInvoice(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Voucher ID</span>
                <span className="font-mono font-black text-slate-800">{selectedTxnForInvoice.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Settlement Date</span>
                <span className="font-bold text-slate-800">{selectedTxnForInvoice.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Beneficiary Doctor</span>
                <span className="font-bold text-slate-800">{profile.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Destination Bank</span>
                <span className="font-bold text-slate-800">{wallet.bankAccount?.bankName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold">Transfer Status</span>
                <span className="font-black text-emerald-600">{selectedTxnForInvoice.status} (IMPS Approved)</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-[#0F2E23]">
                <span>Net Settled Amount</span>
                <span>₹{selectedTxnForInvoice.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer">
                <Printer size={14}/> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 8: SIMULATED VIDEO TELE-CONSULT MODAL
          ========================================================= */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full h-[600px] shadow-2xl overflow-hidden flex flex-col relative border border-slate-800">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                <span className="text-white font-mono text-sm font-bold bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  Live: {formatCallTime(videoCallDuration)}
                </span>
                <span className="text-white text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full">
                  Tele-Consult with {activeVideoCall.patientName}
                </span>
              </div>
              <button 
                onClick={() => {
                  toast.success(`Video consultation ended. Duration: ${formatCallTime(videoCallDuration)}`);
                  setActiveVideoCall(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-full bg-black/40">
                <X size={20} />
              </button>
            </div>

            {/* Main Video Screen (Patient Video Simulation) */}
            <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80" 
                alt="Patient pet" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-xs text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                <PawPrint size={14} className="text-emerald-400" />
                <span>{activeVideoCall.petName} ({activeVideoCall.petBreed}) - Patient Feed</span>
              </div>

              {/* Doctor Thumbnail */}
              <div className="absolute top-16 right-6 w-40 h-28 bg-slate-800 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xl z-20">
                {!isCamOff ? (
                  <img src={profile.avatar} alt="Doctor" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs">
                    <VideoOff size={20} className="mb-1" /> Camera Off
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                  You
                </div>
              </div>
            </div>

            {/* Bottom Call Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4 z-20">
              <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                title={isMicMuted ? 'Unmute' : 'Mute'}>
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button 
                onClick={() => setIsCamOff(!isCamOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${isCamOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                title={isCamOff ? 'Turn Cam On' : 'Turn Cam Off'}>
                {isCamOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>

              <button 
                onClick={() => {
                  setNewRx(p => ({
                    ...p,
                    petName: activeVideoCall.petName,
                    ownerName: activeVideoCall.patientName,
                    ownerPhone: activeVideoCall.phone
                  }));
                  setShowNewRxModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer">
                <FileText size={16} /> Prescribe Rx
              </button>

              <button 
                onClick={() => {
                  toast.success(`Video consultation ended. Duration: ${formatCallTime(videoCallDuration)}`);
                  setActiveVideoCall(null);
                }}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow-lg cursor-pointer"
                title="End Consultation">
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 9: ADD CUSTOM TIME SLOT MODAL (HOURS TAB)
          ========================================================= */}
      {selectedDayForSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0F2E23]">Add Custom Slot for {selectedDayForSlot}</h3>
              <button onClick={() => setSelectedDayForSlot(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSlotToDay} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newSlotStart}
                    onChange={e => setNewSlotStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newSlotEnd}
                    onChange={e => setNewSlotEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0F2E23]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setSelectedDayForSlot(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#163e30] transition">
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VetProviderContent;
