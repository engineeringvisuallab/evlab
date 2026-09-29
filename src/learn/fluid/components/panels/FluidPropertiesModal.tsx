/**
 * EVLab Fluid Properties & Thermodynamics Modal
 */

import React, { useState } from 'react';
import { FLUID_PRESETS, getFluidProperties } from '../../core/fluidEngine';
import { FluidProperty } from '../../types';
import { X, Droplet, Thermometer, Wind, Zap } from 'lucide-react';

interface FluidPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFluid: FluidProperty;
  onSelectFluid: (fluid: FluidProperty) => void;
}

export const FluidPropertiesModal: React.FC<FluidPropertiesModalProps> = ({
  isOpen,
  onClose,
  currentFluid,
  onSelectFluid,
}) => {
  const [selectedFluidId, setSelectedFluidId] = useState<string>(currentFluid.id.split('_')[0] || 'water');
  const [tempC, setTempC] = useState<number>(currentFluid.temperature ?? 20);

  if (!isOpen) return null;

  const calculatedFluid = getFluidProperties(selectedFluidId, tempC);

  const handleApply = () => {
    onSelectFluid(calculatedFluid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Fluid Properties & Thermodynamics Database</h3>
              <p className="text-xs text-slate-400">
                Temperature-dependent physical properties: Density, Dynamic/Kinematic Viscosity, Specific Weight, Vapor Pressure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Fluid Selection Chips */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Working Fluid
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FLUID_PRESETS.map((f) => {
                const isSelected = selectedFluidId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFluidId(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{f.name}</span>
                      <Droplet className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      ρ ≈ {f.baseDensity.toFixed(0)} kg/m³
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Temperature Slider */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                <Thermometer className="w-4 h-4 text-rose-400" />
                <span>Fluid Temperature (°C)</span>
              </div>
              <span className="font-mono text-sm font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-750">
                {tempC.toFixed(1)} °C / {((tempC * 9) / 5 + 32).toFixed(1)} °F
              </span>
            </div>

            <input
              type="range"
              min={selectedFluidId === 'water' ? 0 : -10}
              max={100}
              step={1}
              value={tempC}
              onChange={(e) => setTempC(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{selectedFluidId === 'water' ? '0°C (Freezing)' : '-10°C'}</span>
              <span>20°C (Standard Lab)</span>
              <span>100°C (Boiling)</span>
            </div>
          </div>

          {/* 3. Calculated Properties Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Evaluated Thermodynamic Properties at {tempC}°C
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Density */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">Density (ρ)</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-1">
                  {calculatedFluid.density.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">kg/m³</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(calculatedFluid.density * 0.062428).toFixed(2)} lb/ft³
                </div>
              </div>

              {/* Dynamic Viscosity */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">Dynamic Viscosity (μ)</div>
                <div className="text-base font-bold text-sky-400 font-mono mt-1">
                  {calculatedFluid.dynamicViscosity.toExponential(3)}{' '}
                  <span className="text-xs font-normal text-slate-400">Pa·s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(calculatedFluid.dynamicViscosity * 1000).toFixed(3)} cP (Centipoise)
                </div>
              </div>

              {/* Kinematic Viscosity */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">Kinematic Viscosity (ν)</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                  {calculatedFluid.kinematicViscosity.toExponential(3)}{' '}
                  <span className="text-xs font-normal text-slate-400">m²/s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(calculatedFluid.kinematicViscosity * 1e6).toFixed(3)} cSt (Centistokes)
                </div>
              </div>

              {/* Specific Weight */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">Specific Weight (γ = ρg)</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-1">
                  {calculatedFluid.specificWeight.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">N/m³</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {(calculatedFluid.specificWeight * 0.006371).toFixed(2)} lbf/ft³
                </div>
              </div>

              {/* Vapor Pressure (Cavitation Limit) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-rose-400 font-mono">Vapor Pressure (Pv)</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-1">
                  {(calculatedFluid.vaporPressure / 1000).toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">kPa abs</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Cavitation Saturation Limit</div>
              </div>

              {/* Bulk Modulus */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">Bulk Modulus (Ev)</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-1">
                  {calculatedFluid.bulkModulus ? (calculatedFluid.bulkModulus / 1e9).toFixed(2) : '2.20'}{' '}
                  <span className="text-xs font-normal text-slate-400">GPa</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Water Hammer Wave Speed c ≈ 1480 m/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Active: <span className="text-sky-400 font-bold">{calculatedFluid.name}</span> @ {tempC}°C
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
            >
              Apply Fluid to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
