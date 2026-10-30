import React, { useState } from 'react';
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
  ArrowRight
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
                  toast.success('🎉 Subscription activated successfully!');
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
                toast('Payment cancelled. Your completed profile remains saved.', { icon: 'ℹ️' });
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
        `🎉 ${planName} activated successfully! Welcome to active operations.`,
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
  currentSubscription = null
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

  // Filter available plans:
  // When provider has an active plan, restrict them from taking the plan which is already active!
  // ONLY show the plans which they did not take!
  const availablePlans = (isSubscriptionActive && activePlanId)
    ? PLANS.filter((p) => p.id !== activePlanId)
    : PLANS;

  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    return availablePlans[0]?.id || 'monthly';
  });

  // Ensure selected plan is always a valid available plan
  React.useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(availablePlans[0].id);
    }
  }, [availablePlans, selectedPlanId, isOpen]);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  if (!isOpen) return null;

  const selectedPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0] || PLANS[0];
  const gstAmount = Math.round(selectedPlan.basePrice * GST_RATE * 100) / 100;
  const totalAmount = Math.round((selectedPlan.basePrice + gstAmount) * 100) / 100;

  // Handle Checkout & Payment Processing
  const handleProceedToPayment = async () => {
    if (isSubscriptionActive && selectedPlan.id === activePlanId) {
      toast.error('You already have an active subscription for this plan. Please select a different plan.');
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
                  {isSubscriptionActive
                    ? 'Upgrade or Switch Your Subscription Plan'
                    : (isRenewal ? 'Renew Your Service Provider Subscription' : 'Select Your Provider Subscription Plan')}
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Notification Banner */}
          {isSubscriptionActive ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
              <Sparkles size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-950 leading-relaxed">
                <span>You currently have an active <strong>{activeSub?.planName || (activePlanId ? activePlanId.toUpperCase() + ' PLAN' : 'ACTIVE PLAN')}</strong> (valid until {expiryDate ? expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'active period'}).</span>
                <span className="block mt-0.5 text-amber-800 font-medium">Your current plan is restricted from re-selection. Choose from the available plans below to upgrade or switch.</span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-950 leading-relaxed">
                <strong>Profile Completed Successfully!</strong> To activate your service dashboard and accept customer bookings, please select an operational plan below. Prices are exclusive of 18% GST.
              </div>
            </div>
          )}

          {/* 3 Subscription Plans Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{isSubscriptionActive ? 'Available Alternative Plans' : 'Choose a Subscription Plan'}</span>
              <span className="text-slate-400">Cancel or switch anytime</span>
            </div>

            <div className={`grid grid-cols-1 ${availablePlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3 sm:gap-4`}>
              {availablePlans.map((plan) => {
                const planGst = Math.round(plan.basePrice * GST_RATE * 100) / 100;
                const planTotal = Math.round((plan.basePrice + planGst) * 100) / 100;
                const isSelected = selectedPlanId === plan.id;

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
                        {plan.badge}
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
              <span className="text-[#0F2E23]">{selectedPlan.name} ({selectedPlan.validityLabel})</span>
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
              <span>Exact calendar-month validity applied</span>
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
                  <span>Pay ₹{totalAmount.toFixed(2)} & {isSubscriptionActive ? 'Switch to Plan' : 'Activate Plan'}</span>
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

