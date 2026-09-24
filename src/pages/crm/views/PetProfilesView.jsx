import React, { useState } from 'react';
import { Dog, Search, Syringe, Heart, Scissors, ShieldAlert, ChevronRight, Plus } from 'lucide-react';

export default function PetProfilesView({ pets = [], onSelectPet }) {
  const [search, setSearch] = useState('');

  const filtered = pets.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.breed.toLowerCase().includes(search.toLowerCase()) ||
    p.parentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dog className="w-5 h-5 text-emerald-400" /> Digital Pet Health & Profile Dossiers
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clinical history, styling guidelines, vaccination trackers, and dietary instructions
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pet or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((pet) => (
          <div 
            key={pet.id}
            onClick={() => onSelectPet && onSelectPet(pet)}
            className="p-5 rounded-2xl bg-[#101C1A] border border-emerald-900/30 hover:border-emerald-600/50 transition-all flex flex-col justify-between shadow-xl cursor-pointer group"
          >
            <div>
              {/* Pet Avatar & Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform flex-shrink-0">
                  {pet.avatarEmoji || '🐾'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors truncate">
                      {pet.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {pet.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{pet.breed}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{pet.age} • {pet.weight}</div>
                </div>
              </div>

              {/* Allergies / Medical Note */}
              <div className="mt-4 p-2.5 rounded-xl bg-[#0C1514] border border-amber-500/30 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Medical & Allergy Note
                </div>
                <p className="text-slate-300 text-[11px] truncate">
                  {pet.allergies}
                </p>
              </div>

              {/* Vaccines overview */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-emerald-400" />
                  {pet.vaccinations ? `${pet.vaccinations.length} Vaccines Logged` : 'Vaccines Up to Date'}
                </span>
                <span className="text-slate-300 font-medium">Parent: {pet.parentName}</span>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                Open Clinical Dossier <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
