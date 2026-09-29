import React, { useState } from 'react';
import { CalculationState, Material, SectionProperties, TopicId } from '../types';
import { STANDARD_MATERIALS } from '../core/materials';
import { calculateSectionProperties, STANDARD_SECTIONS } from '../core/sections';
import { formatEngValue } from '../core/units';
import { 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Layers, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  X, 
  Zap 
} from 'lucide-react';

interface WhatIfLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: TopicId;
  material: Material;
  section: SectionProperties;
  calcState: CalculationState;
}

export const WhatIfLabModal: React.FC<WhatIfLabModalProps> = ({
  isOpen,
  onClose,
  topicId,
  material,
  section,
  calcState,
}) => {
  if (!isOpen) return null;

  const [scenario, setScenario] = useState<'double_depth' | 'double_span' | 'change_material' | 'double_torque' | 'halve_length'>('double_depth');

  // Baseline vs Modified calculations
  const baselineDepth = section.d || 200;
  const baselineSpan = calcState.beamSpanLengthM || 4;
  const baselineTorque = calcState.torsionTorqueKNm || 10;
  const baselineLength = calcState.columnLengthM || 4;

  const scenarios = [
    {
      id: 'double_depth',
      title: 'What if beam depth (h) is doubled?',
      description: 'Increases depth from 200mm to 400mm while keeping width constant.',
      governingLaw: 'Ix ∝ h³ (8× stiffer), Zx ∝ h² (4× stronger), δ ∝ 1/h³ (8× less deflection)',
      impacts: [
        { name: 'Moment of Inertia Ix', baseline: '1.0×', modified: '8.0× (Cubic increase)' },
        { name: 'Section Modulus Zx', baseline: '1.0×', modified: '4.0× (Quadratic increase)' },
        { name: 'Flexural Stress σ_max', baseline: `${formatEngValue(calcState.beam.maxFlexuralStressMPa)} MPa`, modified: `${formatEngValue(calcState.beam.maxFlexuralStressMPa / 4)} MPa (75% drop)` },
        { name: 'Max Deflection δ_max', baseline: `${formatEngValue(calcState.beam.maxDeflectionMm)} mm`, modified: `${formatEngValue(calcState.beam.maxDeflectionMm / 8)} mm (87.5% drop)` },
      ],
      takeaway: 'Doubling depth is the single most powerful geometric change to eliminate beam sagging and bending stress with minimal weight penalty.',
    },
    {
      id: 'double_span',
      title: 'What if span length (L) is doubled?',
      description: 'Increases unsupported clear span from 4m to 8m under identical loading.',
      governingLaw: 'Point Load: δ ∝ L³ (8× deflection). UDL: δ ∝ L⁴ (16× deflection!). M_max ∝ L²',
      impacts: [
        { name: 'Max Bending Moment', baseline: `${formatEngValue(calcState.beam.maxBendingMomentKNm)} kN·m`, modified: `${formatEngValue(calcState.beam.maxBendingMomentKNm * 4)} kN·m (4× increase)` },
        { name: 'Max Deflection δ_max', baseline: `${formatEngValue(calcState.beam.maxDeflectionMm)} mm`, modified: `${formatEngValue(calcState.beam.maxDeflectionMm * 8)} to ${formatEngValue(calcState.beam.maxDeflectionMm * 16)} mm (8× to 16× increase)` },
        { name: 'Safety Factor', baseline: 'Safe', modified: 'CRITICAL FAILURE / Excessive Sag' },
      ],
      takeaway: 'Doubling beam span without increasing section depth causes catastrophic deflection and overstress due to 4th power deflection scaling.',
    },
    {
      id: 'change_material',
      title: 'What if Steel (E=200 GPa) is replaced with Aluminum (E=70 GPa)?',
      description: 'Replaces ASTM A36 Steel with 6061-T6 Aluminum with identical cross-section geometry.',
      governingLaw: 'Deflection δ ∝ 1/E. Aluminum has 1/3 the Young’s modulus of steel.',
      impacts: [
        { name: 'Bending / Axial Stress σ', baseline: 'Unchanged (Geometry dependent)', modified: 'Unchanged (M/Z is identical)' },
        { name: 'Elastic Deflections δ', baseline: '1.0× Baseline', modified: '2.86× Greater Sagging (3× deflections)' },
        { name: 'Component Weight', baseline: '100% (7850 kg/m³)', modified: '34% (2700 kg/m³ - 66% lighter)' },
      ],
      takeaway: 'Material substitution alters deflections directly in proportion to Young’s Modulus E, but does not alter elastic bending stress σ = My/I.',
    },
    {
      id: 'halve_length',
      title: 'What if Column unbraced length (L) is halved?',
      description: 'Adds an intermediate lateral brace to cut unbraced column length in half.',
      governingLaw: 'P_cr = π²·EI / (K·L)² ∝ 1/L² (Inverse Square Law)',
      impacts: [
        { name: 'Slenderness Ratio λ', baseline: `${(calcState.buckling.slendernessRatio).toFixed(1)}`, modified: `${(calcState.buckling.slendernessRatio / 2).toFixed(1)} (Halved)` },
        { name: 'Buckling Capacity P_cr', baseline: `${formatEngValue(calcState.buckling.criticalLoadKN)} kN`, modified: `${formatEngValue(calcState.buckling.criticalLoadKN * 4)} kN (400% capacity)` },
        { name: 'Governing Failure', baseline: 'Elastic Buckling', modified: 'Material Yielding / Crushing' },
      ],
      takeaway: 'Halving column length by adding an intermediate brace quadruples (4×) its Euler buckling load resistance.',
    },
  ];

  const currentScenarioData = scenarios.find(s => s.id === scenario) || scenarios[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                EVLab "What If?" Scenario Explorer
              </h3>
              <p className="text-xs text-slate-400">
                Explore non-linear physics scaling and instant counterfactual engineering experiments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Scenario Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => setScenario(sc.id as any)}
                className={`p-3 rounded-lg text-left transition border ${
                  scenario === sc.id
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200">
                  {sc.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {sc.description}
                </p>
              </button>
            ))}
          </div>

          {/* Active Scenario Card */}
          <div className="bg-slate-950/80 rounded-lg border border-slate-800 p-4 space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 font-mono">
                Governing Scaling Law
              </span>
              <div className="font-mono text-cyan-300 text-sm font-bold mt-1 bg-slate-900/90 p-2.5 rounded border border-slate-800">
                {currentScenarioData.governingLaw}
              </div>
            </div>

            {/* Side-by-Side Impact Matrix */}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                Counterfactual Comparison
              </span>
              <div className="mt-2 space-y-2">
                {currentScenarioData.impacts.map((imp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <span className="font-medium text-slate-300">
                      {imp.name}
                    </span>
                    <div className="flex items-center space-x-3 font-mono">
                      <span className="text-slate-500 line-through">
                        {imp.baseline}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 font-bold">
                        {imp.modified}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Physical Takeaway */}
            <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed flex items-start space-x-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Engineering Rule of Thumb: </strong>
                {currentScenarioData.takeaway}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
          >
            Got it, Return to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
