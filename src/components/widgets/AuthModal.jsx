import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShoppingBag,
  Heart,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  ShieldCheck,
  PawPrint,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  login,
  register,
  closeAuthModal,
  setAuthModalMode,
  clearPendingAction
} from '../../store/slices/authSlice.js';
import {
  fetchCart,
  addToCartAPI,
  openCart
} from '../../store/slices/cartSlice.js';
import {
  fetchWishlist,
  toggleWishlistAPI
} from '../../store/slices/wishlistSlice.js';
import { validateEmailFormat } from '../../utils/emailValidator.js';

export default function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authModal, isAuthenticated, user } = useSelector((state) => state.auth);
  const isOpen = Boolean(authModal?.isOpen);
  const activeMode = authModal?.mode || 'login';
  const pendingAction = authModal?.pendingAction;
  const modalMessage = authModal?.message;

  // Active tab state inside modal: 'login' | 'signup'
  const [tab, setTab] = useState(activeMode);
  // Role selector: 'user' (Pet Parent) | 'provider' (Service Provider)
  const [role, setRole] = useState(authModal?.role === 'provider' ? 'provider' : 'user');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [signupError, setSignupError] = useState('');
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  // Keep local tab in sync when Redux changes mode
  useEffect(() => {
    if (authModal?.mode) {
      setTab(authModal.mode);
    }
  }, [authModal?.mode]);

  // Synchronize role if specified in modal request
  useEffect(() => {
    if (authModal?.role) {
      setRole(authModal.role === 'provider' ? 'provider' : 'user');
    }
  }, [authModal?.role]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Forward any openAuthModal trigger to the standard LeadConsultationModal signup popup
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(
        new CustomEvent('open-register-modal', {
          detail: { tab: 'user', hideProviderTab: true }
        })
      );
      dispatch(closeAuthModal());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleClose = () => {
    setLoginError('');
    setSignupError('');
    dispatch(closeAuthModal());
  };

  // Execute queued shopping/browsing actions after authentication
  const executePending = async (action, loggedInUser) => {
    if (!action) return;

    try {
      // Synchronize remote cart and wishlist for newly authenticated session
      await Promise.all([
        dispatch(fetchCart()),
        dispatch(fetchWishlist())
      ]);

      if (action.type === 'OPEN_CART') {
        dispatch(openCart());
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('josh_open_cart'));
          window.dispatchEvent(new CustomEvent('open-cart-drawer'));
        }
      } else if (action.type === 'NAVIGATE_WISHLIST') {
        navigate('/wishlist');
      } else if (action.type === 'NAVIGATE_CHECKOUT') {
        navigate('/checkout');
      } else if (action.type === 'ADD_TO_CART') {
        if (action.payload?.product) {
          const res = await dispatch(addToCartAPI(action.payload));
          if (addToCartAPI.fulfilled.match(res)) {
            toast.success(`${action.payload.product.name || 'Product'} added to your cart!`);
            dispatch(openCart());
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('josh_open_cart'));
              window.dispatchEvent(new CustomEvent('open-cart-drawer'));
            }
          }
        }
      } else if (action.type === 'TOGGLE_WISHLIST') {
        if (action.payload) {
          const res = await dispatch(toggleWishlistAPI(action.payload));
          if (toggleWishlistAPI.fulfilled.match(res)) {
            toast.success('Added to wishlist!');
          }
        }
      } else if (action.type === 'BUY_NOW') {
        if (action.payload?.product) {
          await dispatch(addToCartAPI(action.payload));
          navigate('/checkout');
        }
      } else if (action.type === 'ADD_BUNDLE') {
        if (action.payload?.product) {
          await dispatch(addToCartAPI({ product: action.payload.product, quantity: 1 }));
        }
        if (Array.isArray(action.payload?.items)) {
          for (const item of action.payload.items) {
            await dispatch(addToCartAPI({ product: item, quantity: 1 }));
          }
        }
        toast.success('Bundle added to cart!');
        dispatch(openCart());
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('josh_open_cart'));
          window.dispatchEvent(new CustomEvent('open-cart-drawer'));
        }
      }
    } catch (err) {
      console.warn('Pending action completion note:', err);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanIdentifier = (loginIdentifier || '').trim();
    if (!cleanIdentifier) {
      setLoginError('Please enter your email address or mobile number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoginSubmitting(true);
    try {
      const targetRole = role === 'provider' ? 'SERVICE_PROVIDER' : 'CUSTOMER';
      const actionResult = await dispatch(
        login({
          identifier: cleanIdentifier,
          email: cleanIdentifier,
          password: loginPassword,
          role: targetRole
        })
      );

      if (login.fulfilled.match(actionResult)) {
        const authedUser = actionResult.payload?.user;
        toast.success(`Welcome back, ${authedUser?.name || 'Pet Parent'}!`);
        
        // Execute pending action and close modal
        const currentPending = pendingAction;
        handleClose();
        if (currentPending) {
          await executePending(currentPending, authedUser);
        } else if (authedUser?.role === 'SERVICE_PROVIDER') {
          navigate('/provider-dashboard');
        }
      } else {
        const errorMsg = actionResult.payload || 'Invalid credentials. Please verify your details and try again.';
        setLoginError(errorMsg);
      }
    } catch (err) {
      setLoginError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    const cleanName = (signupName || '').trim();
    const cleanEmail = (signupEmail || '').trim().toLowerCase();
    const cleanMobile = (signupMobile || '').replace(/\D/g, '');

    if (!cleanName) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setSignupError('Please enter your email address.');
      return;
    }
    if (!validateEmailFormat(cleanEmail)) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (cleanMobile && cleanMobile.length !== 10) {
      setSignupError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!signupPassword) {
      setSignupError('Please create a password.');
      return;
    }

    // Password complexity check (8+ chars, upper, lower, digit)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(signupPassword)) {
      setSignupError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setSignupError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsSignupSubmitting(true);
    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile || '9876543210',
        password: signupPassword,
        role: role === 'provider' ? 'SERVICE_PROVIDER' : 'CUSTOMER'
      };

      const actionResult = await dispatch(register(payload));
      if (register.fulfilled.match(actionResult)) {
        const authedUser = actionResult.payload?.user;
        toast.success(`Account created successfully! Welcome ${cleanName}!`);
        
        // Execute pending action and close modal
        const currentPending = pendingAction;
        handleClose();
        if (currentPending) {
          await executePending(currentPending, authedUser);
        } else if (authedUser?.role === 'SERVICE_PROVIDER') {
          navigate('/provider-dashboard');
        }
      } else {
        const errorMsg = actionResult.payload || 'Registration failed. Please check your details.';
        setSignupError(errorMsg);
      }
    } catch (err) {
      setSignupError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSignupSubmitting(false);
    }
  };

  // Quick 1-click test credentials handler for instant verification
  const handleQuickDemoCustomer = () => {
    setLoginIdentifier('priya@joshpetshub.com');
    setLoginPassword('Pass@1234');
    setRole('user');
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-[160] overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-primary/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={handleClose} 
        aria-hidden="true" 
      />

      {/* Main Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner with Brand Theme */}
        <div className="bg-gradient-to-r from-[#0F2E23] via-[#163e30] to-[#0F2E23] px-6 pt-6 pb-5 text-white relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            title="Close popup"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <PawPrint size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-sans">
              Josh Pets Hub
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Sign in to continue' : 'Create your free account'}
          </h3>
          <p className="text-xs text-white/70 mt-1">
            {tab === 'login' 
              ? 'Access your cart, wishlist, and seamless pet shopping across all devices.' 
              : 'Join thousands of pet parents and discover premium pet essentials.'}
          </p>

          {/* Role Pill Switcher */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/80">Account Type:</span>
            <div className="inline-flex bg-white/10 p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  role === 'user' 
                    ? 'bg-amber-400 text-[#0F2E23] shadow-sm' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Pet Parent / Shopper
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  role === 'provider' 
                    ? 'bg-amber-400 text-[#0F2E23] shadow-sm' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Service Provider
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Context Message Banner (e.g. Cart or Wishlist prompt) */}
        {modalMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              {pendingAction?.type?.includes('WISHLIST') ? (
                <Heart size={16} className="fill-emerald-800" />
              ) : (
                <ShoppingBag size={16} />
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-900 leading-snug">
              {modalMessage}
            </p>
          </div>
        )}

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                dispatch(setAuthModalMode('login'));
                setLoginError('');
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-[#0F2E23] shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                dispatch(setAuthModalMode('signup'));
                setSignupError('');
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-[#0F2E23] shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {tab === 'login' ? (
            /* =================== LOGIN FORM =================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Quick 1-Click Demo Helper for quick testing */}
              {role === 'user' && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-900 truncate">
                      Demo User: Priya Sharma
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoCustomer}
                    className="px-2.5 py-1 text-[10px] font-bold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 active:scale-95 transition cursor-pointer shadow-2xs shrink-0"
                  >
                    1-Click Auto Fill
                  </button>
                </div>
              )}

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  {role === 'provider' ? 'Provider Email or Mobile' : 'Email Address or Mobile'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder={role === 'provider' ? 'provider@joshpetshub.com or 9876543210' : 'name@example.com or 9876543210'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    onClick={handleClose}
                    className="text-[11px] font-bold text-[#0F2E23] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoginSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    dispatch(setAuthModalMode('signup'));
                    setSignupError('');
                  }}
                  className="font-bold text-[#0F2E23] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* =================== SIGNUP FORM =================== */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      if (signupError) setSignupError('');
                    }}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      if (signupError) setSignupError('');
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Mobile Number (10 digits)
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2E23] focus-within:ring-2 focus-within:ring-emerald-100 transition bg-slate-50">
                  <div className="px-3 py-2 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={signupMobile}
                    onChange={(e) => {
                      setSignupMobile(e.target.value.replace(/\D/g, ''));
                      if (signupError) setSignupError('');
                    }}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs md:text-sm font-medium text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      if (signupError) setSignupError('');
                    }}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      if (signupError) setSignupError('');
                    }}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#0F2E23] focus:ring-[#0F2E23]"
                />
                <span>
                  I agree to the <span className="font-bold text-[#0F2E23]">Terms of Service</span> and{' '}
                  <span className="font-bold text-[#0F2E23]">Privacy Policy</span>.
                </span>
              </label>

              {/* Error Alert Box */}
              {signupError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSignupSubmitting}
                className="w-full py-3 bg-[#0F2E23] hover:bg-[#163e30] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSignupSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    dispatch(setAuthModalMode('login'));
                    setLoginError('');
                  }}
                  className="font-bold text-[#0F2E23] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Trust Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-semibold">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>256-Bit SSL Encrypted & VCI / AWBI Compliant Digital Platform</span>
        </div>
      </div>
    </div>
  );
}
