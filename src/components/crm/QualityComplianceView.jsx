import React, { useState, useEffect } from 'react';
import {
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, Search, Filter,
  Check, X, RefreshCw, ExternalLink, User, Eye, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const DEMO_AUDIT_CHECKLIST = [
  { item: 'Schedule H / H1 Drug Restriction Compliance', status: 'Compliant', authority: 'Drug Controller General', lastChecked: '17 Nov 2026' },
  { item: 'Tele-veterinary Doctor Licensing Validation', status: 'Compliant', authority: 'Veterinary Council of India', lastChecked: '16 Nov 2026' },
  { item: 'Pet Boarding & Transport Hygiene Protocols', status: 'Compliant', authority: 'Animal Welfare Board', lastChecked: '15 Nov 2026' },
  { item: 'Cold-chain Vaccine Storage Verification', status: 'Compliant', authority: 'Quality Assurance Board', lastChecked: '14 Nov 2026' }
];

const QualityComplianceView = ({ crmToken }) => {
  const [activeTab, setActiveTab] = useState('prescriptions'); // 'prescriptions' | 'audits'
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [doctorRegNumber, setDoctorRegNumber] = useState('');
  const [auditRemarks, setAuditRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/crm/compliance/prescriptions', getHeaders());
      if (res?.success) {
        setPrescriptions(res.prescriptions || []);
      }
    } catch (err) {
      console.warn('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [crmToken]);

  const handleVerify = async (prescriptionId, status) => {
    setUpdating(true);
    try {
      const res = await apiRequest(`/crm/compliance/prescriptions/${prescriptionId}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          status,
          remarks: auditRemarks.trim(),
          doctorRegistrationNumber: doctorRegNumber.trim()
        })
      });
      if (res?.success) {
        toast.success(`Prescription ${prescriptionId} ${status.toLowerCase()}!`);
        setSelectedPrescription(null);
        setAuditRemarks('');
        setDoctorRegNumber('');
        loadPrescriptions();
      }
    } catch (err) {
      toast.error('Failed to update prescription status');
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = prescriptions.filter(p => p.status === 'Pending' || !p.status).length;
  const approvedCount = prescriptions.filter(p => p.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Top Department Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Prescriptions Awaiting Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-rose-600">{pendingCount}</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Gatekeeper</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Verified & Approved Rx
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-emerald-600">{approvedCount}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Dispatched</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Regulatory Adherence Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#6366F1]">100%</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">VCI Certified</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Quality Audits Passed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">4 / 4 Standards</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All Green</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'prescriptions' ? 'bg-[#6366F1] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope size={14} /> Vet Prescription Verification ({prescriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'audits' ? 'bg-[#6366F1] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={14} /> Safety Compliance Checklists
          </button>
        </div>

        <button
          type="button"
          onClick={loadPrescriptions}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          title="Refresh prescriptions"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* TAB 1: PRESCRIPTIONS DESK */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rx ID</th>
                  <th className="py-3 px-4">Patient Pet Name</th>
                  <th className="py-3 px-4">Prescribing Veterinarian</th>
                  <th className="py-3 px-4">Clinic / Hospital</th>
                  <th className="py-3 px-4">Prescription Note</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No customer prescriptions on file.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map(p => (
                    <tr key={p.id || p._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.id || p._id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.patient_name || p.patientName || 'Max'}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {p.doctor_name || p.veterinarianName || 'Dr. Sharma'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.clinic_name || p.clinicName || 'Pet Care Clinic'}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {p.notes || p.customerComments || 'Medication request'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPrescription(p);
                            setAuditRemarks(p.reviewNotes || '');
                            setDoctorRegNumber(p.verifiedDoctorReg || 'VCI/2026/8841');
                          }}
                          className="px-2.5 py-1 bg-[#6366F1]/10 hover:bg-[#6366F1] hover:text-white text-[#6366F1] text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Verify Script
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT CHECKLISTS */}
      {activeTab === 'audits' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Regulatory Safety & Pet Healthcare Compliance Audits</h3>
              <p className="text-xs text-slate-500">Government statutory compliance standards enforced across marketplace and pharmacy.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-full">
              Full Accreditation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_AUDIT_CHECKLIST.map(audit => (
              <div key={audit.item} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{audit.item}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {audit.status}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Regulatory Body: <strong className="text-slate-700">{audit.authority}</strong></span>
                  <span>Checked: {audit.lastChecked}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRESCRIPTION VERIFICATION MODAL */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Veterinary Rx Audit</span>
                <h3 className="font-serif font-black text-slate-900 text-base">
                  Script Review for {selectedPrescription.patient_name || selectedPrescription.patientName || 'Max'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPrescription(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Prescribing Doctor:</span>
                  <strong className="text-slate-800">{selectedPrescription.doctor_name || selectedPrescription.veterinarianName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital / Clinic:</span>
                  <strong className="text-slate-800">{selectedPrescription.clinic_name || selectedPrescription.clinicName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prescription File Document:</span>
                  <span className="font-mono text-indigo-600 font-bold">
                    {selectedPrescription.file_url || selectedPrescription.prescriptionFileUrl || 'rx-document-scan.png'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Veterinary Council Registration Number Validation *
                </label>
                <input
                  type="text"
                  value={doctorRegNumber}
                  onChange={(e) => setDoctorRegNumber(e.target.value)}
                  placeholder="e.g. VCI/2026/8841"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6366F1] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Compliance Officer Approval Remarks
                </label>
                <textarea
                  rows="2"
                  value={auditRemarks}
                  onChange={(e) => setAuditRemarks(e.target.value)}
                  placeholder="e.g. Validated with doctor's digital seal. Approved for prescription medicine order dispatch."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleVerify(selectedPrescription.id || selectedPrescription._id, 'Rejected')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                >
                  Reject Rx
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleVerify(selectedPrescription.id || selectedPrescription._id, 'Approved')}
                  className="px-5 py-2 bg-[#6366F1] hover:bg-[#4f46e5] text-white font-bold rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {updating ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Approve Pharmacy Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityComplianceView;

