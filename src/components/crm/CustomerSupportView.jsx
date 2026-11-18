import React, { useState } from 'react';
import {
  MessageSquare, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, Phone, Mail, User, Send, Check, X, Sparkles, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const CustomerSupportView = ({ tickets = [], onRefresh, crmToken }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  // New Ticket Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    subject: '',
    priority: 'Medium',
    category: 'Order Support',
    initialMessage: ''
  });

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      const res = await apiRequest(`/crm/tickets/${ticketId}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res?.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: newStatus }));
        }
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setUpdating(true);
    try {
      const newMessages = [
        ...(selectedTicket.messages || []),
        {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          senderName: 'Customer Support Desk',
          text: replyMessage.trim(),
          timestamp: new Date().toISOString()
        }
      ];

      const res = await apiRequest(`/crm/tickets/${selectedTicket.id}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          messages: newMessages,
          status: 'In Progress'
        })
      });

      if (res?.success) {
        toast.success('Reply transmitted to customer email & SMS!');
        setSelectedTicket(prev => ({ ...prev, messages: newMessages, status: 'In Progress' }));
        setReplyMessage('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to send response');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newForm.customerName || !newForm.subject || !newForm.initialMessage) {
      toast.error('Customer name, subject, and message are required.');
      return;
    }

    try {
      const res = await apiRequest('/crm/tickets', {
        ...getHeaders(),
        method: 'POST',
        body: JSON.stringify(newForm)
      });
      if (res?.success) {
        toast.success('Support ticket created successfully!');
        setShowNewModal(false);
        setNewForm({
          customerName: '', customerEmail: '', customerPhone: '',
          subject: '', priority: 'Medium', category: 'Order Support', initialMessage: ''
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to create ticket.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Department Header & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Open Unassigned Tickets
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-rose-600">{openCount}</span>
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">SLA Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Cases In Progress
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-amber-600">{inProgressCount}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Active Follow-up</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            CSAT Rating (Satisfaction)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">4.9 / 5.0</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">94% Positive</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg First Response Time
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#0F2E23]">14 mins</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-3m vs goal</span>
          </div>
        </div>
      </div>

      {/* Main Ticket Queue Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['ALL', 'Open', 'In Progress', 'Resolved'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket subject or customer..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Log Support Case
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket ID & Subject</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No tickets found in this view.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                    title="Click to view & reply to ticket"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{ticket.id}</span>
                        <span className="font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-1">{ticket.subject}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284C7] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {ticket.customerName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{ticket.customerName}</span>
                          <span className="text-[10px] text-slate-400">{ticket.customerEmail || ticket.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ticket.category || 'General Support'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'In Progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET DETAILS & REPLY MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTicket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-serif font-black text-slate-900 text-base">{selectedTicket.subject}</h3>
                <span className="text-xs text-slate-500">
                  Client: <strong className="text-slate-800">{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail || selectedTicket.customerPhone})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-grow overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Opening Note</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.initialMessage || 'Customer requested assistance with booking / order status.'}
                </p>
              </div>

              {selectedTicket.messages?.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`p-3 rounded-lg border max-w-[85%] ${
                    msg.sender === 'agent'
                      ? 'ml-auto bg-[#0284C7] text-white border-[#0284C7]'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-1">
                    <span className="font-bold">{msg.senderName || (msg.sender === 'agent' ? 'Support Desk' : 'Customer')}</span>
                    <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Send Response to Customer:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'Resolved')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'In Progress')}
                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    In Progress
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows="2"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official support response..."
                  className="flex-grow p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={updating || !replyMessage.trim()}
                  className="px-4 bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {updating ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOG NEW TICKET MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Log New Customer Support Case</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newForm.customerName}
                  onChange={(e) => setNewForm({ ...newForm, customerName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newForm.customerEmail}
                    onChange={(e) => setNewForm({ ...newForm, customerEmail: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={newForm.customerPhone}
                    onChange={(e) => setNewForm({ ...newForm, customerPhone: e.target.value })}
                    placeholder="+91 98450 99881"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={newForm.subject}
                  onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })}
                  placeholder="e.g. Express delivery delay on Royal Canin 15kg"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newForm.priority}
                    onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white"
                  >
                    <option value="Order Support">Order Support</option>
                    <option value="Service Booking">Service Booking</option>
                    <option value="Prescription Inquiry">Prescription Inquiry</option>
                    <option value="Billing & Refund">Billing & Refund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Case Details *</label>
                <textarea
                  rows="3"
                  required
                  value={newForm.initialMessage}
                  onChange={(e) => setNewForm({ ...newForm, initialMessage: e.target.value })}
                  placeholder="Describe grievance, customer statements, or escalation requirements..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369a1] text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSupportView;

