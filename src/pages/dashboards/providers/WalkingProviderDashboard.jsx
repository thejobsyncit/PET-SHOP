import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateProfile } from '../../../store/slices/authSlice.js';
import {
  PawPrint, Calendar, Star, TrendingUp, DollarSign, Clock, MapPin, 
  MessageSquare, Plus, Search, ChevronRight, ChevronLeft, Phone, ShieldCheck, Mail, Heart, Settings,
  Tag, ShoppingBag, AlertCircle, LayoutDashboard, LogOut, CheckCircle, X, Send, CreditCard, Loader2, Edit3, Check, Stethoscope, FileText, Building, User,
  Trash2, Clock3, CheckCircle2, Paperclip, Image, Bell, Volume2, VolumeX, Copy, Share2, Camera
} from 'lucide-react';
import { apiRequest } from '../../../services/api.js';
import { getStoredWalkingProviders, getStoredWalkingBookings, saveWalkingProvider } from '../../../data/walkingData.js';
import { safeSetItem, safeGetItem } from '../../../utils/safeStorage.js';
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
      const allBookings = getStoredWalkingBookings() || [];
      // Filter bookings for this provider
      const myBookings = Array.isArray(allBookings) ? allBookings.filter(b => b && b.providerId === myProvider.id) : [];
      
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

  // Block Calendar State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState(() => {
    const saved = safeGetItem('walking_blocked_calendar_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'BLK-1', date: '2026-10-10', timeSlot: 'Afternoon (02:00 PM - 05:00 PM)', reason: 'Personal Time Off' }
    ];
  });

  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'Full Day (All Slots)',
    reason: 'Personal Time Off'
  });

  const handleBlockCalendarSubmit = (e) => {
    e.preventDefault();
    if (!blockForm.date) {
      toast.error('Please select a date to block');
      return;
    }

    const newBlocked = {
      id: `BLK-${Date.now().toString().slice(-4)}`,
      date: blockForm.date,
      timeSlot: blockForm.timeSlot,
      reason: blockForm.reason.trim() || 'Unavailable'
    };

    const updated = [newBlocked, ...blockedSlots];
    setBlockedSlots(updated);
    safeSetItem('walking_blocked_calendar_v1', JSON.stringify(updated));
    setShowBlockModal(false);
    toast.success(`Calendar blocked for ${blockForm.date} (${blockForm.timeSlot})`);
  };

  const handleUnblockSlot = (id) => {
    const updated = blockedSlots.filter(s => s.id !== id);
    setBlockedSlots(updated);
    safeSetItem('walking_blocked_calendar_v1', JSON.stringify(updated));
    toast.success('Calendar slot unblocked successfully!');
  };

  const handleUpdateApptStatus = (apptId, newStatus) => {
    const updated = appointments.map(a => a.id === apptId ? { ...a, status: newStatus } : a);
    setAppointments(updated);
    toast.success(`Appointment ${apptId} marked as ${newStatus}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Walk Appointments</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your upcoming and pending dog walks.</p>
        </div>
        <button 
          onClick={() => setShowBlockModal(true)}
          className="bg-[#0F2E23] hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm active:scale-95"
        >
          <Plus size={16} /> Block Calendar
        </button>
      </div>

      {/* Blocked Calendar Overview Bar */}
      {blockedSlots.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-600" /> Currently Blocked Slots ({blockedSlots.length})
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Clients cannot book walks during these times</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {blockedSlots.map((slot) => (
              <div key={slot.id} className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-800">{slot.date}</span>
                  <span className="text-slate-400 text-[10px] mx-1.5">•</span>
                  <span className="text-amber-800 font-medium text-[11px]">{slot.timeSlot}</span>
                  {slot.reason && <span className="text-slate-500 text-[10px] block">Note: {slot.reason}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblockSlot(slot.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Unblock date"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${appt.status === 'Confirmed' || appt.status === 'Scheduled' || appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : appt.status === 'In Progress' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
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
                      <button 
                        onClick={() => handleUpdateApptStatus(appt.id, 'Confirmed')}
                        className="flex-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Accept Walk
                      </button>
                      <button 
                        onClick={() => handleUpdateApptStatus(appt.id, 'Declined')}
                        className="flex-1 w-full bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  ) : appt.status === 'In Progress' ? (
                    <button 
                      onClick={() => handleUpdateApptStatus(appt.id, 'Completed')}
                      className="flex-1 w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      Complete Walk
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleUpdateApptStatus(appt.id, 'In Progress')}
                        className="flex-1 w-full bg-[#0F2E23] hover:bg-[#1a4a3b] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Start Walk
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block Calendar Modal */}
      {showBlockModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowBlockModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F2E23] text-white flex items-center justify-center shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[#0F2E23] text-base">Block Walker Calendar</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Mark unavailable days or shifts on your profile</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowBlockModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBlockCalendarSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Date *</label>
                <input 
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={blockForm.date}
                  onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Time Slot to Block *</label>
                <select
                  value={blockForm.timeSlot}
                  onChange={(e) => setBlockForm({ ...blockForm, timeSlot: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="Full Day (All Slots)">Full Day (All Slots)</option>
                  <option value="Morning Shift (06:00 AM - 10:00 AM)">Morning Shift (06:00 AM - 10:00 AM)</option>
                  <option value="Afternoon Shift (02:00 PM - 05:00 PM)">Afternoon Shift (02:00 PM - 05:00 PM)</option>
                  <option value="Evening Shift (05:00 PM - 08:00 PM)">Evening Shift (05:00 PM - 08:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Vacation, Medical Leave, Personal Errands"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowBlockModal(false)} 
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#0F2E23] text-white rounded-xl font-black uppercase tracking-wider hover:bg-[#163e30] cursor-pointer shadow-md"
                >
                  Block Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RoutesModule = () => {
  const DEFAULT_ROUTES = [
    { id: 'RT-1', name: 'Indiranagar Morning Route', duration: '60 mins', distance: '3.5 km', capacity: 'Up to 4 dogs', slots: '2 Available', active: true, area: 'Indiranagar 100ft Rd & Defence Colony' },
    { id: 'RT-2', name: 'Koramangala Evening Stroll', duration: '45 mins', distance: '2.0 km', capacity: 'Up to 3 dogs', slots: 'Full', active: true, area: 'Koramangala 4th & 5th Block' },
    { id: 'RT-3', name: 'HSR Layout Weekend Pack', duration: '90 mins', distance: '5.0 km', capacity: 'Up to 6 dogs', slots: '4 Available', active: false, area: 'HSR Layout Sector 2 & Park' }
  ];

  const [routes, setRoutes] = useState(() => {
    const saved = safeGetItem('walking_routes_list_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_ROUTES;
  });

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({
    name: '',
    duration: '60 mins',
    distance: '3.5 km',
    capacity: 'Up to 4 dogs',
    slots: '2 Available',
    area: '',
    active: true
  });

  const handleOpenCreateModal = () => {
    setEditingRoute(null);
    setRouteForm({
      name: '',
      duration: '60 mins',
      distance: '3.0 km',
      capacity: 'Up to 4 dogs',
      slots: '3 Available',
      area: '',
      active: true
    });
    setShowRouteModal(true);
  };

  const handleOpenEditModal = (route) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name,
      duration: route.duration,
      distance: route.distance,
      capacity: route.capacity,
      slots: route.slots,
      area: route.area || '',
      active: route.active
    });
    setShowRouteModal(true);
  };

  const handleSaveRoute = (e) => {
    e.preventDefault();
    if (!routeForm.name.trim()) {
      toast.error('Please enter a route name');
      return;
    }

    let updated;
    if (editingRoute) {
      updated = routes.map(r => r.id === editingRoute.id ? { ...r, ...routeForm } : r);
      toast.success('Route updated successfully!');
    } else {
      const newRoute = {
        id: `RT-${Date.now().toString().slice(-4)}`,
        ...routeForm
      };
      updated = [newRoute, ...routes];
      toast.success('New route created successfully!');
    }
    setRoutes(updated);
    safeSetItem('walking_routes_list_v1', JSON.stringify(updated));
    setShowRouteModal(false);
  };

  const handleDeleteRoute = (routeId) => {
    const updated = routes.filter(r => r.id !== routeId);
    setRoutes(updated);
    safeSetItem('walking_routes_list_v1', JSON.stringify(updated));
    setShowRouteModal(false);
    toast.success('Route deleted successfully!');
  };

  const handleToggleRouteActive = (routeId) => {
    const updated = routes.map(r => r.id === routeId ? { ...r, active: !r.active } : r);
    setRoutes(updated);
    safeSetItem('walking_routes_list_v1', JSON.stringify(updated));
    toast.success('Route status updated');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Active Routes</h2>
          <p className="text-sm text-slate-500 font-medium">Manage your standard walking routes and pack capacity.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm cursor-pointer active:scale-95"
        >
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
                <button
                  type="button"
                  onClick={() => handleToggleRouteActive(route.id)}
                  title="Click to toggle status"
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${route.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {route.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              <h3 className="text-base font-black text-[#0F2E23] mb-1">{route.name}</h3>
              <p className="text-xs font-bold text-slate-500 mb-1">{route.distance} • {route.duration}</p>
              {route.area && (
                <p className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1">
                  <MapPin size={11} /> {route.area}
                </p>
              )}
              
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
              
              <button 
                onClick={() => handleOpenEditModal(route)}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Route Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Route Modal */}
      {showRouteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowRouteModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F2E23] text-white flex items-center justify-center shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[#0F2E23] text-base">
                    {editingRoute ? 'Edit Walking Route' : 'Create New Walking Route'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure route distance, duration, and pack capacity</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowRouteModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Route Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Indiranagar Morning Route"
                  value={routeForm.name}
                  onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Area / Landmark</label>
                <input 
                  type="text"
                  placeholder="e.g. Indiranagar 100ft Rd & Defence Colony"
                  value={routeForm.area}
                  onChange={(e) => setRouteForm({ ...routeForm, area: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration *</label>
                  <select
                    value={routeForm.duration}
                    onChange={(e) => setRouteForm({ ...routeForm, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                    <option value="120 mins">120 mins</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Distance *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 3.5 km"
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pack Capacity *</label>
                  <select
                    value={routeForm.capacity}
                    onChange={(e) => setRouteForm({ ...routeForm, capacity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Solo Walk (1 dog)">Solo Walk (1 dog)</option>
                    <option value="Up to 2 dogs">Up to 2 dogs</option>
                    <option value="Up to 3 dogs">Up to 3 dogs</option>
                    <option value="Up to 4 dogs">Up to 4 dogs</option>
                    <option value="Up to 6 dogs">Up to 6 dogs</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Availability *</label>
                  <select
                    value={routeForm.slots}
                    onChange={(e) => setRouteForm({ ...routeForm, slots: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Full">Full (0 slots)</option>
                    <option value="1 Available">1 Available</option>
                    <option value="2 Available">2 Available</option>
                    <option value="3 Available">3 Available</option>
                    <option value="4 Available">4 Available</option>
                    <option value="Open Enrolment">Open Enrolment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Route Status</span>
                  <span className="text-[10px] text-slate-500">Enable or disable booking visibility for this route</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRouteForm({ ...routeForm, active: !routeForm.active })}
                  className={`w-12 h-6 rounded-full relative transition cursor-pointer ${
                    routeForm.active ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                    routeForm.active ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                {editingRoute && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoute(editingRoute.id)}
                    className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold cursor-pointer transition"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowRouteModal(false)} 
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#0F2E23] text-white rounded-xl font-black uppercase tracking-wider hover:bg-[#163e30] cursor-pointer shadow-md"
                >
                  {editingRoute ? 'Save Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MessagesModule = ({ user }) => {
  const DEFAULT_CONVERSATIONS = [
    { 
      id: 1, 
      name: 'Vikram Singh', 
      pet: 'Luna (Husky)', 
      date: 'Today, 10:30 AM', 
      isUnread: true,
      avatarColor: 'bg-blue-100 text-blue-600',
      initials: 'VS',
      phone: '+91 98765 43210',
      messages: [
        { id: 'm1', sender: 'client', text: 'Hi! Are you available for morning walks at Cubbon Park next week?', time: '10:30 AM' }
      ]
    },
    { 
      id: 2, 
      name: 'Anita Menon', 
      pet: 'Max (GSD)', 
      date: 'Yesterday, 4:15 PM', 
      isUnread: true,
      avatarColor: 'bg-emerald-100 text-emerald-600',
      initials: 'AM',
      phone: '+91 98450 12345',
      messages: [
        { id: 'm2', sender: 'client', text: 'Hello, what is your rate for a solo walk in Koramangala?', time: 'Yesterday, 4:15 PM' }
      ]
    },
    { 
      id: 3, 
      name: 'Rahul Desai', 
      pet: 'Buddy (Retriever)', 
      date: 'Sep 02, 2026', 
      isUnread: false,
      avatarColor: 'bg-purple-100 text-purple-600',
      initials: 'RD',
      phone: '+91 97312 98765',
      messages: [
        { id: 'm3', sender: 'client', text: "Thanks for the walk today! Buddy loved it. Let's schedule again for Friday.", time: 'Sep 02, 11:20 AM' },
        { id: 'm4', sender: 'provider', text: 'You are welcome Rahul! Friday morning 7:00 AM slot is reserved for Buddy.', time: 'Sep 02, 11:45 AM' }
      ]
    },
    {
      id: 4,
      name: 'Sneha Patel',
      pet: 'Milo (Beagle)',
      date: 'Aug 30, 2026',
      isUnread: false,
      avatarColor: 'bg-amber-100 text-amber-700',
      initials: 'SP',
      phone: '+91 99001 54321',
      messages: [
        { id: 'm5', sender: 'client', text: 'Milo is a bit shy with large dogs. Do you offer solo walking options?', time: 'Aug 30, 02:15 PM' },
        { id: 'm6', sender: 'provider', text: 'Hi Sneha! Yes, we have dedicated 1-on-1 solo walks for sensitive dogs, tailored to Milo.', time: 'Aug 30, 02:40 PM' }
      ]
    },
    {
      id: 5,
      name: 'Priya Sharma',
      pet: 'Coco (Shih Tzu)',
      date: 'Aug 25, 2026',
      isUnread: false,
      avatarColor: 'bg-rose-100 text-rose-700',
      initials: 'PS',
      phone: '+91 98111 22334',
      messages: [
        { id: 'm7', sender: 'client', text: 'Can we book an evening walk slot around 5:30 PM in Indiranagar?', time: 'Aug 25, 05:10 PM' }
      ]
    }
  ];

  const [conversations, setConversations] = useState(() => {
    const saved = safeGetItem('walking_inquiries_threads_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            ...c,
            messages: Array.isArray(c.messages) && c.messages.length > 0 
              ? c.messages 
              : [{ id: `m-${c.id}-0`, sender: 'client', text: c.message || 'Hi, interested in walking service.', time: c.date || '10:00 AM' }]
          }));
        }
      } catch (e) {}
    }
    return DEFAULT_CONVERSATIONS;
  });

  const [selectedInquiryId, setSelectedInquiryId] = useState(() => {
    return conversations[0]?.id || 1;
  });
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Chat Settings State
  const [chatSettings, setChatSettings] = useState(() => {
    const saved = safeGetItem('walking_chat_settings_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      soundAlerts: true,
      autoReply: false,
      autoReplyMessage: 'Hi! Swift Paws Walking is currently out on scheduled dog walks. We will reply within 30 minutes!',
      isMuted: false
    };
  });

  const activeConversation = useMemo(() => {
    return conversations.find(c => String(c.id) === String(selectedInquiryId)) || conversations[0] || null;
  }, [conversations, selectedInquiryId]);

  const currentIndex = useMemo(() => {
    return conversations.findIndex(c => String(c.id) === String(activeConversation?.id));
  }, [conversations, activeConversation]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiryId, conversations]);

  const handleSelectConversation = (id) => {
    setSelectedInquiryId(id);
    setShowAddMenu(false);
    const updated = conversations.map(c => String(c.id) === String(id) ? { ...c, isUnread: false } : c);
    setConversations(updated);
    safeSetItem('walking_inquiries_threads_v1', JSON.stringify(updated));
  };

  const handlePrevConversation = () => {
    if (currentIndex > 0) {
      handleSelectConversation(conversations[currentIndex - 1].id);
    }
  };

  const handleNextConversation = () => {
    if (currentIndex < conversations.length - 1) {
      handleSelectConversation(conversations[currentIndex + 1].id);
    }
  };

  const appendMessage = (newMsg) => {
    const updated = conversations.map(c => {
      if (String(c.id) === String(activeConversation?.id)) {
        return {
          ...c,
          isUnread: false,
          date: 'Just now',
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    });

    setConversations(updated);
    safeSetItem('walking_inquiries_threads_v1', JSON.stringify(updated));
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'provider',
      text: replyText.trim(),
      time: timeNow
    };

    appendMessage(newMsg);
    setReplyText('');
    toast.success('Message sent to client!');
  };

  // "+ Add" Quick Actions Handler
  const handleQuickAdd = (type, payload) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let newMsg = null;

    if (type === 'gps') {
      newMsg = {
        id: `msg-gps-${Date.now()}`,
        sender: 'provider',
        text: '📍 Walker Checked-In: "Indiranagar Green Loop" — Walk is live and on schedule. Track route in real-time!',
        time: timeNow
      };
      toast.success('Shared live GPS route check-in!');
    } else if (type === 'report') {
      newMsg = {
        id: `msg-rep-${Date.now()}`,
        sender: 'provider',
        text: '🐾 Walk Summary: 45 min walk completed | 3.2 km distance | Potty break ✅ | Hydration break ✅ | Energy level: High & Happy 🐶',
        time: timeNow
      };
      toast.success('Sent walk summary report!');
    } else if (type === 'rate') {
      newMsg = {
        id: `msg-rate-${Date.now()}`,
        sender: 'provider',
        text: '💳 Swift Paws Rates: Solo Walk (45 mins) — ₹300 | 5-Day Weekly Pass — ₹1,400. Includes GPS tracking & treats!',
        time: timeNow
      };
      toast.success('Sent service rate card!');
    } else if (type === 'confirm') {
      newMsg = {
        id: `msg-conf-${Date.now()}`,
        sender: 'provider',
        text: '✅ Walk Confirmed: Reserved for tomorrow morning at 7:00 AM. Our verified walker will arrive on time!',
        time: timeNow
      };
      toast.success('Sent booking confirmation!');
    } else if (type === 'photo') {
      newMsg = {
        id: `msg-pic-${Date.now()}`,
        sender: 'provider',
        text: '📷 Photo Update: Having a wonderful walk in the park! 🐾',
        image: payload || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60',
        time: timeNow
      };
      toast.success('Attached walk photo!');
    }

    if (newMsg) {
      appendMessage(newMsg);
    }
    setShowAddMenu(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        handleQuickAdd('photo', uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setChatSettings(newSettings);
    safeSetItem('walking_chat_settings_v1', JSON.stringify(newSettings));
    toast.success('Chat settings saved!');
    setShowSettingsModal(false);
  };

  const handleMarkAsUnread = () => {
    if (!activeConversation) return;
    const updated = conversations.map(c => 
      String(c.id) === String(activeConversation.id) ? { ...c, isUnread: true } : c
    );
    setConversations(updated);
    safeSetItem('walking_inquiries_threads_v1', JSON.stringify(updated));
    toast.success(`Marked conversation with ${activeConversation.name} as unread`);
    setShowSettingsModal(false);
  };

  const handleClearHistory = () => {
    if (!activeConversation) return;
    const updated = conversations.map(c => {
      if (String(c.id) === String(activeConversation.id)) {
        return { ...c, messages: [] };
      }
      return c;
    });
    setConversations(updated);
    safeSetItem('walking_inquiries_threads_v1', JSON.stringify(updated));
    toast.success('Chat history cleared');
    setShowSettingsModal(false);
  };

  const handleExportChat = () => {
    if (!activeConversation) return;
    const transcript = (activeConversation.messages || [])
      .map(m => `[${m.time}] ${m.sender === 'provider' ? 'You' : activeConversation.name}: ${m.text}`)
      .join('\n');
    navigator.clipboard?.writeText(transcript);
    toast.success('Chat transcript copied to clipboard!');
  };

  const unreadCount = conversations.filter(c => c.isUnread).length;

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return conversations;
    return conversations.filter(c => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const petMatch = c.pet?.toLowerCase().includes(q);
      const phoneMatch = c.phone?.toLowerCase().includes(q);
      const dateMatch = c.date?.toLowerCase().includes(q);
      const textMatch = c.messages?.some(m => m.text?.toLowerCase().includes(q));
      return nameMatch || petMatch || phoneMatch || dateMatch || textMatch;
    });
  }, [conversations, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-[#0F2E23]">Client Inquiries</h2>
          <p className="text-sm text-slate-500 font-medium">Respond to pet owners interested in your walking services.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            {unreadCount} Unread
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[560px]">
        {/* Left Side: Inbox List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..." 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800" 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-1">
              <span>{filteredInquiries.length} of {conversations.length} inquiries</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-emerald-600 font-bold hover:underline">
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Search size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-medium">No inquiries found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = String(inq.id) === String(activeConversation?.id);
                const lastMsg = inq.messages && inq.messages.length > 0 ? inq.messages[inq.messages.length - 1].text : '';
                return (
                  <div 
                    key={inq.id} 
                    onClick={() => handleSelectConversation(inq.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600 shadow-2xs' 
                        : 'hover:bg-white border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-sm font-bold ${inq.isUnread ? 'text-[#0F2E23]' : 'text-slate-700'}`}>{inq.name}</h4>
                        {inq.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{inq.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 mb-1.5 flex items-center gap-1">
                      <PawPrint size={10}/> {inq.pet}
                    </div>
                    <p className={`text-xs line-clamp-2 ${inq.isUnread ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                      {lastMsg}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white relative">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${activeConversation?.avatarColor || 'bg-blue-100 text-blue-600'}`}>
                {activeConversation?.initials || 'C'}
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F2E23] flex items-center gap-2">
                  {activeConversation?.name}
                  {activeConversation?.isUnread && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">New</span>
                  )}
                </h3>
                <p className="text-xs font-bold text-emerald-600">Client • {activeConversation?.pet} • {activeConversation?.phone || '+91 98000 00000'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Prev / Next buttons to move from one message to another */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevConversation}
                  disabled={currentIndex <= 0}
                  className="p-1.5 text-slate-500 hover:text-[#0F2E23] disabled:text-slate-300 disabled:cursor-not-allowed transition rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Previous message"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[11px] font-bold text-slate-400 px-2 select-none">
                  {currentIndex + 1}/{conversations.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextConversation}
                  disabled={currentIndex >= conversations.length - 1}
                  className="p-1.5 text-slate-500 hover:text-[#0F2E23] disabled:text-slate-300 disabled:cursor-not-allowed transition rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Next message"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Settings icon button */}
              <button 
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-slate-400 hover:text-[#0F2E23] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Chat Settings"
              >
                <Settings size={18}/>
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            <div className="flex flex-col items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Conversation with {activeConversation?.name}
              </span>
            </div>
            
            {activeConversation?.messages && activeConversation.messages.length > 0 ? (
              activeConversation.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-3 ${msg.sender === 'provider' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    msg.sender === 'provider' 
                      ? 'bg-[#0F2E23] text-white' 
                      : (activeConversation?.avatarColor || 'bg-blue-100 text-blue-600')
                  }`}>
                    {msg.sender === 'provider' ? 'You' : (activeConversation?.initials || 'C')}
                  </div>
                  <div className={`p-3.5 rounded-2xl shadow-sm max-w-[80%] ${
                    msg.sender === 'provider' 
                      ? 'bg-[#0F2E23] text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-emerald-900/30">
                        <img src={msg.image} alt="Walk attachment" className="w-full max-h-48 object-cover rounded-xl" />
                      </div>
                    )}
                    <span className={`text-[9px] font-bold mt-1.5 block ${
                      msg.sender === 'provider' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No messages yet. Send a message to start conversation.</p>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>
          
          {/* Quick Reply Pills */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
            {[
              "Hi! Yes, I am available.",
              "My standard rate is ₹300 per walk.",
              "I can pick up the pet for morning walk.",
              "Can you confirm your society & flat number?"
            ].map((quick, qIdx) => (
              <button
                key={qIdx}
                type="button"
                onClick={() => setReplyText(quick)}
                className="text-[11px] bg-white border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* "+ Add" Popover Menu */}
          {showAddMenu && (
            <div className="absolute bottom-20 left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 w-72 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Add Walk Attachment</span>
                <button onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
                >
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Image size={15} /></div>
                  <span>Upload Walk Photo / Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAdd('gps')}
                  className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
                >
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={15} /></div>
                  <span>Share Live GPS Route Stamp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAdd('report')}
                  className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
                >
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><CheckCircle2 size={15} /></div>
                  <span>Send Walk Completion Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAdd('rate')}
                  className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
                >
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><CreditCard size={15} /></div>
                  <span>Send Service Rate Card (₹300)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAdd('confirm')}
                  className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
                >
                  <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg"><Clock size={15} /></div>
                  <span>Confirm Scheduled Walk Slot</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input for image upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              {/* "+ Add" icon button next to text field */}
              <button 
                type="button"
                onClick={() => setShowAddMenu(prev => !prev)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  showAddMenu 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-50 border-slate-200'
                }`}
                title="Add walk update, photo, or rate card"
              >
                <Plus size={20}/>
              </button>

              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800" 
              />
              <button 
                type="submit"
                disabled={!replyText.trim()}
                className="p-2.5 bg-[#0F2E23] text-white hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                title="Send message"
              >
                <Send size={18}/>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Settings Modal (Item 5) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#0F2E23] flex items-center gap-2">
                  <Settings size={20} className="text-emerald-600" />
                  Conversation Settings
                </h3>
                <p className="text-xs text-slate-500">Preferences for {activeConversation?.name} ({activeConversation?.pet})</p>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Notification Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">Sound Notifications</h5>
                    <p className="text-[11px] text-slate-500">Play alert sound on incoming replies</p>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={chatSettings.soundAlerts}
                  onChange={(e) => setChatSettings({ ...chatSettings, soundAlerts: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Auto Reply Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">Walker Auto-Responder</h5>
                      <p className="text-[11px] text-slate-500">Automatically reply when on active walk</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={chatSettings.autoReply}
                    onChange={(e) => setChatSettings({ ...chatSettings, autoReply: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                {chatSettings.autoReply && (
                  <textarea 
                    value={chatSettings.autoReplyMessage}
                    onChange={(e) => setChatSettings({ ...chatSettings, autoReplyMessage: e.target.value })}
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Enter auto-response text..."
                  />
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleMarkAsUnread}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail size={16} /> Mark Conversation as Unread
                </button>

                <button
                  type="button"
                  onClick={handleExportChat}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy size={16} /> Copy Full Chat Transcript
                </button>

                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 size={16} /> Clear Conversation History
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSaveSettings(chatSettings)}
                className="flex-1 py-2.5 bg-[#0F2E23] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [balance, setBalance] = useState(12500);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const initialForm = { bankName: '', accountNumber: '', ifsc: '', amount: '' };
  const [form, setForm] = useState(initialForm);
  const [transactions, setTransactions] = useState([
    { id: 'WA-098', pet: 'Buddy (Golden Retriever)', date: 'Sep 04, 2026 • 07:00 AM', status: 'Cleared', amount: 300, isCredit: true },
    { id: 'WA-097', pet: 'Luna (Husky)', date: 'Sep 03, 2026 • 06:30 AM', status: 'Cleared', amount: 400, isCredit: true },
    { id: 'WD-012', pet: 'Bank Transfer', date: 'Sep 01, 2026', status: 'Processed', amount: 5000, isCredit: false }
  ]);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const withdrawAmt = Number(form.amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (withdrawAmt > balance) {
      toast.error(`Withdrawal amount cannot exceed available balance of ₹${balance.toLocaleString('en-IN')}`);
      return;
    }
    setBalance(prev => prev - withdrawAmt);
    setTransactions([
      {
        id: 'WD-' + Math.floor(100 + Math.random() * 900),
        pet: `Bank Transfer (${form.bankName || 'HDFC Bank'})`,
        date: 'Today',
        status: 'Processed',
        amount: withdrawAmt,
        isCredit: false
      },
      ...transactions
    ]);
    toast.success(`Withdrawal of ₹${withdrawAmt.toLocaleString('en-IN')} initiated successfully! Funds will credit within 24 hours.`);
    setForm(initialForm);
    setShowWithdrawModal(false);
  };

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
          <div className="text-4xl font-black mb-4">₹{balance.toLocaleString('en-IN')}</div>
          <button 
            type="button"
            onClick={() => {
              setForm(initialForm);
              setShowWithdrawModal(true);
            }}
            className="w-full bg-white text-[#0F2E23] hover:bg-emerald-50 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
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
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Description / Pet</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{t.pet}</td>
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${t.isCredit ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {t.isCredit ? `+₹${t.amount.toLocaleString('en-IN')}` : `-₹${t.amount.toLocaleString('en-IN')}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b border-slate-100 shrink-0 bg-white z-10">
              <h3 className="font-sans font-black text-base sm:text-lg text-[#0F2E23]">Withdraw Funds to Bank</h3>
              <button 
                type="button"
                onClick={() => setShowWithdrawModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 sm:px-8 py-6 flex-1 custom-scrollbar">
              <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="e.g. 9845001239841"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={form.ifsc}
                    onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full mt-1 border rounded-lg p-2.5 font-bold text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Withdrawal Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={balance}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="e.g. 5000"
                    className="w-full mt-1 border rounded-lg p-2.5 font-black text-sm text-[#0F2E23]"
                  />
                  <span className="text-[10px] text-slate-400">Available: ₹{balance.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2E23] text-white font-black py-3 rounded-xl uppercase tracking-wider mt-2 cursor-pointer hover:bg-[#164E3D] transition shadow-sm"
                >
                  Confirm Withdrawal
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WalkingProviderContent = ({ activeTab, user }) => {
  switch (activeTab) {
    case 'appointments': return <AppointmentsModule user={user} />;
    case 'routes': return <RoutesModule />;
    case 'messages': return <MessagesModule user={user} />;
    case 'reviews': return <ReviewsModule user={user} />;
    case 'wallet': return <WalletModule />;
    case 'profile': return <div className="p-8 text-center text-slate-500 font-medium">Profile management coming soon...</div>;
    default: return <AppointmentsModule user={user} />;
  }
};

const WalkingProviderDashboard = ({ 
  currentProvider, 
  profiles, 
  handleToggleOnline 
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storedTab = safeGetItem('walkingDashboardTab');
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
      safeSetItem('walkingDashboardTab', activeTabParam);
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

  const displayAvatar = user?.avatar || user?.profilePicture || currentProvider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';
  const displayName = user?.name || currentProvider?.name || 'Provider';

  return (
    <div className="min-h-auto lg:h-screen bg-[#FAF9F5] text-slate-900 font-sans selection:bg-[#0F2E23]/20 selection:text-[#0F2E23] flex flex-col lg:flex-row">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border-r border-slate-200 relative lg:sticky top-0 lg:top-[104px] h-auto lg:h-[calc(100vh-104px)] flex flex-col justify-between overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 pt-6 lg:pt-12 space-y-8">
          
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
                        safeSetItem('walkingDashboardTab', item.id);
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
      <main className="flex-1 min-w-0 px-6 lg:px-8 pt-12 pb-10 overflow-x-hidden">
        
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
        <div className="bg-white rounded-3xl p-8 lg:p-4 lg:p-10 border border-slate-200 min-h-[500px] shadow-sm">
          <WalkingProviderContent activeTab={activeTab} user={user} />
        </div>
      </main>

    </div>
  );
};

export default WalkingProviderDashboard;
