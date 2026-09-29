import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Maximize2,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import { AppliedForce, solveFBD } from '../solvers/fbdSolver';

interface FBDStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const FBDStudioModal: React.FC<FBDStudioModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [mass, setMass] = useState<number>(10);
  const [forces, setForces] = useState<AppliedForce[]>([
    { id: 'f1', name: 'Weight (mg)', magnitude: 98.1, angleDeg: 270, posX: 0, posY: 0, type: 'weight' },
    { id: 'f2', name: 'Normal Force (N)', magnitude: 98.1, angleDeg: 90, posX: 0, posY: -0.5, type: 'normal' },
    { id: 'f3', name: 'Applied Pull (F)', magnitude: 50, angleDeg: 30, posX: 1.0, posY: 0.5, type: 'applied' },
  ]);

  if (!isOpen) return null;

  const fbdResult = solveFBD(mass, forces, 0, 0);

  const handleAddForce = () => {
    const newId = `f_${Date.now().toString().slice(-4)}`;
    setForces((prev) => [
      ...prev,
      {
        id: newId,
        name: `Force ${prev.length + 1}`,
        magnitude: 40,
        angleDeg: 45,
        posX: 0.5,
        posY: 0,
        type: 'applied',
      },
    ]);
  };

  const handleUpdateForce = (id: string, field: keyof AppliedForce, value: any) => {
    setForces((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleRemoveForce = (id: string) => {
    setForces((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="fbd-studio-modal"
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Interactive Free Body Diagram Studio</h2>
              <p className="text-xs text-slate-400">
                Isolate rigid bodies, apply vector forces, and test 2D static equilibrium (ΣFx=0, ΣFy=0, ΣMO=0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Force List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Body Mass (kg):</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value) || 1)}
                  className={`w-20 px-2 py-1 text-xs rounded border font-mono font-bold ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                  }`}
                />
              </div>
              <button
                onClick={handleAddForce}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vector Force</span>
              </button>
            </div>

            {/* List of active forces */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {forces.map((f) => (
                <div
                  key={f.id}
                  className={`p-3 rounded-xl border space-y-2 ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => handleUpdateForce(f.id, 'name', e.target.value)}
                      className="text-xs font-bold bg-transparent border-b border-transparent hover:border-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemoveForce(f.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove Force"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Magnitude (N)</span>
                      <input
                        type="number"
                        value={f.magnitude}
                        step={5}
                        min={0}
                        onChange={(e) => handleUpdateForce(f.id, 'magnitude', parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-0.5 rounded border font-mono text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Angle (°)</span>
                      <input
                        type="number"
                        value={f.angleDeg}
                        step={5}
                        min={0}
                        max={360}
                        onChange={(e) => handleUpdateForce(f.id, 'angleDeg', parseFloat(e.target.value) || 0)}
                        className={`w-full px-2 py-0.5 rounded border font-mono text-xs ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pos (x, y) m</span>
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={f.posX}
                          step={0.1}
                          onChange={(e) => handleUpdateForce(f.id, 'posX', parseFloat(e.target.value) || 0)}
                          className={`w-1/2 px-1 py-0.5 rounded border font-mono text-[11px] ${
                            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                          }`}
                        />
                        <input
                          type="number"
                          value={f.posY}
                          step={0.1}
                          onChange={(e) => handleUpdateForce(f.id, 'posY', parseFloat(e.target.value) || 0)}
                          className={`w-1/2 px-1 py-0.5 rounded border font-mono text-[11px] ${
                            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equilibrium Check & Vector Summation */}
          <div className="lg:col-span-6 space-y-4">
            <div
              className={`p-4 rounded-xl border ${
                fbdResult.isEquilibrium
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {fbdResult.isEquilibrium ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span>PERFECT MECHANICAL EQUILIBRIUM</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span>SYSTEM NOT IN EQUILIBRIUM</span>
                  </>
                )}
              </div>
              <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
                {fbdResult.interpretation}
              </p>
            </div>

            {/* Sum of Equations */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 font-mono text-xs ${
                isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-sans font-bold text-slate-400">Statics Equation</span>
                <span className="font-sans font-bold text-slate-400">Evaluated Sum</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Σ F_x = 0</span>
                <span className={`font-bold ${Math.abs(fbdResult.sumFx) < 0.05 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {fbdResult.sumFx.toFixed(2)} N
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Σ F_y = 0</span>
                <span className={`font-bold ${Math.abs(fbdResult.sumFy) < 0.05 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {fbdResult.sumFy.toFixed(2)} N
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Σ M_O = 0 (Moment about origin)</span>
                <span className={`font-bold ${Math.abs(fbdResult.sumMomentOrigin) < 0.05 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {fbdResult.sumMomentOrigin.toFixed(2)} N·m
                </span>
              </div>
            </div>

            {/* Step Trace */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Resolution Breakdown
              </span>
              {fbdResult.steps.map((s) => (
                <div
                  key={s.stepNumber}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-300">{s.description}</div>
                  <div className="font-mono text-[11px] text-blue-400 mt-0.5">{s.substitution}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
