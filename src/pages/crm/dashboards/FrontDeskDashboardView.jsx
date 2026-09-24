import React from 'react';
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  Plus, 
  MessageSquare, 
  PhoneCall, 
  Receipt,
  QrCode,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FrontDeskDashboardView({
  appointments = [],
  onOpenNewBooking,
  onOpenInbox,
  onReplyMessage,
  messages = [],
  onUpdateAppointmentStatus
}) {
  const handleCollectPayment = (apt) => {
    toast.success(`Payment of ₹${apt.amount} collected from ${apt.parentName} via UPI/Card! Receipt sent.`);
  };

  const handleCheckIn = (apt) => {
    if (onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(apt.id, 'Checked-In');
    }
    toast.success(`${apt.petName} has been checked in and queued for ${apt.service}!`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#10221E] via-[#0D1D19] to-[#0A1613] border border-teal-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Front Office & Client Concierge
              </span>
              <span className="text-xs text-slate-400">Reception Lead: Kavya Nair</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Rapid Check-In, Invoicing & Client Reception
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Walk-in registrations, POS payment collection, client communication, and arrival lounge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewBooking}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-950"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Fast Walk-In Booking
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Check-In / Check-Out Counter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" /> Live Arrival & Check-In Desk
              </h3>
              <span className="text-xs text-emerald-400 font-semibold">{appointments.length} Total Today</span>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="p-3.5 rounded-xl bg-[#0C1514] border border-emerald-900/30 hover:border-emerald-700/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#132220] border border-emerald-700/30 flex items-center justify-center text-xl">
                      {apt.petAvatar || '🐾'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {apt.petName}
                        <span className="text-xs font-normal text-slate-400">({apt.petBreed})</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {apt.parentName} • <span className="text-emerald-400">{apt.service}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Assigned: {apt.staffName} • Slot: {apt.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status !== 'Checked-In' && apt.status !== 'In-Progress' && (
                      <button
                        onClick={() => handleCheckIn(apt)}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs border border-teal-500/30"
                      >
                        Check-In
                      </button>
                    )}

                    {!apt.paid ? (
                      <button
                        onClick={() => handleCollectPayment(apt)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Collect ₹{apt.amount}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Paid ₹{apt.amount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Quick Invoicing POS & Waiting Lounge */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick POS Terminal */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-teal-500/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-400" /> Front Desk Instant POS Terminal
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct UPI QR generator & thermal receipt printing for walk-in services.
            </p>

            <div className="p-4 rounded-xl bg-[#0C1514] border border-emerald-900/30 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Direct Dynamic UPI QR</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Scan with GPay, PhonePe, Paytm</div>
                <div className="text-emerald-400 font-semibold mt-1">Instant Bank Confirmation</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Counter Collections Today:</span>
              <span className="font-bold text-white text-sm">₹28,450</span>
            </div>
          </div>

          {/* Customer Lounge Tracker */}
          <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Waiting Lounge Status
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200">Arun Kumar</span>
                  <div className="text-[10px] text-slate-400">Waiting for Bruno (Grooming Finishing)</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Lounge Bay 2</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0C1514] border border-emerald-900/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200">Divya S.</span>
                  <div className="text-[10px] text-slate-400">Dropping Luna for Daycare</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">Lounge Bay 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
