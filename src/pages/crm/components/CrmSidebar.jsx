import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Dog, 
  Calendar, 
  Scissors, 
  Home, 
  Stethoscope, 
  MessageSquare, 
  BarChart3, 
  Network, 
  Settings, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CrmSidebar({ activeTab, setActiveTab, currentRole, isCollapsed, setIsCollapsed }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orgchart', label: 'Org Chart & Roles', icon: Network, highlight: true },
    { id: 'parents', label: 'Pet Parents', icon: Users },
    { id: 'pets', label: 'Pet Profiles', icon: Dog },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'grooming', label: 'Grooming', icon: Scissors },
    { id: 'boarding', label: 'Boarding & Daycare', icon: Home },
    { id: 'vet', label: 'Veterinary Clinic', icon: Stethoscope },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '2' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <aside className={`transition-all duration-300 ease-in-out flex flex-col bg-[#0B1312] border-r border-emerald-900/30 select-none z-30 ${
      isCollapsed ? 'w-20' : 'w-64'
    } min-h-screen text-slate-300`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-emerald-950/80 justify-between">
        <Link to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-emerald-50 tracking-wide flex items-center gap-1.5">
                PAWORA <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wider uppercase">CRM</span>
              </span>
              <span className="text-[11px] text-emerald-400/60 font-medium">Pet Care Enterprise</span>
            </div>
          )}
        </Link>
      </div>

      {/* Active Role Indicator Badge */}
      <div className={`px-4 py-3 border-b border-emerald-950/60 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed ? (
          <div className="bg-[#101C1A] border border-emerald-800/20 rounded-xl p-2.5 flex items-center gap-3">
            <img 
              src={currentRole.avatar} 
              alt={currentRole.holder} 
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentRole.holder}</div>
              <div className="text-[11px] text-emerald-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                {currentRole.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`${currentRole.holder} (${currentRole.name})`}>
            <img 
              src={currentRole.avatar} 
              alt={currentRole.holder} 
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-emerald-500/40"
            />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Operations Workspace
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group text-left ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-inner border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'
              }`} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Org
                    </span>
                  )}
                </>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-emerald-950/60 bg-[#070D0C]">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          title={isCollapsed ? 'Return to Store' : undefined}
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          {!isCollapsed && <span>Exit CRM to Store</span>}
        </Link>
      </div>
    </aside>
  );
}
