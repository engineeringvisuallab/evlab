/**
 * EV Software Core - Notification Drawer
 * Displays real-time SDK and Core platform alerts, transfers, and commits.
 */

import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  X,
  Trash2,
  Clock,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useCore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-88 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">Core Event Stream</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto opacity-30" />
            <p>No active notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                n.read
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950 border-slate-800 shadow-sm ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  {n.type === 'transfer_received' && <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />}
                  {n.type === 'revision_committed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {n.type === 'validation_complete' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  {n.type === 'system_alert' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{n.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
