import React, { useState, useEffect, useRef } from 'react';
import {
  X, ShieldCheck, CheckCircle2, Lock, Landmark, AlertCircle,
  CreditCard, Loader2, ArrowRight, Receipt, Calendar, Clock,
  MapPin, PawPrint, Sparkles, User, Phone, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

// Helper to load Razorpay checkout script
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

const RazorpayBookingPaymentModal = ({
  isOpen,
  onClose,
  bookingData,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [simulatedOrderInfo, setSimulatedOrderInfo] = useState(null);

  const isCancelledRef = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      isCancelledRef.current = true;
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (_) {}
        abortControllerRef.current = null;
      }
      setIsProcessing(false);
      setCompletedBooking(null);
      setShowSimulatedGateway(false);
      setSimulatedOrderInfo(null);
    } else {
      isCancelledRef.current = false;
    }
  }, [isOpen]);

  // Handle closing modal with graceful abort of ongoing verification
  const handleModalClose = () => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (_) {}
      abortControllerRef.current = null;
    }
    const wasProcessing = isProcessing;
    setIsProcessing(false);
    setShowSimulatedGateway(false);
    if (wasProcessing) {
      toast('Payment verification cancelled.', { icon: 'ℹ️' });
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Handle cancellation inside the simulated gateway
  const handleCancelSimulation = () => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      try { abortControllerRef.current.abort(); } catch (_) {}
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setShowSimulatedGateway(false);
    toast('Payment verification cancelled. Your booking was not confirmed.', { icon: 'ℹ️' });
  };

  // Auto-close confirmation screen promptly after 2 seconds
  useEffect(() => {
    if (completedBooking) {
      const timer = setTimeout(() => {
        handleModalClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completedBooking]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !bookingData) return null;

  const {
    serviceName = 'Pet Care Service',
    serviceCategory = 'General Service',
    providerName = 'Verified Service Partner',
    providerPhone = '',
    providerLocation = '',
    date = '',
    timeSlot = '',
    price = 0,
    petDetails = {},
    ownerName = '',
    ownerPhone = '',
    ownerEmail = ''
  } = bookingData;

  const numPrice = Number(price) || 0;

  // Handle checkout execution
  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Order on Backend
      const orderRes = await apiRequest('/wallet-payouts/create-booking-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: numPrice,
          serviceName,
          bookingId: bookingData.id || bookingData._id,
          customerEmail: ownerEmail,
          customerPhone: ownerPhone
        })
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Could not initiate payment order.');
      }

      // 2. Check if real Razorpay or simulation
      if (!orderRes.isSimulated && orderRes.razorpayKey && !orderRes.razorpayKey.includes('placeholder')) {
        const hasLoaded = await loadRazorpayScript();
        if (hasLoaded && window.Razorpay) {
          const options = {
            key: orderRes.razorpayKey,
            amount: orderRes.amount,
            currency: 'INR',
            name: 'Josh Pets Hub',
            description: `${serviceName} by ${providerName}`,
            order_id: orderRes.orderId,
            handler: async (response) => {
              await verifyAndFinalizePayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
            },
            prefill: {
              name: ownerName,
              email: ownerEmail,
              contact: ownerPhone
            },
            theme: {
              color: '#0F2E23'
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
                toast('Payment cancelled. Your booking was not confirmed.', { icon: 'ℹ️' });
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        }
      }

      // 3. Fallback: Automated Secure Sandbox Simulator
      setSimulatedOrderInfo(orderRes);
      setIsProcessing(false);
      setShowSimulatedGateway(true);

    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const verifyAndFinalizePayment = async ({ orderId, paymentId, signature }) => {
    isCancelledRef.current = false;
    abortControllerRef.current = new AbortController();
    setIsProcessing(true);
    try {
      const verifyRes = await apiRequest('/wallet-payouts/verify-booking-payment', {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          bookingPayload: {
            ...bookingData,
            status: 'Confirmed',
            paymentStatus: 'Paid',
            settlementStatus: 'Pending'
          }
        })
      });

      if (isCancelledRef.current) {
        return;
      }

      if (!verifyRes || !verifyRes.success) {
        throw new Error(verifyRes?.message || 'Cryptographic verification failed.');
      }

      setCompletedBooking(verifyRes.booking);
      setIsProcessing(false);
      setShowSimulatedGateway(false);

      // Fire real-time events for both Parent and Provider sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('service-booking-created', { detail: verifyRes.booking }));
        window.dispatchEvent(new CustomEvent('service-booking-updated', { detail: verifyRes.booking }));
      }

      toast.success(
        `🎉 Booking Confirmed! Payment of ₹${numPrice} collected by Josh Pet Hub.`,
        { duration: 2000 }
      );

      if (onSuccess) {
        onSuccess(verifyRes.booking);
      }
    } catch (err) {
      if (isCancelledRef.current || err?.name === 'AbortError') {
        console.log('Payment verification aborted by user.');
        return;
      }
      console.error('Payment verification error:', err);
      toast.error(err.message || 'Payment verification failed.');
      setIsProcessing(false);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSimulatedPaymentConfirm = async () => {
    setIsProcessing(true);
    const simPaymentId = `pay_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const simSignature = `sig_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    await verifyAndFinalizePayment({
      orderId: simulatedOrderInfo.orderId,
      paymentId: simPaymentId,
      signature: simSignature
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleModalClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F2E23] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-sans font-black text-base text-white">Centralized Platform Checkout</h3>
              <p className="text-[11px] text-emerald-200 font-medium">Secured by Razorpay • Josh Pets Hub Escrow</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* SUCCESS SCREEN */}
          {completedBooking ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="text-xl font-black text-[#0F2E23]">Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">Your service appointment is officially locked and synchronized.</p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 font-medium">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-bold">Booking ID</span>
                  <span className="font-black text-[#0F2E23] font-mono">{completedBooking.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Service</span>
                  <span className="font-bold text-slate-800">{serviceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Service Provider</span>
                  <span className="font-bold text-slate-800">{providerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date & Slot</span>
                  <span className="font-bold text-slate-800">{date} • {timeSlot}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black text-[10px] uppercase">
                    Paid (Razorpay)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Platform Wallet</span>
                  <span className="text-emerald-700 font-bold text-[11px]">Credited to Central Ledger</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-800">Total Paid</span>
                  <span className="text-base font-black text-[#0F2E23]">₹{numPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full bg-[#0F2E23] hover:bg-[#163e30] text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition cursor-pointer"
              >
                Close & View Booking
              </button>
            </div>
          ) : showSimulatedGateway ? (
            /* SIMULATED GATEWAY */
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                <div className="flex items-center gap-2 font-black text-sm text-[#0F2E23] mb-1">
                  <Sparkles size={16} className="text-amber-500" />
                  Razorpay Secure Gateway Simulator
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Executing server order <span className="font-mono font-bold">{simulatedOrderInfo?.orderId}</span>. In live deployment, Razorpay's branded modal opens. Click confirm below to finalize instant cryptographic verification and platform ledger crediting.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Payee:</span>
                  <span className="font-black text-[#0F2E23]">Josh Pets Hub Central Platform</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Service Partner:</span>
                  <span className="font-bold text-slate-800">{providerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Payable:</span>
                  <span className="text-base font-black text-[#0F2E23]">₹{numPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelSimulation}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatedPaymentConfirm}
                  disabled={isProcessing}
                  className="flex-2 py-3 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying Signature...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Confirm ₹{numPrice.toLocaleString('en-IN')} Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD PAYMENT SUMMARY SCREEN */
            <div className="space-y-4">
              
              {/* Service & Provider Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      {serviceCategory}
                    </span>
                    <h4 className="font-black text-sm text-[#0F2E23]">{serviceName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Price</span>
                    <span className="text-base font-black text-[#0F2E23]">₹{numPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-emerald-700 shrink-0" />
                    <span className="truncate">{providerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-700 shrink-0" />
                    <span>{date || 'Upcoming'}</span>
                  </div>
                  {timeSlot && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-emerald-700 shrink-0" />
                      <span>{timeSlot}</span>
                    </div>
                  )}
                  {petDetails?.name && (
                    <div className="flex items-center gap-1.5">
                      <PawPrint size={13} className="text-emerald-700 shrink-0" />
                      <span>{petDetails.name} ({petDetails.breed || 'Pet'})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-4 bg-white">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Service Fee</span>
                  <span className="font-bold text-slate-800">₹{numPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Platform Protection & Escrow Fee</span>
                  <span className="font-bold text-emerald-700">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Taxes & Banking Charges</span>
                  <span className="font-bold text-emerald-700">Included</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-[#0F2E23]">
                  <span>Total Payable Now</span>
                  <span className="text-base text-emerald-800">₹{numPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Security & Escrow Explainer */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px]">
                  <ShieldCheck size={15} className="text-amber-700 shrink-0" />
                  Josh Pet Hub Escrow Guarantee
                </div>
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  Your payment is safely collected by Josh Pet Hub and held in our central escrow account. The service provider will only receive their payout settlement after the scheduled service is verified and delivered.
                </p>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="w-full bg-[#0F2E23] hover:bg-[#163e30] text-white py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Contacting Razorpay...
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Pay ₹{numPrice.toLocaleString('en-IN')} via Razorpay & Confirm
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold pt-1">
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-600" /> 256-Bit SSL</span>
                <span>•</span>
                <span>Direct Provider Payout Protection</span>
                <span>•</span>
                <span>Razorpay Verified</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RazorpayBookingPaymentModal;

