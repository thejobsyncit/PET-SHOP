import React, { useState, useEffect } from 'react';
import { Calendar, Star, MessageSquare, Clock, CreditCard, Building, Check, Video, Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, Download, Edit3, HeartPulse, StarHalf, Home, Image as ImageIcon, Scissors, Sparkles, Upload, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const GroomingProviderContent = ({ activeTab }) => {
  const [profile, setProfile] = useState({
    id: 'my-grooming-profile',
    avatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=400',
    name: 'Velvet Fur Grooming Studio',
    registration: 'GROOM-2023-KA-99',
    certifications: 'Certified Master Groomer (NDGAA)',
    studioName: 'Velvet Fur Premium Spa',
    address: 'Indiranagar, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    experienceDisplay: '5+ Years Exp.',
    experienceYears: 5,
    rating: 4.8,
    reviewsCount: 156,
    phone: '+91 98765 43210',
    isVerified: true,
    openTodayTiming: '10:00 AM - 08:00 PM',
    bio: 'Premium pet spa offering stress-free grooming and medicated baths.',
    facilities: ['Air Conditioned', 'CCTV Monitored', 'Medicated Baths'],
  });

  const [schedule, setSchedule] = useState({
    acceptingWalkIns: true,
    days: {
      Monday: { isOpen: true, start: '10:00', end: '20:00' },
      Tuesday: { isOpen: true, start: '10:00', end: '20:00' },
      Wednesday: { isOpen: true, start: '10:00', end: '20:00' },
      Thursday: { isOpen: true, start: '10:00', end: '20:00' },
      Friday: { isOpen: true, start: '10:00', end: '20:00' },
      Saturday: { isOpen: true, start: '09:00', end: '21:00' },
      Sunday: { isOpen: false, start: '10:00', end: '18:00' },
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
  
  const [packagesState, setPackagesState] = useState({
    fullGroom: { active: true, fee: 1500 },
    bathBrush: { active: true, fee: 800 },
    nailClip: { active: true, fee: 300 },
  });

  const togglePackage = (key) => setPackagesState(p => ({ ...p, [key]: { ...p[key], active: !p[key].active }}));
  const updatePackageFee = (key, val) => setPackagesState(p => ({ ...p, [key]: { ...p[key], fee: val }}));

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full">
      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Studio Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional details and studio amenities.</p>
            </div>
            <button 
              onClick={() => toast.success('Profile updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save & Publish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-6">
                <div className="relative group cursor-pointer w-24 h-24 shrink-0">
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Upload size={20} className="text-white" />
                  </div>
                  <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio / Profile Image</label>
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registration / Trade License</label>
                <input type="text" name="registration" value={profile.registration} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certifications (e.g. NDGAA)</label>
                <input type="text" name="certifications" value={profile.certifications} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">City</label>
                  <input type="text" name="city" value={profile.city} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">State</label>
                  <input type="text" name="state" value={profile.state} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Studio Address</label>
                <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Studio Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none" placeholder="Tell pet parents about your grooming approach..."></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Spa Appointments & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage today's schedule and upcoming grooming sessions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">M</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Max (Golden Retriever)</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Today, 11:00 AM • Full Groom</p>
                  </div>
                </div>
                <span className="bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">In 15 Mins</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-[#0F2E23] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-[#163e30] transition">Start Session</button>
                <button className="flex-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-slate-200 transition">Reschedule</button>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-l-emerald-500 border-y border-r border-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition opacity-70">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">B</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Bella (Persian Cat)</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Today, 09:30 AM • Bath & Brush</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PACKAGES TAB */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Grooming Packages & Pricing</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your offered services and base pricing.</p>
            </div>
            <button 
              onClick={() => toast.success('Packages & Pricing updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Sparkles size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Full Grooming</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Bath, haircut, nail clipping, ear cleaning, and styling.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('fullGroom')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.fullGroom.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.fullGroom.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Starts at)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.fullGroom.fee} onChange={e => updatePackageFee('fullGroom', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Building size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Bath & Brush</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Medicated or soothing bath, blow dry, and thorough brushing.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('bathBrush')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.bathBrush.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.bathBrush.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Starts at)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.bathBrush.fee} onChange={e => updatePackageFee('bathBrush', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Scissors size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Nail Clipping</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Quick and safe nail trimming and filing service.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => togglePackage('nailClip')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${packagesState.nailClip.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${packagesState.nailClip.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Price (Fixed)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={packagesState.nailClip.fee} onChange={e => updatePackageFee('nailClip', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Add-On Services</h3>
              <button onClick={() => toast.success('Add-on modal opened')} className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest hover:text-emerald-700 transition"><Plus size={14}/> Add New</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Teeth Cleaning', 'De-shedding Treatment', 'Flea & Tick Bath', 'Ear Cleaning'].map((spec, i) => (
                <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                  {spec} <span onClick={() => toast.success(`Removed ${spec}`)} className="text-slate-300 hover:text-red-500 cursor-pointer transition">×</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Before & After Gallery</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Showcase your grooming transformations to potential clients.</p>
            </div>
            <button 
              onClick={() => toast.success('Upload dialog opened...')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition whitespace-nowrap">
              <Plus size={16} /> Upload Photo
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                <ImageIcon size={32} className="text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-400">Sample {i}</span>
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => toast.success('Image deleted')} className="text-white text-xs font-bold bg-rose-500 px-3 py-1 rounded-full mb-2">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOURS TAB */}
      {activeTab === 'hours' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Studio Hours & Availability</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your weekly schedule and walk-in availability.</p>
            </div>
            <button onClick={() => toast.success('Schedule saved successfully!')} className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Schedule
            </button>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-xl mt-1">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F2E23]">Accepting Walk-Ins?</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">Turn this on if you accept walk-in grooming without prior appointment.</p>
              </div>
            </div>
            <div 
              onClick={() => setSchedule(p => ({ ...p, acceptingWalkIns: !p.acceptingWalkIns }))}
              className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 shrink-0 ${schedule.acceptingWalkIns ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${schedule.acceptingWalkIns ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Weekly Operating Hours</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.keys(schedule.days).map((day) => (
                <div key={day} className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!schedule.days[day].isOpen ? 'bg-slate-50/50 opacity-75' : ''}`}>
                  <div className="flex items-center gap-4 w-40">
                    <div 
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${schedule.days[day].isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${schedule.days[day].isOpen ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                    <span className={`font-bold ${schedule.days[day].isOpen ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
                  </div>
                  
                  {schedule.days[day].isOpen ? (
                    <div className="flex items-center gap-3 w-full max-w-sm">
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-sm">
                        <Clock3 size={14} className="text-slate-400 mr-2" />
                        <input type="time" value={schedule.days[day].start} onChange={(e) => updateTime(day, 'start', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full" />
                      </div>
                      <span className="text-slate-400 font-bold text-xs uppercase">To</span>
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-sm">
                        <Clock3 size={14} className="text-slate-400 mr-2" />
                        <input type="time" value={schedule.days[day].end} onChange={(e) => updateTime(day, 'end', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm text-sm font-black text-rose-500 uppercase tracking-widest pl-2">Closed</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Customer Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Monitor your ratings and reply to client feedback.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-5xl font-black text-[#0F2E23] flex items-baseline gap-2">4.8 <span className="text-lg font-bold text-slate-400">/ 5.0</span></div>
              <div className="flex gap-1 text-[#ffd000] mt-2">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <StarHalf size={18} fill="currentColor" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-3">Based on 156 Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* WALLET TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-fadeIn">
           <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Track your grooming earnings and bank settlements.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Current Balance</h3>
            <div className="text-4xl font-black text-[#0F2E23]">₹8,450</div>
            <button className="mt-4 px-6 py-2 bg-[#0F2E23] text-white rounded-xl text-xs font-black uppercase tracking-widest">Withdraw to Bank</button>
          </div>
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="h-[600px] flex border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm animate-fadeIn">
          {/* Chat List */}
          <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h3 className="font-black text-[#0F2E23]">Client Inquiries</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-slate-100 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">Priya Sharma</h4>
                  <span className="text-[10px] text-emerald-600 font-bold">10:42 AM</span>
                </div>
                <p className="text-xs text-slate-500 truncate">Do you use hypoallergenic shampoo?</p>
              </div>
            </div>
          </div>
          {/* Chat Window */}
          <div className="flex-1 flex flex-col relative bg-[#FAF9F5]/30">
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">P</div>
                <div>
                  <h4 className="font-bold text-[#0F2E23]">Priya Sharma</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Inquiry regarding Bath & Brush</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-sm text-slate-700">Hi, I'd like to book a bath for my Shih Tzu. Do you use hypoallergenic shampoo? He has sensitive skin.</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && messageInput.trim()) {
                      toast.success('Reply sent to Priya');
                      setMessageInput('');
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 px-2" 
                />
                <button 
                  onClick={() => {
                    if (messageInput.trim()) {
                      toast.success('Reply sent to Priya');
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

    </div>
  );
};

export default GroomingProviderContent;
