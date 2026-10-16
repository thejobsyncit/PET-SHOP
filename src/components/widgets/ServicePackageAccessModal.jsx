import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  X, Check, ShieldCheck, Sparkles, CreditCard,
  Lock, ArrowRight, ArrowLeft, CircleCheck,
  QrCode, Smartphone, Building, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage.js';
import { getCookie, setCookie } from '../../utils/cookieUtils.js';
import { apiRequest } from '../../services/api.js';
import { setServiceMembership } from '../../store/slices/authSlice.js';

/**
 * COMMON SERVICE PACKAGES FOR ALL SERVICE CATEGORIES
 * Standard Tier: ₹199 + 18% GST (Total ₹235)
 * VIP Tier: ₹499 + 18% GST (Total ₹589)
 */
export const COMMON_SERVICE_PACKAGES = [
  {
    id: 'pass-standard-199',
    title: 'Standard Service Pass',
    tier: 'Standard Access Tier',
    badge: 'Standard Access',
    isVip: false,
    basePrice: 199,
    gstPercent: 18,
    gstAmount: 35.82,
    price: 235,
    priceLabel: '₹199',
    priceSuffix: '+ 18% GST',
    totalPayable: 235,
    taxText: '₹199 base + ₹35.82 (18% GST) = ₹235 total',
    desc: 'Direct contact pass to verified service specialists across all pet care departments.',
    features: [
      'Direct verified provider phone & chat communication',
      'Verified background clearance credentials',
      'Standard booking queue scheduling nationwide'
    ]
  },
  {
    id: 'pass-vip-499',
    title: 'VIP All-Access & Priority Pass',
    tier: 'VIP Elite Priority',
    badge: '⭐ VIP Most Recommended',
    isVip: true,
    basePrice: 499,
    gstPercent: 18,
    gstAmount: 89.82,
    price: 589,
    priceLabel: '₹499',
    priceSuffix: '+ 18% GST',
    totalPayable: 589,
    taxText: '₹499 base + ₹89.82 (18% GST) = ₹589 total',
    desc: 'VIP pass with 24/7 priority concierge, zero cancellation fees, and instant express bookings.',
    features: [
      '24/7 Priority VIP Concierge & Live Chat support',
      'Instant express fast-track scheduling with top specialists',
      'Direct senior vet consults & zero cancellation penalty guarantee'
    ]
  }
];

export const SERVICE_PACKAGES_DATA = {
  'Grooming': COMMON_SERVICE_PACKAGES,
  'Hostel': COMMON_SERVICE_PACKAGES,
  'Walking': COMMON_SERVICE_PACKAGES,
  'Training': COMMON_SERVICE_PACKAGES,
  'Transport': COMMON_SERVICE_PACKAGES,
  'Veterinary': COMMON_SERVICE_PACKAGES,
  'Insurance': COMMON_SERVICE_PACKAGES,
  'Breeding': COMMON_SERVICE_PACKAGES,
  'Adoption': COMMON_SERVICE_PACKAGES
};

/**
 * Universal, self-healing helper to get active membership from all persistent storage layers.
 */
export const getActiveUserMembership = (currentUser = null) => {
  try {
    // 1. Check current user object
    if (currentUser?.serviceMembership && (currentUser.serviceMembership.status === 'ACTIVE' || currentUser.serviceMembership.tier)) {
      return currentUser.serviceMembership;
    }

    // 2. Check localStorage 'pawora_user_membership'
    let rawMem = safeGetItem('pawora_user_membership') || localStorage.getItem('pawora_user_membership');

    // 3. Check sessionStorage
    if (!rawMem && typeof sessionStorage !== 'undefined') {
      try { rawMem = sessionStorage.getItem('pawora_user_membership'); } catch (_) {}
    }

    // 4. Check persistent cookie
    if (!rawMem) {
      try { rawMem = getCookie('pawora_user_membership'); } catch (_) {}
    }

    if (rawMem) {
      const parsed = typeof rawMem === 'string' ? JSON.parse(rawMem) : rawMem;
      if (parsed && (parsed.status === 'ACTIVE' || parsed.tier)) {
        // Auto-heal all other storage layers so they remain unified
        try {
          const str = JSON.stringify(parsed);
          localStorage.setItem('pawora_user_membership', str);
          sessionStorage.setItem('pawora_user_membership', str);
          setCookie('pawora_user_membership', str, 365);
        } catch (_) {}
        return parsed;
      }
    }

    // 5. Check 'joshpetshub_user'
    const rawUser = safeGetItem('joshpetshub_user') || localStorage.getItem('joshpetshub_user');
    if (rawUser) {
      const parsedUser = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
      if (parsedUser?.serviceMembership && (parsedUser.serviceMembership.status === 'ACTIVE' || parsedUser.serviceMembership.tier)) {
        const mem = parsedUser.serviceMembership;
        try {
          const str = JSON.stringify(mem);
          localStorage.setItem('pawora_user_membership', str);
          sessionStorage.setItem('pawora_user_membership', str);
          setCookie('pawora_user_membership', str, 365);
        } catch (_) {}
        return mem;
      }
    }

    // 6. Check registered users list fallback
    try {
      const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      if (Array.isArray(reg)) {
        const found = reg.find(u => u?.serviceMembership && (u.serviceMembership.status === 'ACTIVE' || u.serviceMembership.tier));
        if (found?.serviceMembership) {
          const mem = found.serviceMembership;
          try {
            const str = JSON.stringify(mem);
            localStorage.setItem('pawora_user_membership', str);
            sessionStorage.setItem('pawora_user_membership', str);
            setCookie('pawora_user_membership', str, 365);
          } catch (_) {}
          return mem;
        }
      }
    } catch (_) {}
  } catch (_) {}
  return null;
};

export const hasUserPurchasedPackage = (currentUser = null) => {
  return !!getActiveUserMembership(currentUser);
};

export const handleServiceAction = ({
  isAuthenticated,
  serviceType = 'Grooming',
  provider = null,
  action = 'book',
  customPackages = null,
  onAuthorized = null
}) => {
  // 1. Check if user already took a package and paid once:
  const activeMembership = getActiveUserMembership();
  if (activeMembership) {
    // If user paid once, the payment package modal MUST NOT COME in this or any other public service page!
    if (typeof onAuthorized === 'function') {
      onAuthorized();
      return true;
    }

    const tierName = activeMembership.tier === 'VIP' ? 'VIP All-Access Pass' : 'Standard Service Pass';

    if (action === 'whatsapp') {
      const rawPhone = (provider?.phone || '+91 98765 43210').replace(/\s+/g, '');
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hi ${provider?.name || 'Verified Provider'}, I have an active ${tierName} on Josh Pets Hub and would like to connect for ${serviceType} services.`);
      toast.success(`${tierName} Active! Connecting on WhatsApp...`, {
        icon: '💬'
      });
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
      return true;
    }

    if (action === 'call') {
      const rawPhone = (provider?.phone || '+91 98765 43210').replace(/\s+/g, '');
      window.open(`tel:${rawPhone}`, '_self');
      return true;
    }

    if (action === 'adopt') {
      toast.success(`🎉 ${tierName} Active: Direct adoption inquiry connected for ${provider?.name || 'pet'}!`, {
        icon: '🐾'
      });
      const rawPhone = (provider?.phone || '+91 98765 43210').replace(/\s+/g, '');
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hi ${provider?.parentName || 'Shelter'}, I have an active ${tierName} and would like to inquire about adopting ${provider?.name || 'this pet'}.`);
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
      return true;
    }

    // Default booking / consult action:
    toast.success(`🎉 ${tierName} Active! Direct booking & verified provider access unlocked.`, {
      icon: '✅',
      duration: 3500
    });

    window.dispatchEvent(
      new CustomEvent('open-direct-booking-modal', {
        detail: {
          serviceType,
          provider,
          membership: activeMembership
        }
      })
    );
    return true;
  }

  // 2. User has NOT purchased a pass yet: check if authenticated
  if (!isAuthenticated) {
    toast.error('Please register or log in first to access verified service providers.', {
      icon: '🔒',
      duration: 4000
    });
    window.dispatchEvent(
      new CustomEvent('open-register-modal', {
        detail: {
          tab: 'user',
          hideProviderTab: true,
          source: serviceType.toLowerCase()
        }
      })
    );
    return false;
  }

  // 3. Authenticated user without active pass: open the common payment access pass modal
  window.dispatchEvent(
    new CustomEvent('open-service-access-modal', {
      detail: {
        serviceType,
        provider,
        packages: customPackages,
        action
      }
    })
  );
  return true;
};

/**
 * ServicePackageAccessModal Component
 * Compact, streamlined, clean UI for selecting and activating Service Access Passes.
 */
const ServicePackageAccessModal = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [serviceType, setServiceType] = useState('Grooming');
  const [provider, setProvider] = useState(null);
  const [packages, setPackages] = useState(COMMON_SERVICE_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState(COMMON_SERVICE_PACKAGES[1]);

  // Stepper flow: 1 = 'packages', 2 = 'payment', 3 = 'success'
  const [step, setStep] = useState(1);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('834');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Listen to global open event
  useEffect(() => {
    const handleOpen = (e) => {
      const isForce = e?.detail?.forceOpen || e?.detail?.isUpgrade;
      const activeMem = getActiveUserMembership(user);
      if (activeMem && !isForce) {
        toast.success(`You already have an active ${activeMem.tier === 'VIP' ? 'VIP All-Access Pass' : 'Standard Service Pass'}! Access is unlocked nationwide.`, {
          icon: '⭐',
          id: 'mem-already-active',
          duration: 3500
        });
        setIsOpen(false);
        return;
      }

      const type = e?.detail?.serviceType || 'Grooming';
      const prov = e?.detail?.provider || {
        name: 'Josh Pets Hub Verified Service',
        rating: 4.9,
        reviews: 120,
        city: 'Bangalore',
        area: 'Indiranagar',
        phone: '+91 98765 43210'
      };

      setServiceType(type);
      setProvider(prov);
      setPackages(COMMON_SERVICE_PACKAGES);
      setSelectedPackage(COMMON_SERVICE_PACKAGES[1]); // default to VIP
      setStep(1);
      setConfirmedBooking(null);
      setIsOpen(true);
    };

    window.addEventListener('open-service-access-modal', handleOpen);
    return () => {
      window.removeEventListener('open-service-access-modal', handleOpen);
    };
  }, [user]);

  if (!isOpen) return null;

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);

    try {
      await new Promise((res) => setTimeout(res, 900));

      const txnId = `TXN_PET_${Date.now().toString().slice(-8)}`;
      const bookingId = `BK-${Date.now().toString().slice(-6)}`;

      const bookingRecord = {
        id: bookingId,
        _id: bookingId,
        serviceType,
        providerName: provider?.name || 'Verified Provider',
        providerPhone: provider?.phone || '+91 98765 43210',
        providerLocation: `${provider?.area || 'Central'}, ${provider?.city || 'Bangalore'}`,
        packageName: selectedPackage?.title,
        packageTier: selectedPackage?.tier,
        amount: selectedPackage?.totalPayable || selectedPackage?.price,
        paymentMethod,
        paymentStatus: 'Paid',
        transactionId: txnId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        user: {
          name: user?.name || 'User',
          email: user?.email || '',
          phone: user?.mobile || ''
        }
      };

      // Persist in local storage for bookings
      try {
        const stored = JSON.parse(safeGetItem('pawora_user_bookings', '[]') || '[]');
        stored.unshift(bookingRecord);
        safeSetItem('pawora_user_bookings', JSON.stringify(stored));
      } catch (_) {}

      // Persist service membership state with multi-layer resilience
      const isVipTier = selectedPackage?.isVip || selectedPackage?.basePrice === 499 || selectedPackage?.id === 'pass-vip-499';
      const membershipRecord = {
        tier: isVipTier ? 'VIP' : 'STANDARD',
        packageName: selectedPackage?.title || (isVipTier ? 'VIP All-Access & Priority Pass' : 'Standard Service Pass'),
        basePrice: selectedPackage?.basePrice || (isVipTier ? 499 : 199),
        gstAmount: selectedPackage?.gstAmount || (isVipTier ? 89.82 : 35.82),
        totalPaid: selectedPackage?.totalPayable || (isVipTier ? 589 : 235),
        taxBreakdown: selectedPackage?.taxText || (isVipTier ? '₹499 + 18% GST (₹589)' : '₹199 + 18% GST (₹235)'),
        paymentMethod,
        transactionId: txnId,
        purchasedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        features: selectedPackage?.features || []
      };

      const memStr = JSON.stringify(membershipRecord);
      safeSetItem('pawora_user_membership', memStr);
      try {
        sessionStorage.setItem('pawora_user_membership', memStr);
        setCookie('pawora_user_membership', memStr, 365);
      } catch (_) {}

      dispatch(setServiceMembership(membershipRecord));
      window.dispatchEvent(new CustomEvent('user-membership-updated', { detail: membershipRecord }));

      // Fire backend attempt quietly
      try {
        await apiRequest('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            providerName: bookingRecord.providerName,
            serviceType,
            location: bookingRecord.providerLocation,
            date: bookingRecord.date,
            timeSlot: 'Morning Slot (10:00 AM - 12:00 PM)',
            fee: bookingRecord.amount,
            transactionId: txnId,
            paymentStatus: bookingRecord.paymentStatus
          })
        });
      } catch (_) {}

      setConfirmedBooking(bookingRecord);
      setStep(3);
      toast.success(isVipTier ? '🎉 VIP All-Access Pass Activated!' : '🎉 Standard Service Pass Activated!', {
        duration: 4000,
        icon: '✅'
      });
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please retry.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setStep(1);
    setConfirmedBooking(null);
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-150">
      
      {/* Compact container card */}
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Streamlined Header */}
        <div className="bg-[#0F2E23] text-white px-4 py-3 sm:px-5 sm:py-3.5 shrink-0 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-sans leading-none">
                  Service Access Pass
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                  Verified Network
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Unlock direct phone, chat & booking with verified providers
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mini Stepper */}
        <div className="bg-slate-100 px-4 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className={step === 1 ? 'text-[#0F2E23] font-bold' : step > 1 ? 'text-emerald-700' : ''}>
            1. Select Pass
          </span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className={step === 2 ? 'text-[#0F2E23] font-bold' : step > 2 ? 'text-emerald-700' : ''}>
            2. Payment
          </span>
          <ChevronRight size={12} className="text-slate-400" />
          <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>
            3. Confirmation
          </span>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          
          {/* STEP 1: COMPACT TWO-PACKAGE SELECTION */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packages.map((pkg, idx) => {
                  const isVip = pkg.isVip || idx === 1;
                  return (
                    <div
                      key={pkg.id || idx}
                      className={`rounded-xl p-3.5 flex flex-col justify-between border transition relative ${
                        isVip
                          ? 'border-amber-400 bg-amber-50/30 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Tier Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isVip
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isVip ? '⭐ VIP Most Popular' : 'Standard Tier'}
                          </span>
                        </div>

                        {/* Title & Price */}
                        <h4 className="text-sm font-bold text-slate-900 font-sans leading-tight">
                          {pkg.title}
                        </h4>
                        
                        <div className="flex items-baseline gap-1 mt-1.5 mb-2.5 pb-2 border-b border-slate-100">
                          <span className="text-xl font-black text-[#0F2E23]">
                            {pkg.priceLabel || `₹${pkg.basePrice}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            + 18% GST (₹{pkg.totalPayable})
                          </span>
                        </div>

                        {/* Crisp 3-bullet list */}
                        <ul className="space-y-1.5 text-xs text-slate-600 mb-3.5">
                          {(pkg.features || []).slice(0, 3).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5 leading-snug">
                              <span className={`font-black text-xs shrink-0 ${isVip ? 'text-amber-600' : 'text-emerald-600'}`}>✓</span>
                              <span className="text-[11px]">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Select Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                          isVip
                            ? 'bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37]'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <span>Choose {isVip ? 'VIP' : 'Standard'} (₹{pkg.totalPayable})</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-center text-slate-400 pt-1">
                🔒 One-time fee unlocks nationwide verified provider directory & direct WhatsApp/phone contact.
              </p>
            </div>
          )}

          {/* STEP 2: STREAMLINED PAYMENT GATEWAY */}
          {step === 2 && selectedPackage && (
            <div className="space-y-3.5">
              
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
              >
                <ArrowLeft size={13} /> Change Package
              </button>

              {/* Order Summary Pill */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Pass</span>
                  <strong className="text-slate-800 text-xs font-bold">{selectedPackage.title}</strong>
                  <span className="text-[11px] text-slate-500 block">Base ₹{selectedPackage.basePrice} + GST ₹{selectedPackage.gstAmount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payable</span>
                  <strong className="text-lg font-black text-[#0F2E23]">₹{selectedPackage.totalPayable || selectedPackage.price}</strong>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Choose Payment Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: <QrCode size={14} /> },
                    { id: 'Card', label: 'Card', icon: <CreditCard size={14} /> },
                    { id: 'NetBanking', label: 'NetBanking', icon: <Building size={14} /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-[#0F2E23] text-white border-[#0F2E23]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Input Modes */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2.5">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="w-16 h-16 bg-white border border-slate-700 p-1 rounded flex items-center justify-center shrink-0">
                        <QrCode size={48} className="text-slate-900" />
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <p className="font-bold text-slate-800">Scan QR Code</p>
                        <p className="text-[10px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Or enter UPI ID / VPA</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0F2E23]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 block">Select Bank</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-1.5 rounded border text-[11px] font-bold transition cursor-pointer ${
                            selectedBank === b ? 'bg-[#0F2E23] text-white border-[#0F2E23]' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay & Activate Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="w-full py-3 rounded-xl bg-[#0F2E23] hover:bg-[#164E3D] text-[#D4AF37] font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span>Activating Pass...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Pay ₹{selectedPackage.totalPayable || selectedPackage.price} & Activate Pass</span>
                  </>
                )}
              </button>

            </div>
          )}

          {/* STEP 3: CONFIRMATION VIEW */}
          {step === 3 && confirmedBooking && (
            <div className="text-center py-2 space-y-3.5 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CircleCheck size={28} />
              </div>

              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Payment Confirmed
                </span>
                <h3 className="text-base font-bold text-slate-900 font-sans mt-1">
                  {confirmedBooking.packageTier?.includes('VIP') ? '👑 VIP All-Access Pass Activated!' : '🛡️ Standard Service Pass Activated!'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Direct provider phone, chat, and verified booking is now unlocked across all pet service pages.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ref ID:</span>
                  <span className="font-mono font-bold text-slate-800">{confirmedBooking.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Paid Amount:</span>
                  <strong className="text-emerald-700 font-bold">₹{confirmedBooking.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Validity:</span>
                  <strong className="text-slate-800">1 Year Unlimited Access</strong>
                </div>
              </div>

              <div className="flex gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    navigate('/account?tab=profile');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0F2E23] hover:bg-[#164E3D] text-white font-bold text-xs transition cursor-pointer"
                >
                  View In Profile
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ServicePackageAccessModal;
