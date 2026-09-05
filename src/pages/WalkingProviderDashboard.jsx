import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building, User
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { getStoredWalkingProviders, getStoredWalkingBookings, saveWalkingProvider } from '../data/walkingData.js';

import toast from 'react-hot-toast';


const AppointmentsModule = ({ user }) => {
  
  const [myProvider, setMyProvider] = useState(null);
  useEffect(() => {
    const providers = getStoredWalkingProviders();
    // Match by name or phone, fallback to a dummy if none found but user is logged in
    let matched = providers.find(p => p.walkerName === user?.name || p.phone === user?.mobile || p.name === user?.name);
    if (!matched && user) {
      matched = {
        id: 'WLK-NEW',
        name: user.name || 'My Walking Agency',
        walkerName: user.name,
        phone: user.mobile,
        experience: 'Beginner (0-1 yrs)',
        rating: 0,
        reviews: 0,
        price: 300,
        area: 'Indiranagar'
      };
    }
    setMyProvider(matched);
  }, [user]);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (myProvider) {
      const allBookings = getStoredWalkingBookings();
      // Filter bookings for this provider
      const myBookings = allBookings.filter(b => b.providerId === myProvider.id);
      
      // Transform into display format
      const formatted = myBookings.map((b, idx) => ({
        id: b.id || `WA-00${idx+1}`,
        petName: b.petName || 'Dog',
        breed: b.petBreed || 'Mixed',
        owner: b.ownerName || 'Client',
        time: b.timeSlot || 'Morning',
        date: new Date(b.date || b.createdAt).toLocaleDateString(),
        status: b.status || 'Pending',
        location: b.location || 'Local Area',
        type: b.serviceType || 'Solo Walk'
      }));
      
      setAppointments(formatted);
    }
  }, [myProvider]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Walk Appointments</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your upcoming and pending dog walks.</p>
        </div>
        <button className="bg-[#0F2E23] hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
          <Plus size={16} /> Block Calendar
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Appointments Yet</h3>
          <p className="text-slate-500 mt-1">When users book your services, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{appt.id}</span>
                      <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">{appt.type}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${appt.status === 'Confirmed' || appt.status === 'Scheduled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {appt.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black text-[#0F2E23] mt-2">Walk with <span className="text-emerald-600">{appt.petName}</span></h3>
                  <p className="text-xs font-bold text-slate-500">{appt.breed} • Owner: {appt.owner}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2"><Clock size={16} className="text-slate-400"/> {appt.date}, {appt.time}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400"/> {appt.location}</div>
                  </div>
                </div>
                
                <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                  {appt.status === 'Pending' ? (
                    <>
                      <button className="flex-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm">Accept Walk</button>
                      <button className="flex-1 w-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors">Decline</button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 w-full bg-[#0F2E23] hover:bg-[#1a4a3b] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm">Start Walk</button>
                      <button className="flex-1 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors">Message</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RoutesModule = () => {
  const routes = [
    { id: 1, name: 'Indiranagar Morning Route', duration: '60 mins', distance: '3.5 km', capacity: 'Up to 4 dogs', slots: '2 Available', active: true },
    { id: 2, name: 'Koramangala Evening Stroll', duration: '45 mins', distance: '2.0 km', capacity: 'Up to 3 dogs', slots: 'Full', active: true },
    { id: 3, name: 'HSR Layout Weekend Pack', duration: '90 mins', distance: '5.0 km', capacity: 'Up to 6 dogs', slots: '4 Available', active: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Active Routes</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your standard walking routes and pack capacity.</p>
        </div>
        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm">
          <MapPin size={16} /> Create Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${route.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <MapPin size={20} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${route.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {route.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <h3 className="text-base font-black text-[#0F2E23] mb-1">{route.name}</h3>
              <p className="text-xs font-bold text-slate-500 mb-4">{route.distance} • {route.duration}</p>
              
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-600">Pack Capacity</span>
                  <span className="text-xs font-black text-[#0F2E23]">{route.capacity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">Current Slots</span>
                  <span className={`text-xs font-black ${route.slots === 'Full' ? 'text-rose-500' : 'text-emerald-600'}`}>{route.slots}</span>
                </div>
              </div>
              
              <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors">
                Edit Route Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessagesModule = ({ user }) => {
  const inquiries = [
    { id: 1, name: 'Vikram Singh', pet: 'Luna (Husky)', date: 'Today, 10:30 AM', message: 'Hi! Are you available for morning walks at Cubbon Park next week?', isUnread: true },
    { id: 2, name: 'Anita Menon', pet: 'Max (GSD)', date: 'Yesterday, 4:15 PM', message: 'Hello, what is your rate for a solo walk in Koramangala?', isUnread: true },
    { id: 3, name: 'Rahul Desai', pet: 'Buddy (Retriever)', date: 'Sep 02, 2026', message: 'Thanks for the walk today! Buddy loved it. Let\'s schedule again for Friday.', isUnread: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Client Inquiries</h2>
          <p className="text-sm text-slate-500 font-medium">Respond to pet owners interested in your walking services.</p>
        </div>
        <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          2 Unread
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side: Inbox List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inquiries.map((inq, idx) => (
              <div key={inq.id} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${idx === 0 ? 'bg-white border-l-4 border-l-emerald-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm font-bold ${inq.isUnread ? 'text-[#0F2E23]' : 'text-slate-600'}`}>{inq.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{inq.date}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 mb-1.5 flex items-center gap-1"><PawPrint size={10}/> {inq.pet}</div>
                <p className={`text-xs line-clamp-2 ${inq.isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{inq.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-black text-[#0F2E23]">Vikram Singh</h3>
              <p className="text-xs font-bold text-emerald-600">Client • Luna (Husky)</p>
            </div>
            <button className="text-slate-400 hover:text-[#0F2E23] transition-colors"><Settings size={18}/></button>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
            <div className="flex flex-col items-center mb-6">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">VS</div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%]">
                <p className="text-sm text-slate-700">{inquiries[0].message}</p>
                <span className="text-[9px] font-bold text-slate-400 mt-2 block">10:30 AM</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 rounded-xl"><Plus size={20}/></button>
              <input type="text" placeholder="Type your reply here..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              <button className="p-2.5 bg-[#0F2E23] text-white hover:bg-emerald-800 transition-colors rounded-xl shadow-sm"><Send size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsModule = ({ user }) => {
  const reviews = [
    { id: 1, client: 'Karthik S.', pet: 'Rocky (Bulldog)', rating: 5, date: 'Sep 01, 2026', comment: 'Excellent walker! Rocky always comes back tired and happy. Very punctual and sends great photo updates.' },
    { id: 2, client: 'Deepa M.', pet: 'Coco (Retriever)', rating: 5, date: 'Aug 28, 2026', comment: 'Highly reliable. I completely trust them with Coco. The GPS tracking feature gives a lot of peace of mind.' },
    { id: 3, client: 'Rohan K.', pet: 'Simba (Spitz)', rating: 4, date: 'Aug 15, 2026', comment: 'Good service, but sometimes the group walks get a little too crowded for Simba. Otherwise great.' },
    { id: 4, client: 'Nisha R.', pet: 'Bella (Lab)', rating: 5, date: 'Jul 22, 2026', comment: 'Best dog walker in Indiranagar! Bella eagerly waits at the door every evening.' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Customer Reviews</h2>
          <p className="text-sm text-slate-500 font-medium">See what pet owners are saying about your walking services.</p>
        </div>
        <div className="flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <div className="text-center border-r border-amber-200 pr-4">
            <div className="text-2xl font-black text-amber-600">4.9</div>
            <div className="flex text-amber-500">
              <Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Overall Rating</div>
            <div className="text-[10px] font-bold text-amber-600">Based on 45 reviews</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                  {rev.client.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0F2E23]">{rev.client}</h4>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">{rev.date}</div>
                </div>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-slate-200"} />
                ))}
              </div>
            </div>
            
            <div className="mb-3">
              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                Walked: <span className="text-[#0F2E23]">{rev.pet}</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const WalletModule = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-[#0F2E23]">Wallet & Payouts</h2>
        <p className="text-sm text-slate-500 font-medium">Track your walking earnings and payouts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#0F2E23] to-[#1a4a3b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <DollarSign size={14} /> Available Balance
          </div>
          <div className="text-4xl font-black mb-4">₹12,500</div>
          <button className="w-full bg-white text-[#0F2E23] hover:bg-emerald-50 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            Withdraw Funds
          </button>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} /> Pending Clearance
          </div>
          <div className="text-3xl font-black text-slate-700 mb-1">₹3,200</div>
          <p className="text-xs text-slate-500 font-medium">Funds from this week's walks will clear on Friday.</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Recent Walk Earnings</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Walk ID</th>
                <th className="px-6 py-4">Pet Name</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">WA-098</td>
                <td className="px-6 py-4 font-medium text-slate-600">Buddy (Golden Retriever)</td>
                <td className="px-6 py-4 text-slate-500">Sep 04, 2026 • 07:00 AM</td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Cleared</span></td>
                <td className="px-6 py-4 text-right font-black text-emerald-600">+₹300</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">WA-097</td>
                <td className="px-6 py-4 font-medium text-slate-600">Luna (Husky)</td>
                <td className="px-6 py-4 text-slate-500">Sep 03, 2026 • 06:30 AM</td>
                <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Cleared</span></td>
                <td className="px-6 py-4 text-right font-black text-emerald-600">+₹400</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">WD-012</td>
                <td className="px-6 py-4 font-medium text-slate-600">Bank Transfer</td>
                <td className="px-6 py-4 text-slate-500">Sep 01, 2026</td>
                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">Processed</span></td>
                <td className="px-6 py-4 text-right font-black text-slate-700">-₹5,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProfileModule = ({ user }) => {
  
  const [myProvider, setMyProvider] = useState(null);
  useEffect(() => {
    const providers = getStoredWalkingProviders();
    // Match by name or phone, fallback to a dummy if none found but user is logged in
    let matched = providers.find(p => p.walkerName === user?.name || p.phone === user?.mobile || p.name === user?.name);
    if (!matched && user) {
      matched = {
        id: 'WLK-NEW',
        name: user.name || 'My Walking Agency',
        walkerName: user.name,
        phone: user.mobile,
        experience: 'Beginner (0-1 yrs)',
        rating: 0,
        reviews: 0,
        price: 300,
        area: 'Indiranagar'
      };
    }
    setMyProvider(matched);
  }, [user]);


  const [formData, setFormData] = useState({
    name: '',
    experience: 'Beginner (0-1 yrs)',
    tagline: '',
    area: '',
    price: 300,
    maxDogs: 4
  });

  useEffect(() => {
    if (myProvider) {
      setFormData({
        name: myProvider.name || '',
        experience: myProvider.experience || 'Beginner (0-1 yrs)',
        tagline: myProvider.tagline || '',
        area: myProvider.area || '',
        price: myProvider.price || 300,
        maxDogs: myProvider.maxDogs || 4
      });
    }
  }, [myProvider]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!myProvider) return;
    
    const updatedProvider = {
      ...myProvider,
      ...formData
    };
    
    const success = saveWalkingProvider(updatedProvider);
    if (success) {
      toast.success('Walker Profile updated globally!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  if (!myProvider) return <div className="p-10 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-[#0F2E23]">Walker Profile Registration</h2>
        <p className="text-sm text-slate-500 font-medium">Update your public profile, rates, and service areas. Changes will reflect on the public Pet Walking page.</p>
      </div>

      <form className="space-y-8 max-w-4xl" onSubmit={handleSubmit}>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User size={16} className="text-emerald-500" /> Basic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Agency / Display Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Experience Level</label>
              <select name="experience" value={formData.experience} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                <option>Beginner (0-1 yrs)</option>
                <option>Intermediate (1-3 yrs)</option>
                <option>Expert (3+ yrs)</option>
                <option>5+ Years Exp</option>
                <option>6+ Years Exp</option>
                <option>7+ Years Exp</option>
                <option>8+ Years Exp</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-600">Bio & Experience Description (Tagline)</label>
              <textarea rows="4" name="tagline" value={formData.tagline} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" /> Service Areas & Rates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Primary Operating Areas</label>
              <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Base Rate per Walk (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Max Dogs per Walk</label>
              <input type="number" name="maxDogs" value={formData.maxDogs} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2">
            <Check size={16} /> Save Profile globally
          </button>
        </div>
      </form>
    </div>
  );
};

const WalkingProviderContent = ({ activeTab, user }) => {
  switch (activeTab) {
    case 'appointments': return <AppointmentsModule user={user} />;
    case 'routes': return <RoutesModule user={user} />;
    case 'messages': return <MessagesModule user={user} />;
    case 'reviews': return <ReviewsModule user={user} />;
    case 'wallet': return <WalletModule user={user} />;
    case 'profile': return <ProfileModule user={user} />;
    default: 
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <LayoutDashboard size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
          <p className="text-slate-500 max-w-sm">This module is currently under development. Check back soon for updates!</p>
        </div>
      );
  }
};

const WalkingProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = localStorage.getItem('walkingDashboardTab');
  const activeTabParam = searchParams.get('tab') || storedTab || 'appointments';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [profileName, setProfileName] = useState(user?.name || currentProvider?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || user?.profilePicture || currentProvider?.avatar || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || currentProvider?.name || '');
      setProfileAvatar(user.avatar || user.profilePicture || currentProvider?.avatar || '');
    }
  }, [user, currentProvider]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name: profileName, avatar: profileAvatar, profilePicture: profileAvatar }));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    if (activeTabParam) {
      setActiveTab(activeTabParam);
      localStorage.setItem('walkingDashboardTab', activeTabParam);
    }
  }, [activeTabParam]);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock Stats for new dashboards
  const stats = {
    totalListings: 12,
    availableStock: 3,
    soldOutCount: 45,
    totalOrders: 60,
    revenue: 12500,
    discounts: 500, 
    inquiries: 12,
    rating: currentProvider?.rating || 4.9,
    reviews: currentProvider?.reviewsCount || 100
  };

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';
  const displayName = user?.name || currentProvider?.name || 'Provider';

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 sticky top-[104px] h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-12 space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group cursor-pointer">
              <label htmlFor="sidebar-avatar-upload" className="block relative cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd000] to-amber-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg transition group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                  <div className="bg-[#0F2E23]/80 p-2 rounded-full text-white">
                    <Edit3 size={16} />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm z-20">
                  <span className={`w-3 h-3 rounded-full ${currentProvider?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                </div>
              </label>
              <input 
                type="file" 
                id="sidebar-avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  handleFileChange(e, async (dataUrl) => {
                    setProfileAvatar(dataUrl);
                    const result = await dispatch(updateProfile({ name: profileName, avatar: dataUrl, profilePicture: dataUrl }));
                    if (updateProfile.fulfilled.match(result)) {
                      toast.success('Profile picture updated successfully!');
                    }
                  });
                }} 
              />
            </div>
            <div className="w-full px-4">
              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="flex items-center gap-2 justify-center mt-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full text-center text-sm font-black text-[#0F2E23] border-b-2 border-[#ffd000] focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <button type="submit" className="text-emerald-600 hover:text-emerald-700 p-1">
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="text-rose-600 hover:text-rose-700 p-1">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 mt-2 group/edit cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                  <h2 className="text-xl font-sans font-black text-[#0F2E23] tracking-tight leading-tight">
                    {profileName || displayName}
                  </h2>
                  <Edit3 size={14} className="text-slate-300 group-hover/edit:text-[#ffd000] transition" />
                </div>
              )}
              <span className="inline-flex mt-2 bg-[#ffd000]/10 text-[#0F2E23] border border-[#ffd000]/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest items-center justify-center gap-1 shadow-sm mx-auto">
                <ShieldCheck size={12} className="text-amber-500" /> Elite Walker
              </span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-3">Main Menu</div>
            <ul className="space-y-1">
              {[
                { id: 'appointments', label: 'Walk Appointments', count: 5, icon: Calendar },
                { id: 'routes', label: 'Active Routes', count: 3, icon: MapPin },
                { id: 'messages', label: 'Client Inquiries', count: 2, icon: MessageSquare },
                { id: 'reviews', label: 'Customer Reviews', extra: '4.9 ★', icon: Heart },
                { id: 'wallet', label: 'Wallet & Payouts', icon: DollarSign },
                { id: 'profile', label: 'Walker Registration & Profile', icon: PawPrint }
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                        setActiveTab(item.id);
                        setSearchParams({ tab: item.id });
                        localStorage.setItem('walkingDashboardTab', item.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                      activeTab === item.id 
                        ? 'bg-[#0F2E23] text-white shadow-md' 
                        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={activeTab === item.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-emerald-600'} />
                      <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.extra !== undefined && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.extra}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <button
            onClick={() => {
              toast.success('Logged out successfully');
              navigate('/');
            }}
            className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
              Walking Provider Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your dog walking appointments, active routes, and walker profile.
            </p>
          </div>
        </div>

        {/* KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 mb-10">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#0F2E23]/30 transition duration-300 shadow-sm hover:shadow-md group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Walk Appointments</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-slate-100">
                <PawPrint size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1">{stats.totalListings}</div>
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-2">All time</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Pending Walks</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-emerald-100">
                <MapPin size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.availableStock}</div>
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-2 relative z-10">In queue</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-rose-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Completed Walks</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-rose-100">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-3xl font-sans font-black text-[#0F2E23] mb-1 relative z-10">{stats.soldOutCount}</div>
            <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-2 relative z-10">Dogs walked</div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#ffd000]/80 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#ffd000]/10 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Total Earnings</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-amber-100">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹{stats.revenue.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-2 relative z-10">
              {stats.totalOrders} total sessions
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-sky-500/50 transition duration-300 shadow-sm hover:shadow-md group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Discounts Given</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition duration-300 border border-sky-100">
                <Tag size={16} />
              </div>
            </div>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <div className="text-2xl font-sans font-black text-[#0F2E23]">₹{stats.discounts.toLocaleString('en-IN')}</div>
            </div>
            <div className="text-[10px] text-sky-600 font-black uppercase tracking-wider mt-2 relative z-10">Total savings offered</div>
          </div>

        </div>

        {/* TAB CONTENT */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <WalkingProviderContent activeTab={activeTab} />
        </div>
      </main>

    </div>
  );
};

export default WalkingProviderDashboard;
