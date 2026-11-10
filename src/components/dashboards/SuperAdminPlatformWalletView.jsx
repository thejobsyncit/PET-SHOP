import React, { useState, useEffect } from 'react';
import {
  Wallet, Landmark, ShieldCheck, Clock3, CheckCircle2, DollarSign,
  TrendingUp, RefreshCw, Calendar, User, FileText, CheckCircle,
  AlertCircle, Download, ArrowUpRight, X, Check, Lock, Filter,
  Layers, ShoppingBag, Eye, FileSpreadsheet, AlertTriangle, Shield,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const SuperAdminPlatformWalletView = () => {
  const [platformWallet, setPlatformWallet] = useState(null);
  const [adminPayouts, setAdminPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('payouts'); // 'payouts' | 'ledger'
  const [payoutFilterStatus, setPayoutFilterStatus] = useState('all');

  // Payout Processing Modals
  const [showPayoutActionModal, setShowPayoutActionModal] = useState(false);
  const [activePayoutForAction, setActivePayoutForAction] = useState(null);
  const [payoutActionType, setPayoutActionType] = useState('APPROVE'); // 'APPROVE' | 'REJECT' | 'MARK_PAID' | 'MARK_FAILED'
  const [payoutActionNote, setPayoutActionNote] = useState('');
  const [payoutTransferRef, setPayoutTransferRef] = useState('');
  const [isSubmittingPayoutAction, setIsSubmittingPayoutAction] = useState(false);

  // Fetch live Central Wallet Data
  const loadPlatformWalletData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        apiRequest('/wallet-payouts/platform-wallet'),
        apiRequest('/wallet-payouts/admin/payout-requests')
      ]);

      if (walletRes && walletRes.success) {
        setPlatformWallet(walletRes);
      }
      if (payoutsRes && payoutsRes.success && Array.isArray(payoutsRes.payouts)) {
        setAdminPayouts(payoutsRes.payouts);
      }
    } catch (err) {
      console.warn('Could not load central platform wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformWalletData();

    const handleSync = () => loadPlatformWalletData();
    window.addEventListener('service-booking-created', handleSync);
    window.addEventListener('service-booking-updated', handleSync);

    return () => {
      window.removeEventListener('service-booking-created', handleSync);
      window.removeEventListener('service-booking-updated', handleSync);
    };
  }, []);

  // Action Triggers
  const handleOpenPayoutAction = (payout, type) => {
    setActivePayoutForAction(payout);
    setPayoutActionType(type);
    setPayoutActionNote(type === 'APPROVE' ? 'Approved by Super Admin for bank settlement' : '');
    setPayoutTransferRef(type === 'MARK_PAID' ? `UTR${Date.now().toString().slice(-10)}` : '');
    setShowPayoutActionModal(true);
  };

  const handleExecutePayoutAction = async (e) => {
    e.preventDefault();
    if (!activePayoutForAction || !payoutActionType) return;

    if (payoutActionType === 'REJECT' && !payoutActionNote.trim()) {
      toast.error('Please enter an internal reason/note for rejecting.');
      return;
    }
    if (payoutActionType === 'MARK_PAID' && !payoutTransferRef.trim()) {
      toast.error('Transfer Reference / UTR is required to mark as Paid.');
      return;
    }

    setIsSubmittingPayoutAction(true);
    try {
      const res = await apiRequest('/wallet-payouts/admin/process-payout', {
        method: 'POST',
        body: JSON.stringify({
          payoutId: activePayoutForAction.id,
          action: payoutActionType,
          adminNotes: payoutActionNote.trim(),
          transferReference: payoutTransferRef.trim()
        })
      });

      if (res && res.success) {
        toast.success(`Payout ${activePayoutForAction.id} marked as ${res.payout.status}!`);
        setShowPayoutActionModal(false);
        loadPlatformWalletData();
      } else {
        throw new Error(res?.message || 'Failed to update payout.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process payout.');
    } finally {
      setIsSubmittingPayoutAction(false);
    }
  };

  const handleDownloadPayoutReport = () => {
    try {
      window.open('http://localhost:5001/api/wallet-payouts/admin/export-payouts-csv', '_blank');
      toast.success('Downloading Payouts Report (CSV)...');
    } catch (_) {
      toast.error('Failed to download report');
    }
  };

  // Filtered payouts
  const filteredPayouts = adminPayouts.filter(p => {
    if (payoutFilterStatus === 'all') return true;
    return (p.status || '').toLowerCase() === payoutFilterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header with Export & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EBE5] pb-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
            <Landmark size={20} className="text-emerald-700" />
            Central Platform Wallet & Service Provider Payouts
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time Razorpay payment collection ledger, escrow balances, and bank transfer authorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadPlatformWalletData}
            disabled={isLoading}
            className="p-2 border border-[#E3EBE5] rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Refresh Central Financials"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-emerald-700' : ''} />
          </button>

          <button
            type="button"
            onClick={handleDownloadPayoutReport}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E3EBE5] text-slate-700 font-bold text-xs uppercase tracking-wider rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* 2. Central Platform Wallet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Collected */}
        <div className="bg-gradient-to-br from-[#0F2E23] to-[#1d4737] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-1">
              Total Payments Collected
            </span>
            <div className="text-3xl font-black text-white mt-1">
              ₹{(platformWallet?.totalCollected || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-800/60 flex justify-between items-center text-[11px] text-emerald-200">
            <span>{platformWallet?.totalSuccessfulBookings || 0} Successful Bookings</span>
            <span className="font-bold flex items-center gap-0.5"><ShieldCheck size={13} /> 100% Escrow</span>
          </div>
        </div>

        {/* Available Platform Balance */}
        <div className="bg-white border border-[#E3EBE5] p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Available Platform Balance
            </span>
            <div className="text-3xl font-black text-[#0F2E23] mt-1">
              ₹{(platformWallet?.availablePlatformBalance || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
            <span>Current Razorpay Balance</span>
            <span className="text-emerald-700 font-bold">Unencumbered</span>
          </div>
        </div>

        {/* Platform Commission Earned */}
        <div className="bg-white border border-[#E3EBE5] p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Platform Commission (5%)
            </span>
            <div className="text-3xl font-black text-emerald-700 mt-1">
              ₹{(platformWallet?.platformCommissionEarned || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
            <span>Platform Revenue YTD</span>
            <span className="text-emerald-700 font-bold">Josh Retained</span>
          </div>
        </div>

        {/* Pending Payouts vs Completed */}
        <div className="bg-white border border-[#E3EBE5] p-5 rounded-2xl shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
              Pending Payout Queue
            </span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              ₹{(platformWallet?.totalPendingPayouts || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
            <span>Settled: ₹{(platformWallet?.totalCompletedPayouts || 0).toLocaleString('en-IN')}</span>
            <span className="text-slate-400 text-[10px]">Refunds: ₹{(platformWallet?.totalRefunded || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* 3. Sub-Navigation Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EBE5] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'payouts'
                ? 'bg-[#0F2E23] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Landmark size={14} /> Service Provider Payout Requests ({adminPayouts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ledger'
                ? 'bg-[#0F2E23] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet size={14} /> Central Platform Transaction Ledger ({platformWallet?.recentLedger?.length || 0})
          </button>
        </div>

        {activeSubTab === 'payouts' && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Status:</span>
            {['all', 'requested', 'approved', 'paid', 'rejected'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setPayoutFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                  payoutFilterStatus === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. SUB-TAB 1: Payout Requests Queue Table */}
      {activeSubTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-[#E3EBE5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-slate-600 font-bold uppercase tracking-wider border-b border-[#E3EBE5]">
                <tr>
                  <th className="p-3.5">Request ID</th>
                  <th className="p-3.5">Provider Partner</th>
                  <th className="p-3.5">Service Category</th>
                  <th className="p-3.5">Requested Amount</th>
                  <th className="p-3.5">Verified Bank Details</th>
                  <th className="p-3.5">Requested At</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Transfer Ref (UTR)</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EBE5] font-medium">
                {filteredPayouts.length > 0 ? (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{p.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block">{p.providerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.providerEmail || p.providerId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {p.serviceCategory}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                        {p.payoutMethod === 'UPI' || p.upiId ? (
                          <div>
                            <span className="font-bold text-emerald-800 flex items-center gap-1">
                              <CreditCard size={12} className="text-emerald-600" /> Instant UPI
                            </span>
                            <span className="text-slate-800 font-bold block">{p.upiId || p.bankDetails?.upiId}</span>
                            {p.bankDetails?.accountHolder && (
                              <span className="text-[10px] text-slate-500 block">Name: {p.bankDetails.accountHolder}</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">{p.bankDetails?.bankName || 'Verified Bank'}</span>
                            <span>{p.bankDetails?.accountNumberMasked || '••••••••'} (IFSC: {p.bankDetails?.ifsc || '—'})</span>
                            {p.bankDetails?.accountHolder && (
                              <span className="text-[10px] text-slate-500 block">Name: {p.bankDetails.accountHolder}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {p.requestedAt ? new Date(p.requestedAt).toLocaleString('en-IN') : 'Recent'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          p.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : p.status === 'Rejected' || p.status === 'Failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                        {p.adminNotes && (
                          <span className="block text-[10px] text-slate-400 italic mt-0.5 max-w-[150px] truncate" title={p.adminNotes}>
                            Note: {p.adminNotes}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                        {p.transferReference || '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'Requested' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenPayoutAction(p, 'APPROVE')}
                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenPayoutAction(p, 'REJECT')}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {p.status === 'Approved' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenPayoutAction(p, 'MARK_PAID')}
                                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1"
                              >
                                <Check size={12} /> Mark Paid (UTR)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenPayoutAction(p, 'MARK_FAILED')}
                                className="px-2.5 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Failed
                              </button>
                            </>
                          )}

                          {(p.status === 'Paid' || p.status === 'Rejected' || p.status === 'Failed') && (
                            <span className="text-[10px] font-bold text-slate-400">Processed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-400">
                      <Landmark size={28} className="mx-auto mb-1.5 text-slate-300" />
                      <p className="font-bold">No payout withdrawal requests found for this filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 2: Platform Central Transaction Ledger Table */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-[#E3EBE5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-slate-600 font-bold uppercase tracking-wider border-b border-[#E3EBE5]">
                <tr>
                  <th className="p-3.5">Ledger Ref</th>
                  <th className="p-3.5">Transaction Type</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Service / Booking Ref</th>
                  <th className="p-3.5">Partner / Customer</th>
                  <th className="p-3.5">Josh Platform Fee</th>
                  <th className="p-3.5">Partner Share</th>
                  <th className="p-3.5">Gateway Payment ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EBE5] font-medium">
                {platformWallet?.recentLedger && platformWallet.recentLedger.length > 0 ? (
                  platformWallet.recentLedger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{tx.id}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tx.type === 'PAYMENT_COLLECTION'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.type === 'PAYOUT_DISBURSEMENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-bold block">{tx.description || tx.serviceCategory}</span>
                        <span className="font-mono text-[10px] text-slate-400">{tx.bookingId || '—'}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <span className="font-bold block">{tx.providerName}</span>
                        <span className="text-[10px] text-slate-400">Cust: {tx.customerName}</span>
                      </td>
                      <td className="p-3.5 text-emerald-700 font-mono font-bold">
                        {tx.platformFee ? `₹${tx.platformFee.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {tx.providerShare ? `₹${tx.providerShare.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                        {tx.paymentId || tx.utr || '—'}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-slate-400">
                      <FileSpreadsheet size={28} className="mx-auto mb-1.5 text-slate-300" />
                      <p className="font-bold">Central wallet ledger is empty.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL: Super Admin Payout Action Modal */}
      {showPayoutActionModal && activePayoutForAction && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-[#0F2E23]" />
                <h3 className="font-black text-base text-[#0F2E23]">
                  {payoutActionType === 'APPROVE' && 'Approve Payout Request'}
                  {payoutActionType === 'REJECT' && 'Reject Payout Request'}
                  {payoutActionType === 'MARK_PAID' && (activePayoutForAction?.payoutMethod === 'UPI' || activePayoutForAction?.upiId ? 'Confirm UPI Disbursement (Ref/UTR)' : 'Confirm Bank Disbursement (UTR)')}
                  {payoutActionType === 'MARK_FAILED' && 'Mark Payout as Failed'}
                </h3>
              </div>
              <button onClick={() => setShowPayoutActionModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecutePayoutAction} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Request ID:</span>
                  <span className="font-mono font-bold text-slate-800">{activePayoutForAction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Provider Partner:</span>
                  <span className="font-bold text-slate-800">{activePayoutForAction.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Service Category:</span>
                  <span className="font-bold text-emerald-800">{activePayoutForAction.serviceCategory}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Withdrawal Amount:</span>
                  <span className="text-base font-black text-[#0F2E23]">₹{Number(activePayoutForAction.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Destination Preview */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 space-y-1">
                <span className="font-bold block text-[11px]">
                  {activePayoutForAction.payoutMethod === 'UPI' || activePayoutForAction.upiId ? 'Destination UPI ID:' : 'Destination Verified Account:'}
                </span>
                <p className="font-mono text-xs font-bold">
                  {activePayoutForAction.payoutMethod === 'UPI' || activePayoutForAction.upiId
                    ? (activePayoutForAction.upiId || activePayoutForAction.bankDetails?.upiId)
                    : `${activePayoutForAction.bankDetails?.bankName} (${activePayoutForAction.bankDetails?.accountNumberMasked})`
                  }
                </p>
                {activePayoutForAction.payoutMethod !== 'UPI' && !activePayoutForAction.upiId && (
                  <p className="font-mono text-[10px] text-emerald-700">
                    IFSC: {activePayoutForAction.bankDetails?.ifsc} • Name: {activePayoutForAction.bankDetails?.accountHolder}
                  </p>
                )}
              </div>

              {/* UTR Input for MARK_PAID */}
              {payoutActionType === 'MARK_PAID' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {activePayoutForAction.payoutMethod === 'UPI' || activePayoutForAction.upiId
                      ? 'UPI Transfer Reference / Ref ID *'
                      : 'Bank Transfer Reference / UTR Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutTransferRef}
                    onChange={(e) => setPayoutTransferRef(e.target.value)}
                    placeholder={activePayoutForAction.payoutMethod === 'UPI' || activePayoutForAction.upiId ? 'e.g. UPI/123456789012 or IMPS Ref' : 'e.g. UTR8192348123 or NEFT/IMPS Ref'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">This reference will be recorded in the platform ledger and displayed to the provider.</span>
                </div>
              )}

              {/* Admin Note / Rejection Reason */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {payoutActionType === 'REJECT' ? 'Rejection Reason (Required) *' : 'Internal Admin Note (Optional)'}
                </label>
                <textarea
                  required={payoutActionType === 'REJECT'}
                  rows={2}
                  value={payoutActionNote}
                  onChange={(e) => setPayoutActionNote(e.target.value)}
                  placeholder={
                    payoutActionType === 'REJECT'
                      ? 'Specify why this payout request is rejected (will be shown to provider)...'
                      : 'Optional reference or banking remarks...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutActionModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayoutAction}
                  className={`flex-1 py-2.5 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition cursor-pointer ${
                    payoutActionType === 'REJECT' || payoutActionType === 'MARK_FAILED'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#0F2E23] hover:bg-[#163e30]'
                  }`}
                >
                  {isSubmittingPayoutAction ? 'Processing...' : `Confirm ${payoutActionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminPlatformWalletView;

