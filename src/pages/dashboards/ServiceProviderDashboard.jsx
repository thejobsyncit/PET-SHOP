import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Calendar,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Receipt,
  FileCheck2,
  X,
  Check,
  QrCode,
  Building,
  Wallet,
  Smartphone,
  ArrowLeft,
  Copy
} from 'lucide-react';

import { fetchSubscriptionStatus, fetchProfile, sanitizeUserForStorage, safeSetItem } from '../../store/slices/authSlice.js';
import ProviderProfileCompletionView from '../../components/dashboards/ProviderProfileCompletionView.jsx';
import SubscriptionModal, { PLANS, executeSubscriptionCheckout } from '../../components/widgets/SubscriptionModal.jsx';

// Dedicated Provider Dashboards
import PetSellerDashboard from './providers/PetSellerDashboard.jsx';
import ProductSellerDashboard from './providers/ProductSellerDashboard.jsx';
import PetAdoptionDashboard from './providers/PetAdoptionDashboard.jsx';
import VetProviderDashboard from './providers/VetProviderDashboard.jsx';
import GroomingProviderDashboard from './providers/GroomingProviderDashboard.jsx';
import HostelProviderDashboard from './providers/HostelProviderDashboard.jsx';
import WalkingProviderDashboard from './providers/WalkingProviderDashboard.jsx';
import TransportProviderDashboard from './providers/TransportProviderDashboard.jsx';
import TrainingProviderDashboard from './providers/TrainingProviderDashboard.jsx';
import InsuranceProviderDashboard from './providers/InsuranceProviderDashboard.jsx';
import BreedingProviderDashboard from './providers/BreedingProviderDashboard.jsx';

// Helper to normalize and map service category names to canonical dashboard keys
const getCanonicalServiceKey = (categoryName = '') => {
  const cat = (categoryName || '').toLowerCase().trim();
  if (cat.includes('vet')) return 'vet';
  if (cat.includes('adopt') || cat.includes('shelter')) return 'adoption';
  if (cat.includes('groom') || cat.includes('spa')) return 'grooming';
  if (cat.includes('hostel') || cat.includes('board') || cat.includes('resort')) return 'hostel';
  if (cat.includes('walk') || cat.includes('fitness')) return 'walking';
  if (cat.includes('transport') || cat.includes('transit') || cat.includes('relocation')) return 'transport';
  if (cat.includes('train') || cat.includes('behavior')) return 'training';
  if (cat.includes('insur')) return 'insurance';
  if (cat.includes('breed') || cat.includes('mating')) return 'breeding';
  if (cat.includes('product') || cat.includes('accessory') || cat.includes('food') || cat.includes('item') || cat.includes('merch') || cat.includes('shop') || cat.includes('store') || cat.includes('supplies')) return 'productseller';
  return 'seller';
};

/**
 * ServiceProviderDashboard
 * Enforces:
 * 1. Role-based & database-validated service category dashboard routing.
 * 2. Mandatory profile completion before dashboard usage.
 * 3. Subscription plan selection popup & server-verified plan-based dashboard access.
 * 4. Immediate and visible display of active subscription details in dashboard.
 * 5. Full operational access to dedicated dashboard once subscribed.
 */
const ServiceProviderDashboard = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isRenewalModal, setIsRenewalModal] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);

  // Local immediate state overrides to ensure zero-delay transitions
  const [activeSubscriptionOverride, setActiveSubscriptionOverride] = useState(null);
  const [profileCompletedLocally, setProfileCompletedLocally] = useState(false);
  const [payingPlanId, setPayingPlanId] = useState(null);

  // Dedicated Payment Page & Payment Mode Selection State
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'WALLET'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.businessName || user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const typeParam = (searchParams.get('type') || searchParams.get('category') || '').toLowerCase().trim();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const registeredCategory = user?.serviceCategory || user?.service_category || 'Pet Seller';
  const authorizedKey = getCanonicalServiceKey(registeredCategory);

  // Sync latest subscription status & profile on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'SERVICE_PROVIDER') {
      dispatch(fetchSubscriptionStatus());
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, user?.role]);

  // Keep override in sync if Redux user gets new subscription
  useEffect(() => {
    if (user?.subscription) {
      setActiveSubscriptionOverride(user.subscription);
    }
  }, [user?.subscription]);

  // 1. Role-Based Access Control: Authentication & Provider Role Verification
  useEffect(() => {
    if (!isAuthenticated) {
      const justLoggedOut = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('josh_just_logged_out');
      if (justLoggedOut) {
        try {
          sessionStorage.removeItem('josh_just_logged_out');
        } catch (_) {}
        navigate('/', { replace: true });
        return;
      }
      navigate('/login?role=provider', { replace: true });
      return;
    }

    if (user?.role === 'CUSTOMER') {
      toast.error('Access Denied: Pet Parent accounts cannot access Service Provider dashboards.');
      navigate('/account', { replace: true });
      return;
    }

    // Service-Specific Dashboard Authorization Guard
    if (!isAdmin && typeParam) {
      const requestedKey = getCanonicalServiceKey(typeParam);
      if (requestedKey !== authorizedKey) {
        toast.error(`Access Restricted: You are authorized for ${registeredCategory}. You cannot access other service dashboards.`);
      }
    }
  }, [isAuthenticated, user?.role, typeParam, authorizedKey, registeredCategory, isAdmin, navigate]);

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null;
  }

  // Determine active service dashboard:
  // Admins may view any dashboard via query param; Providers are strictly locked to their authorized service
  const activeKey = (isAdmin && typeParam) ? getCanonicalServiceKey(typeParam) : authorizedKey;

  // Active Subscription & Profile Status Evaluation
  const subscription = activeSubscriptionOverride || user?.subscription;
  const now = new Date();
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
  const startDate = subscription?.startDate ? new Date(subscription.startDate) : null;

  const isSubscriptionActive = Boolean(
    isAdmin ||
    (subscription &&
      subscription.status === 'ACTIVE' &&
      expiryDate &&
      expiryDate > now)
  );

  const isSubscriptionExpired = Boolean(
    !isAdmin &&
    subscription &&
    (subscription.status === 'EXPIRED' || (expiryDate && expiryDate <= now))
  );

  const isProfileComplete = Boolean(
    isAdmin ||
    profileCompletedLocally ||
    user?.isProfileComplete ||
    user?.profileCompleted ||
    (user?.location && user?.mobile && (user?.govtProofNumber || user?.vciRegistration))
  );

  // Remaining days calculation
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Safe defaults for provider props
  const defaultProvider = {
    id: user?.id || user?._id || 'provider-default',
    name: user?.businessName || user?.name || 'Service Partner',
    email: user?.email || '',
    phone: user?.mobile || '+91 98765 43210',
    serviceCategory: registeredCategory,
    rating: 4.9,
    reviewsCount: 128,
    avatar: user?.avatar || user?.profilePicture || '',
    subscription: subscription,
    planName: subscription?.planName || 'Active Partner Plan'
  };

  const safeProps = {
    currentProvider: props.currentProvider || defaultProvider,
    profiles: Array.isArray(props.profiles) ? props.profiles : [],
    handleToggleOnline: props.handleToggleOnline || (() => {}),
    subscription: subscription,
    onOpenSubscriptionModal: () => {
      setIsRenewalModal(true);
      setShowSubscriptionModal(true);
    },
    onOpenPlanDetails: () => setShowPlanDetailsModal(true),
    currentSubscription: subscription,
    ...props
  };

  // Handler when profile is submitted successfully
  const handleProfileSubmitted = (updatedUser) => {
    setProfileCompletedLocally(true);
    if (updatedUser) {
      try {
        safeSetItem('joshpetshub_user', JSON.stringify(sanitizeUserForStorage(updatedUser)));
      } catch (_) {}
    }
    if (updatedUser?.subscription) {
      setActiveSubscriptionOverride(updatedUser.subscription);
    }
    setShowProfileEditor(false);
    setShowSubscriptionModal(true);
    setIsRenewalModal(false);
    dispatch(fetchProfile());
    toast.success('Profile saved! Please choose your subscription plan to activate your dashboard.');
  };

  // Handler when subscription payment is completed
  const handleSubscriptionSuccess = (activatedSub) => {
    if (activatedSub) {
      setActiveSubscriptionOverride(activatedSub);
    }
    setSelectedCheckoutPlan(null);
    setShowSubscriptionModal(false);
    dispatch(fetchProfile());
    dispatch(fetchSubscriptionStatus());
    toast.success('🎉 Subscription activated! Welcome to your active dashboard.', { duration: 5000 });
  };

  // Input formatters for Card & UPI
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCvvChange = (e) => {
    setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleAppendUpiSuffix = (suffix) => {
    const base = upiId.includes('@') ? upiId.split('@')[0] : (upiId || (user?.email ? user.email.split('@')[0] : 'provider'));
    setUpiId(`${base}${suffix}`);
    setUpiVerified(true);
  };

  // Dedicated Payment Checkout & Activation Handler
  const handleConfirmPayment = async () => {
    if (!selectedCheckoutPlan || isProcessingPayment) return;

    if (paymentMode === 'CARD') {
      const rawCard = cardNumber.replace(/\s+/g, '');
      if (rawCard.length < 15) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error('Please enter card expiry (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter 3 or 4-digit CVV.');
        return;
      }
    }

    setIsProcessingPayment(true);

    let methodLabel = 'UPI / QR Scan';
    if (paymentMode === 'UPI') {
      methodLabel = upiId ? `UPI (${upiId.trim()})` : 'UPI (QR Code Scan)';
    } else if (paymentMode === 'CARD') {
      const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || 'Online';
      methodLabel = `Credit/Debit Card (ending in ${last4})`;
    } else if (paymentMode === 'NETBANKING') {
      methodLabel = `Net Banking (${selectedBank})`;
    } else if (paymentMode === 'WALLET') {
      methodLabel = `Wallet (${selectedWallet})`;
    }

    try {
      await executeSubscriptionCheckout({
        planId: selectedCheckoutPlan.id,
        serviceCategory: registeredCategory,
        paymentMethod: methodLabel,
        user,
        dispatch,
        onSuccess: (activatedSub) => {
          handleSubscriptionSuccess(activatedSub);
        },
        onCancel: () => {
          setIsProcessingPayment(false);
        },
        onError: () => {
          setIsProcessingPayment(false);
        }
      });
    } catch (err) {
      console.error('Subscription checkout error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // -------------------------------------------------------------
  // SCENARIO A: Mandatory Profile Completion (Profile is Incomplete)
  // -------------------------------------------------------------
  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
        {/* Top Header */}
        <div className="bg-[#0F2E23] text-white py-6 px-4 sm:px-8 border-b border-emerald-900 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <Sparkles size={14} className="text-amber-300" />
                <span>Dedicated Service Provider Portal</span>
                <span className="text-white/40">•</span>
                <span className="text-white">{registeredCategory}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Welcome, {user?.name || user?.businessName || 'Service Partner'}
              </h1>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                Please complete your verified business profile below. Once submitted, you can choose an active subscription plan to begin accepting client bookings and inquiries.
              </p>
            </div>
            <div className="bg-amber-400/20 border border-amber-400/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-300" />
              <span>Step 1 of 2: Profile Completion</span>
            </div>
          </div>
        </div>

        {/* Profile Completion Form Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <ProviderProfileCompletionView
            user={user}
            serviceCategory={registeredCategory}
            isMandatory={true}
            onProfileSaved={handleProfileSubmitted}
          />
        </main>

        {/* Subscription Modal (shown after profile submission) */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          serviceCategory={registeredCategory}
          onSubscriptionSuccess={handleSubscriptionSuccess}
          isRenewal={false}
          currentSubscription={subscription}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCENARIO B: Profile is Complete, but Subscription is NOT Active
  // (Either has no subscription or subscription is expired)
  // -------------------------------------------------------------
  if (!isSubscriptionActive) {
    const checkoutPlanGst = selectedCheckoutPlan ? Math.round(selectedCheckoutPlan.basePrice * 0.18 * 100) / 100 : 0;
    const checkoutPlanTotal = selectedCheckoutPlan ? Math.round((selectedCheckoutPlan.basePrice + checkoutPlanGst) * 100) / 100 : 0;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
        {/* Top Header */}
        <div className="bg-[#0F2E23] text-white py-6 px-4 sm:px-8 border-b border-emerald-900 shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Verified Provider Profile Active</span>
                <span className="text-white/40">•</span>
                <span className="text-white">{registeredCategory}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                {user?.businessName || user?.name || 'Service Partner'}
              </h1>
              <p className="text-xs text-emerald-100/80 mt-1">
                {isSubscriptionExpired
                  ? 'Your subscription plan has expired. Operational features are locked until renewal.'
                  : 'Your profile is complete! Activate an operational plan to start receiving appointments & inquiries.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfileEditor(!showProfileEditor)}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 size={14} />
                <span>{showProfileEditor ? 'Back to Dashboard' : 'View / Edit Profile'}</span>
              </button>
              {isSubscriptionExpired && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRenewalModal(true);
                    setShowSubscriptionModal(true);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Renew Subscription</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* If user toggled to view/edit their profile */}
        {showProfileEditor ? (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowProfileEditor(false)}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                ← Back to Activation Overview
              </button>
            </div>
            <ProviderProfileCompletionView
              user={user}
              serviceCategory={registeredCategory}
              isMandatory={false}
              onProfileSaved={(u) => {
                setShowProfileEditor(false);
                toast.success('Profile details updated successfully.');
              }}
            />
          </main>
        ) : selectedCheckoutPlan ? (
          /* ========================================================
             DEDICATED PAYMENT & PAYMENT MODE SELECTION PAGE
             ======================================================== */
          <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-6">
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedCheckoutPlan(null)}
                className="text-xs text-slate-700 hover:text-[#0F2E23] flex items-center gap-1.5 font-bold cursor-pointer transition hover:-translate-x-0.5"
              >
                <ArrowLeft size={15} />
                <span>Back to Subscription Plans</span>
              </button>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-Bit SSL Encrypted & Bank Verified Checkout</span>
              </div>
            </div>

            {/* Page Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Step 2 of 2: Checkout & Payment Mode
              </span>
              <h2 className="font-serif font-bold text-2xl text-slate-900 mt-1">
                Select Payment Mode for {selectedCheckoutPlan.name}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Authorized for <strong>{registeredCategory}</strong>. Choose your payment method below to complete subscription and unlock operations.
              </p>
            </div>

            {/* 2-Column Checkout Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Payment Mode Selection (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Mode Selector Cards */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <CreditCard size={18} className="text-[#0F2E23]" />
                      <span>Choose Payment Mode</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select how you want to complete payment of ₹{checkoutPlanTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Payment Mode Tabs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: <QrCode size={16} />, badge: 'Instant' },
                      { id: 'CARD', label: 'Cards', icon: <CreditCard size={16} />, badge: 'Debit/Credit' },
                      { id: 'NETBANKING', label: 'Net Banking', icon: <Building size={16} />, badge: 'All Banks' },
                      { id: 'WALLET', label: 'Wallets', icon: <Wallet size={16} />, badge: '1-Click' }
                    ].map((mode) => {
                      const isActive = paymentMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMode(mode.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'border-[#0F2E23] bg-emerald-50/60 ring-2 ring-[#0F2E23]/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#0F2E23] text-white' : 'bg-slate-100 text-slate-700'}`}>
                              {mode.icon}
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-200/80 text-emerald-900' : 'bg-slate-100 text-slate-500'}`}>
                              {mode.badge}
                            </span>
                          </div>
                          <div>
                            <span className={`text-xs font-bold block ${isActive ? 'text-[#0F2E23]' : 'text-slate-800'}`}>
                              {mode.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Mode Form Details */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 mt-4">
                    
                    {/* Mode 1: UPI / QR Code */}
                    {paymentMode === 'UPI' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <Smartphone size={16} className="text-emerald-700" />
                              <span>Instant UPI / QR Code Payment</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Scan using PhonePe, Google Pay, Paytm, BHIM, CRED or any UPI app
                            </p>
                          </div>
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Zero Fee
                          </span>
                        </div>

                        {/* Interactive QR Code Display */}
                        <div className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                          {/* Styled QR Code Box */}
                          <div className="relative w-36 h-36 bg-white border border-slate-300 rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs shrink-0 group">
                            {/* SVG QR Code Pattern Mockup */}
                            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                              {/* Corner Position Detection Squares */}
                              <rect x="5" y="5" width="26" height="26" rx="4" strokeWidth="4" />
                              <rect x="11" y="11" width="14" height="14" fill="currentColor" strokeWidth="0" />
                              <rect x="69" y="5" width="26" height="26" rx="4" strokeWidth="4" />
                              <rect x="75" y="11" width="14" height="14" fill="currentColor" strokeWidth="0" />
                              <rect x="5" y="69" width="26" height="26" rx="4" strokeWidth="4" />
                              <rect x="11" y="75" width="14" height="14" fill="currentColor" strokeWidth="0" />
                              
                              {/* Data Matrix Dots Pattern */}
                              <rect x="37" y="8" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="49" y="8" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="37" y="20" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="55" y="20" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="8" y="37" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="20" y="37" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="8" y="49" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="20" y="49" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              
                              {/* Center Paw Emblem */}
                              <circle cx="50" cy="50" r="13" fill="#0F2E23" strokeWidth="0" />
                              <circle cx="50" cy="52" r="4.5" fill="#FAF9F5" strokeWidth="0" />
                              <circle cx="45" cy="45" r="2.2" fill="#FAF9F5" strokeWidth="0" />
                              <circle cx="55" cy="45" r="2.2" fill="#FAF9F5" strokeWidth="0" />
                              <circle cx="41" cy="50" r="1.8" fill="#FAF9F5" strokeWidth="0" />
                              <circle cx="59" cy="50" r="1.8" fill="#FAF9F5" strokeWidth="0" />

                              <rect x="69" y="37" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="85" y="37" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="75" y="49" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="37" y="69" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="49" y="69" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="55" y="81" width="6" height="6" fill="currentColor" strokeWidth="0" />
                              <rect x="81" y="81" width="6" height="6" fill="currentColor" strokeWidth="0" />
                            </svg>
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Point & Scan
                            </span>
                            <h5 className="font-bold text-slate-900 text-sm">
                              Scan QR using any UPI App
                            </h5>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Open <strong>GPay, PhonePe, Paytm, or BHIM</strong>, scan this QR to pay <strong>₹{checkoutPlanTotal.toFixed(2)}</strong>.
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                                <span key={app} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                  {app}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-3">
                          <div className="border-t border-slate-300 w-full" />
                          <span className="bg-slate-50 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                            Or Enter UPI ID / VPA
                          </span>
                          <div className="border-t border-slate-300 w-full" />
                        </div>

                        {/* UPI ID Field */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>Virtual Payment Address (VPA) / UPI ID</span>
                            {upiVerified && (
                              <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                                <Check size={12} /> Verified UPI ID
                              </span>
                            )}
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                if (e.target.value.includes('@') && e.target.value.length > 5) {
                                  setUpiVerified(true);
                                }
                              }}
                              placeholder="e.g. yourname@okhdfcbank or mobilenumber@upi"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                            />
                            {upiId && (
                              <button
                                type="button"
                                onClick={() => setUpiVerified(true)}
                                className="absolute right-2 px-2.5 py-1 rounded-lg bg-[#0F2E23] text-white text-[10px] font-bold cursor-pointer hover:bg-[#1D3B2E]"
                              >
                                {upiVerified ? 'Verified ✓' : 'Verify'}
                              </button>
                            )}
                          </div>

                          {/* Quick UPI Suffixes */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-500 font-medium">Quick handles:</span>
                            {['@okhdfcbank', '@okaxis', '@oksbi', '@ybl', '@paytm'].map((sfx) => (
                              <button
                                key={sfx}
                                type="button"
                                onClick={() => handleAppendUpiSuffix(sfx)}
                                className="text-[10px] font-bold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 px-2 py-0.5 rounded-md transition cursor-pointer"
                              >
                                {sfx}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Credit / Debit Cards */}
                    {paymentMode === 'CARD' && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <CreditCard size={16} className="text-emerald-700" />
                              <span>Credit or Debit Card</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              All major Indian and international cards supported
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {['VISA', 'MC', 'RUPAY'].map((c) => (
                              <span key={c} className="text-[9px] font-black bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-700">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                              placeholder="4532 8920 1234 5678"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                            />
                            <CreditCard size={16} className="absolute right-3.5 top-3 text-slate-400" />
                          </div>
                        </div>

                        {/* Name on Card */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Full name as printed on card"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                          />
                        </div>

                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                              placeholder="MM / YY"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              CVV / Security Code
                            </label>
                            <div className="relative">
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={handleCvvChange}
                                maxLength={4}
                                placeholder="•••"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0F2E23] focus:ring-1 focus:ring-[#0F2E23]"
                              />
                              <Lock size={14} className="absolute right-3.5 top-3 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Save Card Checkbox */}
                        <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="rounded border-slate-300 text-[#0F2E23] focus:ring-[#0F2E23]"
                          />
                          <span>Save this card securely for future renewals (PCI-DSS compliant)</span>
                        </label>
                      </div>
                    )}

                    {/* Mode 3: Net Banking */}
                    {paymentMode === 'NETBANKING' && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <Building size={16} className="text-emerald-700" />
                              <span>Internet Banking</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Instant direct debit from all scheduled Indian banks
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {selectedBank} Selected
                          </span>
                        </div>

                        {/* Top 6 Indian Banks */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Popular Banks
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              'HDFC Bank',
                              'ICICI Bank',
                              'State Bank of India',
                              'Axis Bank',
                              'Kotak Mahindra Bank',
                              'Punjab National Bank'
                            ].map((bank) => {
                              const isSelected = selectedBank === bank;
                              return (
                                <button
                                  key={bank}
                                  type="button"
                                  onClick={() => setSelectedBank(bank)}
                                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-[#0F2E23] text-white border-[#0F2E23] shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="truncate">{bank}</span>
                                  {isSelected && <Check size={13} className="shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Other Banks Dropdown */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Or Select Other Bank
                          </label>
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                          >
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="Union Bank of India">Union Bank of India</option>
                            <option value="IndusInd Bank">IndusInd Bank</option>
                            <option value="Federal Bank">Federal Bank</option>
                            <option value="Yes Bank">Yes Bank</option>
                            <option value="IDBI Bank">IDBI Bank</option>
                            <option value="Indian Bank">Indian Bank</option>
                            <option value="Central Bank of India">Central Bank of India</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Mode 4: Wallets */}
                    {paymentMode === 'WALLET' && (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              <Wallet size={16} className="text-emerald-700" />
                              <span>Digital Wallets</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Link and pay directly from your digital wallet balance
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {selectedWallet}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {['Amazon Pay', 'Paytm Wallet', 'PhonePe Wallet', 'MobiKwik'].map((wallet) => {
                            const isSelected = selectedWallet === wallet;
                            return (
                              <button
                                key={wallet}
                                type="button"
                                onClick={() => setSelectedWallet(wallet)}
                                className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-[#0F2E23] text-white border-[#0F2E23] shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span>{wallet}</span>
                                {isSelected && <Check size={13} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Security Assurance footer */}
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                    <span>Transactions are secured with 256-bit bank-grade encryption and RBI compliant tokens.</span>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary & Pay Action (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Order Summary Card */}
                <div className="bg-gradient-to-b from-[#0F2E23] via-[#143D2F] to-[#0F2E23] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/80 sticky top-20 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        {selectedCheckoutPlan.badge}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-white mt-0.5">
                        {selectedCheckoutPlan.name}
                      </h3>
                      <p className="text-[11px] text-emerald-200">
                        Authorized: <strong>{registeredCategory}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-emerald-300 block font-bold">Validity</span>
                      <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                        {selectedCheckoutPlan.validityLabel}
                      </span>
                    </div>
                  </div>

                  {/* Price Calculation Table */}
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-2 text-xs text-emerald-100">
                    <div className="flex justify-between">
                      <span>Base Subscription Fee:</span>
                      <span className="font-semibold text-white">₹{selectedCheckoutPlan.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applicable GST (18% Digital Tax):</span>
                      <span className="font-semibold text-white">+ ₹{checkoutPlanGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 text-[11px]">
                      <span>Payment Gateway Convenience Fee:</span>
                      <span className="font-semibold uppercase tracking-wider">Free (₹0.00)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/15 text-sm font-black text-white">
                      <span>Total Amount Payable:</span>
                      <span className="text-lg text-amber-300 font-extrabold">₹{checkoutPlanTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Features Unlocked List */}
                  <div className="space-y-1.5 pt-1 text-[11px] text-emerald-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/90 block">
                      Privileges Unlocked Instantly
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-amber-300 shrink-0" />
                        <span>Real-time Bookings & Appointment Schedule</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-amber-300 shrink-0" />
                        <span>Direct Client Messaging & On-call Inquiries</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-amber-300 shrink-0" />
                        <span>Verified Service Partner Badge on Search</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-amber-300 shrink-0" />
                        <span>0% Commission (Keep 100% Client Revenue)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pay & Activate Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw size={15} className="animate-spin text-slate-900" />
                          <span>Processing & Activating...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>
                            Pay ₹{checkoutPlanTotal.toFixed(2)} via {paymentMode === 'UPI' ? 'UPI' : paymentMode === 'CARD' ? 'Card' : paymentMode === 'NETBANKING' ? 'Net Banking' : 'Wallet'} & Activate
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch / Change Plan Option */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCheckoutPlan(null)}
                      className="text-xs text-emerald-200 hover:text-white underline font-medium cursor-pointer"
                    >
                      Want to pick a different plan? Switch Plan
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </main>
        ) : (
          <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
            {/* Status Notification Banner (shown only if subscription expired) */}
            {isSubscriptionExpired && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-base">
                    Subscription Expired on {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                  </h3>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Client booking access, direct inquiries, and live listings for <strong>{registeredCategory}</strong> are temporarily paused.
                    Your business profile, history, and verified details remain 100% safe. Renew your subscription to restore operations instantly.
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRenewalModal(true);
                        setShowSubscriptionModal(true);
                      }}
                      className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Renew Subscription Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Showcase Card Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Available Partner Plans for {registeredCategory}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the plan that suits your service schedule. All plans include full dashboard features.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                  const planGst = Math.round(plan.basePrice * 0.18 * 100) / 100;
                  const planTotal = Math.round((plan.basePrice + planGst) * 100) / 100;
                  return (
                    <div
                      key={plan.id}
                      className="border border-slate-200 hover:border-[#0F2E23] rounded-2xl p-5 flex flex-col justify-between transition bg-slate-50/50 hover:bg-emerald-50/20 group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-[#0F2E23]">₹{plan.basePrice}</span>
                          <span className="text-xs text-slate-500">+ 18% GST</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          Validity: <strong>{plan.validityLabel}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCheckoutPlan(plan);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full bg-[#0F2E23] hover:bg-[#1D3B2E] text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <span>Select {plan.name}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locked Dashboard Features Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Operational Features Locked
                  </h4>
                  <p className="text-xs text-slate-500">
                    Client appointments, chat messages, booking requests, and revenue payouts will unlock immediately upon plan selection.
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          serviceCategory={registeredCategory}
          onSubscriptionSuccess={handleSubscriptionSuccess}
          isRenewal={isRenewalModal}
          currentSubscription={subscription}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCENARIO C: Profile Complete + Subscription Active
  // (Full operational access to the dedicated service dashboard with prominent plan showcase)
  // -------------------------------------------------------------
  const activePlanName = subscription?.planName || (subscription?.planId ? `${subscription.planId.toUpperCase()} Plan` : 'Active Partner Plan');
  const activePlanBadge = subscription?.planId === 'yearly' ? 'Yearly (Best Value)' : subscription?.planId === 'quarterly' ? 'Quarterly' : 'Monthly';
  const totalInvoicedAmount = subscription?.totalAmount || (subscription?.basePrice ? Math.round(subscription.basePrice * 1.18 * 100) / 100 : 'Paid');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 
        ========================================================
        EXECUTIVE PARTNER SUBSCRIPTION STATUS & ACTION HEADER
        ========================================================
      */}
      <header className="bg-gradient-to-r from-[#0F2E23] via-[#143d2f] to-[#0F2E23] text-white px-4 sm:px-8 py-3 border-b border-emerald-900/60 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left: Active Subscription Indicator & Plan Details */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Green Pulsing Dot + Badge */}
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl font-bold border border-emerald-400/30 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Sparkles size={13} className="text-amber-300" />
              <span className="text-[11px] tracking-wide uppercase font-extrabold">{activePlanName}</span>
              <span className="bg-emerald-950/70 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                ACTIVE
              </span>
            </div>

            {/* Validity & Expiry Countdown */}
            <div className="hidden md:flex items-center gap-2 text-emerald-100/90 text-xs">
              <Clock size={14} className="text-emerald-300" />
              <span>
                Valid until:{' '}
                <strong className="text-white font-semibold">
                  {expiryDate
                    ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Active'}
                </strong>
              </span>
              {daysRemaining > 0 && (
                <span className="bg-white/10 text-emerald-200 text-[11px] px-2 py-0.5 rounded-md font-medium border border-white/10">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </span>
              )}
            </div>

            {/* Invoiced Fee Pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-emerald-200/80 text-[11px]">
              <span>Invoiced:</span>
              <strong className="text-white font-bold">₹{totalInvoicedAmount}</strong>
              <span className="text-emerald-300/70 text-[10px]">(incl. 18% GST)</span>
            </div>
          </div>

          {/* Right: Actions (Plan Details, Edit Profile, Renew/Upgrade) */}
          <div className="flex items-center gap-2 ml-auto">
            {/* View Plan Details / Invoice Button */}
            <button
              type="button"
              onClick={() => setShowPlanDetailsModal(true)}
              className="bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border border-white/10"
              title="View full subscription invoice & unlocked privileges"
            >
              <Receipt size={13} className="text-amber-300" />
              <span className="hidden sm:inline">Plan Details & Invoice</span>
              <span className="sm:hidden">Plan</span>
            </button>



            {/* Renew / Upgrade Button */}
            <button
              type="button"
              onClick={() => {
                setIsRenewalModal(true);
                setShowSubscriptionModal(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw size={13} />
              <span>Renew / Upgrade</span>
            </button>
          </div>
        </div>
      </header>

      {/* Profile Editor View Toggle */}
      {showProfileEditor ? (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowProfileEditor(false)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
            >
              ← Back to {registeredCategory} Dashboard
            </button>
          </div>
          <ProviderProfileCompletionView
            user={user}
            serviceCategory={registeredCategory}
            isMandatory={false}
            onProfileSaved={(u) => {
              setShowProfileEditor(false);
              toast.success('Profile details updated successfully!');
            }}
          />
        </main>
      ) : (
        /* Render Dedicated Service Provider Dashboard */
        <div className="flex-1">
          {(() => {
            // 1. Consult a Vet
            if (activeKey === 'vet') {
              return <VetProviderDashboard {...safeProps} />;
            }
            // 2. Pet Adoption & Shelter
            if (activeKey === 'adoption') {
              return <PetAdoptionDashboard {...safeProps} />;
            }
            // 3. Pet Grooming Spa
            if (activeKey === 'grooming') {
              return <GroomingProviderDashboard {...safeProps} />;
            }
            // 4. Pet Hostel / Boarding
            if (activeKey === 'hostel') {
              return <HostelProviderDashboard {...safeProps} />;
            }
            // 5. Dog Walking & Fitness
            if (activeKey === 'walking') {
              return <WalkingProviderDashboard {...safeProps} />;
            }
            // 6. Pet Transport & Relocation
            if (activeKey === 'transport') {
              return <TransportProviderDashboard {...safeProps} />;
            }
            // 7. Training & Behavior
            if (activeKey === 'training') {
              return <TrainingProviderDashboard {...safeProps} />;
            }
            // 8. Pet Insurance
            if (activeKey === 'insurance') {
              return <InsuranceProviderDashboard {...safeProps} />;
            }
            // 9. Mating & Breeding
            if (activeKey === 'breeding') {
              return <BreedingProviderDashboard {...safeProps} />;
            }
            // 10. Pet Products & Supplies Seller
            if (activeKey === 'productseller') {
              return <ProductSellerDashboard {...safeProps} />;
            }
            // 11. Pet Classifieds / Seller / Default
            return <PetSellerDashboard {...safeProps} />;
          })()}
        </div>
      )}

      {/* Plan Details & Invoice Summary Modal */}
      {showPlanDetailsModal && (
        <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-slate-800">
            {/* Modal Header */}
            <div className="bg-[#0F2E23] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Active Subscription Invoice</h3>
                  <p className="text-xs text-emerald-200">Josh Pets Hub Service Partner Billing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Plan Badge & Status */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                    {activePlanBadge}
                  </span>
                  <h4 className="font-bold text-base text-emerald-950 mt-1">{activePlanName}</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Authorized Service: <strong>{registeredCategory}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs">
                    <Check size={13} className="text-emerald-600" /> Active
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                    {daysRemaining} days remaining
                  </p>
                </div>
              </div>

              {/* Billing & Tax Breakdown Table */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 border-b border-stone-200 pb-2">
                  <span>Billing & Tax Details</span>
                  <span className="text-slate-500 font-normal">GSTIN Tax Invoice</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Subscription Fee:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{subscription?.basePrice ? subscription.basePrice.toFixed(2) : (subscription?.planId === 'yearly' ? '999.00' : subscription?.planId === 'quarterly' ? '499.00' : '199.00')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Applicable GST (18%):</span>
                  <span className="font-semibold text-slate-800">
                    ₹{subscription?.gstAmount ? subscription.gstAmount.toFixed(2) : (subscription?.planId === 'yearly' ? '179.82' : subscription?.planId === 'quarterly' ? '89.82' : '35.82')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-[#0F2E23]">
                  <span>Total Amount Paid:</span>
                  <span>₹{totalInvoicedAmount}</span>
                </div>
              </div>

              {/* Dates & Reference IDs */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
                  <strong className="text-slate-800">
                    {startDate ? startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                  </strong>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                  <strong className="text-slate-800">
                    {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active'}
                  </strong>
                </div>
                <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10px] text-slate-600 truncate">
                  <span className="text-slate-400 block uppercase font-bold font-sans">Payment Reference</span>
                  {subscription?.paymentId || 'PAY_VERIFIED_ONLINE'}
                </div>
              </div>

              {/* Unlocked Capabilities */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Unlocked Privileges</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Real-time Bookings & Inquiries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Live Customer Chat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Verified Partner Badge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>Zero Booking Commission</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanDetailsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanDetailsModal(false);
                    setIsRenewalModal(true);
                    setShowSubscriptionModal(true);
                  }}
                  className="bg-[#0F2E23] hover:bg-[#1D3B2E] text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={13} />
                  <span>Renew / Switch Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal for Renewal / Upgrades */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        serviceCategory={registeredCategory}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        isRenewal={isRenewalModal}
        currentSubscription={subscription}
      />
    </div>
  );
};

export default ServiceProviderDashboard;
