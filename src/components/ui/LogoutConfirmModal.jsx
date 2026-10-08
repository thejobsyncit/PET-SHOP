import React from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, userName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
          <LogOut size={26} />
        </div>

        <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
          Confirm Logout
        </h3>

        <p className="text-xs text-stone-500 leading-relaxed mb-6">
          Are you sure you want to log out{userName ? `, ${userName}` : ''}? You will need to sign in again to access your orders, bookings, and address book.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} /> Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
