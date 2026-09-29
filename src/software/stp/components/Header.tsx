/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Master Application Header
 * @license Apache-2.0
 */

import React from 'react';
import { ProjectState, ScenarioState } from '../types/stp';
import { Activity, Download, Save, TestTube, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface HeaderProps {
  project: ProjectState;
  onSave: () => void;
  onExport: () => void;
  onOpenTests: () => void;
  onSwitchScenario: (scenarioId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onSave,
  onExport,
  onOpenTests,
  onSwitchScenario,
}) => {
  const activeScenario = project.scenarios[project.activeScenarioId];
  const failCount = project.validationResults.filter((r) => r.severity === 'FAIL').length;
  const warningCount = project.validationResults.filter((r) => r.severity === 'WARNING').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex flex-wrap items-center justify-between shadow-lg">
      {/* Title & Identity */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow font-mono text-xl font-black text-white tracking-wider flex items-center space-x-1.5">
          <Activity className="w-6 h-6" />
          <span>EVLab</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">{project.identity.name}</h1>
            <span className="bg-slate-800 text-cyan-400 border border-cyan-800/50 text-xs px-2 py-0.5 rounded font-mono font-medium">
              {project.identity.revision}
            </span>
            <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs px-2 py-0.5 rounded font-mono">
              {project.identity.projectStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {project.identity.client} &bull; {project.identity.consultant} &bull; {project.identity.location}
          </p>
        </div>
      </div>

      {/* Scenario Switcher & Validation Badges */}
      <div className="flex items-center space-x-4">
        {/* Scenario Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">Scenario:</span>
          <select
            value={project.activeScenarioId}
            onChange={(e) => onSwitchScenario(e.target.value)}
            className="bg-slate-900 text-cyan-300 font-semibold text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none focus:border-cyan-500"
          >
            {(Object.values(project.scenarios) as ScenarioState[]).map((scen) => (
              <option key={scen.id} value={scen.id}>
                {scen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Validation Status Badges */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono">
          {failCount > 0 ? (
            <span className="flex items-center space-x-1 text-red-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{failCount} FAIL</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PASS</span>
            </span>
          )}
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-medium">{warningCount} WARN</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenTests}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <TestTube className="w-3.5 h-3.5" />
            <span>Run Test Suite</span>
          </button>

          <button
            onClick={onSave}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save State</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </header>
  );
};
