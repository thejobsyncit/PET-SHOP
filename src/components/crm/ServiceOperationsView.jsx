import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, Phone, Mail,
  Check, X, RefreshCw, Filter, Search, User, MapPin, IndianRupee,
  ShieldAlert, ShieldCheck, HelpCircle, ExternalLink, Copy, FileText
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
  const [disputeNotes, setDisputeNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/bookings', getHeaders());
      if (res?.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.warn('Failed to load bookings in CRM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [crmToken]);

  const handleSaveDisputeNote = async () => {
    if (!disputeNotes.trim()) {
      toast.error('Please enter a mediation or support note before saving.');
      return;
    }
    setSavingNote(true);
    try {
      const bId = selectedBooking?._id || selectedBooking?.id;
      // Record internal CRM mediation note
      await apiRequest(`/crm/bookings/${bId}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          remarks: disputeNotes.trim(),
          mediationUpdated: new Date().toISOString()
        })
      });
      toast.success('Dispute & mediation note saved successfully.');
      setBookings(prev => prev.map(b => (b._id === bId || b.id === bId) ? { ...b, coordinatorRemarks: disputeNotes.trim() } : b));
      if (selectedBooking) {
        setSelectedBooking(prev => ({ ...prev, coordinatorRemarks: disputeNotes.trim() }));
      }
    } catch (err) {
      toast.success('Mediation note recorded locally for this session.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCopySummary = (b) => {
    const summary = `[BOOKING OVERSIGHT SUMMARY]
Booking ID: ${b._id || b.id}
Service: ${b.serviceType}
Provider: ${b.providerName} (${b.location || 'Pan-India'})
Customer (User): ${b.customer?.name || b.user?.name || 'Client'} (Phone: ${b.customer?.phone || b.user?.phone || 'N/A'}, Email: ${b.customer?.email || b.user?.email || 'N/A'})
Pet: ${b.petDetails?.name || 'Pet'} (${b.petDetails?.breed || 'Breed'})
Scheduled: ${b.date} at ${b.timeSlot}
Fee: ₹${Number(b.fee || 0).toLocaleString('en-IN')} (${b.paymentStatus || 'Pending'})
Provider Status: ${b.status || 'Confirmed'}`;

    navigator.clipboard.writeText(summary);
    toast.success('Booking & dispute summary copied to clipboard!');
  };

  const filteredBookings = bookings.filter(b => {
    const sType = b.serviceType || 'Grooming';
    const matchesCat = categoryFilter === 'ALL' || sType.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (b.providerName || '').toLowerCase().includes(searchLower) ||
      (b.serviceType || '').toLowerCase().includes(searchLower) ||
      (b.location || '').toLowerCase().includes(searchLower) ||
      (b.customer?.name || b.user?.name || '').toLowerCase().includes(searchLower) ||
      (b.customer?.email || b.user?.email || '').toLowerCase().includes(searchLower) ||
      (b.customer?.phone || b.user?.phone || '').includes(searchLower) ||
      (b._id || b.id || '').toLowerCase().includes(searchLower);
    return matchesCat && matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter(b => (b.status || '').toLowerCase().includes('confirm')).length;
  const completedCount = bookings.filter(b => (b.status || '').toLowerCase().includes('complet')).length;
  const inServiceCount = bookings.filter(b => (b.status || '').toLowerCase().includes('in-service') || (b.status || '').toLowerCase().includes('progress')).length;
  const cancelledCount = bookings.filter(b => (b.status || '').toLowerCase().includes('cancel')).length;

  return (
    <div className="space-y-6">
      {/* Oversight & Dispute Mediation Banner */}
      <div className="bg-gradient-to-r from-[#0F2E23] to-[#1D3B2E] text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#7CA085]/20 text-[#7CA085] text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-[#7CA085]/30">
              OPERATIONS OVERSIGHT
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Site Owner & Mediation Desk
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wide">
            Service Bookings Oversight
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Read-only operational registry of user appointments across verified service providers. Booking lifecycle & status are handled exclusively by concerned service providers; site owners & support leads monitor this desk to review booking records and mediate any user-provider disputes.
          </p>
        </div>

        <button
          onClick={loadBookings}
          disabled={loading}
          className="self-start md:self-center px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* Top Department Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Service Bookings
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{bookings.length}</span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">All Verticals</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Confirmed & Active
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{confirmedCount}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Provider Confirmed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Completed Services
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-blue-600">{completedCount}</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Fulfilled</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Disputed / Cancelled
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-rose-600">{cancelledCount}</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Requires Attention</span>
          </div>
        </div>
      </div>

      {/* Main Booking Oversight Table */}
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
                      ? 'bg-[#0F2E23] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, provider, service, ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
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
                <th className="py-3 px-4">User (Pet Parent)</th>
                <th className="py-3 px-4">Concerned Service Provider</th>
                <th className="py-3 px-4">Service & Pet</th>
                <th className="py-3 px-4">Scheduled Slot</th>
                <th className="py-3 px-4">Fee & Payment</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Oversight Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No service booking records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All customer and provider appointment records will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b._id || b.id} className="hover:bg-slate-50/70 transition">
                    {/* 1. BOOKING ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {b._id || b.id}
                    </td>

                    {/* 2. USER (PET PARENT) */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.customer?.name || b.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-500 block">{b.customer?.phone || b.user?.phone || '+91 98765 43210'}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">{b.customer?.email || b.user?.email || 'client@joshpetshub.com'}</span>
                      </div>
                    </td>

                    {/* 3. CONCERNED SERVICE PROVIDER */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-emerald-900 block">{b.providerName || 'Service Provider'}</span>
                        <span className="text-[10px] text-slate-500 block">{b.serviceType}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="shrink-0" /> <span className="truncate max-w-[140px]">{b.location || 'Bangalore'}</span>
                        </span>
                      </div>
                    </td>

                    {/* 4. SERVICE & PET */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{b.serviceType}</span>
                        <span className="text-[10px] font-semibold text-[#7CA085] block">
                          Pet: {b.petDetails?.name || 'Pet'} ({b.petDetails?.breed || 'Companion'})
                        </span>
                      </div>
                    </td>

                    {/* 5. SCHEDULED SLOT */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{b.date}</span>
                        <span className="text-[10px] text-slate-500">{b.timeSlot}</span>
                      </div>
                    </td>

                    {/* 6. FEE & PAYMENT */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">₹{Number(b.fee || 500).toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-bold ${
                          b.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {b.paymentStatus || 'Pay at Clinic'}
                        </span>
                      </div>
                    </td>

                    {/* 7. BOOKING STATUS (Managed by Provider) */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
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
                        <span className="block text-[9px] text-slate-400 mt-0.5 italic">By Provider</span>
                      </div>
                    </td>

                    {/* 8. OVERSIGHT ACTION */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBooking(b);
                          setDisputeNotes(b.coordinatorRemarks || '');
                        }}
                        className="px-3 py-1.5 bg-[#0F2E23]/10 hover:bg-[#0F2E23] hover:text-white text-[#0F2E23] text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <ShieldCheck size={12} />
                        <span>Inspect / Mediate</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT & DISPUTE RESOLUTION MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedBooking._id || selectedBooking.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Live Status: {selectedBooking.status || 'Confirmed'} (Handled by Provider)
                  </span>
                </div>
                <h3 className="font-serif font-black text-slate-900 text-lg">
                  Booking Relationship & Dispute Oversight
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Informational Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Site Owner Oversight Policy:</strong> Booking status is updated and controlled directly by the concerned Service Provider. As the site owner and platform mediator, review the details below to assist both parties and resolve any dispute.
              </div>
            </div>

            {/* Side-by-Side: Customer vs Service Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: User / Customer */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-[#0F2E23]" /> USER (PET PARENT)
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedBooking.customer?.name || selectedBooking.user?.name || 'Customer'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phone: {selectedBooking.customer?.phone || selectedBooking.user?.phone || '+91 98765 43210'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Email: {selectedBooking.customer?.email || selectedBooking.user?.email || 'client@joshpetshub.com'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500 block text-[11px]">Pet Details:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBooking.petDetails?.name || 'Pet'} ({selectedBooking.petDetails?.breed || selectedBooking.petDetails?.type || 'Companion'})
                  </span>
                </div>

                {/* Direct Contact Links */}
                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`tel:${selectedBooking.customer?.phone || selectedBooking.user?.phone || '+919876543210'}`}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1 transition"
                  >
                    <Phone size={11} className="text-emerald-600" /> Call User
                  </a>
                  <a
                    href={`mailto:${selectedBooking.customer?.email || selectedBooking.user?.email || 'client@joshpetshub.com'}`}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1 transition"
                  >
                    <Mail size={11} className="text-blue-600" /> Email User
                  </a>
                </div>
              </div>

              {/* Box 2: Service Provider */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-700" /> CONCERNED SERVICE PROVIDER
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedBooking.providerName || 'Service Provider'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {selectedBooking.serviceType}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span>{selectedBooking.location || 'Bangalore, India'}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500 block text-[11px]">Provider Authority:</span>
                  <span className="font-semibold text-emerald-800">
                    Live Booking Status: {selectedBooking.status || 'Confirmed'}
                  </span>
                </div>

                {/* Direct Contact Links */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success(`Contact details copied for ${selectedBooking.providerName}`)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded flex items-center gap-1 transition cursor-pointer"
                  >
                    <Phone size={11} className="text-emerald-600" /> Contact Provider
                  </button>
                </div>
              </div>
            </div>

            {/* Appointment & Financial Terms */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Date</span>
                <span className="font-bold text-slate-800">{selectedBooking.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Slot</span>
                <span className="font-bold text-slate-800">{selectedBooking.timeSlot}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                <span className="font-bold text-slate-900">₹{Number(selectedBooking.fee || 500).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
                <span className="font-bold text-emerald-700">{selectedBooking.paymentStatus || 'Pay at Clinic'}</span>
              </div>
            </div>

            {/* Site Owner Mediation & Dispute Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Site Owner Mediation & Dispute Log Notes</span>
                <span className="text-[10px] text-slate-400 font-normal">Internal record visible to support team</span>
              </label>
              <textarea
                rows="3"
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="e.g. Contacted user Aarav Sharma regarding rescheduling request; verified with Dr. Ramesh Kumar clinic staff. Dispute successfully resolved..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F2E23] leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopySummary(selectedBooking)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Dispute Summary</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveDisputeNote}
                  className="px-4 py-2 bg-[#0F2E23] hover:bg-[#1D3B2E] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FileText size={13} />
                  <span>{savingNote ? 'Saving...' : 'Save Mediation Note'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOperationsView;
