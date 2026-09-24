import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, DollarSign, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PetBreedDropdown from '../../../components/ui/PetBreedDropdown.jsx';

export default function NewBookingModal({ isOpen, onClose, onAddBooking, staffList = [] }) {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [petBreed, setPetBreed] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Grooming');
  const [service, setService] = useState('Full grooming');
  const [time, setTime] = useState('10:00 AM');
  const [staffName, setStaffName] = useState('Meera');
  const [amount, setAmount] = useState('1850');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!petName.trim() || !parentName.trim()) {
      toast.error('Please enter Pet Name and Parent Name');
      return;
    }

    const newBooking = {
      id: `apt-${Date.now()}`,
      time,
      petName: petName.trim(),
      petType,
      petBreed: petBreed.trim() || 'Mixed Breed',
      petAvatar: petType === 'Cat' ? '🐱' : petType === 'Bird' ? '🦜' : '🐶',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim() || '+91 98840 00000',
      service,
      serviceCategory,
      staffName,
      staffRole: serviceCategory === 'Grooming' ? 'GROOMING_LEAD' : serviceCategory === 'Veterinary' ? 'VETERINARIAN' : 'BOARDING_SUPERVISOR',
      status: 'Confirmed',
      amount: parseInt(amount, 10) || 1200,
      paid: false,
      notes: notes.trim() || 'Standard booking reservation.',
      date: 'Today'
    };

    onAddBooking(newBooking);
    toast.success(`Booking confirmed for ${newBooking.petName}!`);
    onClose();
  };

  const handleCategoryChange = (cat) => {
    setServiceCategory(cat);
    if (cat === 'Grooming') {
      setService('Full grooming');
      setAmount('1850');
      setStaffName('Meera');
    } else if (cat === 'Daycare') {
      setService('Daycare check-in');
      setAmount('800');
      setStaffName('Rahul');
    } else if (cat === 'Veterinary') {
      setService('Health Check & Vaccines');
      setAmount('1200');
      setStaffName('Dr. Ananya');
    } else if (cat === 'Boarding') {
      setService('Deluxe Suite Boarding');
      setAmount('4500');
      setStaffName('Rahul');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0E1716] border border-emerald-800/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-emerald-900/40 flex items-center justify-between bg-[#121E1C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Pet Booking</h2>
              <p className="text-xs text-slate-400">Reserve a slot for grooming, clinic, daycare, or boarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          {/* Service Category Buttons */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Service Department</label>
            <div className="grid grid-cols-4 gap-2">
              {['Grooming', 'Daycare', 'Veterinary', 'Boarding'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`py-2 px-2 rounded-xl text-center font-semibold transition-all ${
                    serviceCategory === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                      : 'bg-[#142321] text-slate-300 border border-emerald-900/40 hover:border-emerald-700/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pet & Parent Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pet Type</label>
              <select
                value={petType}
                onChange={(e) => {
                  setPetType(e.target.value);
                  setPetBreed('');
                }}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bruno"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Breed</label>
              <PetBreedDropdown
                petType={petType}
                value={petBreed}
                onChange={setPetBreed}
                placeholder="Select Breed"
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                allowedCategories={['dogs', 'cats', 'birds']}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pet Parent Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Parent Phone</label>
              <input
                type="text"
                placeholder="e.g. +91 98840 11223"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Service Name & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Service Selected</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated Fee (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Time & Assigned Staff */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Appointment Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:15 PM">03:15 PM</option>
                <option value="04:30 PM">04:30 PM</option>
                <option value="05:45 PM">05:45 PM</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assign Staff</label>
              <select
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Meera">Meera (Master Groomer)</option>
                <option value="Asha">Asha (Senior Stylist)</option>
                <option value="Dr. Ananya">Dr. Ananya (Head Vet)</option>
                <option value="Rahul">Rahul (Boarding Head)</option>
                <option value="Kavya">Kavya (Reception)</option>
              </select>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Special Pet Care Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Allergies, sensitive skin, nervous around loud dryers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold shadow-lg shadow-emerald-900/40"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
