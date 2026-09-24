import React, { useState } from 'react';
import { 
  Stethoscope, 
  Syringe, 
  FileText, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Plus, 
  ShieldAlert,
  Thermometer,
  Pill
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VetDashboardView({ 
  appointments = [],
  pets = [],
  onSelectPet
}) {
  const [prescriptions, setPrescriptions] = useState([
    { id: 'rx-1', pet: 'Milo (Beagle)', drug: 'Amoxicillin Trihydrate 250mg', dosage: '1 tab every 12 hrs', duration: '7 days', doctor: 'Dr. Ananya Sen', date: 'Today' },
    { id: 'rx-2', pet: 'Rocky (Labrador)', drug: 'GlycoFlex Plus Joint Supplement', dosage: '2 chews daily with food', duration: '30 days', doctor: 'Dr. Ananya Sen', date: 'Yesterday' }
  ]);

  const [showRxModal, setShowRxModal] = useState(false);
  const [rxPet, setRxPet] = useState('Milo (Beagle)');
  const [rxDrug, setRxDrug] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxDuration, setRxDuration] = useState('5 days');

  const vetAppointments = appointments.filter(a => a.serviceCategory === 'Veterinary' || a.staffName.includes('Ananya'));

  const handleAddRx = (e) => {
    e.preventDefault();
    if (!rxDrug.trim()) return;
    const newRx = {
      id: `rx-${Date.now()}`,
      pet: rxPet,
      drug: rxDrug,
      dosage: rxDosage || '1 tab twice daily',
      duration: rxDuration,
      doctor: 'Dr. Ananya Sen',
      date: 'Today'
    };
    setPrescriptions([newRx, ...prescriptions]);
    toast.success(`Prescription issued for ${rxPet}`);
    setRxDrug('');
    setRxDosage('');
    setShowRxModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1E1118] via-[#1A0F15] to-[#120B0F] border border-rose-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Veterinary Medical Station & EHR
              </span>
              <span className="text-xs text-slate-400">Chief Vet: Dr. Ananya Sen (BVSc, MVSc Surgery)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Clinical Consultations & Surgery Queue
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Electronic Health Records, digital prescription dispatch, vaccine certifications, and triage.
            </p>
          </div>

          <button
            onClick={() => setShowRxModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950"
          >
            <Pill className="w-4 h-4" /> Issue Digital Prescription (Rx)
          </button>
        </div>
      </div>

      {/* Grid: Consultations & Medical Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Clinical Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-400" /> Today&apos;s Consultation & Vaccine Cases
              </h3>
              <span className="text-xs text-slate-400">{vetAppointments.length || 2} Patients Scheduled</span>
            </div>

            <div className="space-y-3">
              {/* Consultation Card 1 */}
              <div className="p-4 rounded-xl bg-[#0C1514] border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-xl">
                      🐕
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        Milo <span className="text-xs font-normal text-slate-400">(Beagle • 4 Yrs • 14.8 kg)</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Parent: Kiran Patel (+91 99620 33445)
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Rabies Due in 2 Days
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#142321] border border-emerald-900/40 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-rose-300">Chief Complaint:</span> Annual booster + skin redness check on abdomen
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold">Slot: 03:15 PM</div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temp: 101.4°F • HR: 110 bpm
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowRxModal(true)}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40 text-[11px]"
                    >
                      Prescribe Rx
                    </button>
                    <button 
                      onClick={() => toast.success('Rabies booster certified and logged in digital registry!')}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]"
                    >
                      Certify Vaccine
                    </button>
                  </div>
                </div>
              </div>

              {/* Consultation Card 2 */}
              <div className="p-4 rounded-xl bg-[#0C1514] border border-emerald-900/20 hover:border-emerald-700/40 transition-all flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xl">
                      🐶
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        Bruno <span className="text-xs font-normal text-slate-400">(Golden Retriever • 3 Yrs • 31.5 kg)</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Parent: Arun Kumar (+91 98840 11223)
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Pre-Grooming Health Clearance
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#142321] border border-emerald-900/40 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-300">Observation:</span> Sensitive outer ear canal, cleared for gentle lavender groom.
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold">Cleared (10:15 AM)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Digital Prescriptions Log */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Digital Pharmacy Prescriptions (Rx)
              </h3>
              <span className="text-xs text-slate-400">Dispatched to Pharmacy</span>
            </div>

            <div className="space-y-2.5">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-3 rounded-xl bg-[#0C1514] border border-emerald-900/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{rx.drug}</div>
                    <div className="text-slate-400 text-[11px]">{rx.pet} • {rx.dosage} • {rx.duration}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Dispatched
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{rx.doctor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Medical Alerts & Quarantine Monitor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medical Quarantine / Isolation Ward */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-rose-900/40 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Medical Isolation Ward Status
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                Negative Contagion
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Isolation Room 1 & 2 are sanitised and available for infectious quarantine (parvo / kennel cough suspects).
            </p>
            <div className="p-3 rounded-xl bg-[#0C1514] border border-emerald-900/30 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Contagion Protocol Status:</span>
              <span className="text-emerald-400 font-bold">Level 0 (Clear)</span>
            </div>
          </div>

          {/* Vitals Logger */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Patient Vitals Logger Reference
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-[#0C1514] text-slate-300">
                <span>Canine Normal Temperature</span>
                <span className="text-slate-100 font-bold">101.0°F – 102.5°F</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#0C1514] text-slate-300">
                <span>Feline Normal Temperature</span>
                <span className="text-slate-100 font-bold">100.5°F – 102.5°F</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#0C1514] text-slate-300">
                <span>Canine Heart Rate (Resting)</span>
                <span className="text-slate-100 font-bold">60 – 140 bpm</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#0C1514] text-slate-300">
                <span>Feline Heart Rate (Resting)</span>
                <span className="text-slate-100 font-bold">140 – 220 bpm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Generator Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0E1716] border border-rose-800/40 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-rose-400" /> Digital Prescription Generator (Rx)
            </h3>
            <form onSubmit={handleAddRx} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Patient</label>
                <select
                  value={rxPet}
                  onChange={(e) => setRxPet(e.target.value)}
                  className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Milo (Beagle)">Milo (Beagle - Parent: Kiran Patel)</option>
                  <option value="Bruno (Golden Retriever)">Bruno (Golden - Parent: Arun Kumar)</option>
                  <option value="Luna (Persian Cat)">Luna (Persian - Parent: Divya S.)</option>
                  <option value="Simba (GSD)">Simba (GSD - Parent: Vikram Mehta)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Medication Name & Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cefpodoxime 200mg or Nexgard Spectra"
                  value={rxDrug}
                  onChange={(e) => setRxDrug(e.target.value)}
                  className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet twice daily after meals"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Course Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 5 days, 14 days"
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold"
                >
                  Issue Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
