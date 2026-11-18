import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, Phone, Mail,
  Check, X, RefreshCw, Filter, Search, User, MapPin, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const SERVICE_CATEGORIES = ['ALL', 'Grooming', 'Veterinary', 'Hostel', 'Training', 'Walking', 'Transport'];

const ServiceOperationsView = ({ crmToken }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/bookings', getHeaders());
      if (res?.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [crmToken]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      const res = await apiRequest(`/crm/bookings/${bookingId}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, remarks: actionRemarks.trim() })
      });
      if (res?.success) {
        toast.success(`Booking ${bookingId} updated to ${newStatus}`);
        setBookings(prev => prev.map(b => (b._id === bookingId || b.id === bookingId) ? { ...b, status: newStatus } : b));
        setSelectedBooking(null);
        setActionRemarks('');
      }
    } catch (err) {
      toast.error('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const sType = b.serviceType || 'Grooming';
    const matchesCat = categoryFilter === 'ALL' || sType.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || 'Pending') === statusFilter;
    const matchesSearch =
      (b.providerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.location || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b._id || '').toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const inServiceCount = bookings.filter(b => b.status === 'In-Service').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Service Bookings
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{bookings.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All Verticals</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Confirmed & Scheduled
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{confirmedCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ready to Serve</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Currently In-Service
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-sky-600">{inServiceCount}</span>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">Active Appointments</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Fulfillment Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#059669]">98.2%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Zero no-shows</span>
          </div>
        </div>
      </div>

      {/* Main Booking Dispatch Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Category & Status Filter Tabs */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search provider, client, location..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#059669]"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Bookings Queue */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Service & Provider</th>
                <th className="py-3 px-4">Pet Details</th>
                <th className="py-3 px-4">Scheduled Slot</th>
                <th className="py-3 px-4">Fee & Payment</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No bookings found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b._id || b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {b._id || b.id}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.serviceType}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{b.providerName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {b.location}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="bg-slate-50 px-2 py-1 rounded border border-slate-200/60 w-fit">
                        <span className="font-bold text-slate-800 block">{b.petDetails?.name || 'Companion'}</span>
                        <span className="text-[10px] text-slate-500">{b.petDetails?.breed || b.petDetails?.type || 'Pet'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{b.date}</span>
                        <span className="text-[10px] text-slate-500">{b.timeSlot}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">₹{b.fee || 500}</span>
                        <span className={`text-[10px] font-bold ${b.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {b.paymentStatus || 'Unpaid'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'In-Service'
                          ? 'bg-sky-100 text-sky-800'
                          : b.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {b.status || 'Confirmed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1 bg-[#059669]/10 hover:bg-[#059669] hover:text-white text-[#059669] text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Dispatch / Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH ACTION MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">{selectedBooking._id || selectedBooking.id}</span>
                <h3 className="font-serif font-black text-slate-900 text-base">Update Service Appointment</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <strong className="text-slate-800">{selectedBooking.serviceType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider:</span>
                  <strong className="text-slate-800">{selectedBooking.providerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pet Patient:</span>
                  <strong className="text-slate-800">{selectedBooking.petDetails?.name} ({selectedBooking.petDetails?.breed})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot:</span>
                  <strong className="text-slate-800">{selectedBooking.date} @ {selectedBooking.timeSlot}</strong>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Coordinator Dispatch Remarks
                </label>
                <textarea
                  rows="2"
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="e.g. Confirmed special diet instructions with kennel attendant..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#059669]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Set Dispatch Stage:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Confirmed')}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                  >
                    Confirm Slot
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'In-Service')}
                    className="py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-lg border border-sky-200 transition cursor-pointer"
                  >
                    Mark In-Service
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Completed')}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
                  >
                    Mark Completed
                  </button>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Cancelled')}
                    className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOperationsView;

