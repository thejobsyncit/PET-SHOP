import React from 'react';
import { X, Dog, ShieldAlert, Heart, Calendar, Syringe, Scissors, Phone, Mail, MapPin } from 'lucide-react';

export default function PetDetailsModal({ pet, onClose }) {
  if (!pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0E1716] border border-emerald-800/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#12221F] to-[#0D1917] border-b border-emerald-900/40 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
              {pet.avatarEmoji || '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{pet.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {pet.type} • {pet.gender || 'Pet'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{pet.breed} • {pet.age} • {pet.weight}</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3" /> Parent: {pet.parentName} ({pet.parentPhone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs">
          {/* Medical Alerts & Allergies */}
          <div className="p-4 rounded-xl bg-[#142321] border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">Allergies & Medical Sensitivities</div>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                {pet.allergies || 'No known allergies reported.'}
              </p>
            </div>
          </div>

          {/* Temperament & Diet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#121E1C] border border-emerald-900/30">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                <Heart className="w-4 h-4 text-emerald-400" /> Temperament & Behavior
              </div>
              <p className="text-slate-300 leading-relaxed">
                {pet.temperament || 'Friendly and calm.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121E1C] border border-emerald-900/30">
              <div className="font-bold text-teal-300 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-4 h-4 text-teal-400" /> Feeding & Diet Notes
              </div>
              <p className="text-slate-300 leading-relaxed">
                {pet.dietNotes || 'Standard balanced kibble.'}
              </p>
            </div>
          </div>

          {/* Grooming / Styling Preference */}
          <div className="p-4 rounded-xl bg-[#121E1C] border border-emerald-900/30">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
              <Scissors className="w-4 h-4 text-amber-400" /> Styling & Grooming Guidelines
            </div>
            <p className="text-slate-300 leading-relaxed">
              {pet.groomingNotes || 'Standard breed bath & grooming routine.'}
            </p>
          </div>

          {/* Vaccinations Table */}
          {pet.vaccinations && pet.vaccinations.length > 0 && (
            <div>
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-emerald-400" /> Vaccination Record
              </h3>
              <div className="rounded-xl border border-emerald-900/40 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#142321] text-slate-400 border-b border-emerald-900/40 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Vaccine Name</th>
                      <th className="px-3 py-2">Administered</th>
                      <th className="px-3 py-2">Valid Until</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/60 bg-[#0F1A18]">
                    {pet.vaccinations.map((vac, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 font-medium text-slate-200">{vac.name}</td>
                        <td className="px-3 py-2 text-slate-400">{vac.date}</td>
                        <td className="px-3 py-2 text-slate-400">{vac.validUntil}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vac.status.includes('DUE')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {vac.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#121E1C] border-t border-emerald-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
