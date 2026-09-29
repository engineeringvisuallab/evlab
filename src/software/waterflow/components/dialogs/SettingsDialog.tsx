/**
 * EVLab WaterFlow - Global Engineering Calculation Settings
 */

import React from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { UnitConverter } from '../../core/units/unitConverter';
import { FlowUnit, HeadlossFormula, UnitSystem } from '../../types/waterflow';
import { X, Settings, Sliders } from 'lucide-react';

export const SettingsDialog: React.FC = () => {
  const { settings, setSettings, setActiveDialog, runSimulation } = useWaterFlow();

  const handleUnitSystemChange = (unitSystem: UnitSystem) => {
    setSettings(prev => ({
      ...prev,
      unitSystem,
      flowUnit: UnitConverter.getDefaultFlowUnit(unitSystem)
    }));
  };

  const handleSave = () => {
    setActiveDialog(null);
    setTimeout(() => runSimulation(), 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Engineering Calculation Settings</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="p-6 space-y-4 text-xs">
          {/* Unit System */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
            <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              Unit System & Flow Display
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Unit System:</span>
                <select
                  value={settings.unitSystem}
                  onChange={e => handleUnitSystemChange(e.target.value as UnitSystem)}
                  className="w-full bg-slate-900 text-white p-2 rounded border border-slate-700 font-semibold"
                >
                  <option value="SI">SI (Metric: meters, L/s, kPa)</option>
                  <option value="US">US Customary (feet, GPM, psi)</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Flow Unit:</span>
                <select
                  value={settings.flowUnit}
                  onChange={e => setSettings(prev => ({ ...prev, flowUnit: e.target.value as FlowUnit }))}
                  className="w-full bg-slate-900 text-cyan-300 p-2 rounded border border-slate-700 font-mono font-bold"
                >
                  {settings.unitSystem === 'SI' ? (
                    <>
                      <option value="LPS">LPS (Liters / sec)</option>
                      <option value="LPM">LPM (Liters / min)</option>
                      <option value="MLD">MLD (Million Liters / day)</option>
                      <option value="CMH">CMH (m3 / hour)</option>
                    </>
                  ) : (
                    <>
                      <option value="GPM">GPM (US Gallons / min)</option>
                      <option value="MGD">MGD (Million Gallons / day)</option>
                      <option value="CFS">CFS (Cubic Feet / sec)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Friction Headloss Formula */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
            <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              Friction Loss Equation
            </label>
            <select
              value={settings.headlossFormula}
              onChange={e => setSettings(prev => ({ ...prev, headlossFormula: e.target.value as HeadlossFormula }))}
              className="w-full bg-slate-900 text-amber-300 font-semibold p-2 rounded border border-slate-700"
            >
              <option value="Hazen-Williams">Hazen-Williams Formula (C-Factor)</option>
              <option value="Darcy-Weisbach">Darcy-Weisbach Formula (Swamee-Jain Roughness height e)</option>
            </select>
          </div>

          {/* Solver Iteration Parameters */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
            <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              Iterative Solver Convergence Criteria
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Max Iterations:</span>
                <input
                  type="number"
                  value={settings.maxIterations}
                  onChange={e => setSettings(prev => ({ ...prev, maxIterations: parseInt(e.target.value) || 100 }))}
                  className="w-full bg-slate-900 text-white p-2 rounded border border-slate-700 font-mono"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Accuracy Tolerance (m):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={settings.accuracyTolerance}
                  onChange={e => setSettings(prev => ({ ...prev, accuracyTolerance: parseFloat(e.target.value) || 0.0001 }))}
                  className="w-full bg-slate-900 text-white p-2 rounded border border-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded shadow transition"
          >
            Apply Settings & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
};
