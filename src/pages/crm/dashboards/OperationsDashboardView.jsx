import React from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperationsDashboardView({
  staff = [],
  inventory = [],
  onApproveRestock,
  tasks = [],
  onToggleTask
}) {
  const facilityStations = [
    { name: 'Grooming Table 1 (Hydrobath)', status: 'Occupied', current: 'Bruno (Golden Retriever)', staff: 'Meera K.', timeRemaining: '25 min' },
    { name: 'Grooming Table 2 (Styling)', status: 'Occupied', current: 'Simba (GSD)', staff: 'Asha S.', timeRemaining: '40 min' },
    { name: 'Vet Exam Room 1', status: 'In Consultation', current: 'Milo (Beagle)', staff: 'Dr. Ananya', timeRemaining: '15 min' },
    { name: 'Vet Surgery Suite 2', status: 'Available', current: 'Cleaned & Ready', staff: 'Nurse Staff', timeRemaining: '-' },
    { name: 'Daycare Yard Alpha (High Energy)', status: 'Active Play', current: '12 Active Dogs', staff: 'Rahul V.', timeRemaining: 'Till 4 PM' },
    { name: 'Daycare Quiet Pen Beta (Cats & Seniors)', status: 'Active Rest', current: 'Luna + 5 Seniors', staff: 'Care Assistant', timeRemaining: 'Till 6 PM' }
  ];

  return (
    <div className="space-y-6">
      {/* Operations Quick Overview Banner */}
      <div className="bg-gradient-to-r from-[#10221E] via-[#0E1B19] to-[#0A1312] border border-blue-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Operations & Facilities Command
              </span>
              <span className="text-xs text-slate-400">Bangalore Central Flagship</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Facility Utilization & Staff Roster
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Live monitoring of grooming stations, clinical rooms, day pens, and supply stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-emerald-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Utilization</div>
              <div className="text-lg font-bold text-emerald-400">84.2%</div>
            </div>
            <div className="bg-[#142321] px-4 py-2 rounded-xl border border-emerald-900/40 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Staff on Floor</div>
              <div className="text-lg font-bold text-blue-400">7 / 7 Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Live Facility Stations & Shift Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Facility Stations Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Live Station Capacity & Usage
                </h3>
                <p className="text-[11px] text-slate-400">Real-time status of service tables, consultation bays, and playpens</p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">6 of 6 Monitored</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {facilityStations.map((station, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl bg-[#0C1514] border border-emerald-900/30 hover:border-emerald-700/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-slate-100">{station.name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      station.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : station.status === 'In Consultation'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {station.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-emerald-950/60 flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-300 font-medium">{station.current}</span>
                      <div className="text-[10px] text-slate-500">Lead: {station.staff}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {station.timeRemaining}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supply Chain & Restock Approval Queue */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" /> Supply Inventory & Purchase Orders
                </h3>
                <p className="text-[11px] text-slate-400">Restock approvals for salon cosmetics, surgical supplies, and pet food</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {inventory.map((item) => {
                const needsOrder = item.stock <= item.minRequired;
                return (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-[#0C1514] border border-emerald-900/25 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Dept: <span className="text-slate-300">{item.department}</span> • Min Threshold: {item.minRequired} units
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className={`font-bold ${needsOrder ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.stock} in stock
                        </div>
                        <div className="text-[10px] text-slate-500">{item.status}</div>
                      </div>

                      {needsOrder ? (
                        <button
                          onClick={() => {
                            if (onApproveRestock) onApproveRestock(item.id);
                            toast.success(`Purchase order generated for ${item.name}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                        >
                          Approve Restock PO
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-medium flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> Adequate
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Staff Shift Roster & Operational Tasks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Shift Roster */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-400" /> On-Duty Shift Roster
            </h3>
            <div className="space-y-3">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/40" />
                    <div>
                      <div className="font-semibold text-slate-200">{member.name}</div>
                      <div className="text-[10px] text-slate-400">{member.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-medium text-[10px] border border-emerald-500/30">
                      {member.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">{member.shift}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Checklist */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">Facility Maintenance & Sanitation</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between text-slate-300">
                <span>Playpen UV Disinfection Cycle</span>
                <span className="text-emerald-400 text-[11px] font-bold">Done (07:30 AM)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between text-slate-300">
                <span>Autoclave Sterilization for Vet Tools</span>
                <span className="text-emerald-400 text-[11px] font-bold">Done (08:45 AM)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between text-slate-300">
                <span>HVAC HEPA Air Filter Replacement</span>
                <span className="text-amber-400 text-[11px] font-bold">Scheduled 06 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
