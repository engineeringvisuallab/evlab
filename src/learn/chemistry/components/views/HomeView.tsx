import React from 'react';
import { AcademicLevel } from '../../types/chemistry';
import {
  FlaskConical,
  Atom,
  Grid,
  Pipette,
  Wind,
  Droplets,
  Scale,
  Zap,
  Repeat,
  BatteryCharging,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  academicLevel: AcademicLevel;
  onLaunchLab: (labId: string) => void;
  onOpenLearn: (topicId?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  academicLevel,
  onLaunchLab,
  onOpenLearn
}) => {
  const featuredLabs = [
    {
      id: 'titration',
      title: 'Precision Titration Lab',
      category: 'Analytical',
      icon: Pipette,
      description: 'Volumetric neutralization analysis with fine burette valve regulation and live pH inflection curve plotting.'
    },
    {
      id: 'atomic_structure',
      title: 'Atomic Structure & Isotopes',
      category: 'General',
      icon: Atom,
      description: 'Subatomic particle manipulation (p+, n0, e-), Bohr orbital shells, and isotope stability.'
    },
    {
      id: 'periodic_table',
      title: 'Periodic Table & Trends',
      category: 'Inorganic',
      icon: Grid,
      description: 'Complete 118-element periodic system with heatmaps for electronegativity, ionization energy, and radius.'
    },
    {
      id: 'gas_law',
      title: 'Gas Laws & Kinetic Theory',
      category: 'Physical',
      icon: Wind,
      description: 'Simulate kinetic molecular collisions in a piston chamber under Boyle, Charles, and Avogadro laws.'
    },
    {
      id: 'acid_base',
      title: 'Acid-Base Dissociation & Buffers',
      category: 'Analytical',
      icon: Droplets,
      description: 'Weak vs strong electrolyte ionization, Ka equilibrium, Henderson-Hasselbalch, and buffer capacity.'
    },
    {
      id: 'electrochemistry',
      title: 'Galvanic Daniell Cell & Nernst',
      category: 'Electrochemistry',
      icon: BatteryCharging,
      description: 'Daniell cell with salt bridge ion migration, digital voltmeter, and non-standard Nernst cell potentials.'
    }
  ];

  return (
    <div className="space-y-6" id="home-view">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded border border-slate-800 bg-[#111A2E] p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-teal-500/30 text-teal-400 text-[11px] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>Interactive Virtual Chemistry Simulator • {academicLevel}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
            See what chemistry is doing, <br className="hidden sm:inline" />
            <span className="text-teal-400">
              not just read what chemistry says.
            </span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            A comprehensive, rigorous scientific laboratory platform bridging macroscopic experiment observations,
            sub-microscopic particle kinetics, and transparent mathematical equations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onLaunchLab('titration')}
              className="px-5 py-2.5 rounded bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-md active:scale-95"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Launch Virtual Lab</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-teal-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* Featured Virtual Labs Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Featured Laboratory Modules</h2>
            <p className="text-xs text-slate-400">Select an interactive experiment to begin live simulations</p>
          </div>
          <button
            onClick={() => onLaunchLab('titration')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 uppercase tracking-wider font-mono"
          >
            <span>View All Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredLabs.map((lab) => {
            const Icon = lab.icon;
            return (
              <div
                key={lab.id}
                onClick={() => onLaunchLab(lab.id)}
                className="group bg-[#111A2E] border border-slate-800 hover:border-teal-500/60 rounded p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-teal-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {lab.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors uppercase tracking-wide">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{lab.description}</p>
                </div>

                <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-teal-400 gap-1 pt-2 border-t border-slate-800/80 font-mono">
                  <span>Enter Experiment</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Learning Architecture Banner (Learn -> Visualize -> Calculate -> Experiment -> Why) */}
      <div className="p-5 rounded border border-slate-800 bg-[#111A2E] space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          EVLab Scientific Architecture
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: '01. LEARN', title: 'Theory & Nomenclature', desc: 'IUPAC formulas & principles' },
            { step: '02. VISUALIZE', title: '3D & Particle View', desc: 'Bohr shells & WebGL orbitals' },
            { step: '03. EXPERIMENT', title: 'Virtual Glassware', desc: 'Burettes, pistons & electrodes' },
            { step: '04. CALCULATE', title: 'Exact Mathematics', desc: 'PV=nRT, pH, Nernst, Arrhenius' },
            { step: '05. UNDERSTAND', title: 'AI "Why?" Reasoning', desc: 'Molecular collision kinetics' }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-teal-400 font-mono tracking-wider">{item.step}</span>
              <div className="text-xs font-semibold text-white">{item.title}</div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
