import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, Star, MessageSquare, Clock, CreditCard, Building, Check, Video, Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, Download, Edit3, HeartPulse, StarHalf, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateVetProfile, getStoredVetDoctors, getVetAppointments } from '../data/veterinaryData.js';

const VetProviderContent = ({ activeTab }) => {
  const [profile, setProfile] = useState({
    id: 'my-vet-profile',
    avatar: 'https://i.pravatar.cc/150?img=12', // default placeholder
    name: 'Dr. Ramesh Kumar',
    vciRegistration: 'VCI/2010/KA-08492',
    degrees: 'B.V.Sc & A.H, M.V.Sc (Veterinary Surgery)',
    clinicName: 'Pawora Luxury Vet Clinic & Diagnostic Center',
    address: 'MG Road, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    experienceDisplay: '14+ Years Exp.',
    experienceYears: 14,
    rating: 5.0,
    reviewsCount: 0,
    phone: '+91 98450 88219',
    inClinicFee: 800,
    videoConsultFee: 500,
    homeVisitFee: 1500,
    petCategories: ['Dogs', 'Cats', 'Birds', 'All'],
    specializations: ['General Physician & Vaccines', 'Orthopedics & Soft Tissue Surgery'],
    isVerified: true,
    isEmergencyAvailable: true,
    isHomeVisitAvailable: true,
    openTodayTiming: '09:00 AM - 09:00 PM',
    bio: 'Dedicated small animal surgeon.',
    facilities: ['Digital X-Ray', 'In-House Blood Lab'],
    consultationModes: ['In-Clinic Visit', '24/7 Video Tele-Consult', 'Home Visit Vet']
  });

  const [appointments, setAppointments] = useState([]);
  
  const [schedule, setSchedule] = useState({
    emergency: true,
    days: {
      Monday: { isOpen: true, start: '09:00', end: '21:00' },
      Tuesday: { isOpen: true, start: '09:00', end: '21:00' },
      Wednesday: { isOpen: true, start: '09:00', end: '21:00' },
      Thursday: { isOpen: true, start: '09:00', end: '21:00' },
      Friday: { isOpen: true, start: '09:00', end: '21:00' },
      Saturday: { isOpen: true, start: '09:00', end: '21:00' },
      Sunday: { isOpen: false, start: '09:00', end: '21:00' },
    }
  });

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

  const [messageInput, setMessageInput] = useState('');
  
  const [servicesState, setServicesState] = useState({
    inClinic: { active: true, fee: 800 },
    video: { active: true, fee: 500 },
    home: { active: true, fee: 1500 },
  });

  const toggleService = (key) => setServicesState(p => ({ ...p, [key]: { ...p[key], active: !p[key].active }}));
  const updateServiceFee = (key, val) => setServicesState(p => ({ ...p, [key]: { ...p[key], fee: val }}));

  useEffect(() => {
    // Load my appointments
    const allApps = getVetAppointments();
    const myApps = allApps.filter(app => app.doctorId === profile.id || app.vetId === profile.id || (!app.doctorId && !app.vetId)); // fallback
    setAppointments(myApps);

    // Load existing profile from storage if it exists
    const docs = getStoredVetDoctors();
    const myDoc = docs.find(d => d.id === profile.id);
    if(myDoc) {
      setProfile(myDoc);
    } else {
      // Auto-publish on first load so we show up on the listing page
      updateVetProfile(profile);
    }
  }, [activeTab]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({...prev, [name]: value}));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({...prev, avatar: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateVetProfile(profile);
    toast.success('Profile saved and published to directory!');
  };

  return (
    <>
      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinic Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional details and clinic amenities.</p>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save & Publish
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-2">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
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
              <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">VCI Registration Number</label>
              <input type="text" name="vciRegistration" value={profile.vciRegistration} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Degrees & Qualifications</label>
              <input type="text" name="degrees" value={profile.degrees} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Clinic Hospital Name</label>
              <input type="text" name="clinicName" value={profile.clinicName} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Clinic Full Address</label>
              <input type="text" name="address" value={profile.address} onChange={handleProfileChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" />
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-6">Hospital Amenities & Labs Available</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Digital X-Ray', 'In-House Blood Lab', 'Surgical OT (Isoflurane)', 'Pharmacy On-Site', 'Emergency Oxygen ICU', 'Ultrasound Doppler', 'Ultrasonic Dental Scaler', 'Medicated Med-Bath'].map((amenity, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="w-5 h-5 bg-[#0F2E23] rounded flex items-center justify-center text-white">
                    <Check size={14} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your earnings and bank settlements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Available Balance</span>
              <h3 className="text-4xl font-black text-[#0F2E23] mb-2">₹1,647</h3>
              <p className="text-sm font-bold text-emerald-600 mb-6">Ready for instant bank settlement</p>
              <button 
                onClick={() => toast.success('Withdrawal request of ₹1,647 initiated. It will reflect in your account within 24 hours.', { duration: 5000 })}
                className="w-full bg-[#0F2E23] hover:bg-[#1a4a38] text-white py-3 rounded-xl text-sm font-black transition">
                Withdraw to Bank Account →
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Lifetime Clinical Revenue</span>
              <h3 className="text-4xl font-black text-[#0F2E23] mb-2">₹35,897</h3>
              <p className="text-sm font-bold text-slate-500 mt-2">From 142 completed consultations</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-4">Default Bank Account</span>
              <h4 className="text-lg font-black text-[#0F2E23] mb-1">HDFC Bank Limited</h4>
              <p className="text-sm font-mono text-slate-500 mb-4">A/C: **** **** 4892 (IFSC: HDFC0001248)</p>
              <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black px-3 py-1 rounded-md w-fit">
                ✓ Verified for Instant IMPS
              </span>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-4">Recent Settlements & Payouts</h3>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-slate-800 font-mono font-bold">TXN-9842A1</td>
                      <td className="px-6 py-4 text-slate-500">Aug 28, 2026</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">₹4,500</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                          <CheckCircle2 size={12}/> Settled
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest inline-flex items-center gap-1"><Download size={14}/> PDF</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-slate-800 font-mono font-bold">TXN-8731B4</td>
                      <td className="px-6 py-4 text-slate-500">Aug 21, 2026</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">₹2,800</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                          <CheckCircle2 size={12}/> Settled
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest inline-flex items-center gap-1"><Download size={14}/> PDF</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-slate-800 font-mono font-bold">TXN-7620C9</td>
                      <td className="px-6 py-4 text-slate-500">Aug 14, 2026</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">₹3,250</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                          <CheckCircle2 size={12}/> Settled
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest inline-flex items-center gap-1"><Download size={14}/> PDF</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="flex h-[600px] -m-8 sm:-m-10 border-t border-slate-100 overflow-hidden rounded-b-3xl animate-in fade-in zoom-in-95 duration-300">
          {/* Left Pane - Chat List */}
          <div className="w-1/3 border-r border-slate-100 bg-white flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#0F2E23] uppercase tracking-widest">Patient Inquiries</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-start gap-3 p-4 border-l-4 border-emerald-500 bg-emerald-50/30 cursor-pointer">
                <img src="https://i.pravatar.cc/150?img=11" alt="Aarav" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-black text-[#0F2E23] truncate">Aarav Sharma</h4>
                    <span className="text-[10px] font-bold text-slate-400">10:45 AM</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mb-1">Bruno (Golden Retriever)</p>
                  <p className="text-xs text-slate-500 truncate">Got it Doctor, I booked the 11:00 AM slot. See you shortly at t...</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border-l-4 border-transparent hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                <img src="https://i.pravatar.cc/150?img=5" alt="Priya" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-black text-slate-700 truncate">Priya Sundaram</h4>
                    <span className="text-[10px] font-bold text-slate-400">Yesterday</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mb-1">Coco (Shih Tzu)</p>
                  <p className="text-xs text-slate-500 truncate">Hi Priya, as long as she has no fever or lethargy, we can proc...</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border-l-4 border-transparent hover:bg-slate-50 cursor-pointer">
                <img src="https://i.pravatar.cc/150?img=8" alt="Vikram" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-black text-slate-700 truncate">Vikram Joshi</h4>
                    <span className="text-[10px] font-bold text-slate-400">Aug 30</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mb-1">Milo (Persian Cat)</p>
                  <p className="text-xs text-slate-500 truncate">Wonderful news Vikram! Continue the dietary fiber formula f...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Chat Window */}
          <div className="flex-1 bg-slate-50 flex flex-col relative">
            <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?img=11" alt="Aarav" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-black text-[#0F2E23]">Aarav Sharma</h4>
                  <p className="text-xs font-bold text-emerald-600">Bruno (Golden Retriever) • +91 98234 56789</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-slate-100 text-[#0F2E23] flex items-center justify-center hover:bg-slate-200 transition">
                  <Video size={18} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition">
                  <FileText size={16} /> Attach Rx
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-end pb-24">
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-sm text-slate-700">Hello Dr. Ramesh! Bruno has been scratching his left ear since yesterday morning. Should I bring him in today?</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">10:30 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[#0F2E23] text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-md">
                  <p className="text-sm">Hello Aarav! Yes, please bring Bruno in for an otoscopic check. In the meantime, please avoid putting water in his ear.</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-right opacity-80">10:35 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-sm text-slate-700">Got it Doctor, I booked the 11:00 AM slot. See you shortly at the clinic!</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">10:45 AM</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                <button className="p-2 text-slate-400 hover:text-[#0F2E23] transition">
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      toast.success('Message sent to Aarav Sharma');
                      setMessageInput('');
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700" 
                />
                <button 
                  onClick={() => {
                    if (messageInput.trim()) {
                      toast.success('Message sent to Aarav Sharma');
                      setMessageInput('');
                    }
                  }}
                  className="px-4 py-2 bg-[#0F2E23] text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-[#1a4a38] transition">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Appointments & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your upcoming bookings and patient queue.</p>
            </div>
          </div>
          
          {appointments.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-[#0F2E23] mb-4 shadow-sm border border-slate-200">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-black text-[#0F2E23]">No Appointments Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">When users book an appointment from your public directory profile, they will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((app, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-[#0F2E23] text-lg">{app.petName} <span className="text-sm font-bold text-slate-500 ml-2">({app.petBreed})</span></h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-3">Owner: {app.ownerName} • {app.ownerPhone}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> {app.bookingDate}</span>
                      <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock3 size={12}/> {app.bookingTimeSlot}</span>
                      <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Stethoscope size={12}/> {app.bookingMode || 'In-Clinic Visit'}</span>
                    </div>
                    {app.petSymptoms && <p className="text-sm text-slate-600 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100"><strong>Reason:</strong> {app.petSymptoms}</p>}
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition shadow-sm w-full">Complete</button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition w-full">Reschedule</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinical Services & Fees</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your consultation modes, pricing, and specializations.</p>
            </div>
            <button 
              onClick={() => toast.success('Services & Fees updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service Modes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Building size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">In-Clinic Visit</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Physical examination at your registered clinic address.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleService('inClinic')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.inClinic.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${servicesState.inClinic.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.inClinic.fee} 
                      onChange={e => updateServiceFee('inClinic', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Video size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Video Tele-Consult</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Remote diagnosis and digital prescriptions via video call.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleService('video')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.video.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${servicesState.video.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.video.fee} 
                      onChange={e => updateServiceFee('video', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><HeartPulse size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Home Visit Vet</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">On-site veterinary care at the patient's residence.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleService('home')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${servicesState.home.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${servicesState.home.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Consultation Fee</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input 
                      type="number" 
                      value={servicesState.home.fee} 
                      onChange={e => updateServiceFee('home', e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Offered Specializations</h3>
              <button onClick={() => toast.success('Opening Specializations Modal')} className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest hover:text-emerald-700 transition"><Plus size={14}/> Add New</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['General Physician & Vaccines', 'Orthopedics & Soft Tissue Surgery', 'Pet Nutrition', 'Feline Medicine'].map((spec, i) => (
                <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                  {spec} <span onClick={() => toast.success(`Removed ${spec}`)} className="text-slate-300 hover:text-red-500 cursor-pointer transition">×</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECORDS TAB */}
      {activeTab === 'records' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">E-Prescriptions & Records</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage patient medical histories and digital prescriptions.</p>
            </div>
            <button 
              onClick={() => toast.success('Starting new digital prescription flow...')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition whitespace-nowrap">
              <Plus size={16} /> New Prescription
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-black">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Diagnosis</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500">Today, 10:45 AM</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">B</div>
                        <div>
                          <p className="text-slate-800 font-bold">Bruno</p>
                          <p className="text-[10px] text-slate-400">Dog • Golden Retriever</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Otitis Externa (Left Ear)</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast.success('Downloading PDF Rx for Bruno...')} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1 justify-end w-full"><Download size={14}/> PDF Rx</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500">Yesterday</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">C</div>
                        <div>
                          <p className="text-slate-800 font-bold">Coco</p>
                          <p className="text-[10px] text-slate-400">Dog • Shih Tzu</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Routine Vaccination (DHLPPi)</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast.success('Downloading PDF Rx for Coco...')} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1 justify-end w-full"><Download size={14}/> PDF Rx</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-500">Aug 30, 2026</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">M</div>
                        <div>
                          <p className="text-slate-800 font-bold">Milo</p>
                          <p className="text-[10px] text-slate-400">Cat • Persian</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Feline Lower Urinary Tract Disease</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toast.success('Downloading PDF Rx for Milo...')} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1 justify-end w-full"><Download size={14}/> PDF Rx</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HOURS TAB */}
      {activeTab === 'hours' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Clinic Hours & Slots</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your weekly availability and emergency hours.</p>
            </div>
            <button 
              onClick={() => toast.success('Clinic schedule updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Schedule
            </button>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-rose-800 flex items-center gap-2"><Clock3 size={16}/> 24/7 Emergency Availability</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Show up in emergency vet searches during odd hours.</p>
            </div>
            <div 
              onClick={() => setSchedule(prev => ({...prev, emergency: !prev.emergency}))}
              className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${schedule.emergency ? 'bg-rose-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${schedule.emergency ? 'right-0.5' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest mb-2">Weekly Schedule</h3>
            
            {Object.entries(schedule.days).map(([day, config]) => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                <div className="w-32 flex items-center justify-between sm:justify-start gap-3">
                  <span className={`text-sm font-bold ${!config.isOpen ? 'text-slate-400' : 'text-slate-700'}`}>{day}</span>
                  <div 
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${!config.isOpen ? 'bg-slate-200' : 'bg-emerald-500'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${!config.isOpen ? 'left-0.5' : 'right-0.5'}`}></div>
                  </div>
                </div>
                {config.isOpen ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input 
                      type="time" 
                      value={config.start}
                      onChange={(e) => updateTime(day, 'start', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" 
                    />
                    <span className="text-slate-400 font-bold text-xs">to</span>
                    <input 
                      type="time" 
                      value={config.end}
                      onChange={(e) => updateTime(day, 'end', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-[#0F2E23]" 
                    />
                    <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 ml-auto flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md"><Plus size={12}/> Add Slot</button>
                  </div>
                ) : (
                  <div className="flex-1 text-sm font-bold text-slate-400">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Patient Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Monitor feedback and reply to your patients.</p>
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
              <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">Based on 124 reviews</p>
            </div>
            
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-12">{star} Stars</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-amber-400 rounded-full`} style={{ width: star === 5 ? '85%' : star === 4 ? '10%' : '0%' }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-8 text-right">{star === 5 ? '105' : star === 4 ? '19' : '0'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Recent Reviews</h3>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black">AK</div>
                  <div>
                    <h4 className="font-bold text-[#0F2E23]">Aditi Kumar</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">2 days ago • For Dog</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Dr. Ramesh is extremely patient and thorough. My Golden Retriever was very anxious but the doctor calmed him down effortlessly. The clinic is very clean and well-equipped.</p>
              <div className="pt-2">
                <button className="text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:text-emerald-700 transition"><MessageSquare size={14}/> Reply privately</button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black">SJ</div>
                  <div>
                    <h4 className="font-bold text-[#0F2E23]">Siddharth Jain</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">1 week ago • For Cat</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} className="text-slate-300" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Good doctor, explained the diagnosis clearly via Video Consult. The digital prescription was generated immediately after the call.</p>
              <div className="pt-2">
                <button className="text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:text-emerald-700 transition"><MessageSquare size={14}/> Reply privately</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default VetProviderContent;
