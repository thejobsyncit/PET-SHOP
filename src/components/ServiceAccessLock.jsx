import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Lock, ShieldAlert, Heart, Home, Scissors, Footprints, 
  Truck, GraduationCap, ShieldCheck, Stethoscope, ArrowRight,
  Briefcase, Sparkles, AlertCircle, LogOut
} from 'lucide-react';

/**
 * Helper to check if a specific service path is locked for the logged-in user
 */
export const isServicePathLockedForUser = (user, targetPath = '') => {
  if (!user || user.role !== 'SERVICE_PROVIDER') return false;
  
  const category = (user.serviceCategory || '').toLowerCase().trim();
  const path = targetPath.toLowerCase().trim();

  // If user is a Pet Adoption service provider:
  if (category === 'pet adoption' || category === 'adoption') {
    // Only adoption and dashboard are allowed
    const isAdoptionPath = path === '/adopt' || path.startsWith('/adopt/') || path === '/provider-dashboard' || path === '/provider/dashboard' || path === '/account';
    return !isAdoptionPath;
  }

  // If user is a Pet Seller:
  if (category === 'pet seller') {
    const isSellerAllowed = path === '/pets' || path.startsWith('/pets') || path === '/provider-dashboard' || path === '/provider/dashboard' || path === '/account';
    return !isSellerAllowed;
  }

  // If user is another specific service provider (e.g. Grooming, Hostel, Vet, Walking, Transport, Training, Insurance)
  const allowedMap = {
    'pet hostel / boarding': ['/hostel', '/services/hostel'],
    'pet grooming spa': ['/grooming', '/services/grooming'],
    'pet walking & fitness': ['/walking', '/services/walking', '/dog-walking'],
    'pet transport & relocation': ['/transport', '/services/transport', '/pet-transport'],
    'pet training & behavior': ['/training', '/services/training', '/pet-training', '/dog-training'],
    'pet insurance': ['/insurance', '/services/insurance', '/pet-insurance'],
    'consult a vet': ['/veterinary', '/services/veterinary', '/vet', '/consult-a-vet'],
    'pet mating & breeding': ['/breeding']
  };

  const allowed = allowedMap[category];
  if (allowed) {
    const isAllowed = allowed.some(p => path === p || path.startsWith(`${p}/`)) || 
                      path === '/provider-dashboard' || 
                      path === '/provider/dashboard' || 
                      path === '/account';
    return !isAllowed;
  }

  return false;
};

/**
 * ServiceAccessLock Component
 * Displays a full-screen, high-end lock banner when a service provider attempts to view an unauthorized service page.
 */
const ServiceAccessLock = ({ serviceName = 'Pet Service', attemptedPath = '' }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const providerCategory = user?.serviceCategory || 'Service Provider';
  const isAdoptionProvider = providerCategory.toLowerCase().includes('adoption');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#FAF9F5]">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400"></div>

        {/* Lock Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-amber-600 shadow-md">
          <Lock size={36} className="animate-pulse" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
            ✕
          </span>
        </div>

        {/* Heading & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200">
            <ShieldAlert size={13} /> Access Restricted • Account Role Guard
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-black text-[#0F2E23] tracking-tight">
            {serviceName} is Locked
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            You are currently signed in as a verified <strong className="text-[#0F2E23]">{providerCategory}</strong>. 
            Access to other commercial service portals (such as {serviceName}) is restricted to specialized professionals in that domain.
          </p>
        </div>

        {/* Provider Profile summary box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Your Registered Service</span>
            <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
              {providerCategory}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold">Account Name:</span>
            <span className="font-bold text-slate-900">{user?.businessName || user?.name || 'Authorized Partner'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-bold">Authorized Dashboard:</span>
            <span className="font-bold text-[#0F2E23]">
              {isAdoptionProvider ? 'Pet Adoption & Sanctuary Hub' : `${providerCategory} Portal`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAdoptionProvider ? (
            <>
              <Link
                to="/provider-dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart size={16} className="text-[#ffd000]" /> Go to Adoption Dashboard
              </Link>
              <Link
                to="/adopt"
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
              >
                View Adoption Directory →
              </Link>
            </>
          ) : (
            <Link
              to="/provider-dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Briefcase size={16} className="text-[#ffd000]" /> Open My Provider Dashboard
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default ServiceAccessLock;
