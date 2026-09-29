/**
 * EVLab BOQ - Active Project Settings Page
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, Save, Percent, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { activeProject, updateProjectSettings, updateActiveProjectInfo } = useAppStore();

  if (!activeProject) {
    return <div className="p-8 text-slate-400 font-mono">No active project loaded.</div>;
  }

  const s = activeProject.settings;

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1400px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Project Configuration & Financial Factors</span>
        </h1>
        <p className="text-xs text-slate-400">
          Set global overhead, profit margins, contingency, tax/VAT percentages, and display precision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
        {/* Financial Factors */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="font-bold text-cyan-300 uppercase flex items-center space-x-1.5">
            <Percent className="w-4 h-4" />
            <span>Markups & Tax Factors (%)</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Contractor Overhead Margin (%)</label>
              <input
                type="number"
                step="any"
                value={s.overheadPercentage}
                onChange={(e) => updateProjectSettings({ overheadPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Contractor Profit Margin (%)</label>
              <input
                type="number"
                step="any"
                value={s.contractorProfitPercentage}
                onChange={(e) => updateProjectSettings({ contractorProfitPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">VAT / Tax Rate (%)</label>
              <input
                type="number"
                step="any"
                value={s.vatTaxPercentage}
                onChange={(e) => updateProjectSettings({ vatTaxPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Unforeseen Contingency Allowance (%)</label>
              <input
                type="number"
                step="any"
                value={s.contingencyPercentage}
                onChange={(e) => updateProjectSettings({ contingencyPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Project Metadata */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="font-bold text-cyan-300 uppercase">Project Identification</h3>

          <div className="space-y-3 font-sans">
            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1">Project Title</label>
              <input
                type="text"
                value={activeProject.name}
                onChange={(e) => updateActiveProjectInfo({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1">Client Authority</label>
              <input
                type="text"
                value={activeProject.client}
                onChange={(e) => updateActiveProjectInfo({ client: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1">Consultant Engineer</label>
              <input
                type="text"
                value={activeProject.consultant}
                onChange={(e) => updateActiveProjectInfo({ consultant: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs font-mono block mb-1">Contract / Tender Ref</label>
              <input
                type="text"
                value={activeProject.contractNumber}
                onChange={(e) => updateActiveProjectInfo({ contractNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
