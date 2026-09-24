import React, { useState } from 'react';
import { 
  Network, 
  ShieldCheck, 
  Users, 
  Crown, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Lock,
  Layers,
  Building2,
  ExternalLink
} from 'lucide-react';
import { CRM_ROLES } from '../crmData.js';
import toast from 'react-hot-toast';

export default function OrgChartView({ onSelectRole, currentRole }) {
  const [selectedInspectRole, setSelectedInspectRole] = useState(null);

  const ceo = CRM_ROLES.SUPER_ADMIN;
  const ops = CRM_ROLES.OPERATIONS_MANAGER;
  const deptLeads = [
    CRM_ROLES.VETERINARIAN,
    CRM_ROLES.GROOMING_LEAD,
    CRM_ROLES.BOARDING_SUPERVISOR,
    CRM_ROLES.FRONT_DESK
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#10251F] via-[#0E1F1A] to-[#0A1411] border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Interactive Organizational Hierarchy
              </span>
              <span className="text-xs text-slate-400">Enterprise Governance Structure</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Pet Care Enterprise Organizational Chart
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Click any role node to immediately switch into that role&apos;s specialized dashboard or inspect their operational permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Super Admin can access all roles:</span>
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Full Access Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy Tree */}
      <div className="flex flex-col items-center">
        {/* LEVEL 1: CEO / Super Admin */}
        <div className="relative group">
          <div className={`w-80 p-5 rounded-2xl bg-[#101C1A] border ${
            currentRole.id === ceo.id 
              ? 'border-emerald-400 ring-4 ring-emerald-500/20 shadow-2xl' 
              : 'border-emerald-700/40 hover:border-emerald-500'
          } shadow-xl transition-all`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={ceo.avatar} 
                  alt={ceo.holder} 
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                    {ceo.holder} <Crown className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">{ceo.title}</div>
                  <div className="text-[10px] text-slate-400">{ceo.department}</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
              {ceo.description}
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Reports: {ceo.directReportsCount} Dept Heads
              </span>
              <button
                onClick={() => {
                  onSelectRole(ceo);
                  toast.success(`Switched to ${ceo.name} dashboard!`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRole.id === ceo.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {currentRole.id === ceo.id ? 'Active Dashboard' : 'Switch to Role'}
              </button>
            </div>
          </div>

          {/* Vertical Connecting Line */}
          <div className="w-0.5 h-10 bg-emerald-600/60 mx-auto" />
        </div>

        {/* LEVEL 2: Operations Manager */}
        <div className="relative group">
          <div className={`w-80 p-5 rounded-2xl bg-[#101C1A] border ${
            currentRole.id === ops.id 
              ? 'border-blue-400 ring-4 ring-blue-500/20 shadow-2xl' 
              : 'border-blue-700/40 hover:border-blue-500'
          } shadow-xl transition-all`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={ops.avatar} 
                  alt={ops.holder} 
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/50"
                />
                <div>
                  <div className="font-bold text-sm text-white">
                    {ops.holder}
                  </div>
                  <div className="text-xs text-blue-400 font-medium">{ops.title}</div>
                  <div className="text-[10px] text-slate-400">{ops.department}</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
              {ops.description}
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Direct Reports: {ops.directReportsCount} Leads
              </span>
              <button
                onClick={() => {
                  onSelectRole(ops);
                  toast.success(`Switched to ${ops.name} dashboard!`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentRole.id === ops.id
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                }`}
              >
                {currentRole.id === ops.id ? 'Active Dashboard' : 'Switch to Role'}
              </button>
            </div>
          </div>

          {/* Vertical Connecting Line down to horizontal bar */}
          <div className="w-0.5 h-10 bg-emerald-600/60 mx-auto" />
        </div>

        {/* Horizontal Distributor Line for Department Leads */}
        <div className="hidden lg:block w-[90%] max-w-5xl h-0.5 bg-emerald-600/60 relative mb-6">
          <div className="absolute left-[12.5%] -top-2 w-0.5 h-4 bg-emerald-600/60" />
          <div className="absolute left-[37.5%] -top-2 w-0.5 h-4 bg-emerald-600/60" />
          <div className="absolute left-[62.5%] -top-2 w-0.5 h-4 bg-emerald-600/60" />
          <div className="absolute left-[87.5%] -top-2 w-0.5 h-4 bg-emerald-600/60" />
        </div>

        {/* LEVEL 3: Department Heads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl px-4">
          {deptLeads.map((role) => {
            const isActive = currentRole.id === role.id;
            return (
              <div 
                key={role.id}
                className={`p-4 rounded-2xl bg-[#101C1A] border ${
                  isActive 
                    ? 'border-emerald-400 ring-4 ring-emerald-500/20 shadow-2xl' 
                    : 'border-emerald-900/40 hover:border-emerald-600/50'
                } shadow-xl flex flex-col justify-between transition-all`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <img 
                      src={role.avatar} 
                      alt={role.holder} 
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/40 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{role.holder}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold truncate">{role.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{role.department}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-3 leading-relaxed line-clamp-3">
                    {role.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] font-mono text-slate-400 border border-emerald-900/30">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Team: {role.directReportsCount} staff</span>
                  <button
                    onClick={() => {
                      onSelectRole(role);
                      toast.success(`Switched to ${role.name} dashboard!`);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isActive ? 'Active' : 'Open View'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
