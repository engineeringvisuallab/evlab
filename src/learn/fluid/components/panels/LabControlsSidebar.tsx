/**
 * EVLab Parameter Controls Left Sidebar
 * High-density engineering input controls with SI/US units, dual sliders,
 * pipe material selectors, and real-time physical bounds validation.
 */

import React from 'react';
import { LabTopicId, FluidProperty, UnitSystem } from '../../types';
import { PIPE_MATERIALS } from '../../core/pipeMaterialRegistry';
import { STANDARD_FITTINGS } from '../../core/fittingRegistry';
import { ValidationIssue } from '../../core/validationEngine';
import { Sliders, RotateCcw, AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface LabControlsSidebarProps {
  labId: LabTopicId;
  parameters: Record<string, any>;
  onParameterChange: (key: string, value: any) => void;
  onResetParameters: () => void;
  fluid: FluidProperty;
  unitSystem: UnitSystem;
  validationIssues: ValidationIssue[];
}

export const LabControlsSidebar: React.FC<LabControlsSidebarProps> = ({
  labId,
  parameters,
  onParameterChange,
  onResetParameters,
  fluid,
  unitSystem,
  validationIssues,
}) => {
  const isUS = unitSystem === 'US';

  // Render specific inputs based on current lab
  const renderLabInputs = () => {
    switch (labId) {
      case 'continuity':
        return (
          <>
            {/* D1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Inlet Diameter D₁</span>
                <span className="font-mono text-sky-400">
                  {isUS
                    ? `${((parameters.d1 || 0.1) * 39.3701).toFixed(2)} in`
                    : `${((parameters.d1 || 0.1) * 1000).toFixed(0)} mm`}
                </span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.3}
                step={0.005}
                value={parameters.d1 || 0.1}
                onChange={(e) => onParameterChange('d1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* D2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Outlet Diameter D₂</span>
                <span className="font-mono text-sky-400">
                  {isUS
                    ? `${((parameters.d2 || 0.05) * 39.3701).toFixed(2)} in`
                    : `${((parameters.d2 || 0.05) * 1000).toFixed(0)} mm`}
                </span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.25}
                step={0.005}
                value={parameters.d2 || 0.05}
                onChange={(e) => onParameterChange('d2', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Discharge Q or Velocity V1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Discharge Rate Q</span>
                <span className="font-mono text-emerald-400">
                  {isUS
                    ? `${((parameters.discharge_Lps || 10) * 15.8503).toFixed(1)} gpm`
                    : `${(parameters.discharge_Lps || 10).toFixed(1)} L/s`}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                step={0.5}
                value={parameters.discharge_Lps || 10}
                onChange={(e) => onParameterChange('discharge_Lps', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </>
        );

      case 'bernoulli':
        return (
          <>
            {/* Elevation z1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Station 1 Elevation z₁</span>
                <span className="font-mono text-sky-400">
                  {isUS ? `${((parameters.z1 ?? 8) * 3.28084).toFixed(1)} ft` : `${(parameters.z1 ?? 8).toFixed(1)} m`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={parameters.z1 ?? 8}
                onChange={(e) => onParameterChange('z1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Elevation z2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Station 2 Elevation z₂</span>
                <span className="font-mono text-sky-400">
                  {isUS ? `${((parameters.z2 ?? 3) * 3.28084).toFixed(1)} ft` : `${(parameters.z2 ?? 3).toFixed(1)} m`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={parameters.z2 ?? 3}
                onChange={(e) => onParameterChange('z2', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Pressure P1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Inlet Pressure P₁</span>
                <span className="font-mono text-emerald-400">
                  {isUS ? `${((parameters.p1_kPa ?? 150) * 0.145038).toFixed(1)} psi` : `${(parameters.p1_kPa ?? 150).toFixed(0)} kPa`}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={5}
                value={parameters.p1_kPa ?? 150}
                onChange={(e) => onParameterChange('p1_kPa', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Flow rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Flow Rate Q</span>
                <span className="font-mono text-sky-400">{(parameters.Q_m3s || 0.03).toFixed(3)} m³/s</span>
              </div>
              <input
                type="range"
                min={0.005}
                max={0.1}
                step={0.002}
                value={parameters.Q_m3s || 0.03}
                onChange={(e) => onParameterChange('Q_m3s', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </>
        );

      case 'reynolds':
        return (
          <>
            {/* Pipe Diameter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tube Diameter D</span>
                <span className="font-mono text-sky-400">{((parameters.diameter || 0.025) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.005}
                max={0.1}
                step={0.005}
                value={parameters.diameter || 0.025}
                onChange={(e) => onParameterChange('diameter', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Flow Velocity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Flow Velocity V</span>
                <span className="font-mono text-emerald-400">{(parameters.velocity || 0.1).toFixed(2)} m/s</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={2.5}
                step={0.01}
                value={parameters.velocity || 0.1}
                onChange={(e) => onParameterChange('velocity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </>
        );

      case 'pipe-flow':
      case 'pipe-roughness':
      case 'minor-loss':
        return (
          <>
            {/* Material Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Pipe Material</label>
              <select
                value={parameters.materialId || 'commercial_steel'}
                onChange={(e) => {
                  const mat = PIPE_MATERIALS.find((m) => m.id === e.target.value);
                  onParameterChange('materialId', e.target.value);
                  if (mat) onParameterChange('roughness_mm', mat.roughness_mm);
                }}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {PIPE_MATERIALS.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} (ε = {mat.roughness_mm} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Diameter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Internal Diameter D</span>
                <span className="font-mono text-sky-400">{((parameters.diameter || 0.15) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.025}
                max={0.6}
                step={0.005}
                value={parameters.diameter || 0.15}
                onChange={(e) => onParameterChange('diameter', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Pipe Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Pipe Length L</span>
                <span className="font-mono text-sky-400">{(parameters.length || 200).toFixed(0)} m</span>
              </div>
              <input
                type="range"
                min={10}
                max={1500}
                step={10}
                value={parameters.length || 200}
                onChange={(e) => onParameterChange('length', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Flow Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Discharge Flow Rate Q</span>
                <span className="font-mono text-emerald-400">{((parameters.flowRate_m3s || 0.04) * 1000).toFixed(1)} L/s</span>
              </div>
              <input
                type="range"
                min={0.005}
                max={0.2}
                step={0.002}
                value={parameters.flowRate_m3s || 0.04}
                onChange={(e) => onParameterChange('flowRate_m3s', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Minor Losses K Sum */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Fittings Minor Loss ΣK</span>
                <span className="font-mono text-amber-400">{(parameters.fittingsK || 2.5).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={parameters.fittingsK || 2.5}
                onChange={(e) => onParameterChange('fittingsK', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </>
        );

      case 'venturi':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Inlet Diameter D₁</span>
                <span className="font-mono text-sky-400">{((parameters.d1 || 0.2) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.4}
                step={0.01}
                value={parameters.d1 || 0.2}
                onChange={(e) => onParameterChange('d1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Throat Diameter D₂</span>
                <span className="font-mono text-sky-400">{((parameters.d2 || 0.1) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.25}
                step={0.005}
                value={parameters.d2 || 0.1}
                onChange={(e) => onParameterChange('d2', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Inlet Pressure P₁</span>
                <span className="font-mono text-emerald-400">{(parameters.p1_kPa || 200).toFixed(0)} kPa</span>
              </div>
              <input
                type="range"
                min={50}
                max={400}
                step={5}
                value={parameters.p1_kPa || 200}
                onChange={(e) => onParameterChange('p1_kPa', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Throat Pressure P₂</span>
                <span className="font-mono text-emerald-400">{(parameters.p2_kPa || 160).toFixed(0)} kPa</span>
              </div>
              <input
                type="range"
                min={10}
                max={parameters.p1_kPa || 200}
                step={5}
                value={parameters.p2_kPa || 160}
                onChange={(e) => onParameterChange('p2_kPa', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </>
        );

      case 'orifice':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tank Water Head H</span>
                <span className="font-mono text-sky-400">{(parameters.tankHead || 3.0).toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={10.0}
                step={0.1}
                value={parameters.tankHead || 3.0}
                onChange={(e) => onParameterChange('tankHead', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Orifice Diameter d</span>
                <span className="font-mono text-sky-400">{((parameters.orificeDiameter || 0.05) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.15}
                step={0.005}
                value={parameters.orificeDiameter || 0.05}
                onChange={(e) => onParameterChange('orificeDiameter', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Discharge Coeff. Cd</span>
                <span className="font-mono text-emerald-400">{(parameters.Cd || 0.62).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.55}
                max={0.98}
                step={0.01}
                value={parameters.Cd || 0.62}
                onChange={(e) => onParameterChange('Cd', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </>
        );

      case 'weir':
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Weir Geometry</label>
              <select
                value={parameters.type || 'rectangular'}
                onChange={(e) => onParameterChange('type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="rectangular">Rectangular Suppressed Weir</option>
                <option value="v_notch_90">90° Triangular V-Notch (Thomson)</option>
                <option value="cipolletti">Trapezoidal Cipolletti Weir</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Head over Crest H</span>
                <span className="font-mono text-sky-400">{(parameters.headOverCrest || 0.25).toFixed(3)} m</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.8}
                step={0.01}
                value={parameters.headOverCrest || 0.25}
                onChange={(e) => onParameterChange('headOverCrest', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {parameters.type !== 'v_notch_90' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Crest Width L</span>
                  <span className="font-mono text-sky-400">{(parameters.crestLength || 1.5).toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={5.0}
                  step={0.1}
                  value={parameters.crestLength || 1.5}
                  onChange={(e) => onParameterChange('crestLength', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            )}
          </>
        );

      case 'open-channel':
      case 'froude':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Bed Width b</span>
                <span className="font-mono text-sky-400">{(parameters.bottomWidth || 2.0).toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.1}
                value={parameters.bottomWidth || 2.0}
                onChange={(e) => onParameterChange('bottomWidth', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Water Depth y</span>
                <span className="font-mono text-sky-400">{(parameters.waterDepth || 1.0).toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.05}
                value={parameters.waterDepth || 1.0}
                onChange={(e) => onParameterChange('waterDepth', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Bed Slope S₀</span>
                <span className="font-mono text-emerald-400">{(parameters.bedSlope_S0 || 0.001).toFixed(4)}</span>
              </div>
              <input
                type="range"
                min={0.0001}
                max={0.015}
                step={0.0002}
                value={parameters.bedSlope_S0 || 0.001}
                onChange={(e) => onParameterChange('bedSlope_S0', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Manning n</span>
                <span className="font-mono text-amber-400">{(parameters.manning_n || 0.014).toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.009}
                max={0.045}
                step={0.001}
                value={parameters.manning_n || 0.014}
                onChange={(e) => onParameterChange('manning_n', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </>
        );

      case 'hydraulic-jump':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Initial Supercritical Depth y₁</span>
                <span className="font-mono text-rose-400">{(parameters.upstreamDepth_y1 || 0.4).toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.5}
                step={0.02}
                value={parameters.upstreamDepth_y1 || 0.4}
                onChange={(e) => onParameterChange('upstreamDepth_y1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Upstream Velocity V₁</span>
                <span className="font-mono text-rose-400">{(parameters.upstreamVelocity_v1 || 8.0).toFixed(2)} m/s</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={16.0}
                step={0.2}
                value={parameters.upstreamVelocity_v1 || 8.0}
                onChange={(e) => onParameterChange('upstreamVelocity_v1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Channel Width b</span>
                <span className="font-mono text-sky-400">{(parameters.channelWidth_b || 5.0).toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={15.0}
                step={0.5}
                value={parameters.channelWidth_b || 5.0}
                onChange={(e) => onParameterChange('channelWidth_b', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </>
        );

      case 'pumps':
      case 'pump-curves':
        return (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Static Lift Head H_stat</span>
                <span className="font-mono text-sky-400">{(parameters.staticHead || 25.0).toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={parameters.staticHead || 25.0}
                onChange={(e) => onParameterChange('staticHead', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Pump Shutoff Head H₀</span>
                <span className="font-mono text-emerald-400">{(parameters.pumpShutoffHead_H0 || 55.0).toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={2}
                value={parameters.pumpShutoffHead_H0 || 55.0}
                onChange={(e) => onParameterChange('pumpShutoffHead_H0', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Pipeline Diameter D</span>
                <span className="font-mono text-sky-400">{((parameters.pipeDiameter || 0.2) * 1000).toFixed(0)} mm</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.01}
                value={parameters.pipeDiameter || 0.2}
                onChange={(e) => onParameterChange('pipeDiameter', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </>
        );

      default:
        return <div className="text-xs text-slate-500">Select parameters to adjust.</div>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Engineering Controls</h3>
        </div>
        <button
          onClick={onResetParameters}
          className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
          title="Reset to default lab parameters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Lab Specific Input Controls */}
      <div className="space-y-4">{renderLabInputs()}</div>

      {/* Real-time Physical Validation & Cavitation Warnings */}
      {validationIssues.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Validation & Alerts
          </div>
          {validationIssues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2 ${
                issue.type === 'error'
                  ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                  : issue.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                  : 'bg-sky-950/60 border-sky-800/80 text-sky-300'
              }`}
            >
              {issue.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : issue.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-bold">{issue.title}</div>
                <div className="leading-tight text-[11px] opacity-90">{issue.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fluid Summary Badge */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-1">
        <div className="text-slate-300 font-semibold">{fluid.name}</div>
        <div>ρ = {fluid.density.toFixed(1)} kg/m³ @ {fluid.temperature}°C</div>
        <div>μ = {fluid.dynamicViscosity.toExponential(2)} Pa·s</div>
      </div>
    </div>
  );
};
