import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle, Clock, Trash, Search, RefreshCw,
  Phone, User, Check, X, Award, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const AdminBreederVerificationView = ({ crmToken }) => {
  const [studs, setStuds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadStuds = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/breeding', getHeaders());
      if (res?.success) {
        setStuds(res.studs || []);
      }
    } catch (err) {
      console.warn('Failed to load breeding studs:', err);
      toast.error('Failed to load breeder stud profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStuds();
  }, [crmToken]);

  const handleVerify = async (studId, isVerified) => {
    try {
      const res = await apiRequest(`/breeding/${studId}/verify`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (res?.success) {
        toast.success(isVerified ? 'Breeder KCI license approved!' : 'KCI verification revoked.');
        setStuds(prev => prev.map(s => (s._id || s.id) === studId ? { ...s, isVerified } : s));
      } else {
        toast.error(res?.message || 'Verification update failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating stud verification.');
    }
  };

  const filteredStuds = studs.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      (s.studName || '').toLowerCase().includes(q) ||
      (s.breed || '').toLowerCase().includes(q) ||
      (s.kciNumber || '').toLowerCase().includes(q) ||
      (s.user?.name || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') matchesStatus = Boolean(s.isVerified);
    if (statusFilter === 'PENDING') matchesStatus = !s.isVerified;

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = studs.filter(s => s.isVerified).length;
  const pendingCount = studs.filter(s => !s.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Breeding Studs</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{studs.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Enrolled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">KCI Certified</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{verifiedCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pending Certification</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Requires Check</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Breeder Compliance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-indigo-600">
              {studs.length > 0 ? `${Math.round((verifiedCount / studs.length) * 100)}%` : '100%'}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Target 100%</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Breeder KCI Registration Validations</h3>
            <p className="text-xs text-slate-500">Validate Kennel Club of India (KCI) certificates and pedigree licenses for all breeding profiles.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stud, breed, KCI#..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Check Only</option>
              <option value="VERIFIED">KCI Certified Only</option>
            </select>

            <button
              type="button"
              onClick={loadStuds}
              className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Refresh Studs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading breeder validations...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Stud Profile</th>
                  <th className="py-3 px-4">KCI License No.</th>
                  <th className="py-3 px-4">Breeder Contact</th>
                  <th className="py-3 px-4">Stud Fee</th>
                  <th className="py-3 px-4 text-center">Breeder Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStuds.map(s => {
                  const sId = s._id || s.id;

                  return (
                    <tr key={sId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{s.studName}</span>
                        <span className="text-[11px] text-slate-400">Breed: {s.breed} • Age: {s.age || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 uppercase">{s.kciNumber || 'PENDING'}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{s.user?.name || 'Licensed Breeder'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.contactPhone || s.phone || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{Number(s.studFee || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleVerify(sId, !s.isVerified)}
                          className={`px-3 py-1 font-bold tracking-wider text-[10px] uppercase rounded-full transition cursor-pointer shadow-2xs ${
                            s.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {s.isVerified ? '✓ KCI CERTIFIED' : 'PENDING CHECK'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBreederVerificationView;
