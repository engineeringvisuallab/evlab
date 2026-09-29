/**
 * EVLab WaterFlow - Network Validation Audit Dialog
 * Displays real-time model topology, geometry, and hydraulic validation errors & warnings.
 */

import React from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export const ValidationDialog: React.FC = () => {
  const { validationIssues, selectElement, setActiveDialog } = useWaterFlow();

  const errors = validationIssues.filter(i => i.severity === 'ERROR');
  const warnings = validationIssues.filter(i => i.severity === 'WARNING');
  const infos = validationIssues.filter(i => i.severity === 'INFO');

  const handleFocusElement = (elementId?: string) => {
    if (elementId) {
      selectElement(elementId);
      setActiveDialog(null); // Close dialog and focus on canvas
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Network Topology & Parameter Validation</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Badges */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-red-950 text-red-400 border border-red-800 px-2.5 py-1 rounded">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.length} Errors
          </span>
          <span className="flex items-center gap-1.5 bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded">
            <AlertTriangle className="w-3.5 h-3.5" /> {warnings.length} Warnings
          </span>
          <span className="flex items-center gap-1.5 bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-1 rounded">
            <Info className="w-3.5 h-3.5" /> {infos.length} Information
          </span>
        </div>

        {/* Issue List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto text-xs">
          {validationIssues.length === 0 ? (
            <div className="py-8 text-center text-emerald-400 flex flex-col items-center gap-2 font-semibold">
              <CheckCircle2 className="w-8 h-8" />
              <span>Model Audit Passed! No errors or warnings detected in network topology.</span>
            </div>
          ) : (
            validationIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => handleFocusElement(issue.elementId)}
                className={`p-3 rounded border flex items-start justify-between cursor-pointer transition ${
                  issue.severity === 'ERROR'
                    ? 'bg-red-950/40 border-red-900/80 text-red-200 hover:bg-red-900/60'
                    : issue.severity === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-900/80 text-amber-200 hover:bg-amber-900/60'
                    : 'bg-blue-950/40 border-blue-900/80 text-blue-200 hover:bg-blue-900/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-950 font-mono">
                      {issue.category}
                    </span>
                    <span>{issue.message}</span>
                  </div>
                  {issue.recommendation && (
                    <p className="text-[11px] text-slate-400 italic">
                      Recommendation: {issue.recommendation}
                    </p>
                  )}
                </div>

                {issue.elementId && (
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-700 px-2 py-1 rounded text-cyan-300 font-bold">
                    Select {issue.elementId}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
