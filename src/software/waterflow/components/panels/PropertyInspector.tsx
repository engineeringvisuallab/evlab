/**
 * EVLab WaterFlow - Dynamic Property Inspector
 * Displays and allows inline editing of selected element attributes and calculated hydraulics.
 */

import React from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { UnitConverter } from '../../core/units/unitConverter';
import { Pipe, Junction, Reservoir, Tank, Pump, Valve, LinkStatus, ValveStatus, PipeMaterial } from '../../types/waterflow';
import { Sliders, Trash2, Activity, Play } from 'lucide-react';

export const PropertyInspector: React.FC = () => {
  const {
    selectedElements,
    updateElement,
    deleteElement,
    settings,
    runSimulation
  } = useWaterFlow();

  if (selectedElements.length === 0) {
    return (
      <aside className="w-72 bg-slate-900 border-l border-slate-800 p-4 text-slate-400 text-xs flex flex-col justify-center items-center text-center select-none z-20">
        <Sliders className="w-8 h-8 text-slate-600 mb-2" />
        <p className="font-semibold text-slate-300">Property Inspector</p>
        <p className="mt-1 text-slate-500">Select any junction, reservoir, tank, pipe, pump, or valve on the canvas to inspect and edit engineering properties.</p>
      </aside>
    );
  }

  const el = selectedElements[0];

  const handleInputChange = (field: string, value: any) => {
    updateElement(el.id, { [field]: value });
    // Trigger solver auto-recalculation
    setTimeout(() => runSimulation(), 50);
  };

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full text-slate-300 text-xs select-none z-20">
      {/* Header */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 font-bold text-slate-200 tracking-wider text-[11px] flex items-center justify-between">
        <span className="uppercase text-cyan-400 font-mono flex items-center gap-1">
          {el.type} : <span className="text-white">{el.label || el.id}</span>
        </span>
        <button
          onClick={() => deleteElement(el.id)}
          className="text-slate-500 hover:text-red-400 transition"
          title="Delete Element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Property Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* IDENTITY GROUP */}
        <div className="space-y-1.5">
          <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
            Identity
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-slate-400 font-medium">Element ID:</span>
            <span className="col-span-2 font-mono text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800">{el.id}</span>
          </div>
          <div className="grid grid-cols-3 items-center">
            <span className="text-slate-400 font-medium">Label:</span>
            <input
              type="text"
              value={el.label || ''}
              onChange={e => handleInputChange('label', e.target.value)}
              className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* GEOMETRY & PHYSICAL PROPERTIES */}
        {/* JUNCTION SPECIFIC */}
        {el.type === 'junction' && (() => {
          const j = el as Junction;
          return (
            <div className="space-y-1.5">
              <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
                Elevation & Demand
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Elevation (m):</span>
                <input
                  type="number"
                  step="0.1"
                  value={j.elevation}
                  onChange={e => handleInputChange('elevation', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Base Demand ({settings.flowUnit}):</span>
                <input
                  type="number"
                  step="0.5"
                  value={j.baseDemand}
                  onChange={e => handleInputChange('baseDemand', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-cyan-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
            </div>
          );
        })()}

        {/* RESERVOIR SPECIFIC */}
        {el.type === 'reservoir' && (() => {
          const r = el as Reservoir;
          return (
            <div className="space-y-1.5">
              <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
                Boundary Condition
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Total Head (m):</span>
                <input
                  type="number"
                  step="1"
                  value={r.totalHead || r.elevation + 20}
                  onChange={e => handleInputChange('totalHead', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-cyan-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
            </div>
          );
        })()}

        {/* TANK SPECIFIC */}
        {el.type === 'tank' && (() => {
          const t = el as Tank;
          return (
            <div className="space-y-1.5">
              <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
                Storage Geometry
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Elevation (m):</span>
                <input
                  type="number"
                  value={t.elevation}
                  onChange={e => handleInputChange('elevation', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Init Level (m):</span>
                <input
                  type="number"
                  step="0.5"
                  value={t.initLevel}
                  onChange={e => handleInputChange('initLevel', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-emerald-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Max Level (m):</span>
                <input
                  type="number"
                  value={t.maxLevel}
                  onChange={e => handleInputChange('maxLevel', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Diameter (m):</span>
                <input
                  type="number"
                  value={t.diameter}
                  onChange={e => handleInputChange('diameter', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
            </div>
          );
        })()}

        {/* PIPE SPECIFIC */}
        {el.type === 'pipe' && (() => {
          const p = el as Pipe;
          return (
            <div className="space-y-1.5">
              <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
                Pipe Parameters
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Length (m):</span>
                <input
                  type="number"
                  step="10"
                  value={p.length}
                  onChange={e => handleInputChange('length', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Diameter (mm):</span>
                <input
                  type="number"
                  step="25"
                  value={p.diameter}
                  onChange={e => handleInputChange('diameter', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-cyan-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Material:</span>
                <select
                  value={p.material}
                  onChange={e => handleInputChange('material', e.target.value)}
                  className="col-span-2 bg-slate-950 text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-none"
                >
                  <option value="Ductile Iron">Ductile Iron</option>
                  <option value="Cast Iron">Cast Iron</option>
                  <option value="PVC">PVC</option>
                  <option value="HDPE">HDPE</option>
                  <option value="Steel">Steel</option>
                  <option value="Concrete">Concrete</option>
                </select>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Roughness (C/e):</span>
                <input
                  type="number"
                  value={p.roughness}
                  onChange={e => handleInputChange('roughness', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={p.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="col-span-2 bg-slate-950 text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="CV">CV (Check Valve)</option>
                </select>
              </div>
            </div>
          );
        })()}

        {/* PUMP SPECIFIC */}
        {el.type === 'pump' && (() => {
          const pump = el as Pump;
          return (
            <div className="space-y-1.5">
              <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-0.5">
                Pump Design Curve
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Design Flow ({settings.flowUnit}):</span>
                <input
                  type="number"
                  value={pump.designFlow}
                  onChange={e => handleInputChange('designFlow', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-amber-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Design Head (m):</span>
                <input
                  type="number"
                  value={pump.designHead}
                  onChange={e => handleInputChange('designHead', parseFloat(e.target.value) || 0)}
                  className="col-span-2 bg-slate-950 text-amber-300 font-bold px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Speed (%):</span>
                <input
                  type="number"
                  value={pump.speed}
                  onChange={e => handleInputChange('speed', parseFloat(e.target.value) || 100)}
                  className="col-span-2 bg-slate-950 text-white px-2 py-1 rounded border border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={pump.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="col-span-2 bg-slate-950 text-slate-200 px-2 py-1 rounded border border-slate-700"
                >
                  <option value="ON">ON</option>
                  <option value="OFF">OFF</option>
                </select>
              </div>
            </div>
          );
        })()}

        {/* CALCULATED HYDRAULIC RESULTS DISPLAY */}
        <div className="space-y-1.5 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
          <div className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Calculated Results
          </div>

          {/* Node Hydraulics */}
          {'pressure' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Pressure:</span>
              <span className="text-emerald-300 font-bold">
                {settings.unitSystem === 'US'
                  ? `${((el as Junction).pressure! * 0.145).toFixed(1)} psi`
                  : `${(el as Junction).pressure?.toFixed(1)} kPa`}
              </span>
            </div>
          )}

          {'hydraulicGrade' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Hydraulic Grade (HGL):</span>
              <span className="text-slate-200">{(el as any).hydraulicGrade?.toFixed(2)} m</span>
            </div>
          )}

          {/* Pipe Hydraulics */}
          {'flow' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Flow Rate:</span>
              <span className="text-cyan-300 font-bold">{(el as Pipe).flow?.toFixed(2)} {settings.flowUnit}</span>
            </div>
          )}

          {'velocity' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Velocity:</span>
              <span className="text-slate-200">{(el as Pipe).velocity?.toFixed(2)} m/s</span>
            </div>
          )}

          {'headloss' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Headloss:</span>
              <span className="text-slate-200">{(el as Pipe).headloss?.toFixed(2)} m</span>
            </div>
          )}

          {'headlossGradient' in el && (
            <div className="flex justify-between">
              <span className="text-slate-400">Headloss Gradient:</span>
              <span className="text-slate-200">{(el as Pipe).headlossGradient?.toFixed(2)} m/km</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
