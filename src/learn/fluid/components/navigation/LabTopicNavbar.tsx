/**
 * EVLab Top Navigation Bar
 * Module selection, Unit system toggle (SI/US), Fluid properties picker,
 * Equations Explorer, Presets, AI Tutor, and PDF/Engineering Report Generator.
 */

import React from 'react';
import { LabTopicId, UnitSystem, FluidProperty } from '../../types';
import {
  Waves,
  Droplet,
  BookOpen,
  Sparkles,
  Bot,
  FileText,
  Home,
  Layers,
  Settings2,
  ChevronDown
} from 'lucide-react';

interface LabTopicNavbarProps {
  currentLabId: LabTopicId | 'dashboard';
  onSelectLab: (id: LabTopicId | 'dashboard') => void;
  unitSystem: UnitSystem;
  onToggleUnitSystem: () => void;
  fluid: FluidProperty;
  onOpenFluidModal: () => void;
  onOpenEquationsModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenAiTutor: () => void;
  onGenerateReport: () => void;
}

export const LAB_TOPICS_LIST: { id: LabTopicId; name: string; shortName: string; category: string }[] = [
  { id: 'continuity', name: 'Continuity & Conservation of Mass', shortName: 'Continuity', category: 'Kinematics' },
  { id: 'bernoulli', name: 'Extended Bernoulli Energy & HGL/EGL', shortName: 'Bernoulli', category: 'Energy' },
  { id: 'reynolds', name: 'Reynolds Number & Flow Regimes', shortName: 'Reynolds', category: 'Regimes' },
  { id: 'pipe-flow', name: 'Moody Friction & Darcy-Weisbach', shortName: 'Pipe Flow', category: 'Conduits' },
  { id: 'pipe-roughness', name: 'Pipe Wall Roughness & Losses', shortName: 'Roughness', category: 'Conduits' },
  { id: 'minor-loss', name: 'Fittings & Minor Loss Coefficients', shortName: 'Minor Losses', category: 'Conduits' },
  { id: 'venturi', name: 'Venturi Meter & Flow Differential', shortName: 'Venturi', category: 'Measurement' },
  { id: 'orifice', name: 'Torricelli Tank & Free Jet Trajectory', shortName: 'Orifice Jet', category: 'Measurement' },
  { id: 'weir', name: 'Sharp-Crested Weirs (V-Notch & Rect)', shortName: 'Weirs', category: 'Measurement' },
  { id: 'open-channel', name: 'Manning Uniform Flow in Open Channels', shortName: 'Open Channel', category: 'Free Surface' },
  { id: 'froude', name: 'Froude Number & Critical Flow', shortName: 'Froude Flow', category: 'Free Surface' },
  { id: 'hydraulic-jump', name: 'Bélanger Hydraulic Jump Dissipation', shortName: 'Hydraulic Jump', category: 'Free Surface' },
  { id: 'pumps', name: 'Centrifugal Pumps & System Curve Match', shortName: 'Pump & System', category: 'Machinery' },
  { id: 'pump-curves', name: 'Affinity Laws & Pump Impeller Scaling', shortName: 'Affinity Laws', category: 'Machinery' },
];

export const LabTopicNavbar: React.FC<LabTopicNavbarProps> = ({
  currentLabId,
  onSelectLab,
  unitSystem,
  onToggleUnitSystem,
  fluid,
  onOpenFluidModal,
  onOpenEquationsModal,
  onOpenPresetsModal,
  onOpenAiTutor,
  onGenerateReport,
}) => {
  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 select-none z-40 sticky top-0">
      {/* Upper Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectLab('dashboard')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
            <Waves className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold tracking-tight text-slate-100">EVLab</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-semibold">
                Fluid Mechanics
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">From Equation to Real Flow</p>
          </div>
        </div>

        {/* Global Toolbar Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Unit System Toggle (SI / US) */}
          <button
            onClick={onToggleUnitSystem}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-750 hover:border-slate-600 text-slate-200 transition-colors cursor-pointer"
            title="Toggle between SI Metric and US Customary Units"
          >
            <span className="text-slate-400">Units:</span>
            <span className="font-bold text-sky-400">{unitSystem}</span>
          </button>

          {/* Fluid Property Badge Button */}
          <button
            onClick={onOpenFluidModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-750 hover:border-sky-500/60 text-slate-200 transition-colors cursor-pointer group"
            title="View & Edit Working Fluid Thermodynamics"
          >
            <Droplet className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-medium">{fluid.name}</span>
            <span className="font-mono text-[11px] text-slate-400">({fluid.temperature}°C)</span>
          </button>

          {/* Presets Button */}
          <button
            onClick={onOpenPresetsModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="Load Textbook Benchmark Experiments"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Equations Explorer Button */}
          <button
            onClick={onOpenEquationsModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 border border-slate-750 hover:border-sky-500/60 transition-colors cursor-pointer"
            title="Open Fluid Mechanics Equation Bank"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Equations</span>
          </button>

          {/* AI Tutor Button */}
          <button
            onClick={onOpenAiTutor}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-slate-950 font-semibold transition-colors shadow-md shadow-sky-600/20 cursor-pointer"
            title="Open Gemini AI Engineering Tutor"
          >
            <Bot className="w-3.5 h-3.5 text-slate-950" />
            <span>AI Tutor</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onGenerateReport}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-750 transition-colors cursor-pointer"
            title="Generate Engineering Calculation PDF Summary"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Lab Topics Ribbon */}
      <div className="bg-slate-900/80 border-t border-slate-850 px-4 py-1 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 min-w-max">
          <button
            onClick={() => onSelectLab('dashboard')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              currentLabId === 'dashboard'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>Overview</span>
          </button>

          <span className="text-slate-700">|</span>

          {LAB_TOPICS_LIST.map((topic) => {
            const isActive = currentLabId === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => onSelectLab(topic.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {topic.shortName}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
