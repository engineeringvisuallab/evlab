import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RawWaterQualityItem } from '../types/wtp';
import { evaluateProcessSelectionRules } from '../core/processSelectionEngine';

interface ProcessSelectionProps {
  waterQualityList: RawWaterQualityItem[];
  onNavigateTab: (tab: any) => void;
}

export const ProcessSelectionView: React.FC<ProcessSelectionProps> = ({
  waterQualityList,
  onNavigateTab
}) => {
  // Convert list to record
  const wqMap: Record<string, number> = {};
  waterQualityList.forEach(item => {
    wqMap[item.id.toLowerCase().replace(/wq-/, '')] = item.rawValue;
  });

  const recommendations = evaluateProcessSelectionRules(wqMap);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <span>Rule-Based Process Selection Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated process flow recommendation based on raw water chemistry limits (Turbidity, Iron, Manganese, E. coli, Arsenic, TDS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-100 text-sm">{rec.processName}</span>
              <span className={`px-2 py-0.5 rounded text-3xs font-bold border ${
                rec.status === 'REQUIRED'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                  : rec.status === 'RECOMMENDED'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {rec.status}
              </span>
            </div>

            <div className="text-slate-300 space-y-1">
              <div><span className="text-slate-500">Category:</span> {rec.category}</div>
              <div><span className="text-slate-500">Target Contaminants:</span> {rec.targetPollutant}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-2xs text-cyan-200">
              <span className="text-cyan-400 font-bold">Trigger Reason:</span> {rec.triggerReason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
