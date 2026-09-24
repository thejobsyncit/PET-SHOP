import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Shield,
  Building2,
  Users,
  ChevronRight,
  Stethoscope,
  Scissors,
  Home,
  Headphones,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { authenticateStaff, saveCrmSession, CRM_DEFAULT_PASSWORD, getStaffByRoleId } from '../crmAuth.js';
import { CRM_ROLES, INITIAL_STAFF } from '../crmData.js';
import toast from 'react-hot-toast';

export default function CrmLogin({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('priya@pawora-crm.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'quick-select'

  // Quick staff profiles for rapid 1-click access
  const demoProfiles = [
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'SUPER_ADMIN') || INITIAL_STAFF[0],
      role: CRM_ROLES.SUPER_ADMIN,
      icon: Crown,
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'OPERATIONS_MANAGER') || INITIAL_STAFF[1],
      role: CRM_ROLES.OPERATIONS_MANAGER,
      icon: Building2,
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'VETERINARIAN') || INITIAL_STAFF[2],
      role: CRM_ROLES.VETERINARIAN,
      icon: Stethoscope,
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'GROOMING_LEAD') || INITIAL_STAFF[3],
      role: CRM_ROLES.GROOMING_LEAD,
      icon: Scissors,
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'BOARDING_SUPERVISOR') || INITIAL_STAFF[5],
      role: CRM_ROLES.BOARDING_SUPERVISOR,
      icon: Home,
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      staff: INITIAL_STAFF.find(s => s.roleId === 'FRONT_DESK') || INITIAL_STAFF[6],
      role: CRM_ROLES.FRONT_DESK,
      icon: Headphones,
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    }
  ];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateStaff(identifier, password);
      setIsLoading(false);

      if (!result.success) {
        setErrorMessage(result.message);
        toast.error(result.message);
        return;
      }

      const session = saveCrmSession(result.staff, rememberMe);
      toast.success(`Welcome back, ${result.staff.name}!`, {
        icon: '🛡️',
        style: { background: '#081714', color: '#6EE7B7' }
      });

      if (onLoginSuccess) {
        onLoginSuccess(session, result.staff.role);
      }
    }, 400);
  };

  const handleQuickLogin = (profile) => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      const session = saveCrmSession(profile.staff, rememberMe);
      toast.success(`Logged in as ${profile.staff.name} (${profile.role.name})`, {
        icon: '✨',
        style: { background: '#081714', color: '#6EE7B7' }
      });
      if (onLoginSuccess) {
        onLoginSuccess(session, profile.role);
      }
    }, 300);
  };

  const handleSelectToForm = (profile) => {
    setIdentifier(profile.staff.email);
    setPassword(CRM_DEFAULT_PASSWORD);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-[#070D0C] text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Ambient background glow effects */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[600px] h-[350px] bg-teal-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-5 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header / Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/80 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-white tracking-wide flex items-center gap-2">
              PAWORA <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-semibold">CRM SUITE</span>
            </div>
            <p className="text-[11px] text-emerald-400/60 font-medium">Enterprise Pet Care Workstation</p>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-950/30 border border-transparent hover:border-emerald-800/30"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-xl">
          {/* Outer Glass Card */}
          <div className="bg-[#0B1413]/90 backdrop-blur-xl border border-emerald-800/30 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/80 relative">
            
            {/* Top Security Banner */}
            <div className="flex items-center justify-between pb-6 border-b border-emerald-900/30 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight uppercase">Authorized Staff Access Only</h2>
                  <p className="text-[11px] text-slate-400">Enterprise Role-Based Access Control</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Terminal
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#060D0C] rounded-xl border border-emerald-900/40 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'form'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Staff Credentials
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('quick-select')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'quick-select'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Quick Role Demo
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/30 text-emerald-200 uppercase font-bold">Fast</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: Credentials Form */}
            {activeTab === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Staff Email or ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Staff Email or ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., priya@pawora-crm.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#0E1B18] border border-emerald-900/50 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner font-sans"
                    />
                  </div>
                </div>

                {/* Password / Access Key */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Workstation Security Pin / Password
                    </label>
                    <span className="text-[11px] text-emerald-400/80 font-mono">
                      Demo PIN: admin123
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-500/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter workstation password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0E1B18] border border-emerald-900/50 rounded-xl pl-10 pr-11 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner font-sans tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Terminal ID */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-emerald-800 bg-[#0E1B18] text-emerald-500 focus:ring-emerald-500/40"
                    />
                    <span className="text-xs text-slate-400">Remember this terminal session</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-mono">Node #CRM-01</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Unlock CRM Suite</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: Quick Role Demo Roster */}
            {activeTab === 'quick-select' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-400 mb-3">
                  Click any verified staff profile to log in immediately with role permissions:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                  {demoProfiles.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.staff.id}
                        className="bg-[#0E1B18] border border-emerald-900/40 hover:border-emerald-500/50 rounded-xl p-3 flex flex-col justify-between transition-all hover:bg-[#12221F] group cursor-pointer"
                        onClick={() => handleQuickLogin(item)}
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          <img
                            src={item.staff.avatar}
                            alt={item.staff.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-emerald-500/40 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                              {item.staff.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{item.staff.title}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-900/30 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${item.tagColor}`}>
                            {item.role.name}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickLogin(item);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                          >
                            Sign In <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Security Footer */}
            <div className="mt-6 pt-5 border-t border-emerald-900/30 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
                256-Bit SSL Encrypted
              </span>
              <span>Pawora OS v2.4 • Confidential</span>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 z-10">
        Enterprise Veterinary & Pet Care Management • Unauthorized access attempts are monitored and logged.
      </div>
    </div>
  );
}
