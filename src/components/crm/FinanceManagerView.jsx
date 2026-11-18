import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, CheckCircle2, AlertTriangle, ArrowDownRight,
  ArrowUpRight, RefreshCw, Check, X, Search, FileText, Landmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const FinanceManagerView = ({ crmToken }) => {
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundRemarks, setRefundRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadFinance = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/finance', getHeaders());
      if (res?.success) {
        setFinanceData(res.finance);
      }
    } catch (err) {
      console.warn('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, [crmToken]);

  const handleProcessRefund = async (refundId, status) => {
    setProcessing(true);
    try {
      const res = await apiRequest(`/crm/finance/refunds/${refundId}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          status,
          reviewRemarks: refundRemarks.trim()
        })
      });
      if (res?.success) {
        toast.success(`Refund case ${refundId} marked as ${status}!`);
        setSelectedRefund(null);
        setRefundRemarks('');
        loadFinance();
      }
    } catch (err) {
      toast.error('Failed to process refund decision');
    } finally {
      setProcessing(false);
    }
  };

  const refunds = financeData?.refunds || [];
  const pendingRefunds = refunds.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Top Financial Health KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Gross Platform Volume
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">
              ₹{(financeData?.grossPlatformVolume || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Reconciled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            E-commerce Store Revenue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#10B981]">
              ₹{(financeData?.storeRevenue || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Products</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pet Services Booking Volume
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#059669]">
              ₹{(financeData?.serviceRevenue || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Services</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Refund Cases
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-rose-600">
              {pendingRefunds.length} Cases
            </span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Action Required</span>
          </div>
        </div>
      </div>

      {/* Gateway & Payment Method Distribution */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Landmark size={16} className="text-[#10B981]" />
          Payment Gateway Split & Collection Channels
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">UPI / QR (Instant)</span>
            <span className="text-xl font-bold text-slate-900 block font-mono">
              {financeData?.paymentMethods?.UPI || 2} Orders
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">66% Share • Zero MDR</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Razorpay Cards / EMI</span>
            <span className="text-xl font-bold text-slate-900 block font-mono">
              {financeData?.paymentMethods?.Cards || 1} Orders
            </span>
            <span className="text-[10px] text-sky-600 font-bold">25% Share • T+1 Settled</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Cash on Delivery (COD)</span>
            <span className="text-xl font-bold text-slate-900 block font-mono">
              {financeData?.paymentMethods?.COD || 1} Orders
            </span>
            <span className="text-[10px] text-amber-600 font-bold">Courier Remittance Pending</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Net Banking</span>
            <span className="text-xl font-bold text-slate-900 block font-mono">
              {financeData?.paymentMethods?.NetBanking || 0} Orders
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Direct NEFT/RTGS</span>
          </div>
        </div>
      </div>

      {/* Customer Refund Processing Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Refund Verification & Settlement Desk</h3>
            <p className="text-xs text-slate-500">Authorize or reject refund cases raised by customers or service coordinators.</p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            {refunds.length} Lifetime Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Order / Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Reason Stated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No refund cases on record.
                  </td>
                </tr>
              ) : (
                refunds.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{r.orderId}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{r.customerName}</span>
                        <span className="text-[10px] text-slate-400">{r.customerEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{r.amount}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => { setSelectedRefund(r); setRefundRemarks(''); }}
                          className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Review & Settle
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFUND DECISION MODAL */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">{selectedRefund.id}</span>
                <h3 className="font-serif font-black text-slate-900 text-base">Process Refund Authorization</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRefund(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-800">{selectedRefund.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refund Amount:</span>
                  <strong className="text-slate-900 font-mono text-sm text-emerald-600">₹{selectedRefund.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Channel:</span>
                  <strong className="text-slate-800">{selectedRefund.paymentMethod}</strong>
                </div>
                <div className="pt-1 text-slate-600 italic">
                  "{selectedRefund.reason}"
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Finance Auditor Remarks / Bank RRN Trace
                </label>
                <textarea
                  rows="2"
                  value={refundRemarks}
                  onChange={(e) => setRefundRemarks(e.target.value)}
                  placeholder="e.g. Approved under return SLA; credited back to original payment method."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleProcessRefund(selectedRefund.id, 'Rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                >
                  Reject Claim
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleProcessRefund(selectedRefund.id, 'Approved')}
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {processing ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Approve & Release Funds</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagerView;

