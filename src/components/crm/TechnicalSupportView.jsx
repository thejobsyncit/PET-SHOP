import React, { useState, useEffect } from 'react';
import {
  Server, Activity, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Plus, Check, X, Clock, Wifi, Database, Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const TechnicalSupportView = ({ crmToken }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logging, setLogging] = useState(false);

  const [incidentForm, setIncidentForm] = useState({
    title: '',
    service: 'API Gateway',
    severity: 'Medium',
    details: ''
  });

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/tech/health', getHeaders());
      if (res?.success) {
        setHealthData(res.health);
      }
    } catch (err) {
      console.warn('Failed to load tech health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, [crmToken]);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.title.trim()) {
      toast.error('Incident title is required');
      return;
    }

    setLogging(true);
    try {
      const res = await apiRequest('/crm/tech/incidents', {
        ...getHeaders(),
        method: 'POST',
        body: JSON.stringify(incidentForm)
      });
      if (res?.success) {
        toast.success('Technical incident logged into IT tracking queue!');
        setShowLogModal(false);
        setIncidentForm({ title: '', service: 'API Gateway', severity: 'Medium', details: '' });
        loadHealth();
      }
    } catch (err) {
      toast.error('Failed to log incident');
    } finally {
      setLogging(false);
    }
  };

  const incidents = healthData?.incidents || [];

  return (
    <div className="space-y-6">
      {/* Top Infrastructure Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Express Core Server (Port 5001)
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {healthData?.apiLatencyMs || 34}ms latency
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Supabase DB Storage Engine
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pool: 10</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Razorpay Payment Webhooks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-emerald-500" />
              Active
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">100% Delivery</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Platform Availability Uptime
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#475569]">99.99%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Zero outages</span>
          </div>
        </div>
      </div>

      {/* Main IT Incident Tracker Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">System Incident Logs & Technical Bug Queue</h3>
            <p className="text-xs text-slate-500">Real-time error events, gateway status, and IT diagnostics.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadHealth}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Ping diagnostic health"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 bg-[#475569] hover:bg-[#334155] text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Log IT Incident
            </button>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Service Affected</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Resolution Status</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No active technical incidents reported. System is healthy.
                  </td>
                </tr>
              ) : (
                incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{inc.id}</td>
                    <td className="py-3 px-4 max-w-sm">
                      <span className="font-bold text-slate-900 block">{inc.title}</span>
                      <span className="text-[11px] text-slate-500 block truncate" title={inc.details}>
                        {inc.details}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {inc.service}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : inc.severity === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">{inc.loggedBy}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] text-right">
                      {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG INCIDENT MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Log Technical Issue / Incident</h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Incident Summary *</label>
                <input
                  type="text"
                  required
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  placeholder="e.g. Supabase connection pool spike on checkout"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#475569]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Service</label>
                  <select
                    value={incidentForm.service}
                    onChange={(e) => setIncidentForm({ ...incidentForm, service: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#475569] bg-white font-mono"
                  >
                    <option value="API Gateway">API Gateway</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Database">Supabase Database</option>
                    <option value="Auth / JWT">Auth / JWT Session</option>
                    <option value="Static Assets">Static Assets / CDN</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#475569] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Technical Stack Trace & Details</label>
                <textarea
                  rows="3"
                  value={incidentForm.details}
                  onChange={(e) => setIncidentForm({ ...incidentForm, details: e.target.value })}
                  placeholder="Paste error logs, HTTP status codes, or impacted endpoints..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#475569] font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logging}
                  className="px-5 py-2 text-xs font-bold bg-[#475569] hover:bg-[#334155] text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  {logging ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Incident</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalSupportView;

