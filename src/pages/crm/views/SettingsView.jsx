import React from 'react';
import { Settings, Shield, Lock, Users, Key, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CRM_ROLES } from '../crmData.js';
import toast from 'react-hot-toast';

export default function SettingsView({ currentRole }) {
  const isSuperAdmin = currentRole.id === 'SUPER_ADMIN';

  const auditLogs = [
    { time: '10:14 AM', user: 'Priya Sharma (CEO)', action: 'Viewed Executive Financial Audit & P&L Statement', ip: '192.168.1.10' },
    { time: '09:45 AM', user: 'Meera Kapoor', action: 'Completed Grooming service for Bruno (₹1,850)', ip: '192.168.1.14' },
    { time: '09:12 AM', user: 'Kavya Nair', action: 'Processed UPI Payment ₹800 from Divya S.', ip: '192.168.1.20' },
    { time: '08:30 AM', user: 'Rajesh Menon', action: 'Approved Restock PO for Hypoallergenic Shampoo', ip: '192.168.1.12' }
  ];

  const handleReset = () => {
    localStorage.removeItem('pawora_crm_enterprise_state_v1');
    toast.success('CRM Local storage state reset to default template!');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" /> Enterprise Role Permissions & Security
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access control levels, encryption status, and operational audit trail
        </p>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Organizational Role Permissions Matrix
        </h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C1514] text-slate-400 border-b border-emerald-950 font-semibold">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Access Level</th>
                <th className="p-3">Active Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60">
              {Object.values(CRM_ROLES).map((role) => (
                <tr key={role.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <img src={role.avatar} alt={role.name} className="w-6 h-6 rounded-md object-cover" />
                    {role.name}
                  </td>
                  <td className="p-3 text-slate-400">{role.department}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      role.id === 'SUPER_ADMIN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {role.id === 'SUPER_ADMIN' ? 'Full Master Access' : 'Department Scoped'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-[#142321] text-[9px] font-mono text-emerald-400/80 border border-emerald-900/30">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Trail */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" /> Real-time System Audit Trail
        </h3>
        <div className="space-y-2 text-xs">
          {auditLogs.map((log, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#0C1514] border border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold font-mono text-[11px]">{log.time}</span>
                <span className="font-semibold text-slate-200">{log.user}:</span>
                <span className="text-slate-300">{log.action}</span>
              </div>
              <span className="text-slate-500 font-mono text-[10px]">{log.ip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Reset Tool */}
      <div className="p-5 rounded-2xl bg-[#14120A] border border-amber-500/30 flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-amber-300">Reset Demo CRM State</div>
          <p className="text-slate-400 mt-0.5">Reset stored appointments, tasks, and messages back to original mock data</p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset State
        </button>
      </div>
    </div>
  );
}
