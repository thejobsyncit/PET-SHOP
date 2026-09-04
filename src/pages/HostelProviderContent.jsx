import React, { useState, useEffect } from 'react';
import { Calendar, Star, MessageSquare, Clock, CreditCard, Building, Check, Video, Paperclip, CheckCircle2, FileText, PawPrint, Save, Clock3, User, Plus, Download, Edit3, HeartPulse, StarHalf, Home, Image as ImageIcon, Scissors, Sparkles, Upload, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const HostelProviderContent = ({ activeTab }) => {
  const [profile, setProfile] = useState({
    id: 'my-hostel-profile',
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400',
    name: 'Happy Paws Pet Resort',
    registration: 'HOSTEL-2023-KA-102',
    certifications: 'Certified Boarding Facility (IBK)',
    address: 'Sarjapur Road, Bangalore, Karnataka',
    city: 'Bangalore',
    state: 'Karnataka',
    experienceDisplay: '10+ Years Exp.',
    experienceYears: 10,
    rating: 4.9,
    reviewsCount: 312,
    phone: '+91 97312 99881',
    isVerified: true,
    openTodayTiming: '24 Hours',
    bio: 'Premium pet resort offering luxury kennels, large play areas, and 24/7 vet on call.',
    facilities: ['Air Conditioned', 'CCTV Monitored', 'Swimming Pool', 'Live Feed for Parents'],
  });

  const [schedule, setSchedule] = useState({
    acceptingCheckins: true,
    checkInTime: '12:00',
    checkOutTime: '11:00'
  });

  const [messageInput, setMessageInput] = useState('');
  
  const [kennelsState, setKennelsState] = useState({
    standard: { active: true, fee: 800, capacity: 20 },
    luxury: { active: true, fee: 1500, capacity: 10 },
    suite: { active: true, fee: 2500, capacity: 5 },
  });

  const toggleKennel = (key) => setKennelsState(p => ({ ...p, [key]: { ...p[key], active: !p[key].active }}));
  const updateKennelFee = (key, val) => setKennelsState(p => ({ ...p, [key]: { ...p[key], fee: val }}));

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
              <h2 className="text-xl font-black text-[#0F2E23]">Resort Registration & Profile</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional details and resort amenities.</p>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort / Profile Image</label>
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registration / Trade License</label>
                <input type="text" name="registration" value={profile.registration} onChange={handleProfileChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Certifications (e.g. IBK)</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Resort Address</label>
                <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none"></textarea>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resort Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleProfileChange} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition shadow-sm resize-none" placeholder="Tell pet parents about your boarding facility..."></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Boarding Bookings & Queue</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage check-ins, check-outs, and current guests.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-l-4 border-l-emerald-500 border-y border-r border-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">L</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Leo (Beagle)</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Checking In Today • Standard Kennel</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">ETA 2:00 PM</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-[#0F2E23] text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-[#163e30] transition">Complete Check-in</button>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-l-sky-500 border-y border-r border-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-700">O</div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Oreo (Husky)</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Checking Out Today • Luxury Suite</p>
                  </div>
                </div>
                <span className="bg-sky-50 text-sky-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1">Guest</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-slate-50 transition">Process Check-out</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOMS / PACKAGES TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Kennels & Accommodations</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage your kennel types, capacities, and pricing per night.</p>
            </div>
            <button 
              onClick={() => toast.success('Kennel pricing updated successfully!')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Changes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Home size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Standard Kennel</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Comfortable 4x4ft indoor kennel with basic bedding and 2 walks/day.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('standard')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.standard.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.standard.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.standard.fee} onChange={e => updateKennelFee('standard', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Building size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">Luxury Kennel</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Spacious 6x6ft indoor kennel with premium bedding and 3 walks/day.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('luxury')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.luxury.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.luxury.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.luxury.fee} onChange={e => updateKennelFee('luxury', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Star size={48}/></div>
              <h3 className="text-lg font-black text-[#0F2E23] mb-1">VIP Suite</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Large private room with AC, CCTV for parents, and unlimited play time.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <div onClick={() => toggleKennel('suite')} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${kennelsState.suite.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${kennelsState.suite.active ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Price per Night</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-500 font-bold mr-2">₹</span>
                    <input type="number" value={kennelsState.suite.fee} onChange={e => updateKennelFee('suite', e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0F2E23] uppercase tracking-widest">Included Amenities</h3>
              <button onClick={() => toast.success('Amenities modal opened')} className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest hover:text-emerald-700 transition"><Plus size={14}/> Add New</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.facilities.map((spec, i) => (
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
              <h2 className="text-xl font-black text-[#0F2E23]">Facility Gallery</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Showcase your play areas, kennels, and pool to potential clients.</p>
            </div>
            <button 
              onClick={() => toast.success('Upload dialog opened...')}
              className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition whitespace-nowrap">
              <Plus size={16} /> Upload Photo
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                <ImageIcon size={32} className="text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-400">Area {i}</span>
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
              <h2 className="text-xl font-black text-[#0F2E23]">Check-in/Out Timings</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Set your standard check-in and check-out times.</p>
            </div>
            <button onClick={() => toast.success('Timings saved successfully!')} className="px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition">
              <Save size={16} /> Save Timings
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6">
            
            <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Standard Check-In Time</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <Clock3 size={16} className="text-slate-400 mr-3" />
                    <input type="time" value={schedule.checkInTime} onChange={(e) => setSchedule({...schedule, checkInTime: e.target.value})} className="bg-transparent border-none outline-none text-base font-bold text-slate-700 w-full" />
                  </div>
               </div>
               <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Standard Check-Out Time</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                    <Clock3 size={16} className="text-slate-400 mr-3" />
                    <input type="time" value={schedule.checkOutTime} onChange={(e) => setSchedule({...schedule, checkOutTime: e.target.value})} className="bg-transparent border-none outline-none text-base font-bold text-slate-700 w-full" />
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-[#0F2E23]">Guest Reviews</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Monitor your ratings and reply to pet parent feedback.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-5xl font-black text-[#0F2E23] flex items-baseline gap-2">4.9 <span className="text-lg font-bold text-slate-400">/ 5.0</span></div>
              <div className="flex gap-1 text-[#ffd000] mt-2">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mt-3">Based on 312 Reviews</p>
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
              <p className="text-sm text-slate-500 font-medium mt-1">Track your boarding earnings and bank settlements.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Current Balance</h3>
            <div className="text-4xl font-black text-[#0F2E23]">₹24,500</div>
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
              <h3 className="font-black text-[#0F2E23]">Parent Inquiries</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-slate-100 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">Arjun Reddy</h4>
                  <span className="text-[10px] text-emerald-600 font-bold">11:15 AM</span>
                </div>
                <p className="text-xs text-slate-500 truncate">Do you accept un-neutered dogs?</p>
              </div>
            </div>
          </div>
          {/* Chat Window */}
          <div className="flex-1 flex flex-col relative bg-[#FAF9F5]/30">
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">A</div>
                <div>
                  <h4 className="font-bold text-[#0F2E23]">Arjun Reddy</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Inquiry regarding Boarding</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 max-w-[80%] shadow-sm">
                  <p className="text-sm text-slate-700">Hi, I need to board my Husky for a week. However, he is not neutered yet. Do you have private play areas for him?</p>
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
                      toast.success('Reply sent to Arjun');
                      setMessageInput('');
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 px-2" 
                />
                <button 
                  onClick={() => {
                    if (messageInput.trim()) {
                      toast.success('Reply sent to Arjun');
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

export default HostelProviderContent;
