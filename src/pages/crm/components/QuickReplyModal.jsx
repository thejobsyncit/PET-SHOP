import React, { useState } from 'react';
import { X, Send, Sparkles, Check, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickReplyModal({ isOpen, onClose, message, onSendReply }) {
  const [replyText, setReplyText] = useState('');

  if (!isOpen || !message) return null;

  const quickTemplates = [
    'Hi! We would love to book Coco for Saturday 3 PM. Please confirm if you need bath or haircut!',
    'Thank you so much for the wonderful feedback! Bruno was an absolute joy to groom today.',
    'Hello! We received your request. Our boarding team will call you within 15 minutes to confirm.',
    'Yes, Dr. Ananya has dental slots open tomorrow at 11:30 AM and 3:00 PM.'
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onSendReply(message.id, replyText.trim());
    toast.success(`Reply dispatched to ${message.customerName}!`);
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0E1716] border border-emerald-800/40 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-900/40 flex items-center justify-between bg-[#121E1C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Reply to Customer</h2>
              <p className="text-[11px] text-slate-400">{message.customerName} • {message.petName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Received Message Bubble */}
        <div className="p-4 bg-[#09100F] border-b border-emerald-950/60 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Customer Query:</div>
          <p className="text-slate-200 italic bg-[#111D1B] p-3 rounded-xl border border-emerald-900/30">
            &ldquo;{message.message}&rdquo;
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-5 space-y-4 text-xs">
          {/* Canned Quick Responses */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick 1-Click Templates
            </label>
            <div className="space-y-1.5">
              {quickTemplates.map((template, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setReplyText(template)}
                  className="w-full text-left p-2 rounded-xl bg-[#142321] hover:bg-[#182d2a] border border-emerald-900/30 hover:border-emerald-600/40 text-slate-300 text-[11px] transition-colors truncate"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Reply Textarea */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Your Message</label>
            <textarea
              rows={3}
              required
              placeholder="Type your response to the customer..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
            >
              <Send className="w-3.5 h-3.5" /> Send Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
