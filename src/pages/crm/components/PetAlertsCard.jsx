import React from 'react';
import { Shield, Bell, Check, Send, AlertTriangle, CreditCard, Syringe, Clock } from 'lucide-react';

export default function PetAlertsCard({ alerts = [], onResolveAlert, onAlertAction }) {
  const getIconForType = (type) => {
    switch (type) {
      case 'vaccine':
        return Syringe;
      case 'payment':
        return CreditCard;
      case 'grooming':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="bg-[#101C1A]/90 backdrop-blur-md rounded-2xl border border-emerald-900/30 p-5 shadow-xl flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Pet alerts
        </h3>
        <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No active alerts today. All caught up! 🎉
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = getIconForType(alert.type);
            const isWarning = alert.severity === 'danger' || alert.type === 'payment';
            return (
              <div 
                key={alert.id}
                className="group p-3 rounded-xl bg-[#0C1514] hover:bg-[#132220] border border-emerald-900/20 hover:border-emerald-700/30 transition-all flex flex-col gap-2 relative overflow-hidden"
              >
                {/* Left amber indicator pill matching sample image */}
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20 mt-1 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {alert.title}
                      </span>
                      {alert.actionText && (
                        <button
                          onClick={() => onAlertAction ? onAlertAction(alert) : onResolveAlert(alert.id)}
                          className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
                        >
                          {alert.actionText}
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {alert.subtitle}
                    </div>
                  </div>
                </div>

                {/* Quick dismiss on hover */}
                <div className="flex justify-end pt-1 border-t border-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    Mark as resolved
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
