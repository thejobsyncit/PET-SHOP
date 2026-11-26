import React, { useState, useEffect } from 'react';
import {
  Mail, MessageSquare, Search, RefreshCw, User,
  Calendar, CheckCircle, Clock, Trash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const AdminEnquiriesView = ({ crmToken }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/enquiries', getHeaders());
      if (res?.success) {
        setEnquiries(res.enquiries || []);
      }
    } catch (err) {
      console.warn('Failed to load enquiries:', err);
      toast.error('Failed to load contact submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [crmToken]);

  const filteredEnquiries = enquiries.filter(e => {
    const q = search.toLowerCase();
    return (
      (e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.subject || '').toLowerCase().includes(q) ||
      (e.message || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Submissions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{enquiries.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Inquiries</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Latest Communication</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#0F2E23]">
              {enquiries.length > 0 ? 'Active' : 'Empty'}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Inbox</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Contact Response Target</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-indigo-600">&lt; 4 hrs</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">SLA</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Channel Origin</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-800">Web Portal</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Official</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Contact Form Submissions</h3>
            <p className="text-xs text-slate-500">Review incoming customer messages, adoption queries, and feedback from the main website.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sender, email, subject..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={loadEnquiries}
              className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Refresh Inquiries"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading contact submissions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Sender Info</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message Content</th>
                  <th className="py-3 px-4 text-right">Received On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEnquiries.map(e => {
                  const eId = e._id || e.id || e.createdAt;
                  const dateStr = e.createdAt || e.created_at ? new Date(e.createdAt || e.created_at).toLocaleString() : 'Recent';

                  return (
                    <tr key={eId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{e.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{e.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0F2E23]">{e.subject || 'General Inquiry'}</span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-700 leading-relaxed line-clamp-3">{e.message}</p>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {dateStr}
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

export default AdminEnquiriesView;
