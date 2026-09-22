import React from 'react';
import { MessageSquare, Star, Phone, CheckCheck, Reply } from 'lucide-react';

export default function RecentMessagesCard({ messages = [], onOpenInbox, onReplyMessage }) {
  const getMessageIcon = (msg) => {
    if (msg.message.includes('★') || msg.message.toLowerCase().includes('excellent') || msg.message.toLowerCase().includes('grooming')) {
      return Star;
    }
    if (msg.message.toLowerCase().includes('callback') || msg.message.toLowerCase().includes('call')) {
      return Phone;
    }
    return MessageSquare;
  };

  return (
    <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Recent customer messages
        </h3>
        <button 
          onClick={onOpenInbox}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Open inbox
        </button>
      </div>

      {/* Messages List */}
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {messages.map((msg) => {
          const Icon = getMessageIcon(msg);
          return (
            <div
              key={msg.id}
              onClick={() => onReplyMessage ? onReplyMessage(msg) : onOpenInbox()}
              className="p-3 rounded-xl bg-[#0C1514] hover:bg-[#132220] border border-emerald-900/20 hover:border-emerald-700/30 transition-all flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white/[0.04] text-slate-400 group-hover:text-emerald-300 transition-colors mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-200 transition-colors">
                    &ldquo;{msg.message}&rdquo;
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-300">{msg.customerName}</span>
                    <span>•</span>
                    <span>{msg.petName}</span>
                    {msg.replied && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-[10px]">
                        <CheckCheck className="w-3 h-3" /> Replied
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Ago matching sample image */}
              <div className="text-right flex-shrink-0 flex flex-col items-end">
                <span className="text-[11px] text-slate-400 font-medium">
                  {msg.timeAgo}
                </span>
                <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                  <Reply className="w-3 h-3" /> Reply
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
