import React from 'react';
import { X, Activity, ShieldCheck, Waves, Layers, Cpu, ArrowUpRight, Wrench } from 'lucide-react';

export interface InspectionData {
  inspectId: string;
  title: string;
  subtitle: string;
  description: string;
  engineeringData: Record<string, string>;
}

interface InWorldInspectorModalProps {
  data: InspectionData | null;
  onClose: () => void;
  onLaunchMission?: (districtId: string) => void;
}

export const InWorldInspectorModal: React.FC<InWorldInspectorModalProps> = ({
  data,
  onClose,
  onLaunchMission,
}) => {
  if (!data) return null;

  return (
    <div
      id="in-world-inspector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="in-world-inspector-card"
        className="w-full max-w-xl bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded-md">
                  Field Telemetry
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {data.inspectId}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 leading-tight">{data.title}</h2>
              <p className="text-xs text-slate-400 font-medium">{data.subtitle}</p>
            </div>
          </div>
          <button
            id="close-inspector-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Body */}
        <p className="text-sm text-slate-300 my-4 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          {data.description}
        </p>

        {/* Engineering Parameters Grid */}
        <div className="space-y-2 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Structural & Hydraulic Specifications</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(data.engineeringData).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5 flex flex-col justify-between"
              >
                <span className="text-[11px] text-slate-400 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-slate-100 font-mono font-semibold mt-0.5">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            id="dismiss-inspector-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close Telemetry
          </button>
          <button
            id="action-inspector-btn"
            onClick={() => {
              if (onLaunchMission) onLaunchMission('karatoya_corridor');
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Open Engineering Challenge</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
