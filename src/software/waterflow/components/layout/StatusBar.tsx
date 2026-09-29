/**
 * EVLab WaterFlow - Status Bar & Quick Command Line
 */

import React, { useState } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { UnitConverter } from '../../core/units/unitConverter';
import { Terminal, CheckCircle2, AlertTriangle, Crosshair, ChevronUp, ChevronDown } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    diagnostics,
    selectedElements,
    settings,
    setSettings,
    commandLogs,
    executeCommand,
    activeDialog,
    setActiveDialog
  } = useWaterFlow();

  const [commandInput, setCommandInput] = useState('');
  const [showConsole, setShowConsole] = useState(false);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    executeCommand(commandInput);
    setCommandInput('');
  };

  const toggleUnitSystem = () => {
    setSettings(prev => {
      const nextUnit = prev.unitSystem === 'SI' ? 'US' : 'SI';
      return {
        ...prev,
        unitSystem: nextUnit,
        flowUnit: UnitConverter.getDefaultFlowUnit(nextUnit)
      };
    });
  };

  const selectedCount = selectedElements.length;
  const firstSelected = selectedElements[0];

  return (
    <div className="bg-slate-900 border-t border-slate-800 text-slate-400 text-[11px] font-mono flex flex-col z-30 select-none">
      {/* Expandable Console Drawer */}
      {showConsole && (
        <div className="bg-slate-950 border-b border-slate-800 p-2 h-36 overflow-y-auto flex flex-col font-mono text-xs">
          <div className="text-slate-500 font-bold mb-1 border-b border-slate-800 pb-0.5 flex justify-between items-center">
            <span>COMMAND LOG & HYDRAULIC CONSOLE</span>
            <button onClick={() => setShowConsole(false)} className="text-slate-400 hover:text-white">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {commandLogs.map((log, idx) => (
              <div key={idx} className={`leading-tight ${log.startsWith('>') ? 'text-cyan-400 font-bold' : log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}`}>
                {log}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommandSubmit} className="mt-1 flex items-center gap-2 border-t border-slate-800 pt-1">
            <span className="text-cyan-400 font-bold">&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              placeholder="Enter CAD/Hydraulic command (e.g. RUN ANALYSIS, DRAW PIPE, HELP)..."
              className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
            />
          </form>
        </div>
      )}

      {/* Main Status Strip */}
      <div className="h-7 px-3 flex items-center justify-between">
        {/* Left: Quick Command & Selected Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition font-sans font-semibold text-slate-300"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Console</span>
            {showConsole ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          <div className="h-3 w-px bg-slate-800"></div>

          {/* Selected Element Summary */}
          <div className="flex items-center gap-2 text-slate-300">
            {selectedCount === 0 ? (
              <span className="text-slate-500 italic">No element selected</span>
            ) : selectedCount === 1 ? (
              <span>
                Selected: <strong className="text-cyan-300">{firstSelected.label || firstSelected.id}</strong> ({firstSelected.type})
              </span>
            ) : (
              <span>
                Selected: <strong className="text-cyan-300">{selectedCount} elements</strong>
              </span>
            )}
          </div>
        </div>

        {/* Center: Hydraulic Solver Status */}
        <div className="flex items-center gap-3">
          {diagnostics ? (
            <div className="flex items-center gap-2 font-sans">
              {diagnostics.converged ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Converged ({diagnostics.iterations} iter)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unconverged</span>
                </span>
              )}
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">
                Demand: <strong className="text-white">{diagnostics.totalSystemDemand}</strong> {settings.flowUnit}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">
                Supply: <strong className="text-white">{diagnostics.totalSystemSupply}</strong> {settings.flowUnit}
              </span>
            </div>
          ) : (
            <span className="text-slate-500 font-sans">Solver Ready</span>
          )}
        </div>

        {/* Right: Unit Toggle & Settings */}
        <div className="flex items-center gap-3 font-sans">
          <button
            onClick={toggleUnitSystem}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700 transition"
            title="Click to toggle between SI (Metric) and US Customary units"
          >
            {settings.unitSystem} ({settings.flowUnit})
          </button>

          <span className="text-slate-500">|</span>

          <span className="text-slate-400 font-mono text-[10px]">
            H-Loss: {settings.headlossFormula}
          </span>
        </div>
      </div>
    </div>
  );
};
