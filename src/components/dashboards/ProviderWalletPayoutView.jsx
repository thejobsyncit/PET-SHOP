import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Wallet, Landmark, ShieldCheck, Clock3, CheckCircle2, DollarSign,
  X, CreditCard, ArrowUpRight, Check, AlertCircle, Building,
  TrendingUp, RefreshCw, Calendar, User, FileText, CheckCircle,
  HelpCircle, ChevronRight, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage.js';
import { apiRequest } from '../../services/api.js';

const ProviderWalletPayoutView = ({
  serviceCategory = 'Service Provider',
  storageKeyPrefix = 'provider',
  initialBalance = 28500,
  escrowAmount = 8500
}) => {
  const { user } = useSelector((state) => state.auth);

  const balanceKey = `${storageKeyPrefix}_wallet_balance_v2`;
  const historyKey = `${storageKeyPrefix}_payouts_history_v2`;
  const bankDetailsKey = `${storageKeyPrefix}_bank_details_v2`;

  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('bookings'); // 'bookings' | 'payouts'

  // Financial Metrics State
  const [metrics, setMetrics] = useState({
    totalBookingsReceived: 0,
    totalPaidBookings: 0,
    totalEarningsGenerated: initialBalance + escrowAmount,
    pendingEarnings: escrowAmount,
    availablePayoutBalance: initialBalance,
    totalWithdrawn: 14500,
    totalCompletedPayouts: 1,
    reservedPayouts: 0
  });

  const [bookingsList, setBookingsList] = useState([]);
  const [payoutsHistory, setPayoutsHistory] = useState([]);

  // Bank Account State
  const [bankDetails, setBankDetails] = useState({
    accountHolder: user?.businessName || user?.name || `${serviceCategory} Partner`,
    bankName: 'HDFC Bank',
    accountNumberMasked: '••••••••4321',
    ifsc: 'HDFC0001234',
    isVerified: true
  });

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: ''
  });
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);

  // 1. Fetch live provider earnings and bookings from backend
  const fetchProviderFinancials = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(`/wallet-payouts/provider-earnings?category=${encodeURIComponent(serviceCategory)}`);
      if (res && res.success) {
        setMetrics({
          totalBookingsReceived: res.totalBookingsReceived,
          totalPaidBookings: res.totalPaidBookings,
          totalEarningsGenerated: res.totalEarningsGenerated,
          pendingEarnings: res.pendingEarnings,
          availablePayoutBalance: res.availablePayoutBalance,
          totalWithdrawn: res.totalWithdrawn,
          totalCompletedPayouts: res.totalCompletedPayouts,
          reservedPayouts: res.reservedPayouts || 0
        });

        if (Array.isArray(res.bookingsList)) {
          setBookingsList(res.bookingsList);
        }

        if (Array.isArray(res.payoutsHistory)) {
          setPayoutsHistory(res.payoutsHistory);
        }

        if (res.bankDetails) {
          setBankDetails(res.bankDetails);
        }
      }
    } catch (err) {
      console.warn('[ProviderWalletPayoutView] Could not fetch server earnings, using cached/local:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderFinancials();

    // Listen to real-time booking updates
    const handleSync = () => fetchProviderFinancials();
    window.addEventListener('service-booking-updated', handleSync);
    window.addEventListener('service-booking-created', handleSync);

    return () => {
      window.removeEventListener('service-booking-updated', handleSync);
      window.removeEventListener('service-booking-created', handleSync);
    };
  }, [user?._id, serviceCategory]);

  // 2. Open Bank Details Modal
  const handleOpenBankModal = () => {
    setBankForm({
      accountHolder: bankDetails.accountHolder || user?.businessName || user?.name || '',
      bankName: bankDetails.bankName || 'HDFC Bank',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: bankDetails.ifsc || ''
    });
    setShowBankModal(true);
  };

  // 3. Save Bank Details Form
  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankForm.accountHolder.trim()) {
      toast.error('Account holder name is required');
      return;
    }
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      toast.error('Bank account numbers do not match');
      return;
    }
    if (!/^\d{9,18}$/.test(bankForm.accountNumber)) {
      toast.error('Please enter a valid bank account number (9 to 18 digits)');
      return;
    }
    const cleanIfsc = bankForm.ifsc.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      toast.error('Invalid IFSC Code format (e.g. HDFC0001234)');
      return;
    }

    setIsSubmittingBank(true);
    try {
      const res = await apiRequest('/wallet-payouts/bank-account', {
        method: 'POST',
        body: JSON.stringify({
          ...bankForm,
          ifsc: cleanIfsc,
          providerId: user?._id || user?.id,
          providerEmail: user?.email,
          providerName: user?.businessName || user?.name
        })
      });

      if (res && res.success) {
        setBankDetails(res.bankDetails);
        setShowBankModal(false);
        toast.success('🎉 Bank account details verified and linked successfully!');
      } else {
        throw new Error(res?.message || 'Failed to link bank account');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save bank account');
    } finally {
      setIsSubmittingBank(false);
    }
  };

  // 4. Open Payout Modal
  const handleOpenWithdrawModal = (presetAmount = null) => {
    if (!bankDetails || !bankDetails.isVerified) {
      toast('Please add and verify your bank account details before requesting a payout.', { icon: '⚠️' });
      handleOpenBankModal();
      return;
    }

    const amt = presetAmount !== null
      ? presetAmount.toString()
      : (metrics.availablePayoutBalance > 0 ? metrics.availablePayoutBalance.toString() : '');

    setWithdrawAmount(amt);
    setWithdrawUpi(user?.email ? `${user.email.split('@')[0]}@okhdfcbank` : '');
    setShowWithdrawModal(true);
  };

  // 5. Submit Payout Request
  const handleRequestPayoutSubmit = async (e) => {
    e.preventDefault();
    const num = Number(withdrawAmount);

    if (!num || num < 500) {
      toast.error('Minimum payout withdrawal amount is ₹500.');
      return;
    }
    if (num > metrics.availablePayoutBalance) {
      toast.error(`Withdrawal amount cannot exceed available balance of ₹${metrics.availablePayoutBalance.toLocaleString('en-IN')}.`);
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await apiRequest('/wallet-payouts/request-payout', {
        method: 'POST',
        body: JSON.stringify({
          amount: num,
          upiId: withdrawUpi,
          serviceCategory,
          providerId: user?._id || user?.id,
          providerEmail: user?.email,
          providerName: user?.businessName || user?.name
        })
      });

      if (res && res.success) {
        toast.success(`🎉 Payout request for ₹${num.toLocaleString('en-IN')} submitted for Super Admin review!`);
        setShowWithdrawModal(false);
        fetchProviderFinancials();
      } else {
        throw new Error(res?.message || 'Payout request failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request payout.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-[#0F2E23]">Earnings & Wallet</h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {serviceCategory}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time verified booking earnings, escrow management, and bank payout requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProviderFinancials}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center cursor-pointer"
            title="Refresh Financials"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-700' : ''} />
          </button>
          
          <button
            type="button"
            onClick={() => handleOpenWithdrawModal()}
            disabled={metrics.availablePayoutBalance <= 0}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2 transition ${
              metrics.availablePayoutBalance <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#0F2E23] hover:bg-[#163e30] text-white cursor-pointer active:scale-95'
            }`}
          >
            <Wallet size={16} /> Request Payout
          </button>
        </div>
      </div>

      {/* 2. Primary Financial KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Available for Payout Card */}
        <div className="bg-gradient-to-br from-[#0F2E23] to-[#1a4a3a] text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[170px]">
          <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-1">
              Available for Payout
            </span>
            <div className="text-3xl font-black tracking-tight text-white mt-1">
              ₹{metrics.availablePayoutBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-emerald-800/60">
            <span className="text-[11px] text-emerald-200 font-medium flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" /> Ready to Withdraw
            </span>
            <button
              type="button"
              onClick={() => handleOpenWithdrawModal()}
              disabled={metrics.availablePayoutBalance <= 0}
              className="text-[11px] font-bold text-amber-300 hover:text-white transition flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
            >
              Withdraw <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Total Earnings Generated Card */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[170px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Total Earnings Generated
            </span>
            <div className="text-3xl font-black text-[#0F2E23] mt-1">
              ₹{metrics.totalEarningsGenerated.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{metrics.totalPaidBookings} Paid Bookings</span>
            <span className="text-emerald-700 font-bold">5% Josh Fee</span>
          </div>
        </div>

        {/* Pending Escrow Earnings Card */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[170px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              In Escrow (Upcoming)
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              ₹{metrics.pendingEarnings.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Clock3 size={13} className="text-amber-500" /> Central Platform Hold
            </span>
            <span className="text-slate-400 text-[10px]">Unlocks on service</span>
          </div>
        </div>

        {/* Total Settled & Withdrawn Card */}
        <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs flex flex-col justify-between min-h-[170px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Total Withdrawn to Bank
            </span>
            <div className="text-3xl font-black text-emerald-800 mt-1">
              ₹{metrics.totalWithdrawn.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{metrics.totalCompletedPayouts} Settled Transfers</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={13} /> 100% Cleared
            </span>
          </div>
        </div>

      </div>

      {/* 3. Verified Primary Bank Account Management Bar */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2E23] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Landmark size={22} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-[#0F2E23]">
                {bankDetails.bankName || 'Primary Bank Account'}
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> Verified for Payouts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              A/C: <span className="font-bold text-slate-700">{bankDetails.accountNumberMasked}</span> • IFSC: <span className="font-bold text-slate-700">{bankDetails.ifsc}</span> • Holder: <span className="font-bold text-slate-700">{bankDetails.accountHolder}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenBankModal}
          className="px-4 py-2 border border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
        >
          Update Bank Details
        </button>
      </div>

      {/* 4. Sub-Navigation Tabs: Bookings vs Payouts */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('bookings')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'bookings'
              ? 'bg-[#0F2E23] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} /> Verified Paid Bookings ({bookingsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('payouts')}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'payouts'
              ? 'bg-[#0F2E23] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Landmark size={15} /> Payout Withdrawal Requests ({payoutsHistory.length})
        </button>
      </div>

      {/* 5. TAB 1: Verified Paid Bookings & Earnings Breakdown Table */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5">Booking Ref</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Service Details</th>
                    <th className="px-5 py-3.5">Booking Date</th>
                    <th className="px-5 py-3.5">Service Price</th>
                    <th className="px-5 py-3.5">Josh Fee (5%)</th>
                    <th className="px-5 py-3.5">Net Payable</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Booking Status</th>
                    <th className="px-5 py-3.5">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bookingsList.length > 0 ? (
                    bookingsList.map((item) => (
                      <tr key={item.bookingId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-800">{item.bookingId}</td>
                        <td className="px-5 py-4 text-slate-700">{item.customerName}</td>
                        <td className="px-5 py-4 font-bold text-[#0F2E23]">{item.serviceName}</td>
                        <td className="px-5 py-4 text-slate-500">{item.bookingDate}</td>
                        <td className="px-5 py-4 font-bold text-slate-800">₹{item.servicePrice.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-slate-400 font-mono">-₹{item.platformCommission.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 font-black text-emerald-800 text-sm">
                          ₹{item.netEarnings.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-700">{item.bookingStatus}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            item.settlementStatus === 'Available' || item.settlementStatus === 'Settled'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : item.settlementStatus === 'Refunded'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">No verified service bookings yet for this provider.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">When pet parents book and pay online, earnings will appear here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 2: Payout Withdrawal Requests History */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5">Request Ref</th>
                    <th className="px-5 py-3.5">Requested Date</th>
                    <th className="px-5 py-3.5">Withdrawal Amount</th>
                    <th className="px-5 py-3.5">Destination Account</th>
                    <th className="px-5 py-3.5">Payout Status</th>
                    <th className="px-5 py-3.5">Transfer Ref (UTR)</th>
                    <th className="px-5 py-3.5">Admin Review Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payoutsHistory.length > 0 ? (
                    payoutsHistory.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-800">{po.id}</td>
                        <td className="px-5 py-4 text-slate-500">
                          {po.requestedAt ? new Date(po.requestedAt).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-800 text-sm">
                          ₹{Number(po.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {po.bankDetails?.bankName} ({po.bankDetails?.accountNumberMasked})
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            po.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'Approved'
                              ? 'bg-blue-100 text-blue-800'
                              : po.status === 'Rejected' || po.status === 'Failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-500">
                          {po.transferReference || 'Pending Transfer'}
                        </td>
                        <td className="px-5 py-4 text-slate-500 italic max-w-xs truncate">
                          {po.adminNotes || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        <Landmark size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="font-bold">No payout withdrawal requests found.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click "Request Payout" above to withdraw cleared earnings to your bank account.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Request Payout Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-[#0F2E23]" />
                <h3 className="font-black text-base text-[#0F2E23]">Request Bank Payout</h3>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestPayoutSubmit} className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex justify-between items-center">
                <span className="font-bold text-emerald-800">Available Balance:</span>
                <span className="font-black text-base text-[#0F2E23]">₹{metrics.availablePayoutBalance.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Withdrawal Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  max={metrics.availablePayoutBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Min ₹500 • Max ₹{metrics.availablePayoutBalance.toLocaleString('en-IN')}</span>
              </div>

              {/* Quick Chips */}
              <div className="flex gap-2">
                {[2000, 5000].filter(amt => amt <= metrics.availablePayoutBalance).map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className="flex-1 py-1.5 border border-slate-200 hover:border-emerald-600 rounded-lg text-slate-600 font-bold text-[11px]"
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(metrics.availablePayoutBalance.toString())}
                  className="flex-1 py-1.5 border border-emerald-600 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[11px]"
                >
                  All Balance
                </button>
              </div>

              {/* Destination Bank Preview */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Bank Account</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800 block">{bankDetails.bankName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{bankDetails.accountNumberMasked} (IFSC: {bankDetails.ifsc})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
                    Verified
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > metrics.availablePayoutBalance}
                  className="flex-1 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Update / Link Verified Bank Account */}
      {showBankModal && (
        <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark size={20} className="text-[#0F2E23]" />
                <h3 className="font-black text-base text-[#0F2E23]">Link Bank Settlement Account</h3>
              </div>
              <button onClick={() => setShowBankModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  placeholder="Official name matching bank passbook"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Account Number *</label>
                <input
                  type="password"
                  required
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Enter full 9-18 digit account number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Confirm Bank Account Number *</label>
                <input
                  type="text"
                  required
                  value={bankForm.confirmAccountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                  placeholder="Re-enter bank account number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={bankForm.ifsc}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-600 font-mono uppercase"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                🔒 Bank details are encrypted and masked for security. Payouts will only be processed to this verified account.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBank}
                  className="flex-1 py-2.5 bg-[#0F2E23] hover:bg-[#163e30] text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition cursor-pointer"
                >
                  {isSubmittingBank ? 'Verifying...' : 'Save & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderWalletPayoutView;
