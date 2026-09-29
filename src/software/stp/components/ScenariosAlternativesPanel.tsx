/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Multi-Scenario Manager & Subsystem Process Alternatives Architecture
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, SystemMode, ProcessAlternative } from '../types/stp';
import { PROCESS_ALTERNATIVE_CATALOG, ScenarioEngine } from '../engine/scenariosAndAlternatives';
import { Layers, Plus, CheckCircle2, Shield, AlertTriangle, Zap, DollarSign, Building } from 'lucide-react';

interface ScenariosAlternativesPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
  onSwitchScenario: (scenId: string) => void;
}

export const ScenariosAlternativesPanel: React.FC<ScenariosAlternativesPanelProps> = ({
  project,
  onUpdateProject,
  onSwitchScenario,
}) => {
  const [newScenName, setNewScenName] = useState('');
  const activeScenario = project.scenarios[project.activeScenarioId];
  const alternatives = Object.values(PROCESS_ALTERNATIVE_CATALOG);

  const handleCloneScenario = () => {
    if (!newScenName.trim()) return;
    const updated = JSON.parse(JSON.stringify(project)) as ProjectState;
    const newId = `SCEN-${String.fromCharCode(65 + Object.keys(updated.scenarios).length)}`;

    const cloned = ScenarioEngine.cloneScenario(activeScenario, newId, newScenName);
    updated.scenarios[newId] = cloned;
    updated.activeScenarioId = newId;

    setNewScenName('');
    onUpdateProject(updated);
  };

  const handleModeChange = (subsystemKey: string, mode: SystemMode) => {
    const updated = JSON.parse(JSON.stringify(project)) as ProjectState;
    const currentScen = updated.scenarios[updated.activeScenarioId];
    currentScen.subsystemModes[subsystemKey] = mode;
    onUpdateProject(updated);
  };

  const handleOverrideChange = (subsystemKey: string, techId: string) => {
    const updated = JSON.parse(JSON.stringify(project)) as ProjectState;
    const currentScen = updated.scenarios[updated.activeScenarioId];
    currentScen.subsystemOverrides[subsystemKey] = techId;
    onUpdateProject(updated);
  };

  const subsystemsList = [
    { key: 'PRELIMINARY', label: 'Preliminary Treatment (Screens / Grit)' },
    { key: 'PRIMARY', label: 'Primary Treatment (Sedimentation / Lamella)' },
    { key: 'BIOLOGICAL', label: 'Biological Reactor Process' },
    { key: 'SECONDARY_CLARIFIER', label: 'Secondary Clarification' },
    { key: 'TERTIARY', label: 'Tertiary Filtration (Sand / Disc / UF)' },
    { key: 'DISINFECTION', label: 'Disinfection (UV / Chlorine)' },
    { key: 'SLUDGE', label: 'Sludge Dewatering & Thickening' },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Title & Scenario Cloner Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Multi-Scenario & Process Alternative Design Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare alternative treatment process trains (CAS, SBR, MBBR, UASB, Lamella) across land, CAPEX, OPEX, and energy.
          </p>
        </div>

        {/* Clone Scenario Controls */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
          <input
            type="text"
            placeholder="New Scenario Name..."
            value={newScenName}
            onChange={(e) => setNewScenName(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleCloneScenario}
            className="flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Clone Scenario</span>
          </button>
        </div>
      </div>

      {/* Subsystem ON / OFF / AUTO Selector Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
          <span>Subsystem Control & Override Matrix ({activeScenario.name})</span>
          <span className="text-xs text-slate-400 font-mono">[ON] [OFF] [AUTO SELECT]</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {subsystemsList.map((sub) => {
            const currentMode = activeScenario.subsystemModes[sub.key] || 'ON';
            const selectedOverride = activeScenario.subsystemOverrides[sub.key] || 'ALT-CAS';

            return (
              <div key={sub.key} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{sub.label}</span>
                  {/* ON / OFF / AUTO Segmented Buttons */}
                  <div className="flex bg-slate-900 border border-slate-700/80 rounded p-0.5 font-mono text-[10px]">
                    {(['ON', 'OFF', 'AUTO'] as SystemMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleModeChange(sub.key, mode)}
                        className={`px-2 py-0.5 rounded ${
                          currentMode === mode
                            ? mode === 'ON'
                              ? 'bg-emerald-600 text-white font-bold'
                              : mode === 'OFF'
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-cyan-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Technology Override */}
                {sub.key === 'BIOLOGICAL' && currentMode !== 'OFF' && (
                  <div className="pt-1">
                    <label className="text-[10px] text-slate-500 block">Biological Process Technology Override:</label>
                    <select
                      value={selectedOverride}
                      onChange={(e) => handleOverrideChange('BIOLOGICAL', e.target.value)}
                      className="w-full bg-slate-900 text-cyan-300 font-semibold text-xs rounded border border-slate-700 px-2 py-1 mt-0.5 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="ALT-CAS">Conventional Activated Sludge (CAS)</option>
                      <option value="ALT-EA">Extended Aeration (EA)</option>
                      <option value="ALT-SBR">Sequencing Batch Reactor (SBR)</option>
                      <option value="ALT-MBBR">Moving Bed Biofilm Reactor (MBBR)</option>
                      <option value="ALT-UASB">Upflow Anaerobic Sludge Blanket (UASB)</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative Design Matrix Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Process Alternatives Multi-Criteria Engineering Matrix
          </span>
          <span className="text-xs text-slate-400 font-mono">Evaluation against Metcalf & Eddy / WEF benchmarks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Technology Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Footprint</th>
                <th className="p-3">CAPEX / OPEX</th>
                <th className="p-3 text-cyan-400">Energy (kWh/m³)</th>
                <th className="p-3 text-emerald-400">Sludge (kg/kg BOD)</th>
                <th className="p-3">Operator Skill</th>
                <th className="p-3">BNR Capability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alternatives.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-slate-100 font-sans">{alt.name}</td>
                  <td className="p-3 text-slate-400">{alt.category}</td>
                  <td className="p-3">
                    <span className="bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-slate-300">
                      Level {alt.footprintRating}/5
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    L{alt.capexRating} CAPEX / L{alt.opexRating} OPEX
                  </td>
                  <td className="p-3 text-cyan-300 font-bold">{alt.energyIntensityKwhPerM3.toFixed(2)} kWh/m³</td>
                  <td className="p-3 text-emerald-300 font-bold">{alt.sludgeProductionKgPerKgBod.toFixed(2)} kg/kg</td>
                  <td className="p-3 text-slate-300 font-sans">{alt.operatorSkillRequired}</td>
                  <td className="p-3 text-cyan-400">{alt.bnrCapability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
