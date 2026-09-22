import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  Network, 
  Sparkles, 
  Menu, 
  Check, 
  Layers,
  Crown
} from 'lucide-react';
import { CRM_ROLES } from '../crmData.js';

export default function CrmHeader({ 
  currentRole, 
  onRoleChange, 
  onOpenNewBooking, 
  onOpenOrgChart, 
  toggleSidebar,
  alertsCount = 3,
  onSearch,
  searchQuery
}) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList = Object.values(CRM_ROLES);

  // Greeting title based on active role
  const getGreeting = () => {
    const firstName = currentRole.holder.split(' ')[0];
    return `Good morning, ${firstName}`;
  };

  return (
    <header className="h-20 bg-[#0B1312]/90 backdrop-blur-md border-b border-emerald-900/30 px-6 flex items-center justify-between sticky top-0 z-20 gap-4">
      {/* Left: Greeting & Sidebar Toggle */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-800/20 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight truncate font-sans">
              {getGreeting()}
            </h1>
            {currentRole.id === 'SUPER_ADMIN' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                <Crown className="w-3 h-3 text-amber-400" /> Super Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">
            Here is your pet-care activity for today.
          </p>
        </div>
      </div>

      {/* Center: Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pets, parents, appointments..."
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-[#101C1A] border border-emerald-900/40 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right: Role Switcher & New Booking Action */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Role Impersonation Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#101C1A] hover:bg-[#152522] border border-emerald-800/30 hover:border-emerald-500/40 transition-all text-xs text-slate-200 shadow-sm group"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-emerald-500/50 flex-shrink-0">
              <img src={currentRole.avatar} alt={currentRole.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80">
                Viewing As
              </div>
              <div className="font-semibold text-white leading-none">
                {currentRole.name}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 transition-transform ${
              roleDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Role Dropdown Menu */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0E1716] border border-emerald-700/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-emerald-900/40 mb-1 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Switch Active Dashboard
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentRole.id === 'SUPER_ADMIN' 
                      ? 'Super Admin full access granted to all views' 
                      : 'Simulate specific role workflow'}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {rolesList.map((r) => {
                  const isSelected = r.id === currentRole.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onRoleChange(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs transition-colors text-left ${
                        isSelected 
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40' 
                          : 'text-slate-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <img 
                        src={r.avatar} 
                        alt={r.name} 
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/30 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate flex items-center gap-1.5">
                          {r.name}
                          {r.id === 'SUPER_ADMIN' && (
                            <Crown className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{r.holder} • {r.department}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Org Chart Shortcut */}
              <div className="mt-2 pt-2 border-t border-emerald-900/40">
                <button
                  onClick={() => {
                    setRoleDropdownOpen(false);
                    onOpenOrgChart();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/30 transition-colors"
                >
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  View Full Organization Chart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Org Chart Button */}
        <button
          onClick={onOpenOrgChart}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101C1A] hover:bg-[#152522] border border-emerald-800/30 hover:border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors"
          title="Interactive Organization Chart"
        >
          <Network className="w-4 h-4 text-teal-400" />
          <span className="hidden lg:inline">Org Chart</span>
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button 
            className="p-2.5 rounded-xl bg-[#101C1A] hover:bg-[#152522] border border-emerald-800/30 text-slate-400 hover:text-emerald-300 transition-colors relative"
            title="Clinic Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 flex items-center justify-center shadow-md">
                {alertsCount}
              </span>
            )}
          </button>
        </div>

        {/* + New Booking Primary CTA (Matching Reference Image) */}
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New booking</span>
        </button>
      </div>
    </header>
  );
}
