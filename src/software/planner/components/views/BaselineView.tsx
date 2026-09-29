import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { History, Plus, CheckCircle2, Clock, DollarSign, Layers } from 'lucide-react';

export const BaselineView: React.FC = () => {
  const { project, saveBaseline } = useProject();

  const [baselineName, setBaselineName] = useState('');
  const [baselineDesc, setBaselineDesc] = useState('');

  const handleSaveBaselineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baselineName.trim()) return;

    saveBaseline(baselineName, baselineDesc || 'Project baseline snapshot');
    setBaselineName('');
    setBaselineDesc('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Baseline Manager & Schedule Variance Analysis
              </h1>
              <p className="text-xs text-slate-400">
                Save contractual baseline snapshots to compare planned start/finish dates against current forecasts.
              </p>
            </div>
          </div>
        </div>

        {/* Create Baseline Bar */}
        <form
          onSubmit={handleSaveBaselineSubmit}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Baseline Name
            </label>
            <input
              type="text"
              placeholder="e.g., Baseline 1.0 (Approved Contract)"
              value={baselineName}
              onChange={(e) => setBaselineName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex-1 min-w-[250px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g., Target schedule approved at kick-off meeting"
              value={baselineDesc}
              onChange={(e) => setBaselineDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-1.5 rounded transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Save Baseline</span>
          </button>
        </form>

        {/* Existing Baselines List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Saved Baseline Snapshots</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {(project.baselines || []).map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-cyan-300 text-sm">{b.name}</span>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                      Saved: {new Date(b.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans mt-1">{b.description}</p>
                </div>

                <div className="flex items-center space-x-6 text-slate-300 text-[11px]">
                  <div>
                    <span className="text-slate-500">Target Finish: </span>
                    <span className="font-bold text-emerald-400">{b.finishDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Baseline Budget: </span>
                    <span className="font-bold text-amber-300">
                      {project.currency}
                      {(b.totalCost || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
