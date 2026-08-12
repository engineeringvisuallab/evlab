/**
 * EVLab WaterFlow - Scenario Management & Comparison Engine
 * Allows creating, managing, and comparing demand and status scenarios.
 */

import React, { useState } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Scenario } from '../../types/waterflow';
import { X, Layers, Plus, Trash2, CheckCircle2, Copy } from 'lucide-react';

export const ScenarioManagerDialog: React.FC = () => {
  const { model, updateModel, setActiveDialog, runSimulation } = useWaterFlow();
  const [newScenarioName, setNewScenarioName] = useState('');
  const [demandFactor, setDemandFactor] = useState<number>(1.2);

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;

    const newSc: Scenario = {
      id: `sc-${Date.now()}`,
      name: newScenarioName,
      description: `Custom scenario created at ${new Date().toLocaleTimeString()}`,
      demandMultiplier: demandFactor,
      overrides: {}
    };

    updateModel(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, newSc],
      activeScenarioId: newSc.id
    }));

    setNewScenarioName('');
    setTimeout(() => runSimulation(), 100);
  };

  const handleDeleteScenario = (id: string) => {
    if (model.scenarios.length <= 1) {
      alert('Cannot delete the last scenario.');
      return;
    }
    updateModel(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter(s => s.id !== id),
      activeScenarioId: prev.activeScenarioId === id ? prev.scenarios[0].id : prev.activeScenarioId
    }));
  };

  const handleSelectActive = (id: string) => {
    updateModel(prev => ({
      ...prev,
      activeScenarioId: id
    }));
    setTimeout(() => runSimulation(), 100);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Engineering Scenario Manager</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Create Scenario Form */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center gap-3">
            <input
              type="text"
              placeholder="New Scenario Name (e.g. 2035 Future Growth)..."
              value={newScenarioName}
              onChange={e => setNewScenarioName(e.target.value)}
              className="flex-1 bg-slate-900 text-white p-2 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 font-semibold"
            />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Demand Multiplier:</span>
              <input
                type="number"
                step="0.1"
                value={demandFactor}
                onChange={e => setDemandFactor(parseFloat(e.target.value) || 1.0)}
                className="w-20 bg-slate-900 text-cyan-300 font-bold p-2 rounded border border-slate-700 font-mono"
              />
            </div>
            <button
              onClick={handleCreateScenario}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Scenario</span>
            </button>
          </div>

          {/* Scenario List */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
              Configured Model Scenarios
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {model.scenarios.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => handleSelectActive(sc.id)}
                  className={`p-3 rounded border flex items-center justify-between cursor-pointer transition ${
                    model.activeScenarioId === sc.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {model.activeScenarioId === sc.id && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                    <div>
                      <div className="font-bold text-sm text-white">{sc.name}</div>
                      <div className="text-[11px] text-slate-400">{sc.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {sc.demandMultiplier}x Demand
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteScenario(sc.id); }}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
