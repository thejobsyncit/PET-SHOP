import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Star, MapPin, Phone,
  Mail, Search, Filter, Check, X, RefreshCw, FileText, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const ProviderRelationsView = ({ crmToken }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [kycRemarks, setKycRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/providers', getHeaders());
      if (res?.success) {
        setProviders(res.providers || []);
      }
    } catch (err) {
      console.warn('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [crmToken]);

  const handleUpdateStatus = async (providerId, newStatus) => {
    setUpdating(true);
    try {
      const res = await apiRequest(`/crm/providers/${providerId}/verify`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          verificationStatus: newStatus,
          remarks: kycRemarks.trim()
        })
      });
      if (res?.success) {
        toast.success(`Provider status updated to ${newStatus}`);
        setProviders(prev => prev.map(p => p.id === providerId ? { ...p, verificationStatus: newStatus } : p));
        setSelectedProvider(null);
        setKycRemarks('');
      }
    } catch (err) {
      toast.error('Failed to update provider status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredProviders = providers.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || (p.verificationStatus || 'Pending') === statusFilter;
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.serviceCategory || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const verifiedCount = providers.filter(p => p.verificationStatus === 'Verified').length;
  const pendingCount = providers.filter(p => p.verificationStatus !== 'Verified').length;

  return (
    <div className="space-y-6">
      {/* Top Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registered Service Partners
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{providers.length}</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Active Roster</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Fully Verified & Vetted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{verifiedCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">KYC Cleared</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending KYC Verification
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Requires Audit</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Partner Quality Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#8B5CF6]">4.85 ★</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Top Tier</span>
          </div>
        </div>
      </div>

      {/* Main Partners & KYC Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {['ALL', 'Verified', 'Pending', 'Suspended'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === st ? 'bg-[#8B5CF6] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner, clinic, category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B5CF6]"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Provider / Business</th>
                <th className="py-3 px-4">Vertical Category</th>
                <th className="py-3 px-4">City / Region</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Rating & Experience</th>
                <th className="py-3 px-4">KYC Compliance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No service partners found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProviders.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#8B5CF6] font-bold text-xs flex items-center justify-center shrink-0">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{p.serviceCategory}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" /> {p.city || 'Bangalore'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700">{p.phone}</span>
                        <span className="text-[10px] text-slate-400">{p.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400" />
                        <span>{p.rating || 4.8}</span>
                        <span className="text-[10px] text-slate-400">({p.reviewsCount || 10} reviews)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.verificationStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.verificationStatus === 'Suspended'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.verificationStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelectedProvider(p); setKycRemarks(''); }}
                        className="px-2.5 py-1 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6] hover:text-white text-[#8B5CF6] text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Audit KYC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC AUDIT MODAL */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">KYC Compliance Desk</span>
                <h3 className="font-serif font-black text-slate-900 text-base">{selectedProvider.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <strong className="text-slate-800">{selectedProvider.serviceCategory}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operating City:</span>
                  <strong className="text-slate-800">{selectedProvider.city}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <strong className="text-purple-700">{selectedProvider.verificationStatus}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Compliance Officer Review Remarks
                </label>
                <textarea
                  rows="2"
                  value={kycRemarks}
                  onChange={(e) => setKycRemarks(e.target.value)}
                  placeholder="e.g. Validated State Veterinary Council registration number; premises inspection cleared."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'Verified')}
                  className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check size={13} /> Approve KYC
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'Pending')}
                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition cursor-pointer"
                >
                  Request Docs
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleUpdateStatus(selectedProvider.id, 'Suspended')}
                  className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderRelationsView;

