import React, { useState } from 'react';
import { 
  Home, 
  Dog, 
  Utensils, 
  Footprints, 
  Clock, 
  CheckCircle, 
  Plus, 
  Send, 
  AlertCircle,
  Heart,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BoardingDashboardView({ suites = [], onSelectPet }) {
  const [walkLogs, setWalkLogs] = useState([
    { id: 1, pet: 'Max (Rottweiler)', time: '08:30 AM', duration: '30 mins', handler: 'Rahul', notes: 'Great energy, brisk jog around turf' },
    { id: 2, pet: 'Bella (Labrador)', time: '10:00 AM', duration: '20 mins', handler: 'Care Staff', notes: 'Calm stroll, did potty twice' }
  ]);

  const [feedingLogs, setFeedingLogs] = useState([
    { id: 1, time: '08:00 AM', pet: 'Max (Rottweiler)', meal: 'Royal Canin Maxi (400g)', completed: true },
    { id: 2, time: '01:00 PM', pet: 'Luna (Persian Cat)', meal: 'Warmed Gravy Pouch + Catnip Treat', completed: true },
    { id: 3, time: '02:00 PM', pet: 'Bella (Labrador)', meal: 'Anti-anxiety calming chew with peanut butter', completed: false },
    { id: 4, time: '07:30 PM', pet: 'Max (Rottweiler)', meal: 'Evening Kibble + Glucosamine tab', completed: false }
  ]);

  const toggleFeed = (id) => {
    setFeedingLogs(prev => prev.map(f => f.id === id ? { ...f, completed: !f.completed } : f));
  };

  const handleSendParentUpdate = (petName) => {
    toast.success(`Photo & play update dispatched to parent of ${petName} on WhatsApp!`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#17121E] via-[#140E1B] to-[#0E0A13] border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Boarding Suites & Daycare Playpen
              </span>
              <span className="text-xs text-slate-400">Supervisor: Rahul Verma</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Kennel Occupancy Matrix & Pet Care Logs
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Live suite allocations, dietary regimens, temperament-matched playgroups, and potty logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-purple-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Suites Occupied</div>
              <div className="text-lg font-bold text-purple-400">18 / 24 Beds</div>
            </div>
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-purple-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Daycare Pets</div>
              <div className="text-lg font-bold text-emerald-400">18 Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Suites Matrix & Care Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Suites Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-400" /> Live Kennel & Suite Allocation Matrix
                </h3>
                <p className="text-[11px] text-slate-400">Climate-controlled luxury suites & daycare pens</p>
              </div>
              <span className="text-xs text-purple-400 font-semibold">75% Occupancy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suites.map((suite) => (
                <div 
                  key={suite.id}
                  className="p-3.5 rounded-xl bg-[#0C1514] border border-emerald-900/30 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{suite.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        suite.status === 'Occupied' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : suite.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {suite.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2">
                      {suite.pet ? (
                        <div className="font-semibold text-purple-300">{suite.pet}</div>
                      ) : (
                        <div className="text-slate-500 italic">No guest assigned</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Checkout: {suite.checkOut}</span>
                    {suite.pet && (
                      <button 
                        onClick={() => handleSendParentUpdate(suite.pet)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        title="Send photo update"
                      >
                        <Camera className="w-3 h-3" /> Update
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperament-Based Playgroup Matching */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Dog className="w-4 h-4 text-emerald-400" /> Temperament Playgroup Compatibility Map
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0C1514] border border-blue-500/30">
                <div className="font-bold text-blue-300">Group Alpha (High Energy)</div>
                <p className="text-[11px] text-slate-400 mt-1">Labradors, Boxers, Huskies. High fetch & agility stimulation.</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold">6 Dogs on Yard</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0C1514] border border-amber-500/30">
                <div className="font-bold text-amber-300">Group Beta (Gentle Seniors)</div>
                <p className="text-[11px] text-slate-400 mt-1">Shih Tzus, Senior Beagles, Pugs. Low impact couch cuddles.</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold">5 Dogs in Soft Pen</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0C1514] border border-purple-500/30">
                <div className="font-bold text-purple-300">Group Gamma (Cats & Solo)</div>
                <p className="text-[11px] text-slate-400 mt-1">Private climbing cat tree condos and solo shy dog suites.</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-semibold">Luna + 2 Guests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Feeding & Walking Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Feeding & Medication Schedule */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" /> Feeding & Meds Schedule
            </h3>
            <div className="space-y-2.5 text-xs">
              {feedingLogs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleFeed(item.id)}
                  className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between cursor-pointer hover:border-emerald-600/40"
                >
                  <div>
                    <div className={`font-semibold ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.pet}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.time} • {item.meal}</div>
                  </div>
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outdoor Potty & Walking Tracker */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-teal-400" /> Outdoor Potty & Walk Logs
            </h3>
            <div className="space-y-2.5">
              {walkLogs.map((walk) => (
                <div key={walk.id} className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{walk.pet}</span>
                    <span className="text-emerald-400">{walk.time} ({walk.duration})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 italic">&ldquo;{walk.notes}&rdquo;</p>
                  <div className="text-[10px] text-slate-500 mt-1">Logged by: {walk.handler}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => toast.success('Outdoor walk logged for Max!')}
              className="mt-3 w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log New Outdoor Walk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
