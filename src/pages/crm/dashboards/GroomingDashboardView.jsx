import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Check, 
  AlertCircle, 
  Heart,
  Droplets,
  Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroomingDashboardView({ appointments = [], onSelectPet }) {
  const [activeChecklist, setActiveChecklist] = useState({
    hydrobath: true,
    blowdry: true,
    brushing: true,
    earCleaning: false,
    nailClip: false,
    scissorCut: false,
    bandana: false
  });

  const groomingAppointments = appointments.filter(
    a => a.serviceCategory === 'Grooming' || a.staffRole === 'GROOMING_LEAD'
  );

  const toggleCheck = (key) => {
    setActiveChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinishGroom = () => {
    toast.success('Bruno’s Full Grooming completed! Automated SMS & WhatsApp notification sent to Arun Kumar for pickup.');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1F1C12] via-[#1A170F] to-[#12100A] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pet Styling Studio & Spa
              </span>
              <span className="text-xs text-slate-400">Master Groomer: Meera Kapoor</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Active Grooming Stations & Pet Styling Queues
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Live timers, coat conditioning notes, service checklists, and before & after tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-amber-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Slots Today</div>
              <div className="text-lg font-bold text-amber-400">12 Bookings</div>
            </div>
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-amber-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
              <div className="text-lg font-bold text-emerald-400">5 Finished</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Station on Table 1 & Queue */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Pet on Styling Table 1 */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Currently on Grooming Table 1
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 35 Mins Elapsed
              </span>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0C1514] border border-amber-500/20 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0">
                🐶
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">Bruno (Golden Retriever)</h4>
                  <span className="text-xs font-semibold text-emerald-400">Full Grooming (₹1,850)</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Parent: Arun Kumar (+91 98840 11223)
                </p>
                <div className="mt-2 p-2 rounded-lg bg-[#142321] border border-amber-500/20 text-xs text-amber-200">
                  ⚠️ <span className="font-semibold">Styling Directive:</span> Teddy cut scissor trim on head. Use hypoallergenic oatmeal bath. Sensitive outer ear canal — hand dry only around ears!
                </div>
              </div>
            </div>

            {/* Live Interactive Grooming Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Service Step-by-Step Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'hydrobath', label: 'Hydrobath Oatmeal Wash' },
                  { key: 'blowdry', label: 'Gentle Warm Blowdry' },
                  { key: 'brushing', label: 'De-shedding & Undercoat Brush' },
                  { key: 'earCleaning', label: 'Ear Cleaning & Antiseptic Wipe' },
                  { key: 'nailClip', label: 'Nail Clip & Smooth Dremel' },
                  { key: 'scissorCut', label: 'Head & Paw Scissor Styling' },
                  { key: 'bandana', label: 'Lavender Scent & Free Bandana' }
                ].map(({ key, label }) => {
                  const isChecked = activeChecklist[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCheck(key)}
                      className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 font-medium'
                          : 'bg-[#0C1514] border border-emerald-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{label}</span>
                      {isChecked ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complete Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleFinishGroom}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                <Sparkles className="w-4 h-4" /> Mark Grooming Complete & Notify Parent
              </button>
            </div>
          </div>

          {/* Upcoming Grooming Appointments Queue */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" /> Next in Grooming Salon Queue
            </h3>
            <div className="space-y-3">
              {groomingAppointments.slice(1).map((apt) => (
                <div key={apt.id} className="p-3 rounded-xl bg-[#0C1514] border border-emerald-900/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{apt.petAvatar}</div>
                    <div>
                      <div className="font-bold text-slate-200">{apt.petName} ({apt.petBreed})</div>
                      <div className="text-slate-400 text-[11px]">{apt.service} • Assigned to {apt.staffName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">{apt.time}</span>
                    <div className="text-[10px] text-slate-500">₹{apt.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Spa Up-sell & Coat Care Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spa Up-Sells Tracker */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Spa Add-ons & Treatment Boosters
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Enzymatic Teeth Brushing</div>
                  <div className="text-[10px] text-slate-400">Mint breath refresher</div>
                </div>
                <span className="text-emerald-400 font-bold">+₹350</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Shea Butter Paw Pad Balm</div>
                  <div className="text-[10px] text-slate-400">Protects cracked paws</div>
                </div>
                <span className="text-emerald-400 font-bold">+₹250</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Flea & Tick Neem Rinse</div>
                  <div className="text-[10px] text-slate-400">Organic pest repellent</div>
                </div>
                <span className="text-emerald-400 font-bold">+₹450</span>
              </div>
            </div>
          </div>

          {/* Client Transformation Photo Station */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" /> Grooming Transformation Gallery
            </h3>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Snap high-definition before & after photos for pet parents to receive instantly on WhatsApp.
            </p>
            <button
              onClick={() => toast.success('Photo capture studio opened!')}
              className="w-full py-2 rounded-xl bg-[#142321] hover:bg-[#192d2b] border border-emerald-700/40 text-emerald-300 font-semibold flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" /> Upload Pet Transformation Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
