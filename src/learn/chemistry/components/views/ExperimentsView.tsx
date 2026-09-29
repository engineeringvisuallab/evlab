import React, { useState } from 'react';
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
  Network,
  Flame,
  Search,
  ArrowRight
} from 'lucide-react';

interface ExperimentsViewProps {
  academicLevel: AcademicLevel;
  onLaunchLab: (labId: string) => void;
}

export const ALL_EXPERIMENTS = [
  {
    id: 'titration',
    title: 'Precision Titration Lab',
    category: 'Analytical',
    icon: Pipette,
    difficulty: 'Intermediate',
    description: 'Volumetric neutralization analysis with fine burette valve regulation and live pH inflection curve plotting.'
  },
  {
    id: 'atomic_structure',
    title: 'Atomic Structure & Isotopes',
    category: 'General',
    icon: Atom,
    difficulty: 'Beginner',
    description: 'Subatomic particle manipulation (p+, n0, e-), Bohr orbital shells, and isotope stability.'
  },
  {
    id: 'periodic_table',
    title: 'Periodic Table & Trends',
    category: 'Inorganic',
    icon: Grid,
    difficulty: 'Beginner',
    description: 'Complete 118-element periodic system with heatmaps for electronegativity, ionization energy, and radius.'
  },
  {
    id: 'gas_law',
    title: 'Gas Laws & Kinetic Theory',
    category: 'Physical',
    icon: Wind,
    difficulty: 'Intermediate',
    description: 'Simulate kinetic molecular collisions in a piston chamber under Boyle, Charles, and Avogadro laws.'
  },
  {
    id: 'acid_base',
    title: 'Acid-Base Dissociation & Buffers',
    category: 'Analytical',
    icon: Droplets,
    difficulty: 'Intermediate',
    description: 'Weak vs strong electrolyte ionization, Ka equilibrium, Henderson-Hasselbalch, and buffer capacity.'
  },
  {
    id: 'stoichiometry',
    title: 'Stoichiometry & Limiting Reagents',
    category: 'General',
    icon: Scale,
    difficulty: 'Intermediate',
    description: 'Mole-to-mass conversions, limiting reagent identification, and theoretical vs practical percent yield.'
  },
  {
    id: 'kinetics',
    title: 'Kinetics & Collision Theory',
    category: 'Physical',
    icon: Zap,
    difficulty: 'Advanced',
    description: 'Temperature, catalyst activation energy (Ea), and Maxwell-Boltzmann molecular velocity distributions.'
  },
  {
    id: 'equilibrium',
    title: 'Dynamic Equilibrium & Le Chatelier',
    category: 'Physical',
    icon: Repeat,
    difficulty: 'Advanced',
    description: 'Apply concentration, thermal, and pressure stresses to observe spontaneous equilibrium shifts.'
  },
  {
    id: 'electrochemistry',
    title: 'Galvanic Daniell Cell & Nernst',
    category: 'Electrochemistry',
    icon: BatteryCharging,
    difficulty: 'Advanced',
    description: 'Daniell cell with salt bridge ion migration, digital voltmeter, and non-standard Nernst cell potentials.'
  },
  {
    id: 'bonding',
    title: 'Chemical Bonding & Conductivity',
    category: 'General',
    icon: Network,
    difficulty: 'Beginner',
    description: 'Ionic electron transfer, covalent orbital overlap, and metallic electron sea electrical conductivity.'
  },
  {
    id: 'organic',
    title: 'Organic Chemistry & Isomers',
    category: 'Organic',
    icon: Network,
    difficulty: 'Intermediate',
    description: 'Explore carbon skeletons, functional group reactivity, 3D conformation, and cis/trans stereoisomers.'
  },
  {
    id: 'thermochemistry',
    title: 'Solution Calorimetry (q = mcΔT)',
    category: 'Physical',
    icon: Flame,
    difficulty: 'Intermediate',
    description: 'Measure heat of solution, calorimeter temperature-time profiles, and determine molar enthalpy.'
  },
  {
    id: 'equation_balancer',
    title: 'Chemical Equation Balancer',
    category: 'General',
    icon: Scale,
    difficulty: 'Beginner',
    description: 'Stoichiometric coefficient stepping and atom balance sheet satisfying the Law of Conservation of Mass.'
  }
];

export const ExperimentsView: React.FC<ExperimentsViewProps> = ({
  academicLevel,
  onLaunchLab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General', 'Physical', 'Inorganic', 'Organic', 'Analytical', 'Electrochemistry'];

  const filtered = ALL_EXPERIMENTS.filter((exp) => {
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) return false;
    if (searchQuery.trim() && !exp.title.toLowerCase().includes(searchQuery.toLowerCase()) && !exp.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="experiments-view">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Interactive Virtual Laboratories (13 Modules)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Choose from comprehensive simulation experiments spanning physical, organic, analytical, and inorganic chemistry.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((exp) => {
          const Icon = exp.icon;
          return (
            <div
              key={exp.id}
              onClick={() => onLaunchLab(exp.id)}
              className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                      {exp.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-cyan-400 border border-cyan-900/60">
                      {exp.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{exp.description}</p>
              </div>

              <div className="flex items-center text-xs font-semibold text-cyan-400 gap-1 pt-2 border-t border-slate-800/80">
                <span>Launch Simulation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
