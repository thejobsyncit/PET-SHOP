import React from 'react';
import { 
  Users, 
  Calendar, 
  Dog, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight, 
  Network, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import PetAlertsCard from '../components/PetAlertsCard.jsx';
import TeamTasksCard from '../components/TeamTasksCard.jsx';
import RecentMessagesCard from '../components/RecentMessagesCard.jsx';

export default function SuperAdminDashboardView({
  appointments = [],
  alerts = [],
  tasks = [],
  messages = [],
  onOpenNewBooking,
  onOpenOrgChart,
  onResolveAlert,
  onToggleTask,
  onAddTask,
  onOpenInbox,
  onReplyMessage,
  onSelectPet,
  onUpdateAppointmentStatus
}) {
  // Revenue and workload mock data for charts
  const revenueTrend = [
    { hour: '09 AM', revenue: 4200, bookings: 4 },
    { hour: '11 AM', revenue: 11500, bookings: 12 },
    { hour: '01 PM', revenue: 18900, bookings: 20 },
    { hour: '03 PM', revenue: 24200, bookings: 28 },
    { hour: '05 PM', revenue: 28450, bookings: 36 }
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Metric Cards (Faithful to and elevated from the reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Pet Parents */}
        <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl hover:border-emerald-700/40 transition-all">
          <div className="text-xs font-semibold text-slate-400">
            Active pet parents
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
              1,284
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded flex items-center">
              +8%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            32 new families joined this month
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl hover:border-emerald-700/40 transition-all">
          <div className="text-xs font-semibold text-slate-400">
            Today&apos;s bookings
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
              36
            </span>
            <span className="text-xs font-medium text-emerald-400">
              12 grooming
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            8 vet clinic, 10 daycare, 6 boarding
          </div>
        </div>

        {/* Pets in Daycare */}
        <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl hover:border-emerald-700/40 transition-all">
          <div className="text-xs font-semibold text-slate-400">
            Pets in daycare
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
              18
            </span>
            <span className="text-xs font-medium text-emerald-400">
              3 check-ins
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            72% playpen capacity utilized
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl hover:border-emerald-700/40 transition-all">
          <div className="text-xs font-semibold text-slate-400">
            Today&apos;s revenue
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-sans">
              ₹28,450
            </span>
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% higher than yesterday
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid: Left (Appointments & Analytics) / Right (Alerts, Tasks, Messages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Appointments Table (Matching Reference Sample) */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Today&apos;s appointments
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live clinic and salon appointment schedule
                </p>
              </div>
              <button 
                onClick={onOpenNewBooking}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold text-slate-400 border-b border-emerald-950 pb-2">
                  <tr>
                    <th className="pb-2.5 font-medium">Time</th>
                    <th className="pb-2.5 font-medium">Pet</th>
                    <th className="pb-2.5 font-medium">Service</th>
                    <th className="pb-2.5 font-medium">Staff</th>
                    <th className="pb-2.5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/60">
                  {appointments.slice(0, 5).map((apt) => (
                    <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Time */}
                      <td className="py-3.5 font-semibold text-slate-200 whitespace-nowrap">
                        {apt.time}
                      </td>

                      {/* Pet (Avatar + Name + Parent Name) */}
                      <td className="py-3.5">
                        <div 
                          onClick={() => onSelectPet && onSelectPet(apt)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#162724] border border-emerald-700/30 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                            {apt.petAvatar || '🐶'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                              {apt.petName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {apt.parentName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 text-slate-300 font-medium">
                        {apt.service}
                      </td>

                      {/* Staff */}
                      <td className="py-3.5 text-slate-300">
                        <span className="px-2 py-1 rounded-md bg-[#132220] border border-emerald-900/30 text-[11px]">
                          {apt.staffName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          apt.status === 'In-Progress'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : apt.status === 'Checked-In'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue & Bookings Velocity Chart */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Intraday Revenue Velocity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time billing throughput across grooming, vet & boarding
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Revenue (₹)
                </span>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#132724" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1312', borderColor: '#065F46', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value) => [`₹${value}`, 'Cumulative Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 5 Columns (Alerts, Tasks, Messages matching sample layout) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pet Alerts Widget */}
          <PetAlertsCard 
            alerts={alerts}
            onResolveAlert={onResolveAlert}
          />

          {/* Bottom Row in sample: Team Tasks & Recent Customer Messages */}
          <div className="space-y-6">
            <TeamTasksCard
              tasks={tasks}
              onToggleTask={onToggleTask}
              onAddTask={onAddTask}
            />

            <RecentMessagesCard
              messages={messages}
              onOpenInbox={onOpenInbox}
              onReplyMessage={onReplyMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
