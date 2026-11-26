import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Edit, Trash2, Check, X, Copy, RefreshCw,
  Sparkles, Calendar, Calculator, AlertCircle, Percent, IndianRupee,
  TrendingUp, CheckCircle, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const CouponsManagerView = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState(15);
  const [formMinOrderValue, setFormMinOrderValue] = useState(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Quick Simulator Widget
  const [testSubtotal, setTestSubtotal] = useState('13594');
  const [testCode, setTestCode] = useState('PAWFIRST');
  const [testResult, setTestResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/coupons');
      if (res && res.success && Array.isArray(res.coupons)) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.warn('Failed to load coupons:', err);
      toast.error('Failed to load promotional offer codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormCode('');
    setFormDescription('');
    setFormDiscountType('percentage');
    setFormDiscountValue(15);
    setFormMinOrderValue(0);
    setFormMaxDiscount('2000');
    setFormExpiresAt('2027-12-31');
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingId(c.id || c._id);
    setFormCode(c.code || '');
    setFormDescription(c.description || '');
    setFormDiscountType(c.discountType || 'percentage');
    setFormDiscountValue(c.discountValue ?? 10);
    setFormMinOrderValue(c.minOrderValue ?? 0);
    setFormMaxDiscount(c.maxDiscount !== null && c.maxDiscount !== undefined ? String(c.maxDiscount) : '');
    setFormExpiresAt(c.expiresAt ? c.expiresAt.substring(0, 10) : '');
    setFormIsActive(c.isActive !== false);
    setShowModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      toast.error('Please enter a valid promotional offer code.');
      return;
    }

    if (Number(formDiscountValue) <= 0) {
      toast.error('Discount value must be greater than 0.');
      return;
    }

    if (formDiscountType === 'percentage' && Number(formDiscountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    setSavingCoupon(true);
    const payload = {
      code: cleanCode,
      description: formDescription.trim(),
      discountType: formDiscountType,
      discountValue: Number(formDiscountValue),
      minOrderValue: Number(formMinOrderValue) || 0,
      maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : null,
      expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      isActive: formIsActive
    };

    try {
      if (editingId) {
        const res = await apiRequest(`/coupons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`Offer code "${cleanCode}" updated successfully!`);
          setShowModal(false);
          loadCoupons();
        } else {
          toast.error(res?.message || 'Could not update offer code.');
        }
      } else {
        const res = await apiRequest('/coupons', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`🎉 Offer code "${cleanCode}" created successfully!`);
          setShowModal(false);
          loadCoupons();
        } else {
          toast.error(res?.message || 'Could not create offer code.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving offer code.');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleActive = async (c) => {
    const updatedStatus = !c.isActive;
    const cid = c.id || c._id;
    try {
      const res = await apiRequest(`/coupons/${cid}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: updatedStatus })
      });
      if (res && res.success) {
        setCoupons(prev => prev.map(item => (item.id === cid || item._id === cid) ? { ...item, isActive: updatedStatus } : item));
        toast.success(`Offer code "${c.code}" ${updatedStatus ? 'activated' : 'paused'}.`);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteCoupon = async (c) => {
    const cid = c.id || c._id;
    if (!window.confirm(`Are you sure you want to permanently delete offer code "${c.code}"?`)) return;
    try {
      const res = await apiRequest(`/coupons/${cid}`, {
        method: 'DELETE'
      });
      if (res && res.success) {
        toast.success(`Offer code "${c.code}" deleted.`);
        setCoupons(prev => prev.filter(item => item.id !== cid && item._id !== cid));
      } else {
        toast.error(res?.message || 'Could not delete offer code.');
      }
    } catch (err) {
      toast.error('Failed to delete offer code.');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied code "${code}" to clipboard!`, { icon: '📋' });
  };

  // Run validation simulation
  const handleSimulateValidation = async () => {
    if (!testCode.trim()) {
      toast.error('Enter an offer code to test.');
      return;
    }
    setSimulating(true);
    setTestResult(null);
    try {
      const res = await apiRequest('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: testCode.trim().toUpperCase(),
          cartTotal: Number(testSubtotal) || 0
        })
      });
      setTestResult(res);
      if (res && res.success) {
        toast.success(res.message);
      } else {
        toast.error(res?.message || 'Validation failed');
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Validation error' });
      toast.error(err.message || 'Validation error');
    } finally {
      setSimulating(false);
    }
  };

  // Computed modal preview
  const previewSampleSubtotal = 13594;
  const previewDiscount = (() => {
    const val = Number(formDiscountValue) || 0;
    if (formDiscountType === 'percentage') {
      let d = Math.round((previewSampleSubtotal * val) / 100);
      if (formMaxDiscount && d > Number(formMaxDiscount)) {
        d = Number(formMaxDiscount);
      }
      return d;
    }
    return Math.min(val, previewSampleSubtotal);
  })();

  const filteredCoupons = coupons.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  const totalRedemptions = coupons.reduce((sum, c) => sum + (Number(c.usageCount) || 0), 0);
  const activeCouponsCount = coupons.filter(c => c.isActive !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-beige/40 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Tag size={22} />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                Offer Codes & Promotional Discounts Manager
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Create, customize and manage discount codes for the shop checkout and public header ticker.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadCoupons}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Refresh coupon listings"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={16} /> CREATE NEW OFFER CODE
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-[#FAFBF9] p-3.5 rounded-lg border border-beige/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Offer Codes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-2xl font-bold text-primary">{activeCouponsCount}</span>
              <span className="text-[11px] text-gray-500">of {coupons.length} total</span>
            </div>
          </div>

          <div className="bg-[#FAFBF9] p-3.5 rounded-lg border border-beige/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Redemptions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-2xl font-bold text-emerald-700">{totalRedemptions}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">orders used</span>
            </div>
          </div>

          <div className="bg-[#FAFBF9] p-3.5 rounded-lg border border-beige/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Top Header Offer
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-sm font-black text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                PAWFIRST
              </span>
              <span className="text-[11px] text-gray-500">15% OFF</span>
            </div>
          </div>

          <div className="bg-[#FAFBF9] p-3.5 rounded-lg border border-beige/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Checkout Sync
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700">Real-Time Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Interactive Offer Simulator */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Offer Code Validation Simulator (Test Before Live)
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            Tests exact cart calculation against backend API
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Sample Cart Subtotal (₹)
            </label>
            <input
              type="number"
              value={testSubtotal}
              onChange={(e) => setTestSubtotal(e.target.value)}
              placeholder="13594"
              className="w-full px-3 py-1.5 text-xs border border-beige rounded font-mono font-bold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
              Select or Type Offer Code
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                placeholder="PAWFIRST"
                className="w-full px-3 py-1.5 text-xs border border-beige rounded font-mono uppercase font-bold focus:outline-none focus:border-primary"
              />
              <select
                onChange={(e) => { if (e.target.value) setTestCode(e.target.value); }}
                className="px-2 py-1.5 text-xs border border-beige rounded bg-gray-50 text-gray-700"
              >
                <option value="">Presets</option>
                {coupons.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 flex items-end gap-3">
            <button
              type="button"
              onClick={handleSimulateValidation}
              disabled={simulating}
              className="px-4 py-2 bg-primary hover:bg-[#163a2d] text-white text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer shrink-0"
            >
              {simulating ? 'Validating...' : 'TEST DISCOUNT CALCULATION'}
            </button>

            {testResult && (
              <div className={`p-2 rounded border text-xs flex items-center gap-2 flex-grow ${
                testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {testResult.success ? <CheckCircle size={15} className="shrink-0 text-emerald-600" /> : <AlertCircle size={15} className="shrink-0 text-rose-600" />}
                <div className="text-[11px] leading-tight">
                  <span className="font-bold">{testResult.message}</span>
                  {testResult.coupon?.calculatedDiscount !== undefined && (
                    <span className="block mt-0.5 text-emerald-900 font-mono">
                      Payable: ₹{Number(testSubtotal) - testResult.coupon.calculatedDiscount} (Saved ₹{testResult.coupon.calculatedDiscount})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
        <div className="p-5 border-b border-beige/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h4 className="font-serif text-lg font-bold text-primary">All Offer Codes</h4>
            <p className="text-xs text-gray-500">Click any code to copy. Toggling status reflects immediately in checkout.</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or description..."
              className="w-full px-3 py-1.5 text-xs border border-beige rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] text-[#7CA085] uppercase tracking-wider text-[10px] font-bold border-b border-beige/40">
              <tr>
                <th className="py-3 px-4">Offer Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min. Cart Value</th>
                <th className="py-3 px-4">Max Cap</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/40">
              {filteredCoupons.map((c) => {
                const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                const cid = c.id || c._id;
                return (
                  <tr key={cid || c.code} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-primary bg-primary/10 px-2.5 py-1 rounded tracking-wider border border-primary/20">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.code)}
                          className="text-gray-400 hover:text-primary transition p-1 cursor-pointer"
                          title="Copy offer code"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      {c.description && (
                        <span className="text-[11px] text-gray-500 block mt-0.5 max-w-xs truncate">
                          {c.description}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {c.discountType === 'percentage' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          <Percent size={12} /> {c.discountValue}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                          Flat ₹{c.discountValue} OFF
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : <span className="text-gray-400">None (₹0)</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {c.maxDiscount ? `₹${c.maxDiscount}` : <span className="text-gray-400">No Cap</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {c.usageCount || 0} times
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {c.expiresAt ? (
                        <div>
                          <span className={`block font-medium ${isExpired ? 'text-rose-600 font-bold' : 'text-gray-600'}`}>
                            {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {isExpired && (
                            <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Never Expires</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          c.isActive !== false && !isExpired
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isActive !== false && !isExpired ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                        <span>{c.isActive !== false && !isExpired ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition cursor-pointer"
                          title="Edit offer code"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                          title="Delete offer code"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCoupons.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400 italic">
                    {searchQuery ? `No offer codes matching "${searchQuery}"` : 'No offer codes configured. Click "Create New Offer Code" to add one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Offer Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-beige/60 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">
                  {editingId ? 'Edit Promotional Offer Code' : 'Create New Promotional Offer Code'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCoupon} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Offer Promo Code *
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. PAWFIRST, SUMMER25, WELCOME500"
                  className="w-full px-3.5 py-2.5 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary uppercase font-mono font-black tracking-wider text-primary"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Shoppers will type or tap this exact code during checkout.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Offer Description / Subtext
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. 15% off on your 1st order on all pet products"
                  className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('percentage')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        formDiscountType === 'percentage'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Percent size={13} /> Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType('flat')}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        formDiscountType === 'flat'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IndianRupee size={13} /> Flat Amount (₹)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {formDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formDiscountType === 'percentage' ? '100' : '99999'}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono font-bold"
                  />
                </div>
              </div>

              {/* Min Cart Value & Max Discount Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Min. Cart Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(e.target.value)}
                    placeholder="0 for no minimum"
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Set 0 if offer applies to all order values.</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    placeholder="Optional (e.g. 2000)"
                    disabled={formDiscountType === 'flat'}
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Prevents huge percentage discounts on bulk orders.</span>
                </div>
              </div>

              {/* Expiry Date & Active Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs rounded-lg focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="couponIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="couponIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Offer Code is Active & Ready for Checkout
                  </label>
                </div>
              </div>

              {/* Real-Time Calculation Preview Banner */}
              <div className="bg-[#FAFBF9] border border-beige/80 rounded-xl p-4 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  SAMPLE CHECKOUT CALCULATION:
                </span>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Cart Subtotal:</span>
                    <span className="font-mono">₹{previewSampleSubtotal}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Discount Applied ({formCode || 'OFFER'}):</span>
                    <span className="font-mono">-₹{previewDiscount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary border-t border-beige/60 pt-1">
                    <span>Final Payable:</span>
                    <span className="font-mono text-sm">₹{previewSampleSubtotal - previewDiscount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingCoupon ? 'SAVING...' : editingId ? 'UPDATE CODE' : 'CREATE OFFER CODE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsManagerView;

