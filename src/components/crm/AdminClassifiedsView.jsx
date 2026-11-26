import React, { useState, useEffect } from 'react';
import {
  Award, CheckCircle, Clock, Trash, Search, RefreshCw,
  MapPin, Phone, User, Check, X, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const AdminClassifiedsView = ({ crmToken }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/listings', getHeaders());
      if (res?.success) {
        setListings(res.listings || []);
      }
    } catch (err) {
      console.warn('Failed to load listings:', err);
      toast.error('Failed to load classified listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [crmToken]);

  const handleVerify = async (listingId, isVerified) => {
    try {
      const res = await apiRequest(`/listings/${listingId}/verify`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({ isVerified })
      });
      if (res?.success) {
        toast.success(isVerified ? 'Listing approved & verified!' : 'Verification revoked.');
        setListings(prev => prev.map(l => (l._id || l.id) === listingId ? { ...l, isVerified } : l));
      } else {
        toast.error(res?.message || 'Verification update failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating listing verification.');
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this classified listing?')) return;
    try {
      const res = await apiRequest(`/listings/${listingId}`, {
        ...getHeaders(),
        method: 'DELETE'
      });
      if (res?.success) {
        toast.success('Classified listing removed.');
        setListings(prev => prev.filter(l => (l._id || l.id) !== listingId));
      } else {
        toast.error(res?.message || 'Delete failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting listing.');
    }
  };

  const filteredListings = listings.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch =
      (l.title || '').toLowerCase().includes(q) ||
      (l.breed || '').toLowerCase().includes(q) ||
      (l.location || '').toLowerCase().includes(q) ||
      (l.user?.name || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') matchesStatus = Boolean(l.isVerified);
    if (statusFilter === 'PENDING') matchesStatus = !l.isVerified;

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = listings.filter(l => l.isVerified).length;
  const pendingCount = listings.filter(l => !l.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Classified Posts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{listings.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Verified / Approved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{verifiedCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Live</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Awaiting Moderation</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Needs Review</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Adoption / Free Rehoming</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-indigo-600">
              {listings.filter(l => Number(l.price) === 0).length}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Rescue</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Classified Listings Moderation Desk</h3>
            <p className="text-xs text-slate-500">Vet pet listings, stamp background verifications, and remove non-compliant advertisements.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, breed, location..."
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
              <option value="PENDING">Pending Review Only</option>
              <option value="VERIFIED">Verified Only</option>
            </select>

            <button
              type="button"
              onClick={loadListings}
              className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Refresh Listings"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading classified listings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Listing Details</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Verification Stamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredListings.map(l => {
                  const lId = l._id || l.id;

                  return (
                    <tr key={lId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-xs">{l.title}</span>
                        <span className="text-[11px] text-slate-400">Breed: {l.breed} • Age: {l.age || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{l.user?.name || 'Pet Parent'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{l.contactPhone || l.phone || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {Number(l.price) === 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Free Rehoming
                          </span>
                        ) : (
                          `₹${Number(l.price).toLocaleString()}`
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{l.location || 'India'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleVerify(lId, !l.isVerified)}
                          className={`px-3 py-1 font-bold tracking-wider text-[10px] uppercase rounded-full transition cursor-pointer shadow-2xs ${
                            l.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {l.isVerified ? '✓ VERIFIED' : 'PENDING CHECK'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(lId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove Listing"
                        >
                          <Trash size={13} />
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

export default AdminClassifiedsView;
