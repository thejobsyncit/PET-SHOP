import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import { verifySubscriptionPayment } from '../../store/slices/authSlice.js';

export const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    basePrice: 199,
    validityMonths: 1,
    validityLabel: '1 month',
    badge: 'Monthly',
    popular: false,
    description: 'Perfect for getting started with flexible month-to-month access.'
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    basePrice: 499,
    validityMonths: 3,
    validityLabel: '3 months',
    badge: 'Quarterly',
    popular: false,
    description: 'Great balance of commitment and value for active service providers.'
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    basePrice: 999,
    validityMonths: 12,
    validityLabel: '12 months',
    badge: 'Yearly (Best Value)',
    popular: true,
    description: 'Maximum savings with 365 days of uninterrupted client inquiries & bookings.'
  }
];

export const GST_RATE = 0.18; // 18% standard GST

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Executes direct checkout & payment gateway invocation for a chosen subscription plan.
 */
export const executeSubscriptionCheckout = async ({
  planId,
  serviceCategory = 'Service Provider',
  paymentMethod = 'Online Gateway',
  user,
  dispatch,
  onSuccess = () => {},
  onCancel = () => {},
  onError = () => {}
}) => {
  try {
    // 1. Create order on server (authoritative server pricing & GST calculation)
    const orderRes = await apiRequest('/subscriptions/create-order', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });

    if (!orderRes.success) {
      throw new Error(orderRes.message || 'Failed to create subscription order.');
    }

    // 2. If Razorpay gateway is enabled on the backend
    if (orderRes.gateway === 'razorpay' && orderRes.razorpayKey) {
      const hasRzp = await loadRazorpayScript();
      if (hasRzp && window.Razorpay) {
        return new Promise((resolve) => {
          const options = {
            key: orderRes.razorpayKey,
            amount: Math.round(orderRes.plan.totalAmount * 100),
            currency: 'INR',
            name: 'Josh Pets Hub',
            description: `${orderRes.plan.name} Subscription for ${serviceCategory}`,
            order_id: orderRes.orderId,
            handler: async (response) => {
              try {
                const verifyRes = await dispatch(
                  verifySubscriptionPayment({
                    planId,
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature
                  })
                ).unwrap();

                if (verifyRes.success) {
                  toast.success('🎉 Subscription updated successfully!');
                  onSuccess(verifyRes.subscription);
                  resolve(verifyRes.subscription);
                } else {
                  throw new Error(verifyRes.message || 'Payment verification failed.');
                }
              } catch (err) {
                toast.error(err.message || 'Payment verification failed.');
                onError(err);
                resolve(null);
              }
            },
            prefill: {
              name: user?.name || user?.businessName || '',
              email: user?.email || '',
              contact: user?.mobile || ''
            },
            theme: {
              color: '#0F2E23'
            },
            modal: {
              ondismiss: () => {
                toast('Payment cancelled. Your profile settings remain intact.', { icon: 'ℹ️' });
                onCancel();
                resolve(null);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }
    }

    // 3. Cryptographically Verified Server Order Flow
    const paymentId = `PAY_SUB_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const verifyRes = await dispatch(
      verifySubscriptionPayment({
        planId,
        orderId: orderRes.orderId,
        paymentId,
        orderSignature: orderRes.orderSignature,
        paymentMethod
      })
    ).unwrap();

    if (verifyRes.success) {
      const planName = orderRes.plan?.name || 'Subscription Plan';
      toast.success(
        `🎉 ${planName} processed successfully! Valid through your subscription period.`,
        { duration: 5000 }
      );
      onSuccess(verifyRes.subscription);
      return verifyRes.subscription;
    } else {
      throw new Error(verifyRes.message || 'Payment verification failed.');
    }
  } catch (err) {
    console.error('Subscription checkout error:', err);
    toast.error(err.message || 'Could not complete subscription payment.');
    onError(err);
    throw err;
  }
};

export default function SubscriptionModal({
  isOpen,
  onClose,
  serviceCategory = 'Service Provider',
  onSubscriptionSuccess = () => {},
  isRenewal = false,
  currentSubscription = null,
  onOpenPlanDetails
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Active Subscription & Plan Check
  const activeSub = currentSubscription || user?.subscription;
  const now = new Date();
  const expiryDate = activeSub?.expiryDate ? new Date(activeSub.expiryDate) : null;
  const isSubscriptionActive = Boolean(
    activeSub &&
    activeSub.status === 'ACTIVE' &&
    expiryDate &&
    expiryDate > now
  );
  const activePlanId = isSubscriptionActive ? (activeSub?.planId || activeSub?.id) : null;

  // Locate current plan object
  const currentPlan = isSubscriptionActive
    ? (PLANS.find((p) => p.id === activePlanId) || {
        id: activePlanId || 'yearly',
        name: activeSub?.planName || (activePlanId ? `${activePlanId.toUpperCase()} Plan` : 'Current Plan'),
        basePrice: activeSub?.basePrice || (activePlanId === 'yearly' ? 999 : activePlanId === 'quarterly' ? 499 : 199),
        validityMonths: activeSub?.validityMonths || (activePlanId === 'yearly' ? 12 : activePlanId === 'quarterly' ? 3 : 1),
        validityLabel: activeSub?.validityMonths ? `${activeSub.validityMonths} months` : '12 months',
        badge: activePlanId === 'yearly' ? 'Yearly (Best Value)' : activePlanId === 'quarterly' ? 'Quarterly' : 'Monthly',
        popular: activePlanId === 'yearly',
        description: 'Your currently active operational subscription.'
      })
    : null;

  const currentBasePrice = currentPlan?.basePrice || 0;

  // Days remaining & Renewal Window Calculation
  // Renewal is permitted ONLY when near the renewal period or month (<= 30 days for quarterly/yearly, <= 7 days for monthly)
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const renewalWindowDays = activePlanId === 'monthly' ? 7 : 30;
  const isNearRenewal = isSubscriptionActive && daysRemaining <= renewalWindowDays;
  const canRenew = isSubscriptionActive && isNearRenewal;

  const renewalStartDate = expiryDate
    ? new Date(expiryDate.getTime() - renewalWindowDays * 24 * 60 * 60 * 1000)
    : null;

  // Filter plans strictly HIGHER than the current basePrice (Upgrades only)
  // For ₹499 plan user -> only ₹999 Yearly Plan (lesser ₹199 Monthly Plan is NEVER included)
  // For ₹999 plan user -> empty (already on top tier)
  const upgradePlans = isSubscriptionActive
    ? PLANS.filter((p) => p.basePrice > currentBasePrice)
    : [];

  const hasUpgradeOptions = upgradePlans.length > 0;

  // Tab / Mode determination:
  // - If not active: 'all'
  // - If active, highest tier & NOT near renewal: 'status' (informative view only, no renewal yet!)
  // - If active, highest tier & near renewal: 'renew'
  // - If active, has upgrade options & NOT near renewal: 'upgrade' (only upgrade comes, renew does not!)
  // - If active, has upgrade options & near renewal: user can switch between 'upgrade' and 'renew'
  const [activeTab, setActiveTab] = useState(() => {
    if (!isSubscriptionActive) return 'all';
    if (!hasUpgradeOptions && !canRenew) return 'status';
    if (!hasUpgradeOptions && canRenew) return 'renew';
    if (hasUpgradeOptions && !canRenew) return 'upgrade';
    return isRenewal ? 'renew' : 'upgrade';
  });

  // Keep activeTab synchronized with modal open & active plan status
  useEffect(() => {
    if (!isSubscriptionActive) {
      setActiveTab('all');
    } else if (!hasUpgradeOptions && !canRenew) {
      setActiveTab('status');
    } else if (!hasUpgradeOptions && canRenew) {
      setActiveTab('renew');
    } else if (hasUpgradeOptions && !canRenew) {
      setActiveTab('upgrade');
    } else if (isRenewal) {
      setActiveTab('renew');
    } else {
      setActiveTab('upgrade');
    }
  }, [isOpen, isSubscriptionActive, hasUpgradeOptions, canRenew, isRenewal]);

  // Determine displayed plans based on active mode
  const displayedPlans = useMemo(() => {
    if (!isSubscriptionActive) return PLANS;
    if (activeTab === 'status' || activeTab === 'renew') {
      return currentPlan ? [currentPlan] : [PLANS[PLANS.length - 1]];
    }
    // Upgrade tab: ONLY higher-tier plans
    return upgradePlans;
  }, [isSubscriptionActive, activeTab, currentPlan, upgradePlans]);

  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    return displayedPlans[0]?.id || 'yearly';
  });

  // Ensure selected plan is always a valid available plan in the current view
  useEffect(() => {
    if (displayedPlans.length > 0 && !displayedPlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(displayedPlans[0].id);
    }
  }, [displayedPlans, selectedPlanId]);

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  if (!isOpen) return null;

  const selectedPlan = displayedPlans.find((p) => p.id === selectedPlanId) || displayedPlans[0] || PLANS[0];
  const gstAmount = Math.round(selectedPlan.basePrice * GST_RATE * 100) / 100;
  const totalAmount = Math.round((selectedPlan.basePrice + gstAmount) * 100) / 100;

  const isSelectedPlanCurrent = isSubscriptionActive && selectedPlan.id === activePlanId;
  const isSelectedPlanUpgrade = isSubscriptionActive && selectedPlan.basePrice > currentBasePrice;

  // Preview of extended calendar validity date
  const getExtendedExpiryPreview = (months) => {
    const baseDate = (isSubscriptionActive && expiryDate && expiryDate > now) ? new Date(expiryDate) : new Date();
    const d = new Date(baseDate);
    const startDay = d.getUTCDate();
    const targetMonth = d.getUTCMonth() + months;
    d.setUTCMonth(targetMonth);
    if (d.getUTCDate() !== startDay) {
      d.setUTCDate(0);
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Handle Checkout & Payment Processing
  const handleProceedToPayment = async () => {
    // Disallow switching to a lesser amount plan while active
    if (isSubscriptionActive && currentBasePrice > 0 && selectedPlan.basePrice < currentBasePrice) {
      toast.error('Cannot switch to a lesser plan while your active subscription is valid.');
      return;
    }

    // Disallow renewing if not near renewal period
    if (isSubscriptionActive && selectedPlan.id === activePlanId && !canRenew) {
      toast.error(`Plan renewal is only permitted within ${renewalWindowDays} days of expiration. Your plan is active with ${daysRemaining} days remaining.`);
      return;
    }

    setProcessing(true);
    try {
      await executeSubscriptionCheckout({
        planId: selectedPlan.id,
        serviceCategory,
        user,
        dispatch,
        onSuccess: (sub) => {
          setPaymentSuccess(sub);
          onSubscriptionSuccess(sub);
          onClose();
        },
        onCancel: () => {
          setProcessing(false);
        },
        onError: () => {
          setProcessing(false);
        }
      });
    } catch (_) {
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/75 backdrop-blur-xs p-3 sm:p-4 flex flex-col items-center justify-start sm:justify-center animate-in fade-in duration-200">
      <div className="relative bg-white text-slate-900 w-full max-w-2xl my-auto shadow-2xl border border-stone-200 rounded-3xl overflow-hidden flex flex-col min-h-0 max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2E23] to-[#1D3B2E] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Sparkles size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  {!isSubscriptionActive
                    ? 'Select Your Provider Subscription Plan'
                    : activeTab === 'status'
                    ? 'Active Subscription Status'
                    : activeTab === 'renew'
                    ? 'Renew Your Service Provider Subscription'
                    : 'Upgrade to a Higher Subscription Tier'}
                </h3>
              </div>
              <p className="text-xs text-emerald-200">
                Authorized for <strong>{serviceCategory}</strong> • Unlock full appointments, clients & bookings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 disabled:opacity-50"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          {/* Notification Banner */}
          {isSubscriptionActive ? (
            activeTab === 'status' ? (
              // Case: Top-tier (Yearly Plan) Provider - NOT in renewal window yet
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                  <Sparkles size={20} className="text-emerald-700" />
                </div>
                <div className="text-[11px] text-emerald-950 leading-relaxed flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-xs text-emerald-950">
                      ⭐ Top-Tier Plan Active: <strong>{currentPlan?.name || 'Yearly Plan'}</strong>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Highest Operational Tier
                    </span>
                  </div>
                  <p className="mt-1 text-emerald-800">
                    Your subscription is fully active until <strong>{expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'active period'}</strong> (<strong>{daysRemaining} days remaining</strong>). You are already on the top tier with maximum platform benefits and zero commission!
                  </p>
                  <div className="mt-2.5 bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
                    <Calendar size={15} className="text-emerald-700 shrink-0" />
                    <span>
                      Plan renewal opens <strong>30 days</strong> before expiration (on or after <strong>{renewalStartDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>). No action is needed right now.
                    </span>
                  </div>
                </div>
              </div>
            ) : activeTab === 'renew' ? (
              // Case: Renewal Window is Active (<= 30 days remaining)
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-start gap-3">
                <RefreshCw size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-950 leading-relaxed flex-1">
                  <div className="font-bold text-xs">
                    Renew Active Subscription: <strong>{currentPlan?.name}</strong>
                  </div>
                  <p className="mt-0.5 text-emerald-800">
                    Your current plan expires in <strong>{daysRemaining} days</strong> (valid until <strong>{expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'active period'}</strong>).
                    Renewing extends your operational validity by <strong>+{currentPlan?.validityLabel}</strong> from your current expiry (new expiry: <strong>{getExtendedExpiryPreview(currentPlan?.validityMonths || 1)}</strong>).
                  </p>
                </div>
              </div>
            ) : (
              // Case: Upgrade View (for lower/mid tiers)
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3">
                <TrendingUp size={18} className="text-amber-800 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-950 leading-relaxed flex-1">
                  <div className="font-bold text-xs">
                    Current Active Plan: <strong>{currentPlan?.name}</strong> (valid until {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'active period'} • {daysRemaining} days remaining)
                  </div>
                  <p className="mt-0.5 text-amber-800 font-medium">
                    Upgrade to a higher-tier plan below to unlock longer validity and higher savings. Lesser amount plans are automatically hidden.
                  </p>
                  {!canRenew && (
                    <p className="mt-1 text-slate-600 text-[10px]">
                      ℹ️ Renewal for your current plan unlocks 30 days before expiration (on or after {renewalStartDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}).
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-950 leading-relaxed">
                <strong>Profile Completed Successfully!</strong> To activate your service dashboard and accept customer bookings, please select an operational plan below. Prices are exclusive of 18% GST.
              </div>
            </div>
          )}

          {/* Action Tabs: ONLY when provider has both upgrade options AND is in the renewal window! */}
          {isSubscriptionActive && hasUpgradeOptions && canRenew && (
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('upgrade')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'upgrade'
                    ? 'bg-[#0F2E23] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <TrendingUp size={14} className={activeTab === 'upgrade' ? 'text-amber-300' : 'text-slate-500'} />
                <span>Upgrade to Higher Plan ({upgradePlans.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('renew')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'renew'
                    ? 'bg-[#0F2E23] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <RefreshCw size={14} className={activeTab === 'renew' ? 'text-emerald-300' : 'text-slate-500'} />
                <span>Renew Current Plan</span>
              </button>
            </div>
          )}

          {/* Special Overview View for Active Top-Tier Plan when NOT in renewal window */}
          {activeTab === 'status' ? (
            <div className="space-y-4">
              <div className="bg-white border-2 border-emerald-700/30 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#0F2E23] text-white">
                      Active Operational Plan
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{currentPlan?.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#0F2E23]">₹{currentPlan?.basePrice}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">+ 18% GST</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry Date</span>
                    <strong className="text-slate-800">
                      {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Remaining</span>
                    <strong className="text-emerald-700">{daysRemaining} Days Active</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Renewal Opens</span>
                    <strong className="text-slate-800">
                      {renewalStartDate ? renewalStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '30d prior'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Unlocked Partner Privileges</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Zero Booking Commission</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Verified Provider Badge</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Unlimited Inquiries & Appointments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Direct Customer Chat Console</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Status View */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                {onOpenPlanDetails && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPlanDetails();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Receipt size={14} className="text-[#0F2E23]" />
                    <span>View Plan Invoice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            // Standard Plan Selection or Upgrade/Renew Grid
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>
                    {!isSubscriptionActive
                      ? 'Choose a Subscription Plan'
                      : activeTab === 'renew'
                      ? 'Selected Plan for Renewal'
                      : 'Available Higher-Tier Upgrade Plans'}
                  </span>
                  <span className="text-slate-400">
                    {!isSubscriptionActive
                      ? 'Cancel or switch anytime'
                      : activeTab === 'renew'
                      ? 'Extends current validity'
                      : 'Lesser plans hidden'}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    displayedPlans.length === 1
                      ? 'max-w-md mx-auto w-full'
                      : displayedPlans.length === 2
                      ? 'md:grid-cols-2'
                      : 'md:grid-cols-3'
                  } gap-3 sm:gap-4`}
                >
                  {displayedPlans.map((plan) => {
                    const planGst = Math.round(plan.basePrice * GST_RATE * 100) / 100;
                    const planTotal = Math.round((plan.basePrice + planGst) * 100) / 100;
                    const isSelected = selectedPlanId === plan.id;
                    const isThisPlanCurrent = isSubscriptionActive && plan.id === activePlanId;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#0F2E23] bg-emerald-50/40 shadow-md ring-2 ring-[#0F2E23]/20 scale-[1.01]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                        }`}
                      >
                        {/* Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                              isSelected
                                ? 'bg-[#0F2E23] text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isThisPlanCurrent ? 'Current Plan • Renew' : plan.badge}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-[#0F2E23] text-white rounded-full flex items-center justify-center">
                              <Check size={12} />
                            </div>
                          )}
                        </div>

                        {/* Plan Name & Base Price */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{plan.name}</h4>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black text-[#0F2E23]">₹{plan.basePrice}</span>
                            <span className="text-[10px] text-slate-400 font-medium">+ 18% GST</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Validity: <strong>{plan.validityLabel}</strong>
                          </p>
                          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                            {plan.description}
                          </p>

                          {isThisPlanCurrent && (
                            <div className="mt-3 bg-emerald-100/70 border border-emerald-300 rounded-xl p-2 text-[10px] text-emerald-900 font-medium flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                              <span>Extends validity to: <strong>{getExtendedExpiryPreview(plan.validityMonths)}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Total with GST */}
                        <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] flex items-center justify-between font-medium">
                          <span className="text-slate-500">Total with GST:</span>
                          <strong className="text-slate-900 font-bold">₹{planTotal}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown Summary Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs border-b border-stone-200 pb-2">
                  <span>Checkout Order Summary</span>
                  <span className="text-[#0F2E23] font-bold">
                    {selectedPlan.name} ({selectedPlan.validityLabel})
                    {isSelectedPlanCurrent ? ' • Renewal' : (isSelectedPlanUpgrade ? ' • Upgrade' : '')}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>Base Subscription Fee:</span>
                    <span className="font-semibold text-slate-800">₹{selectedPlan.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST (18% Digital Service Tax):</span>
                    <span className="font-semibold text-slate-800">+ ₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-[#0F2E23]">
                    <span>Total Payable Amount:</span>
                    <span className="text-base text-slate-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security & Policy Assurance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg">
                  <Lock size={12} className="text-emerald-700 shrink-0" />
                  <span>256-bit Encrypted Payment Gateway</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg">
                  <Calendar size={12} className="text-emerald-700 shrink-0" />
                  <span>Exact calendar-month validity extension</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full sm:flex-1 py-3 px-5 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-emerald-300" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} />
                      <span>
                        Pay ₹{totalAmount.toFixed(2)} &{' '}
                        {!isSubscriptionActive
                          ? 'Activate Plan'
                          : (isSelectedPlanCurrent
                            ? `Renew ${selectedPlan.name} (+${selectedPlan.validityLabel})`
                            : `Upgrade to ${selectedPlan.name}`)}
                      </span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={processing}
                  className="w-full sm:w-auto px-4 py-3 bg-stone-100 hover:bg-stone-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer text-center"
                >
                  Decide Later
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-700" /> VCI / AWBI Compliant Digital Invoicing
          </span>
          <span className="text-slate-400">Prices in INR (₹)</span>
        </div>

      </div>
    </div>
  );
}
