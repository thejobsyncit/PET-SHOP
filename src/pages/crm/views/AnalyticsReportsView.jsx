import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  PieChart as PieIcon,
  Download,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import toast from 'react-hot-toast';

export default function AnalyticsReportsView() {
  const departmentRevenue = [
    { name: 'Grooming Salon', revenue: 420000, bookings: 240 },
    { name: 'Boarding Suites', revenue: 580000, bookings: 130 },
    { name: 'Daycare Playpen', revenue: 260000, bookings: 325 },
    { name: 'Veterinary Clinic', revenue: 390000, bookings: 195 },
    { name: 'Pet Spa Up-sells', revenue: 110000, bookings: 160 }
  ];

  const pieData = [
    { name: 'Grooming', value: 420000, color: '#F59E0B' },
    { name: 'Boarding', value: 580000, color: '#8B5CF6' },
    { name: 'Daycare', value: 260000, color: '#10B981' },
    { name: 'Veterinary', value: 390000, color: '#F43F5E' },
    { name: 'Up-sells', value: 110000, color: '#06B6D4' }
  ];

  const handleExport = () => {
    toast.success('Enterprise PDF & CSV Financial Audit Report exported successfully!');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Banner */}
      <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Executive Financial & Operations Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Departmental throughput, customer lifetime value, and profitability metrics
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-[#142321] hover:bg-[#192d2b] border border-emerald-700/40 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow"
        >
          <Download className="w-4 h-4" /> Export Audit Report (PDF/CSV)
        </button>
      </div>

      {/* Top 3 KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-[#101C1A] border border-emerald-900/30">
          <div className="text-slate-400 font-semibold">Total Revenue (MTD)</div>
          <div className="text-2xl font-extrabold text-white mt-1">₹17,60,000</div>
          <div className="text-emerald-400 text-[11px] mt-1 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#101C1A] border border-emerald-900/30">
          <div className="text-slate-400 font-semibold">Customer Retention Rate</div>
          <div className="text-2xl font-extrabold text-white mt-1">87.2%</div>
          <div className="text-emerald-400 text-[11px] mt-1 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Top 5% in industry benchmark
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#101C1A] border border-emerald-900/30">
          <div className="text-slate-400 font-semibold">Avg. Client Spend per Visit</div>
          <div className="text-2xl font-extrabold text-white mt-1">₹2,450</div>
          <div className="text-teal-400 text-[11px] mt-1 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% driven by spa add-ons
          </div>
        </div>
      </div>

      {/* Department Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-7 bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">
            Department Revenue Contribution (₹ MTD)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#132724" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1312', borderColor: '#065F46', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-5 bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">
            Revenue Share by Department
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1312', borderColor: '#065F46', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                />
                <Legend
                  formatter={(val) => <span className="text-slate-300 text-[11px]">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
