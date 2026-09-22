import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsView({ 
  appointments = [], 
  onOpenNewBooking, 
  onUpdateStatus, 
  onSelectPet 
}) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = appointments.filter(apt => {
    const matchesCat = filterCategory === 'All' || apt.serviceCategory === filterCategory;
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
    const matchesSearch = 
      apt.petName.toLowerCase().includes(search.toLowerCase()) ||
      apt.parentName.toLowerCase().includes(search.toLowerCase()) ||
      apt.service.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Master Bookings & Appointment Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time appointment schedule across all departments (Grooming, Clinic, Boarding, Daycare)
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0E1716] border border-emerald-900/30 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pet, parent, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Grooming', 'Daycare', 'Veterinary', 'Boarding'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#142321] text-slate-400 hover:text-white border border-emerald-900/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Checked-In">Checked-In</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0C1514] text-slate-400 border-b border-emerald-950 uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Pet & Parent</th>
              <th className="p-4">Department & Service</th>
              <th className="p-4">Assigned Staff</th>
              <th className="p-4">Fee / Billing</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                  No appointments found matching your search or filters.
                </td>
              </tr>
            ) : (
              filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Time */}
                  <td className="p-4 font-semibold text-slate-200 whitespace-nowrap">
                    {apt.time}
                  </td>

                  {/* Pet & Parent */}
                  <td className="p-4">
                    <div 
                      onClick={() => onSelectPet && onSelectPet(apt)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#142321] border border-emerald-800/30 flex items-center justify-center text-xl group-hover:scale-105 transition-transform flex-shrink-0">
                        {apt.petAvatar || '🐶'}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {apt.petName} <span className="text-[11px] font-normal text-slate-400">({apt.petBreed})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {apt.parentName} • {apt.parentPhone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="p-4">
                    <span className="font-semibold text-slate-200">{apt.service}</span>
                    <div className="text-[10px] text-emerald-400">{apt.serviceCategory}</div>
                  </td>

                  {/* Staff */}
                  <td className="p-4 text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-[#142321] border border-emerald-900/30 text-[11px]">
                      {apt.staffName}
                    </span>
                  </td>

                  {/* Amount & Paid */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-bold text-slate-100">₹{apt.amount}</div>
                    <span className={`text-[10px] font-semibold ${apt.paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {apt.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <select
                      value={apt.status}
                      onChange={(e) => {
                        onUpdateStatus(apt.id, e.target.value);
                        toast.success(`${apt.petName} status set to ${e.target.value}`);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border bg-transparent cursor-pointer ${
                        apt.status === 'In-Progress'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : apt.status === 'Checked-In'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : apt.status === 'Completed'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <option value="Confirmed" className="bg-[#0E1716] text-white">Confirmed</option>
                      <option value="Checked-In" className="bg-[#0E1716] text-white">Checked-In</option>
                      <option value="In-Progress" className="bg-[#0E1716] text-white">In-Progress</option>
                      <option value="Completed" className="bg-[#0E1716] text-white">Completed</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectPet && onSelectPet(apt)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                    >
                      View Pet Dossier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
