import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Award, HeartHandshake, ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PetParentsView({ parents = [], onOpenMessage }) {
  const [search, setSearch] = useState('');

  const filtered = parents.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.pets.some(pet => pet.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Pet Parents & Client CRM Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track client loyalty tiers, contact details, pets registered, and lifetime spend
          </p>
        </div>

        <button
          onClick={() => toast.success('New client onboarding form opened!')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Pet Parent
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by parent name, phone, or pet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#101C1A] border border-emerald-900/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((parent) => (
          <div 
            key={parent.id}
            className="p-5 rounded-2xl bg-[#101C1A] border border-emerald-900/30 hover:border-emerald-700/40 transition-all flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{parent.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {parent.address}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> {parent.memberTier}
                </span>
              </div>

              {/* Pets Badge */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Registered Pets</div>
                <div className="font-medium text-emerald-300">{parent.pets.join(', ')}</div>
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#0C1514] border border-emerald-950">
                  <div className="text-[10px] text-slate-500">Total Visits</div>
                  <div className="font-bold text-white">{parent.totalVisits} visits</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0C1514] border border-emerald-950">
                  <div className="text-[10px] text-slate-500">Lifetime Spend</div>
                  <div className="font-bold text-emerald-400">₹{parent.lifetimeSpend.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-xs">
              <a 
                href={`tel:${parent.phone}`}
                className="text-slate-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> {parent.phone}
              </a>

              <button
                onClick={() => onOpenMessage ? onOpenMessage(parent) : toast.success(`Chat opened with ${parent.name}`)}
                className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-[11px] border border-emerald-500/30"
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
