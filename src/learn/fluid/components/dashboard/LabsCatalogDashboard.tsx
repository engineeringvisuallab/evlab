/**
 * EVLab Fluid Mechanics Virtual Lab Catalog Dashboard
 */

import React from 'react';
import { LabTopicId } from '../../types';
import {
  Waves,
  ArrowRight,
  Zap,
  Activity,
  Gauge,
  Sliders,
  Sparkles,
  TrendingDown,
  Layers,
  Repeat,
  Compass,
  FileCheck
} from 'lucide-react';

interface LabsCatalogDashboardProps {
  onSelectLab: (id: LabTopicId) => void;
  onOpenPresets: () => void;
  onOpenEquations: () => void;
  onOpenAiTutor: () => void;
}

interface LabCardInfo {
  id: LabTopicId;
  title: string;
  category: string;
  formula: string;
  description: string;
  badge: string;
  accentColor: string;
}

const LAB_MODULES: LabCardInfo[] = [
  {
    id: 'continuity',
    title: 'Continuity & Mass Conservation',
    category: 'Kinematics',
    formula: 'Q = A₁V₁ = A₂V₂',
    description: 'Observe cross-sectional area contraction and fluid parcel velocity acceleration in 2D & 3D flow fields.',
    badge: '1D Incompressible Flow',
    accentColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'bernoulli',
    title: 'Extended Bernoulli & Energy Grade Lines',
    category: 'Energy Principles',
    formula: 'z₁ + P₁/γ + V₁²/2g = z₂ + P₂/γ + V₂²/2g + h_L',
    description: 'Dynamic pressure head, elevation potential, velocity heads, and longitudinal HGL/EGL profiles with cavitation detection.',
    badge: 'Energy Grade Lines',
    accentColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'reynolds',
    title: 'Reynolds Number & Flow Regimes',
    category: 'Flow Regimes',
    formula: 'Re = ρVD / μ = VD / ν',
    description: 'Osborne Reynolds visual dye streak experiment: laminar filaments, critical transition zone, and turbulent chaotic eddy dispersion.',
    badge: 'Laminar / Turbulent',
    accentColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pipe-flow',
    title: 'Moody Friction & Darcy-Weisbach Loss',
    category: 'Closed Conduits',
    formula: 'h_f = f · (L/D) · (V²/2g)',
    description: 'Interactive Colebrook-White implicit solver, logarithmic Moody Diagram, pipe wall sand-grain roughness, and pressure loss.',
    badge: 'Moody Chart Solver',
    accentColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'venturi',
    title: 'Venturi Meter Flow Measurement',
    category: 'Flow Measurement',
    formula: 'Q = C_d A₂ √[ 2gΔh / (1 - (A₂/A₁)² ) ]',
    description: 'Converging-diverging ISO 5167 tube, throat constriction pressure drop, differential manometers, and diffuser recovery.',
    badge: 'Piezometric Manometers',
    accentColor: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'orifice',
    title: 'Torricelli Tank & Free Jet Trajectory',
    category: 'Flow Measurement',
    formula: 'V = C_v √(2gh), \\quad Q = C_d A₀ √(2gh)',
    description: 'Sharp-edged orifice discharge, vena contracta streamline contraction (Cc), and parabolic free jet projectile arc.',
    badge: 'Vena Contracta Jet',
    accentColor: 'from-violet-500 to-purple-600',
  },
  {
    id: 'weir',
    title: 'Sharp-Crested Weirs (V-Notch & Rect)',
    category: 'Flow Measurement',
    formula: 'Q = (8/15) C_d √(2g) tan(θ/2) H^(5/2)',
    description: 'Open flume discharge measurement over 90° triangular Thomson V-notches and rectangular suppressed crests.',
    badge: 'Aerated Nappe Flow',
    accentColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'open-channel',
    title: 'Manning Uniform Flow in Open Channels',
    category: 'Free Surface',
    formula: 'Q = (1/n) A R_h^(2/3) S₀^(1/2)',
    description: 'Trapezoidal and rectangular channels, normal depth, bed friction slope, and free surface boundary layer velocity profiles.',
    badge: 'Hydraulic Radius Rh',
    accentColor: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'hydraulic-jump',
    title: 'Bélanger Hydraulic Jump Dissipation',
    category: 'Free Surface',
    formula: 'y₂/y₁ = (1/2) [ √(1 + 8Fr₁²) - 1 ]',
    description: 'Stationary open channel shock wave: supercritical jet transition to subcritical tranquil depth with turbulent roller energy dissipation.',
    badge: 'Spillway Stilling Basin',
    accentColor: 'from-rose-500 to-red-600',
  },
  {
    id: 'pumps',
    title: 'Centrifugal Pump & System Duty Point',
    category: 'Turbomachinery',
    formula: 'H(Q) = H₀ - AQ², \\quad H_{sys}(Q) = H_{stat} + KQ²',
    description: 'Centrifugal pump impeller performance curves, system pipeline head resistance, operating point match, and affinity laws.',
    badge: 'System Curve Match',
    accentColor: 'from-blue-600 to-cyan-500',
  },
];

export const LabsCatalogDashboard: React.FC<LabsCatalogDashboardProps> = ({
  onSelectLab,
  onOpenPresets,
  onOpenEquations,
  onOpenAiTutor,
}) => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-400 text-xs font-mono font-semibold">
            <Waves className="w-3.5 h-3.5" />
            <span>Interactive Engineering Fluid Dynamics Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            EVLab Virtual Fluid Mechanics Lab
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bridging textbook equations with real-world fluid physics. Enter engineering parameters, inspect full step-by-step mathematical traces, and observe realistic 2D/3D visual flow fields.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onSelectLab('continuity')}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              <span>Launch First Lab (Continuity)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPresets}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Textbook Benchmark Presets</span>
            </button>

            <button
              onClick={onOpenEquations}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Equation Explorer</span>
            </button>

            <button
              onClick={onOpenAiTutor}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lab Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Virtual Fluid Mechanics Laboratories</h2>
            <p className="text-xs text-slate-400">Select any module to start interactive simulation & calculation</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {LAB_MODULES.length} Active Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LAB_MODULES.map((module) => (
            <div
              key={module.id}
              onClick={() => onSelectLab(module.id)}
              className="group bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {module.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                    {module.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                  {module.title}
                </h3>

                <div className="font-mono text-[11px] text-sky-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850 truncate">
                  {module.formula}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{module.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400">
                <span>Enter Virtual Lab</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
