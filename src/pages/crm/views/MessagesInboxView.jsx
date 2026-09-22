import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, Phone, Search, Star, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagesInboxView({ messages = [], onReplyMessage }) {
  const [activeThread, setActiveThread] = useState(messages[0] || null);
  const [replyInput, setReplyInput] = useState('');
  const [search, setSearch] = useState('');

  const cannedTemplates = [
    'Your pet appointment is confirmed for today! Please arrive 10 mins prior.',
    'Your pet has completed their grooming and is waiting happily in our lounge!',
    'Hello! Our veterinarian Dr. Ananya is available tomorrow at 11:30 AM.',
    'Thank you for leaving us a wonderful review! Hope to see you again soon.'
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeThread) return;
    onReplyMessage(activeThread.id, replyInput.trim());
    toast.success(`Message sent to ${activeThread.customerName}!`);
    setReplyInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> Customer Communications & WhatsApp CRM
          </h2>
          <p className="text-xs text-slate-400">Direct instant messaging, pickup alerts, and booking enquiries</p>
        </div>
      </div>

      <div className="flex-1 bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
        {/* Left 4 Cols: Threads List */}
        <div className="md:col-span-4 border-r border-emerald-950 flex flex-col bg-[#0C1514]">
          <div className="p-3 border-b border-emerald-950">
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#142321] border border-emerald-900/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-emerald-950/60">
            {messages.map((msg) => {
              const isSelected = activeThread?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => setActiveThread(msg)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-emerald-500/15 border-l-4 border-emerald-400' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white truncate">{msg.customerName}</span>
                    <span className="text-[10px] text-slate-500">{msg.timeAgo}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-1">
                    &ldquo;{msg.message}&rdquo;
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center justify-between">
                    <span>{msg.petName}</span>
                    {msg.replied && (
                      <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <CheckCheck className="w-3 h-3" /> Replied
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Active Chat Conversation */}
        <div className="md:col-span-8 flex flex-col bg-[#101C1A]">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-emerald-950/80 flex items-center justify-between bg-[#0E1716]">
                <div className="flex items-center gap-3">
                  <img 
                    src={activeThread.avatar} 
                    alt={activeThread.customerName} 
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{activeThread.customerName}</h3>
                    <p className="text-xs text-slate-400">{activeThread.petName} • WhatsApp Verified</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
                {/* Customer Message */}
                <div className="flex items-start gap-3 max-w-lg">
                  <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#142321] border border-emerald-900/40 text-xs text-slate-200 shadow-md">
                    <p className="leading-relaxed">{activeThread.message}</p>
                    <div className="text-[10px] text-slate-500 mt-1 text-right">{activeThread.timeAgo}</div>
                  </div>
                </div>

                {/* Reply if present */}
                {activeThread.replied && (
                  <div className="flex items-end justify-end gap-3">
                    <div className="p-3.5 rounded-2xl rounded-tr-none bg-emerald-600/30 border border-emerald-500/40 text-xs text-emerald-100 max-w-lg shadow-md">
                      <p className="leading-relaxed">
                        Hello {activeThread.customerName}! Thank you for reaching out to Pawora Pet Care. Your request is being handled by our team!
                      </p>
                      <div className="text-[10px] text-emerald-400 mt-1 text-right flex items-center justify-end gap-1">
                        Just now <CheckCheck className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Canned Responses */}
              <div className="px-4 py-2 border-t border-emerald-950/60 bg-[#0C1514] flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
                  <Sparkles className="w-3 h-3" /> Templates:
                </span>
                {cannedTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyInput(t)}
                    className="px-2.5 py-1 rounded-lg bg-[#142321] hover:bg-[#1b302c] text-slate-300 border border-emerald-900/40 whitespace-nowrap flex-shrink-0"
                  >
                    {t.slice(0, 30)}...
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t border-emerald-950 flex items-center gap-2 bg-[#0E1716]">
                <input
                  type="text"
                  placeholder={`Reply to ${activeThread.customerName}...`}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-1 bg-[#142321] border border-emerald-900/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a conversation from the left to read and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
