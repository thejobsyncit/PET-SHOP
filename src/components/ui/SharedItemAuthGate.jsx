import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Lock, ShieldCheck, Heart, ShoppingBag, ArrowRight, Sparkles, UserPlus, LogIn } from 'lucide-react';

/**
 * SharedItemAuthGate
 * Restricts viewing of shared product and pet listings to logged-in / registered users only.
 * If the user is unauthenticated, locks the content, displays a high-end sign-in gate,
 * and automatically opens the registration/login modal.
 */
const SharedItemAuthGate = ({
  itemType = 'pet', // 'pet' | 'product' | 'adoption'
  itemName = '',
  itemCategory = '',
  requireAuthOnlyWhenShared = true,
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isShared = 
    searchParams.get('shared') === 'true' ||
    searchParams.get('shared') === '1' ||
    searchParams.get('share') === 'true' ||
    searchParams.get('share') === '1' ||
    searchParams.get('ref') === 'share' ||
    searchParams.get('source') === 'share';

  const shouldGate = isShared || !requireAuthOnlyWhenShared;

  const { isAuthenticated, user: reduxUser } = useSelector((state) => state.auth);
  const storedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem('joshpetshub_user') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('joshpetshub_user') ||
        'null'
      );
    } catch (_) {
      return null;
    }
  })();

  const isAuthed = Boolean(
    isAuthenticated ||
    (reduxUser && (reduxUser._id || reduxUser.id || reduxUser.email)) ||
    (storedUser && (storedUser._id || storedUser.id || storedUser.email))
  );

  // Automatically trigger the registration/login modal for unauthenticated recipients
  useEffect(() => {
    if (shouldGate && !isAuthed) {
      const timer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('open-register-modal', {
            detail: {
              tab: 'user',
              hideProviderTab: true,
              source: isShared ? 'shared-link' : 'item-access',
              message: `Sign in or register to view this ${itemType === 'product' ? 'product' : 'pet'} listing`
            }
          })
        );
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [shouldGate, isAuthed, isShared, itemType]);

  // If not requiring auth for this access mode, or user is already authenticated
  if (!shouldGate || isAuthed) {
    return <>{children}</>;
  }

  // Fallback directory link based on item type
  const directoryLink =
    itemType === 'product'
      ? { to: '/shop', label: 'Browse Public Shop Catalog' }
      : itemType === 'adoption'
      ? { to: '/adopt', label: 'Browse Public Adoption Directory' }
      : { to: '/pets', label: 'Browse Public Pet Directory' };

  const handleOpenRegister = () => {
    window.dispatchEvent(
      new CustomEvent('open-register-modal', {
        detail: {
          tab: 'user',
          hideProviderTab: true,
          source: 'shared-link-gate'
        }
      })
    );
  };

  const handleGoToLogin = () => {
    navigate('/login', {
      state: {
        from: location.pathname + location.search
      }
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 md:py-20 bg-gradient-to-b from-[#faf8f2] via-white to-[#f4efe4]">
      <div className="max-w-xl w-full bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d4af37] via-[#0F2E23] to-[#d4af37]" />

        {/* Ambient Lock Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-[#b89228] shadow-md">
          <Lock size={36} className="text-[#b89228]" />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F2E23] text-white flex items-center justify-center text-xs font-black shadow-sm">
            ✓
          </span>
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 text-amber-900 text-[11px] font-black uppercase tracking-wider border border-amber-300">
            <ShieldCheck size={14} className="text-[#b89228]" />
            <span>Member Access • Login or Register to View</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
            {itemName ? `Sign In to View "${itemName}"` : `Sign In to View This ${itemType === 'product' ? 'Product' : 'Pet'}`}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            This {itemType === 'product' ? 'product' : 'pet listing'} was shared with you on <strong>Josh Pets Hub</strong>. 
            To protect animal welfare, prevent fraudulent inquiries, and provide verified parent access, please log in or create a free account to view complete photos, pricing, and contact details.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full sm:w-1/2 py-3.5 px-5 bg-[#0F2E23] hover:bg-[#163e30] active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Log In to View</span>
            </button>

            <button
              type="button"
              onClick={handleOpenRegister}
              className="w-full sm:w-1/2 py-3.5 px-5 bg-[#ffd000] hover:bg-[#ffdf4d] active:scale-95 text-[#0F2E23] text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Create Free Account</span>
            </button>
          </div>

          <div className="pt-2">
            <Link
              to={directoryLink.to}
              className="text-xs font-bold text-[#b89228] hover:underline inline-flex items-center gap-1"
            >
              <span>← {directoryLink.label}</span>
            </Link>
          </div>
        </div>

        {/* Trust Points */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck size={12} /> 100% Free Registration
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <Sparkles size={12} /> Instant Access After Sign-In
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <Heart size={12} /> Verified Animal Welfare Platform
          </span>
        </div>

      </div>
    </div>
  );
};

export default SharedItemAuthGate;
